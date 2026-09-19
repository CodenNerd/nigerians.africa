import type {
  Claim,
  Evidence,
  MemoryEvent,
  Office,
  OfficeTenure,
  Person,
  Source,
} from "@nigeria-for-nigerians/domain";
import { sparqlJson, bindingValue } from "../lib/wikidata";
import { fetchAndCache, initials, slugify, wdId } from "../lib/fetch";
import type { AdapterResult } from "../lib/staging";

/** Current and recent holders of President / VP of Nigeria (correct Wikidata QIDs). */
const HOLDERS_QUERY = `
SELECT ?person ?personLabel ?office ?officeLabel ?start ?end ?image WHERE {
  VALUES ?office { wd:Q500282 wd:Q2625960 }
  ?person p:P39 ?stmt .
  ?stmt ps:P39 ?office .
  OPTIONAL { ?stmt pq:P580 ?start . }
  OPTIONAL { ?stmt pq:P582 ?end . }
  OPTIONAL { ?person wdt:P18 ?image . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?officeLabel DESC(?start)
LIMIT 40
`;

/** State governors — positions that are subclass of "governor" with Nigerian jurisdiction. */
const GOVERNORS_QUERY = `
SELECT ?person ?personLabel ?office ?officeLabel ?start ?end ?image WHERE {
  ?office wdt:P279* wd:Q132050 .
  ?office wdt:P1001 ?jurisdiction .
  ?jurisdiction wdt:P17 wd:Q1033 .
  ?person p:P39 ?stmt .
  ?stmt ps:P39 ?office .
  OPTIONAL { ?stmt pq:P580 ?start . }
  OPTIONAL { ?stmt pq:P582 ?end . }
  FILTER(!BOUND(?end) || ?end > "2015-01-01T00:00:00Z"^^xsd:dateTime)
  OPTIONAL { ?person wdt:P18 ?image . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?officeLabel DESC(?start)
LIMIT 80
`;

const CC_OK = /CC-BY|CC BY|CC0|Public domain|CC-BY-SA|CC BY-SA/i;

async function commonsMeta(fileUrl: string): Promise<{
  photographer?: string;
  license?: string;
  sourceUrl?: string;
  thumbUrl?: string;
} | null> {
  // fileUrl like http://commons.wikimedia.org/wiki/Special:FilePath/Foo.jpg
  const name = decodeURIComponent(fileUrl.split("/").pop() ?? "");
  if (!name) return null;
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(name)}&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;
  try {
    const { body } = await fetchAndCache("commons", api, {
      accept: "application/json",
      license: "varies",
    });
    const json = JSON.parse(body.toString("utf8")) as {
      query?: {
        pages?: Record<
          string,
          {
            imageinfo?: Array<{
              url?: string;
              extmetadata?: Record<string, { value?: string }>;
            }>;
          }
        >;
      };
    };
    const page = Object.values(json.query?.pages ?? {})[0];
    const info = page?.imageinfo?.[0];
    if (!info) return null;
    const license = info.extmetadata?.LicenseShortName?.value?.replace(/<[^>]+>/g, "");
    const artist = info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, "").trim();
    if (license && !CC_OK.test(license) && !/public domain/i.test(license)) {
      return null;
    }
    return {
      photographer: artist || "Wikimedia Commons contributor",
      license: license || "see Commons",
      sourceUrl: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(name)}`,
      thumbUrl: info.url,
    };
  } catch {
    return null;
  }
}

function isoDate(v?: string): string | undefined {
  if (!v) return undefined;
  return v.slice(0, 10);
}

export async function crawlPeople(runId: string): Promise<AdapterResult> {
  const startedAt = new Date().toISOString();
  const sourcesLog: AdapterResult["manifest"]["sources"] = [];
  const failures: string[] = [];
  const notes: string[] = [];

  const source: Source = {
    id: "src-wikidata-people",
    type: "Official Dataset",
    title: "Wikidata — Nigerian office holders (P39)",
    publisher: "Wikimedia Foundation / Wikidata",
    url: "https://www.wikidata.org/",
    publicationDate: startedAt.slice(0, 10),
    description: "Public office tenures via Wikidata position held (CC0). Images from Commons when CC-licensed.",
    reliability: "high",
  };

  const peopleMap = new Map<string, Person>();
  const officesMap = new Map<string, Office>();
  const tenures: OfficeTenure[] = [];
  const memory: MemoryEvent[] = [];
  const evidence: Evidence[] = [];
  const claims: Claim[] = [];
  const tenureKeys = new Set<string>();

  async function ingestRows(
    rows: Record<string, { type: string; value: string }>[],
    label: string,
  ) {
    notes.push(`${label}: ${rows.length} bindings`);
    for (const row of rows) {
      const personQ = bindingValue(row, "person");
      const personLabel = bindingValue(row, "personLabel");
      const officeQ = bindingValue(row, "office");
      const officeLabel = bindingValue(row, "officeLabel");
      if (!personQ || !personLabel || !officeQ) continue;
      if (/^Q\d+$/.test(personLabel)) continue;

      const personId = wdId(personQ);
      const officeId = wdId(officeQ);
      const start = isoDate(bindingValue(row, "start")) ?? "1900-01-01";
      const end = isoDate(bindingValue(row, "end"));
      const tKey = `${personId}|${officeId}|${start}`;
      if (tenureKeys.has(tKey)) continue;
      tenureKeys.add(tKey);

      if (!officesMap.has(officeId)) {
        const title = officeLabel ?? officeId;
        officesMap.set(officeId, {
          id: officeId,
          slug: slugify(title),
          institutionId: officeId.endsWith("Q500282") || officeId.endsWith("Q2625960")
            ? "wd:Q1033-presidency"
            : "wd:Q1033-state-exec",
          name: title,
          title,
          mandate: `Public office: ${title}.`,
          responsibilities: [title],
          level: officeId.endsWith("Q500282") || officeId.endsWith("Q2625960") ? "federal" : "state",
        });
      }

      if (!peopleMap.has(personId)) {
        const image = bindingValue(row, "image");
        let photoUrl: string | undefined;
        let imageCredit: Person["imageCredit"];
        if (image) {
          const meta = await commonsMeta(image);
          if (meta?.thumbUrl) {
            photoUrl = meta.thumbUrl;
            imageCredit = {
              photographer: meta.photographer ?? "Wikimedia Commons",
              license: meta.license ?? "see Commons",
              sourceUrl: meta.sourceUrl ?? image,
            };
          }
        }

        // Presidential cover for president office holders
        const isPresident = officeQ.endsWith("Q500282");
        peopleMap.set(personId, {
          id: personId,
          slug: slugify(personLabel),
          fullName: personLabel,
          aliases: [],
          bio: `${personLabel} — public office holder record sourced from Wikidata.`,
          photoInitials: initials(personLabel),
          photoUrl,
          coverUrl: isPresident
            ? "https://upload.wikimedia.org/wikipedia/commons/a/a7/Nigerian_Presidential_Complex.jpg"
            : undefined,
          imageCredit: isPresident
            ? {
                photographer: imageCredit?.photographer ?? "Wikimedia Commons",
                license: imageCredit?.license ?? "CC BY-SA 4.0",
                sourceUrl: imageCredit?.sourceUrl ?? "https://www.wikidata.org/",
                coverPhotographer: "Victor Ibrahim Gankon",
                coverLicense: "CC BY-SA 4.0",
                coverSourceUrl:
                  "https://commons.wikimedia.org/wiki/File:Nigerian_Presidential_Complex.jpg",
              }
            : imageCredit,
          isPublicPersonality: true,
          classification: officeLabel,
          locationIds: ["wd:Q1033"],
        });
      }

      const tenureId = `tenure-${slugify(personId)}-${slugify(officeId)}-${start}`;
      tenures.push({
        id: tenureId,
        personId,
        officeId,
        startDate: start,
        endDate: end,
        appointmentType: "elected_or_appointed",
        sourceId: source.id,
      });

      memory.push({
        id: `mem-${tenureId}`,
        eventType: end ? "Outcome" : "Appointment",
        entityType: "person",
        entityId: personId,
        date: start,
        description: end
          ? `Held ${officeLabel ?? "office"} until ${end}.`
          : `Appointed / assumed ${officeLabel ?? "office"}.`,
        sourceId: source.id,
      });
    }
  }

  try {
    sourcesLog.push({ url: "https://query.wikidata.org/sparql#executive-holders" });
    await ingestRows(await sparqlJson(HOLDERS_QUERY), "executive holders");
  } catch (e) {
    failures.push(`executive holders: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    sourcesLog.push({ url: "https://query.wikidata.org/sparql#governors" });
    await ingestRows(await sparqlJson(GOVERNORS_QUERY), "governors");
  } catch (e) {
    failures.push(`governors: ${e instanceof Error ? e.message : String(e)}`);
    notes.push("Governors query failed — executive holders may still succeed.");
  }

  // Official-statement claim ONLY when anchored to State House (Tinubu inauguration pattern)
  const tinubu = [...peopleMap.values()].find((p) => /tinubu/i.test(p.fullName));
  if (tinubu) {
    const claimSource: Source = {
      id: "src-statehouse-inauguration-2023",
      type: "Government",
      title: "Presidential inauguration — 29 May 2023",
      publisher: "State House, Federal Republic of Nigeria",
      url: "https://statehouse.gov.ng",
      publicationDate: "2023-05-29",
      description: "Official presidential transition / inauguration record.",
      reliability: "high",
    };
    claims.push({
      id: "claim-wd-tinubu-inauguration",
      slug: "tinubu-inaugurated-president-2023",
      statement: "Bola Ahmed Tinubu was inaugurated as President of Nigeria on 29 May 2023.",
      kind: "official_record",
      personId: tinubu.id,
      date: "2023-05-29",
      context: "Official inauguration record — status under_review until promote.",
      status: "under_review",
      evidenceIds: ["ev-wd-tinubu-inauguration"],
      responseIds: [],
    });
    evidence.push({
      id: "ev-wd-tinubu-inauguration",
      slug: "statehouse-inauguration-2023",
      type: "Official Statement",
      title: "Presidential inauguration record",
      description: "Anchored to State House official presence for inauguration date.",
      sourceId: claimSource.id,
      capturedAt: "2023-05-29",
      verificationStatus: "under_review",
      relatedEntityType: "person",
      relatedEntityId: tinubu.id,
    });
    return {
      partial: {
        sources: [source, claimSource],
        people: [...peopleMap.values()],
        offices: [...officesMap.values()],
        tenures,
        memory,
        evidence,
        claims,
      },
      manifest: {
        runId,
        adapter: "people",
        startedAt,
        sources: sourcesLog,
        counts: {},
        failures,
        notes,
      },
    };
  }

  return {
    partial: {
      sources: [source],
      people: [...peopleMap.values()],
      offices: [...officesMap.values()],
      tenures,
      memory,
      evidence,
      claims,
    },
    manifest: {
      runId,
      adapter: "people",
      startedAt,
      sources: sourcesLog,
      counts: {},
      failures,
      notes,
    },
  };
}
