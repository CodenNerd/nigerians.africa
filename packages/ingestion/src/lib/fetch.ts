import { createHash } from "node:crypto";
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";

export const USER_AGENT =
  "NigeriaForNigeriansBot/0.1 (+https://github.com/nigeria-for-nigerians; civic-data-ingest; contact=ops@nigeriafornigerians.local)";

export function repoRoot(): string {
  // packages/ingestion/src/lib -> repo root
  return path.resolve(import.meta.dirname, "../../../..");
}

export function rawDir(source: string): string {
  return path.join(repoRoot(), "data", "raw", source);
}

export function stagingDir(runId: string): string {
  return path.join(repoRoot(), "data", "staging", runId);
}

export function generatedSeedDir(): string {
  return path.join(repoRoot(), "packages", "domain", "src", "seed", "generated");
}

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

export function sha256(buf: Buffer | string): string {
  return createHash("sha256").update(buf).digest("hex");
}

export type RawMeta = {
  url: string;
  fetchedAt: string;
  contentHash: string;
  contentType?: string;
  license?: string;
  source: string;
  bytes: number;
};

/**
 * Fetch URL, store immutable raw blob + sidecar metadata.
 * Retries on 429/5xx. Reuses cache when URL meta exists.
 */
export async function fetchAndCache(
  source: string,
  url: string,
  opts?: { accept?: string; license?: string },
): Promise<{ body: Buffer; meta: RawMeta; fromCache: boolean; path: string }> {
  const dir = rawDir(source);
  await ensureDir(dir);

  const urlHash = sha256(url).slice(0, 16);
  const metaPath = path.join(dir, `${urlHash}.meta.json`);

  try {
    await access(metaPath);
    const meta = JSON.parse(await readFile(metaPath, "utf8")) as RawMeta;
    const ext = extFor(meta.contentType);
    const bodyPath = path.join(dir, `${meta.contentHash}${ext}`);
    const body = await readFile(bodyPath);
    return { body, meta, fromCache: true, path: bodyPath };
  } catch {
    // miss
  }

  let lastErr: Error | undefined;
  for (let attempt = 0; attempt < 5; attempt++) {
    await sleep(attempt === 0 ? 400 : 2500 * attempt);

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: opts?.accept ?? "*/*",
        },
        redirect: "follow",
      });

      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`Fetch failed ${res.status} ${res.statusText} for ${url}`);
        continue;
      }

      if (!res.ok) {
        throw new Error(`Fetch failed ${res.status} ${res.statusText} for ${url}`);
      }

      const contentType = res.headers.get("content-type") ?? undefined;
      const ab = await res.arrayBuffer();
      const body = Buffer.from(ab);
      const contentHash = sha256(body);
      const ext = extFor(contentType);
      const bodyPath = path.join(dir, `${contentHash}${ext}`);
      const meta: RawMeta = {
        url,
        fetchedAt: new Date().toISOString(),
        contentHash,
        contentType,
        license: opts?.license,
        source,
        bytes: body.length,
      };

      await writeFile(bodyPath, body);
      await writeFile(metaPath, JSON.stringify(meta, null, 2));

      return { body, meta, fromCache: false, path: bodyPath };
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      if (!/429|503|502/.test(lastErr.message)) {
        // still retry once more for transient network errors
        if (attempt >= 2) throw lastErr;
      }
    }
  }

  throw lastErr ?? new Error(`Fetch failed for ${url}`);
}

function extFor(contentType?: string): string {
  if (!contentType) return ".bin";
  if (contentType.includes("json")) return ".json";
  if (contentType.includes("html")) return ".html";
  if (contentType.includes("xml") || contentType.includes("sparql")) return ".xml";
  if (contentType.includes("pdf")) return ".pdf";
  if (contentType.includes("csv")) return ".csv";
  if (contentType.includes("text")) return ".txt";
  return ".bin";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function wdId(qid: string): string {
  const q = qid.replace(/^.*\//, "");
  return `wd:${q}`;
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
