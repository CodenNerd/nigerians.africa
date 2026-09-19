# Design Paradigm — Civic Record Surfaces

**Snapshot of the current design system.** Portable: copy this doc into another repo and implement against it. This project may later diverge into an enhanced paradigm; treat this file as the baseline, not a living changelog of future experiments.

---

## 1. Intent

Build interfaces that feel like a **public institution / archive**, not a SaaS dashboard, social feed, or marketing site.

| Feel like | Do not feel like |
|-----------|------------------|
| Quiet reading room | Admin console |
| Newspaper of record | Startup landing page |
| Connected public graph | Card grid of widgets |
| Evidence with provenance | True/false verdicts |

Citizens should browse, inspect, and act — without gamification, dark patterns, or decorative chrome.

---

## 2. Core principles

1. **Planes, not cards.** Soft tinted fields (planes) carry hierarchy. Prefer hairline seams (`1px` border color between items) over bordered boxes with radius and shadow. If removing border/shadow/radius does not hurt understanding, remove it.
2. **Brand / product name is hero-level on promotional surfaces.** On hubs and the home hero, the product identity leads; supporting copy stays secondary.
3. **One job per section.** One headline, usually one short supporting sentence, then content.
4. **Typography does the work.** Display serif for titles; humanist sans for body; monospace for metadata and counts.
5. **Atmosphere without clutter.** Fixed radial washes on the page background; hero fields get soft layered gradients. Avoid flat single-color voids *and* busy decoration.
6. **Trust language.** Status labels stay visible. Never collapse claims or evidence into binary true/false. Missing data is shown as a gap, not hidden.
7. **Lists are first-class.** Maps and visuals are exploration aids; equivalent list/page routes always exist for accessibility and low bandwidth.
8. **Motion is presence, not noise.** Two or three intentional motions (rise-in on intros, fade on secondary lines, brightness hover on planes). No bounce, glow, or perpetual animation.

---

## 3. Color tokens

Light-only (`color-scheme: light`). Rename the `civic` prefix if the domain is not civic; keep the **structure**: ink / paper / semantic soft+hard pairs.

### Ink (text)

| Token | Hex | Use |
|-------|-----|-----|
| `ink` | `#1a1a1a` | Primary text, titles |
| `ink-muted` | `#4a4a4a` | Body, subtitles |
| `ink-faint` | `#6b6b6b` | Eyebrows, meta, captions |

### Paper (surfaces)

| Token | Hex | Use |
|-------|-----|-----|
| `paper` | `#f7f5f0` | Page background |
| `paper-card` | `#ffffff` | Occasional elevated plane (menus, aside panels) |
| `paper-border` | `#e2ddd3` | Rules, seams, hairlines |

### Semantic planes (hard + soft)

Each meaning has a **hard** (ink/accent) and **soft** (fill) pair:

| Role | Hard | Soft | Typical use |
|------|------|------|-------------|
| Primary / trust / success | `#1b5e3b` | `#e8f2ec` | Primary CTAs, active nav, “verified” tones |
| Caution / money / claims | `#8a6d1a` | `#f5efd8` | Budgets, warnings, mid-status |
| Risk / reports / disputes | `#8b2e2e` | `#f5e4e4` | Reports, allegations, deltas |
| Institutional / official | `#1e3a5f` | `#e6eef6` | Official records, FOI, institutional links |
| Neutral structure | `#3d4a54` | (use `paper`) | Slate accents, subdued kinds |

**Rule:** Soft planes are large fills. Hard colors are text, underlines, thin accent bars, and solid buttons — never large neon fields.

### Page atmosphere

```css
body {
  background-color: paper;
  background-image:
    radial-gradient(ellipse 120% 80% at 50% -20%, soft-primary @ 0.7, transparent 55%),
    radial-gradient(ellipse 60% 40% at 100% 0%, soft-institutional @ 0.35, transparent 45%);
  background-attachment: fixed;
}
```

Selection highlight: soft-primary fill + hard-primary text.

---

## 4. Typography

| Role | Family (current) | Fallback | Usage |
|------|------------------|----------|--------|
| Display | Libre Baskerville | Georgia, serif | H1/H2, featured tile titles, pull quotes |
| Sans | Source Sans 3 | system-ui | Body, UI, nav |
| Mono | ui-monospace | SF Mono | Counts, dates, FY labels, “meta” lines |

### Scale conventions

| Element | Treatment |
|---------|-----------|
| Eyebrow | ~11px, medium, uppercase, tracking ~0.22–0.28em, `ink-faint` |
| Page title (H1) | Display, ~4xl → 5xl, leading ~1.08, tracking tight |
| Section title (H2) | Display, ~2xl → 3xl, leading ~1.15 |
| Subtitle | Sans, base → lg, `ink-muted`, max-width ~2xl |
| Meta line | Mono, ~11px, uppercase, tracking ~0.14em, `ink-faint` |
| Body / record prose | Sans, base, relaxed leading, max-width ~68ch (`measure`) |

Avoid default stacks (Inter, Roboto, Arial) for branded/public surfaces.

---

## 5. Layout

### Container

- Max width ~`72rem` (`site`)
- Horizontal padding: 1rem → 1.5rem → 2rem by breakpoint
- Centered with auto margins

### Vertical rhythm

- Hub pages: `py-12` / `lg:py-14`
- Record pages: `py-10` / `lg:py-14`
- Between major sections: ~`mt-14`–`mt-16`
- Within a record: sections stacked with large gaps (~`space-y-16`)

### Record page shell

```
[ Page intro: eyebrow → title → subtitle → status/meta ]
[ Main column (sections)  |  Sticky aside (ask + actions) ]
```

Aside ~`16.5rem`, sticky under header (`top-28`). Main column holds the dossier.

### Seamed lists (EntityList pattern)

```
ul: gap-px, background = paper-border
  li > link: soft plane fill, left accent bar (hard color), display title
```

Hover: slight brightness darken (`.plane-link`), not lift/shadow.

### Avoid

- Dashboard multi-panel first viewports
- Rounded-full pill clusters
- Multi-layer drop shadows
- Inset / floating hero media cards on landing surfaces
- Purple-on-white / indigo gradient tropes
- Dark mode as default

---

## 6. Surface model (“planes”)

A **plane** is a full-bleed soft fill (or white `paper-card`) without card chrome.

```
planeTone = {
  green | blue | amber | red | slate | paper
  → { plane: soft bg, ink: hard text, accent: hard bar }
}
```

Use planes for:

- Hub index rows
- Featured mega-nav tiles
- Action CTA grids
- Kind-grouped claim strips
- Status-adjacent callouts (discrepancy, vetted, FOI)

Accent: `1–4px` left edge bar in the hard color, not a badge pile.

---

## 7. Component recipes

### PageIntro

Eyebrow → H1 → subtitle → optional mono meta. Rise-in animation on mount. Max width ~`3xl`.

### SectionHead

H2 + optional subtitle; optional mono meta right-aligned. Bottom hairline (`border-b paper-border`).

### StatusLabel

Small bordered uppercase chip. Map each status to soft bg + hard text + soft border. Labels are human words (“Disputed”, “Under review”), never icons alone.

### RecordSection

`SectionHead` + body. `scroll-mt` accounts for sticky header.

### Plane CTA / Entity row

Soft plane, display title, optional kind eyebrow, optional description, “Open →” mono affordance on hover.

### Buttons

- Primary: hard fill (green), white text, no heavy radius required (square or slight)
- Ghost: border `paper-border` or soft tint; hard text
- Prefer text links in dossiers over button sprawl

### Forms

Paper/80 fields, `paper-border`, focus ring → hard primary border. Labels: same eyebrow style as PageIntro.

---

## 8. Navigation paradigm

### Primary hubs

Flat set of product areas (e.g. Government, Problems, Money…). Utility links (Search, Ask, About, Sign in) sit apart — no mega panels.

### Desktop mega-menu

On hover/focus of a hub:

1. **Opaque** panel (`paper`, not translucent) full viewport width under the header
2. **Scrim** over the rest of the page (`ink` @ ~50%) so content does not show through
3. Three columns inside the site container:
   - **Featured** — 1 large tile (+ image when available) + 2 smaller tiles
   - **Quick paths** — icon + label + optional hint
   - **Popular / start here** — chip links to known records or search queries
4. Footer: “Browse all {Hub} →”
5. Open ~100ms / close ~200ms delay; Escape closes; one menu at a time

### Mobile

Accordion under each hub (same content, compact). No hover mega on touch.

### Icons

Inline SVG strokes (~1.75 weight), ~16px. No heavy icon library required for the paradigm.

---

## 9. Motion

| Token | Behavior |
|-------|----------|
| `anim-rise` | opacity 0→1, translateY 12→0, ~0.55s ease-out |
| `anim-fade` | opacity 0→1, ~0.7s |
| `plane-link` hover | `brightness(0.97)` over ~200ms |

Use rise on page intros and mega panels. Prefer `animation-delay` for staggered secondary lines. Do not animate layout thrash or infinite loops.

---

## 10. Content & trust patterns

- **Eyebrows** name the kind of surface (“Public record”, “Organization · NGO”), not slogans.
- **Provenance** (sources, last reviewed, evidence counts) sits near claims — mono or small sans.
- **Gaps** are visible (“not yet vetted”, “gap visible”, empty evidence bar).
- **Actions** are calm: Report, Start FOI, Browse — not “Destroy” / “Claim victory”.
- **Maps** get a footnote: exploration aid; lists remain available.

---

## 11. Hero / landing (when used)

First viewport budget:

- Brand (hero-level)
- One headline (if needed, subordinate to brand)
- One short supporting sentence
- One CTA group
- Optional dominant full-bleed atmosphere (gradient field), not a collage of cards

Do not pack stats, schedules, or secondary promos into the first viewport.

Utility class pattern: `.hero-field` — soft vertical wash + two radial accents using primary/institutional soft tints.

---

## 12. Accessibility baseline

- Skip link to `#main`
- Sticky header; `scroll-mt` on in-page anchors
- Visible focus on interactive controls
- Mega/accordion: `aria-expanded`, `aria-haspopup`, Escape to dismiss
- Do not rely on color alone for status — keep text labels
- Prefer real text over text-in-image for titles

---

## 13. Anti-patterns (explicit)

- Glassmorphism / see-through mega menus over busy pages
- Purple–indigo gradient branding defaults
- Warm-cream + terracotta + high-contrast serif cliché *as a substitute for this token set* (this paradigm already uses warm paper; keep civic greens/blues, don’t drift to terracotta kitsch)
- Broadsheet dense columns with zero radius *and* no plane color (hairlines alone are not enough)
- Emoji as UI
- Auto-fraud / auto-guilt language from the interface
- New top-nav product names that fragment the mental model

---

## 14. Porting checklist

To reuse this paradigm on another project:

1. Copy **color**, **type**, **max-width**, and **planeTone** into your theme (Tailwind, CSS variables, or design tokens).
2. Implement utilities: `site-container`, `prose-record`, `plane-link`, `anim-rise`, `anim-fade`, optional `hero-field`.
3. Build `PageIntro`, `SectionHead`, seamed `EntityList`, `StatusLabel`, record shell (main + sticky aside).
4. Wire hub mega-nav with opaque panel + page scrim if the IA has multiple hubs.
5. Swap font packages if licensing requires; keep display/sans/mono roles.
6. Rename `civic-*` tokens to your domain; keep hard/soft pairing.
7. Keep this document as `design-paradigm.md` in the new repo; fork a `design-paradigm-v2.md` when you intentionally enhance beyond this baseline.

---

## 15. Reference implementation (this repo)

| Concern | Location |
|---------|----------|
| Tokens | `apps/web/tailwind.config.ts` |
| Utilities / atmosphere | `apps/web/src/app/globals.css` |
| Fonts | `apps/web/src/app/layout.tsx` |
| PageIntro / SectionHead / EntityList | `apps/web/src/components/ui/` |
| Record shell | `apps/web/src/components/RecordPage.tsx` |
| Mega-nav | `apps/web/src/components/SiteHeader.tsx`, `components/nav/`, `lib/nav-mega.ts` |

When this project’s UI evolves past this baseline, **do not silently rewrite this file** — add a new versioned paradigm doc so other projects can still adopt *this* snapshot.
