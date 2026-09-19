import { fetchAndCache, sleep } from "./fetch";

const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";

export async function sparqlJson<T extends Record<string, { type: string; value: string }>>(
  query: string,
): Promise<T[]> {
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}`;

  let lastErr: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      if (attempt > 0) await sleep(2000 * attempt);
      const { body, fromCache } = await fetchAndCache("wikidata", url, {
        accept: "application/sparql-results+json",
        license: "CC0",
      });
      if (!fromCache && attempt === 0) {
        // polite pause after live fetch
        await sleep(500);
      }
      const json = JSON.parse(body.toString("utf8")) as {
        results: { bindings: T[] };
      };
      return json.results.bindings;
    } catch (e) {
      lastErr = e;
      const msg = e instanceof Error ? e.message : String(e);
      if (!/429|503|502|Fetch failed/.test(msg)) throw e;
      // bust cache meta on rate limit by waiting — fetchAndCache may have failed before write
      await sleep(3000 * (attempt + 1));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export function bindingValue(
  b: Record<string, { value?: string } | undefined>,
  key: string,
): string | undefined {
  return b[key]?.value;
}
