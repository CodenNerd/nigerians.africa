#!/usr/bin/env tsx
/**
 * Validate promoted generated seed layers (CI-friendly).
 * Fails on required-source violations in generated/*.json
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { validatePartialSeed } from "../packages/ingestion/src/normalize/validate";
import { generatedSeedDir } from "../packages/ingestion/src/lib/fetch";
import type { SeedDatabase } from "../packages/domain/src/types";

async function main() {
  const dir = generatedSeedDir();
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  let errors = 0;

  for (const file of files) {
    const partial = JSON.parse(
      await readFile(path.join(dir, file), "utf8"),
    ) as Partial<SeedDatabase>;
    const issues = validatePartialSeed(partial);
    console.log(`\n${file}`);
    if (!issues.length) {
      console.log("  ok");
      continue;
    }
    for (const i of issues) {
      console.log(`  [${i.level}] ${i.path}: ${i.message}`);
      if (i.level === "error") errors++;
    }
  }

  if (errors) {
    console.error(`\n✗ ${errors} error(s) in generated seed`);
    process.exit(1);
  }
  console.log("\n✓ Generated seed validation passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
