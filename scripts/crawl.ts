#!/usr/bin/env tsx
/**
 * Crawl CLI — fetch public sources into data/staging/<runId>/
 *
 * Usage:
 *   pnpm crawl --adapter=places
 *   pnpm crawl --adapter=all
 */
import { runCrawl, type AdapterName } from "../packages/ingestion/src/pipeline";

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}

async function main() {
  const adapter = (arg("adapter") ?? "all") as AdapterName;
  const allowed = new Set(["places", "gov", "people", "budget", "vertical", "all"]);
  if (!allowed.has(adapter)) {
    console.error(`Unknown adapter: ${adapter}`);
    console.error(`Allowed: ${[...allowed].join(", ")}`);
    process.exit(1);
  }

  const { runId, results } = await runCrawl(adapter);
  console.log(`\n✓ Crawl complete. runId=${runId}`);
  console.log(`  Review diffs under data/staging/${runId}/`);
  console.log(`  Promote with: pnpm promote-seed --run=${runId} --adapter=<name|all>`);
  for (const r of results) {
    console.log(`  - ${r.adapter}: ${r.diffPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
