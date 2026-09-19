# Data ingestion (crawl → staging → promote)

NigeriaForNigerians ingests **public** civic data into the in-memory seed graph.

```text
adapters → data/raw (hashed blobs) → data/staging/<runId> → review → promote → packages/domain/src/seed/generated/
```

Crawl **never** writes generated seed directly. Promote is the human gate.

## Commands

```bash
# Install (from repo root)
pnpm install

# Crawl one adapter or all
pnpm crawl --adapter=places
pnpm crawl --adapter=gov
pnpm crawl --adapter=people
pnpm crawl --adapter=budget
pnpm crawl --adapter=vertical
pnpm crawl --adapter=all

# Review
open data/staging/<runId>/diff-places.md

# Promote after checklist
pnpm promote-seed --run=<runId> --adapter=places
pnpm promote-seed --run=<runId> --adapter=all
```

## Adapters

| Adapter | Source | Emits |
|---------|--------|-------|
| `places` | Wikidata SPARQL (states, LGAs) | `locations`, `sources` |
| `gov` | Wikidata + curated Presidency / BOF | `institutions`, `offices`, `sources` |
| `people` | Wikidata P39 + Commons CC images | `people`, `tenures`, `memory`, `claims`* |
| `budget` | Budget Office of the Federation | `budgets`, `allocations`, `evidence` |
| `vertical` | NRC / FCDA (Abuja rail thread) | problem→project→money→evidence |

\*Claims only when anchored to an official URL (e.g. State House), status `under_review` until promote.

## Review checklist

- [ ] Licenses / attribution OK for images
- [ ] No invented money amounts
- [ ] No unsourced claims
- [ ] Stable ids look correct (`wd:Q…` where applicable)
- [ ] Diff counts look sane

Promote **fails** if tenures/claims/evidence/allocations violate required source/evidence links.

When adapters were crawled in **separate runs**, promote each:

```bash
pnpm promote-seed --run=<placesRun> --adapter=places
pnpm promote-seed --run=<govRun> --adapter=gov
# …
```

Or crawl with `--adapter=all` (one `runId`) and `pnpm promote-seed --run=<runId> --adapter=all`.

## Layout

| Path | Role |
|------|------|
| `packages/ingestion/` | Adapters, fetch cache, validation |
| `data/raw/<source>/` | Immutable fetched blobs + `.meta.json` (gitignored) |
| `data/staging/<runId>/` | Partial seed JSON, manifest, diff markdown (gitignored) |
| `packages/domain/src/seed/handcrafted.ts` | Curated demo narrative |
| `packages/domain/src/seed/generated/*.json` | Promoted crawl layers (committed) |
| `packages/domain/src/seed/data.ts` | `mergeSeed(handcrafted, …generated)` |

## Rate limits & policy

- User-Agent: `NigeriaForNigeriansBot/0.1`
- Sequential fetches with short delay; raw cache avoids re-download when URL meta exists
- No paywalled news scraping for claims
- Prefer Wikidata / government portals / CC-licensed Commons media
