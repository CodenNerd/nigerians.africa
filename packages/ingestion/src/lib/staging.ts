import type { SeedDatabase } from "@nigeria-for-nigerians/domain";
import { emptySeed, countsOf, seedKeys } from "@nigeria-for-nigerians/domain";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { ensureDir, stagingDir } from "./fetch";

export type CrawlManifest = {
  runId: string;
  adapter: string;
  startedAt: string;
  finishedAt?: string;
  sources: { url: string; contentHash?: string; fromCache?: boolean; error?: string }[];
  counts: Record<string, number>;
  failures: string[];
  notes: string[];
};

export type AdapterResult = {
  partial: Partial<SeedDatabase>;
  manifest: CrawlManifest;
};

export async function writeStaging(
  runId: string,
  adapter: string,
  partial: Partial<SeedDatabase>,
  manifest: CrawlManifest,
): Promise<{ seedPath: string; manifestPath: string; diffPath: string }> {
  const dir = stagingDir(runId);
  await ensureDir(dir);

  const filled = { ...emptySeed(), ...partial };
  // only keep keys that have data in partial for clarity
  const slim: Record<string, unknown> = {};
  for (const key of seedKeys()) {
    const arr = partial[key];
    if (Array.isArray(arr) && arr.length > 0) slim[key] = arr;
  }

  manifest.counts = countsOf(partial);
  manifest.finishedAt = new Date().toISOString();

  const seedPath = path.join(dir, `seed-${adapter}.json`);
  const manifestPath = path.join(dir, `manifest-${adapter}.json`);
  const diffPath = path.join(dir, `diff-${adapter}.md`);

  await writeFile(seedPath, JSON.stringify(slim, null, 2));
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  await writeFile(diffPath, renderDiffMarkdown(adapter, manifest, slim));

  return { seedPath, manifestPath, diffPath };
}

function renderDiffMarkdown(
  adapter: string,
  manifest: CrawlManifest,
  slim: Record<string, unknown>,
): string {
  const lines = [
    `# Crawl diff — ${adapter}`,
    "",
    `- Run: \`${manifest.runId}\``,
    `- Started: ${manifest.startedAt}`,
    `- Finished: ${manifest.finishedAt ?? "—"}`,
    "",
    "## Counts",
    "",
    "| Entity | Count |",
    "|--------|------:|",
  ];
  for (const [k, v] of Object.entries(manifest.counts)) {
    if (v > 0) lines.push(`| ${k} | ${v} |`);
  }
  lines.push("", "## Sources fetched", "");
  for (const s of manifest.sources) {
    if (s.error) lines.push(`- FAIL ${s.url} — ${s.error}`);
    else lines.push(`- ${s.fromCache ? "cache" : "fetch"} \`${s.contentHash?.slice(0, 12) ?? ""}\` ${s.url}`);
  }
  if (manifest.failures.length) {
    lines.push("", "## Failures", "");
    for (const f of manifest.failures) lines.push(`- ${f}`);
  }
  if (manifest.notes.length) {
    lines.push("", "## Notes", "");
    for (const n of manifest.notes) lines.push(`- ${n}`);
  }
  lines.push("", "## Review checklist", "");
  lines.push("- [ ] Licenses / attribution OK for images");
  lines.push("- [ ] No invented money amounts");
  lines.push("- [ ] No unsourced claims");
  lines.push("- [ ] Stable ids look correct (`wd:Q…` where applicable)");
  lines.push("- [ ] Ready for `pnpm promote-seed --run=" + manifest.runId + " --adapter=" + adapter + "`");
  lines.push("", `Partial keys present: ${Object.keys(slim).join(", ") || "(none)"}`);
  return lines.join("\n") + "\n";
}

export function newRunId(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
