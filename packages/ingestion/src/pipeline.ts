import { crawlPlaces } from "./adapters/places";
import { crawlGovernment } from "./adapters/government";
import { crawlPeople } from "./adapters/people";
import { crawlBudget } from "./adapters/budget";
import { crawlVertical } from "./adapters/vertical";
import { newRunId, writeStaging, type AdapterResult } from "./lib/staging";

export type AdapterName = "places" | "gov" | "people" | "budget" | "vertical" | "all";

const ADAPTERS: Exclude<AdapterName, "all">[] = [
  "places",
  "gov",
  "people",
  "budget",
  "vertical",
];

async function runOne(name: Exclude<AdapterName, "all">, runId: string): Promise<AdapterResult> {
  switch (name) {
    case "places":
      return crawlPlaces(runId);
    case "gov":
      return crawlGovernment(runId);
    case "people":
      return crawlPeople(runId);
    case "budget":
      return crawlBudget(runId);
    case "vertical":
      return crawlVertical(runId);
  }
}

export async function runCrawl(adapter: AdapterName, runId = newRunId()) {
  const names = adapter === "all" ? ADAPTERS : [adapter];
  const results: { adapter: string; seedPath: string; manifestPath: string; diffPath: string }[] =
    [];

  for (const name of names) {
    console.log(`\n▸ Crawling adapter: ${name} (run ${runId})`);
    const result = await runOne(name, runId);
    const paths = await writeStaging(runId, name, result.partial, result.manifest);
    console.log(`  staging: ${paths.seedPath}`);
    console.log(`  manifest: ${paths.manifestPath}`);
    console.log(`  diff: ${paths.diffPath}`);
    if (result.manifest.failures.length) {
      console.warn(`  failures: ${result.manifest.failures.length}`);
      for (const f of result.manifest.failures) console.warn(`    - ${f}`);
    }
    results.push({ adapter: name, ...paths });
  }

  return { runId, results };
}

export { ADAPTERS, newRunId };
