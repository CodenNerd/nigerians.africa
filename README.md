# NigeriaForNigerians

A public digital civic institution for Nigeria — making government, problems, money, projects, evidence and history **visible and connected**.

> The platform remembers. Citizens decide.

Product design origins live in [`docs/`](docs/) (originally drafted as *Nigerians.africa* / The People’s Government). The running product brand is **NigeriaForNigerians**.

## Quick start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The app runs on a **connected seed graph** (`packages/domain`) so every documented journey is navigable without Docker. Optional Supabase schema lives in `supabase/migrations/`.

### Optional AI

Copy `.env.example` to `apps/web/.env.local` and set `AI_API_KEY` for LLM summaries. Without it, Ask still returns structured retrieval with citations.

### Demo accounts

| Email | Role |
|-------|------|
| `citizen@demo.ng` | Submit reports |
| `verify@demo.ng` | Verifier desk |
| `gov@demo.ng` | Official responses |

Any password works in the demo auth cookie.

## Signature demo

**Allen Avenue Spur Rehabilitation** — follow:

Problem → Office → Person → Project → Money → Contractor → Evidence → Citizen report → Official response

Start at [`/projects/allen-avenue-spur-rehabilitation`](http://localhost:3000/projects/allen-avenue-spur-rehabilitation) or Ask: *“What happened to the abandoned road project in Ikeja?”*

**Public Personality:** [`/people/bola-ahmed-tinubu`](http://localhost:3000/people/bola-ahmed-tinubu)

## Monorepo layout

```text
apps/web/                 Next.js App Router (public record UI)
packages/domain/          Types, seed graph, PublicRecordStore
packages/ingestion/       Crawl adapters → staging → promote to seed
packages/database/        Schema notes / future Drizzle wiring
data/raw/                 Immutable fetch cache (gitignored)
data/staging/             Review diffs before promote (gitignored)
supabase/migrations/      Postgres + PostGIS + pgvector + RLS
docs/                     Product & technical design
```

## Data crawl

Public sources are crawled into staging, reviewed, then promoted into `packages/domain/src/seed/generated/`.

See [`packages/ingestion/README.md`](packages/ingestion/README.md).

```bash
pnpm crawl --adapter=all
pnpm promote-seed --run=<runId> --adapter=all
pnpm validate-seed
```

## Stack

- Next.js 15 + React 19 + TypeScript + Tailwind
- Seeded entity graph (TDD domain model)
- Leaflet + OSM maps with list fallbacks
- Demo cookie auth + verifier desk
- RAG Ask API (`POST /api/ai/query`) with citation requirements

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web app on :3000 |
| `pnpm build` | Production build |
| `pnpm typecheck` | Typecheck packages |
| `pnpm crawl` | Fetch public data into `data/staging/` |
| `pnpm promote-seed` | Promote reviewed staging into generated seed |
| `pnpm validate-seed` | CI check for required source links on generated seed |

## Design principles (product)

- Public by default — auth for participation, not consumption
- The record is the interface — not a SaaS dashboard
- Evidence first — status labels are visible
- Follow the thread across entities
- AI explains; it does not invent sources or declare guilt
