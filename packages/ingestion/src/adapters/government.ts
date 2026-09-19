import type { Institution, Office, Source } from "@nigeria-for-nigerians/domain";
import { sparqlJson, bindingValue } from "../lib/wikidata";
import { fetchAndCache, slugify, wdId } from "../lib/fetch";
import type { AdapterResult } from "../lib/staging";

/** Federal ministries of Nigeria (instance of / subclass patterns vary; use known set + SPARQL). */
const MINISTRIES_QUERY = `
SELECT DISTINCT ?org ?orgLabel ?website WHERE {
  {
    ?org wdt:P31/wdt:P279* wd:Q192350 .
    ?org wdt:P17 wd:Q1033 .
  } UNION {
    ?org wdt:P31 wd:Q20857065 .
    ?org wdt:P17 wd:Q1033 .
  }
  OPTIONAL { ?org wdt:P856 ?website . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?orgLabel
LIMIT 120
`;

const EXECUTIVE_OFFICES: Array<{
  qid: string;
  title: string;
  name: string;
  mandate: string;
  institutionId: string;
}> = [
  {
    qid: "Q500282",
    title: "President of Nigeria",
    name: "Office of the President",
    mandate: "Head of state and government of the Federal Republic of Nigeria.",
    institutionId: "wd:Q1033-presidency",
  },
  {
    qid: "Q2625960",
    title: "Vice President of Nigeria",
    name: "Office of the Vice President",
    mandate: "Deputy to the President of Nigeria.",
    institutionId: "wd:Q1033-presidency",
  },
];


export async function crawlGovernment(runId: string): Promise<AdapterResult> {
  const startedAt = new Date().toISOString();
  const sourcesLog: AdapterResult["manifest"]["sources"] = [];
  const failures: string[] = [];
  const notes: string[] = [];

  const source: Source = {
    id: "src-wikidata-government",
    type: "Official Dataset",
    title: "Wikidata — Nigerian federal institutions and offices",
    publisher: "Wikimedia Foundation / Wikidata",
    url: "https://www.wikidata.org/",
    publicationDate: startedAt.slice(0, 10),
    description: "Federal ministries/agencies and executive offices via SPARQL (CC0).",
    reliability: "high",
  };

  try {
    const cached = await fetchAndCache(
      "wikidata",
      `https://query.wikidata.org/sparql?query=${encodeURIComponent(MINISTRIES_QUERY)}`,
      { accept: "application/sparql-results+json", license: "CC0" },
    );
    sourcesLog.push({
      url: cached.meta.url,
      contentHash: cached.meta.contentHash,
      fromCache: cached.fromCache,
    });
  } catch (e) {
    failures.push(`cache ministries: ${e instanceof Error ? e.message : String(e)}`);
  }

  const institutions: Institution[] = [
    {
      id: "wd:Q1033-presidency",
      slug: "presidency-of-nigeria",
      name: "The Presidency",
      type: "executive",
      level: "federal",
      mandate: "Executive arm of the Federal Government of Nigeria.",
      description: "Office of the President and Vice President of Nigeria.",
      website: "https://statehouse.gov.ng",
      locationId: "wd:Q1033",
    },
    {
      id: "wd:Q1033-state-exec",
      slug: "state-executive-nigeria",
      name: "State Executive (Nigeria)",
      type: "executive",
      level: "state",
      mandate: "State governors and state executive offices.",
      description: "Grouping institution for state-level executive offices ingested from Wikidata.",
      locationId: "wd:Q1033",
    },
    {
      id: "wd:budget-office",
      slug: "budget-office-of-the-federation",
      name: "Budget Office of the Federation",
      type: "agency",
      level: "federal",
      mandate: "Prepare and monitor the federal budget of Nigeria.",
      description: "Federal agency responsible for budget preparation and monitoring.",
      website: "https://www.budgetoffice.gov.ng",
      locationId: "wd:Q1033",
    },
  ];

  const offices: Office[] = EXECUTIVE_OFFICES.map((o) => ({
    id: wdId(o.qid),
    slug: slugify(o.title),
    institutionId: o.institutionId,
    name: o.name,
    title: o.title,
    mandate: o.mandate,
    responsibilities: [o.mandate],
    level: "federal" as const,
  }));

  try {
    const rows = await sparqlJson(MINISTRIES_QUERY);
    notes.push(`Fetched ${rows.length} ministry/agency candidates`);
    const seen = new Set(institutions.map((i) => i.id));
    for (const row of rows) {
      const qid = bindingValue(row, "org");
      const label = bindingValue(row, "orgLabel");
      if (!qid || !label) continue;
      // skip bare QIDs used as labels
      if (/^Q\d+$/.test(label)) continue;
      const id = wdId(qid);
      if (seen.has(id)) continue;
      seen.add(id);
      const website = bindingValue(row, "website");
      const isMinistry = /ministry/i.test(label);
      institutions.push({
        id,
        slug: slugify(label),
        name: label,
        type: isMinistry ? "ministry" : "agency",
        level: "federal",
        mandate: `Federal institution: ${label}.`,
        description: `${label} (Wikidata ${qid.replace(/^.*\//, "")}).`,
        website,
        locationId: "wd:Q1033",
      });

      // Head office stub for ministries
      if (isMinistry) {
        const officeId = `${id}-minister`;
        offices.push({
          id: officeId,
          slug: slugify(`Minister — ${label}`),
          institutionId: id,
          name: `Minister of ${label.replace(/^Federal Ministry of\s+/i, "")}`,
          title: `Minister — ${label}`,
          mandate: `Political head of ${label}.`,
          responsibilities: [`Lead ${label}`],
          level: "federal",
        });
      }
    }
  } catch (e) {
    failures.push(`ministries SPARQL: ${e instanceof Error ? e.message : String(e)}`);
  }

  notes.push(
    "Hand-curated Presidency + Budget Office added for reliable linking to people/budget adapters.",
  );

  return {
    partial: { sources: [source], institutions, offices },
    manifest: {
      runId,
      adapter: "gov",
      startedAt,
      sources: sourcesLog,
      counts: {},
      failures,
      notes,
    },
  };
}
