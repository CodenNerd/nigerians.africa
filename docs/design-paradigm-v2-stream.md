# Design Paradigm v2 — One-unit skim stream

**Enhancement on top of** [`design-paradigm.md`](./design-paradigm.md).  
Do not replace v1. Other projects may adopt v1 alone, or v1 + this stream layer.

---

## Intent

Keep the **archive / reading-room** feel (planes, serif display, trust labels, no social chrome).  
Borrow only Twitter’s **organization**: one repeating unit, strict vertical rhythm, skim layers.

Overload the citizen with *records*, not with *UI widgets*.

---

## One unit

Every stream row uses the same shape:

| Layer | Content | Always visible? |
|-------|---------|-----------------|
| L1 chrome | Kind (eyebrow) · StatusLabel · date (mono) | Yes |
| L1 primary | Title (one line, medium weight) | Yes |
| L2 skim | Summary (`line-clamp-1`, muted) | Yes (skim) |
| L3 | Related chip · “Open →” on hover | Yes / hover |

- Seamed list (`gap-px` + paper-border), **compact** padding (`px-4 py-3`).
- Soft plane tint by kind family (problem/report → redSoft, money → amberSoft, office/official → blueSoft, project/org → greenSoft). No card chrome, no avatars, no like/repost actions.
- Entire row is one link into the existing dossier route.

---

## Where it lives

- **Home:** stream sits as a **sticky side rail** beside the main archive column (map, problems, money, actions). On small screens it stacks below or above within the same grid flow (main first, rail second on mobile — or rail after hero content).
- **`/record`:** full-width stream page for denser browsing.
- Hub indexes keep **EntityList** (larger archive rows). Stream is for chronology throughput.

---

## Data pattern

Curated `publicRecord` seed + synthesized rows from memory / reports / claims, merged, deduped (`href+title`), newest first, capped for demo.

---

## Explicitly not this enhancement

- Infinite scroll, ranking algorithms, social graph
- Changing v1 color/type tokens
- Replacing mega-nav or hub EntityLists
- Dark mode or glassmorphic feeds

---

## Porting

1. Implement v1 tokens and planes first.
2. Add `RecordStreamItem` + `RecordStream` as above.
3. Promote a stream section where chronology matters more than category browsing.
