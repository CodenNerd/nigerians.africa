# Design Paradigm v3 — Visualisation primitives

**Enhancement on top of** [`design-paradigm.md`](./design-paradigm.md) and [`design-paradigm-v2-stream.md`](./design-paradigm-v2-stream.md).  
Do not replace earlier docs.

---

## Intent

Optimise the product for **multiple visualisation forms** without becoming a BI dashboard:

| Form | Role |
|------|------|
| Geography as art | Schematic SVG (states) — hover/click, not pan/zoom GIS |
| Tile mosaics | Featured entities (projects) with handler chips |
| Stream rail | Dense chronology (v2) |
| Trails / spines | Money and Follow-the-Thread (existing) |

---

## Geography as art

- Fixed `viewBox` SVG; no Leaflet on promotional heroes.
- One path per state; highlight on hover/focus; navigate to place records when seeded.
- Must not overpower brand on the hero (side / secondary visual).

Implementation: `components/viz/NigeriaStateMap.tsx`, asset under `public/maps/`.

---

## Featured project tiles

- Seamed planes, not cards.
- Annotate **who handles** the work: Government · Business · NGO · Community (CDS/CDA-style).
- Derive handlers from the graph (`responsibleOfficeId`, `contractorId`, orgs linked via `projectIds`).

Implementation: `components/viz/ProjectFeatureTiles.tsx`, `store.projectHandlers()`.

---

## Viz kit

`components/viz/`:

- `NigeriaStateMap`
- `ProjectFeatureTiles`
- `VizFrame` — shared eyebrow/title/meta for future charts
- Barrel `index.ts`

---

## Deferred

Choropleth/LGA SVG, chart libraries, replacing Places Leaflet, full project explorer.
