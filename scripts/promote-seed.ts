#!/usr/bin/env tsx
/**
 * Promote reviewed staging JSON into packages/domain/src/seed/generated/
 *
 * Usage:
 *   pnpm promote-seed --run=<runId> --adapter=places
 *   pnpm promote-seed --run=<runId> --adapter=all
 */
import { readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { validatePartialSeed } from "../packages/ingestion/src/normalize/validate";
import type { SeedDatabase } from "../packages/domain/src/types";
import { generatedSeedDir, stagingDir } from "../packages/ingestion/src/lib/fetch";

const ADAPTER_TO_FILE: Record<string, string> = {
  places: "places.json",
  gov: "government.json",
  people: "people.json",
  budget: "budget.json",
  vertical: "vertical.json",
};

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}

async function main() {
  const runId = arg("run");
  const adapterArg = arg("adapter") ?? "all";

  if (!runId) {
    console.error("Required: --run=<runId>");
    process.exit(1);
  }

  const adapters = adapterArg === "all" ? Object.keys(ADAPTER_TO_FILE) : [adapterArg];

  let errors = 0;

  for (const adapter of adapters) {
    const file = ADAPTER_TO_FILE[adapter];
    if (!file) {
      console.error(`Unknown adapter: ${adapter}`);
      errors++;
      continue;
    }

    const stagingPath = path.join(stagingDir(runId), `seed-${adapter}.json`);
    try {
      await access(stagingPath);
    } catch {
      console.warn(`Skip ${adapter}: missing ${stagingPath}`);
      continue;
    }

    const raw = await readFile(stagingPath, "utf8");
    const partial = JSON.parse(raw) as Partial<SeedDatabase>;
    const issues = validatePartialSeed(partial);
    const hard = issues.filter((i) => i.level === "error");
    for (const i of issues) {
      console.log(`  [${i.level}] ${i.path}: ${i.message}`);
    }
    if (hard.length) {
      console.error(`✗ Refusing to promote ${adapter}: ${hard.length} error(s)`);
      errors++;
      continue;
    }

    const outPath = path.join(generatedSeedDir(), file);
    await writeFile(outPath, JSON.stringify(partial, null, 2) + "\n");
    console.log(`✓ Promoted ${adapter} → ${outPath}`);
  }

  if (errors) {
    process.exit(1);
  }

  console.log("\nDone. Restart or refresh the app to load merged seed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
