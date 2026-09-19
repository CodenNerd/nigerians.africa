import type { Location, Source } from "@nigeria-for-nigerians/domain";
import { sparqlJson, bindingValue } from "../lib/wikidata";
import { fetchAndCache, slugify, wdId } from "../lib/fetch";
import type { AdapterResult } from "../lib/staging";

const STATES_QUERY = `
SELECT ?state ?stateLabel ?coord WHERE {
  ?state wdt:P31 wd:Q465842 .
  ?state wdt:P17 wd:Q1033 .
  OPTIONAL { ?state wdt:P625 ?coord . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?stateLabel
`;

const LGAS_QUERY = `
SELECT ?lga ?lgaLabel ?state ?stateLabel ?coord WHERE {
  ?lga wdt:P31 wd:Q1639634 .
  ?lga wdt:P17 wd:Q1033 .
  OPTIONAL { ?lga wdt:P131 ?state . }
  OPTIONAL { ?lga wdt:P625 ?coord . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY ?stateLabel ?lgaLabel
LIMIT 800
`;

function parseCoord(wkt?: string): { lat: number; lng: number } | null {
  if (!wkt) return null;
  // Point(lng lat)
  const m = /Point\(([-\d.]+)\s+([-\d.]+)\)/.exec(wkt);
  if (!m) return null;
  return { lng: parseFloat(m[1]), lat: parseFloat(m[2]) };
}

export async function crawlPlaces(runId: string): Promise<AdapterResult> {
  const startedAt = new Date().toISOString();
  const sources: AdapterResult["manifest"]["sources"] = [];
  const failures: string[] = [];
  const notes: string[] = [];

  const wikidataSource: Source = {
    id: "src-wikidata-places",
    type: "Official Dataset",
    title: "Wikidata — Nigerian states and LGAs",
    publisher: "Wikimedia Foundation / Wikidata",
    url: "https://www.wikidata.org/",
    publicationDate: startedAt.slice(0, 10),
    description: "Structured places ingested via SPARQL (CC0).",
    reliability: "high",
  };

  try {
    const cached = await fetchAndCache(
      "wikidata",
      `https://query.wikidata.org/sparql?query=${encodeURIComponent(STATES_QUERY)}`,
      { accept: "application/sparql-results+json", license: "CC0" },
    );
    sources.push({
      url: cached.meta.url,
      contentHash: cached.meta.contentHash,
      fromCache: cached.fromCache,
    });
  } catch (e) {
    failures.push(`cache states query: ${e instanceof Error ? e.message : String(e)}`);
  }

  const locations: Location[] = [
    {
      id: "wd:Q1033",
      slug: "nigeria",
      name: "Nigeria",
      type: "country",
      lat: 9.082,
      lng: 8.6753,
      summary: "Federal Republic of Nigeria (Wikidata Q1033).",
    },
  ];

  try {
    const stateRows = await sparqlJson(STATES_QUERY);
    notes.push(`Fetched ${stateRows.length} states from Wikidata`);
    for (const row of stateRows) {
      const qid = bindingValue(row, "state");
      const label = bindingValue(row, "stateLabel");
      if (!qid || !label) continue;
      const coord = parseCoord(bindingValue(row, "coord"));
      locations.push({
        id: wdId(qid),
        slug: slugify(label.replace(/\s+State$/i, "")) + "-state",
        name: label,
        type: "state",
        parentId: "wd:Q1033",
        lat: coord?.lat ?? 9.0,
        lng: coord?.lng ?? 8.0,
        summary: `${label} — federating unit of Nigeria (Wikidata).`,
      });
    }
  } catch (e) {
    failures.push(`states SPARQL: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const lgaRows = await sparqlJson(LGAS_QUERY);
    notes.push(`Fetched ${lgaRows.length} LGAs from Wikidata`);
    const seen = new Set(locations.map((l) => l.id));
    for (const row of lgaRows) {
      const qid = bindingValue(row, "lga");
      const label = bindingValue(row, "lgaLabel");
      const stateQ = bindingValue(row, "state");
      if (!qid || !label) continue;
      const id = wdId(qid);
      if (seen.has(id)) continue;
      seen.add(id);
      const coord = parseCoord(bindingValue(row, "coord"));
      const parentId = stateQ ? wdId(stateQ) : undefined;
      locations.push({
        id,
        slug: slugify(label) + "-lga",
        name: label,
        type: "lga",
        parentId: parentId && seen.has(parentId) ? parentId : parentId,
        lat: coord?.lat ?? 9.0,
        lng: coord?.lng ?? 8.0,
        summary: `${label} local government area (Wikidata).`,
      });
    }
  } catch (e) {
    failures.push(`lgas SPARQL: ${e instanceof Error ? e.message : String(e)}`);
  }

  return {
    partial: { sources: [wikidataSource], locations },
    manifest: {
      runId,
      adapter: "places",
      startedAt,
      sources,
      counts: {},
      failures,
      notes,
    },
  };
}
