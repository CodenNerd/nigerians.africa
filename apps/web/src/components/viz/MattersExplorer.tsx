"use client";

import { Suspense, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  MATTER_PROGRESS_STEPS,
  matterProgressIndex,
  type MatterCategory,
  type MatterStatus,
  type ProsecutionMatter,
} from "@nigeria-for-nigerians/domain";
import { VizFrame } from "./VizFrame";
import type { MatterReelItem } from "./MatterReel";
import { MATTER_STATUS_TONE } from "@/lib/hot-matter-tickets";

type StageFilter = "all" | "awaiting" | "active" | "closed";
type ViewMode = "list" | "grid";
type SortMode = "newest" | "progress";

const CLOSED: MatterStatus[] = [
  "closed_won",
  "closed_lost",
  "closed_withdrawn",
  "archived",
];

const ACTIVE: MatterStatus[] = ["accepted", "filed", "in_hearing"];

function stageOf(m: ProsecutionMatter): Exclude<StageFilter, "all"> {
  if (CLOSED.includes(m.status)) return "closed";
  if (ACTIVE.includes(m.status)) return "active";
  if (!m.prosecutingOrgId) return "awaiting";
  if (m.status === "published" || m.status === "under_review") return "awaiting";
  return "active";
}

function categoryLabel(c: MatterCategory): string {
  return c.replace(/_/g, " ");
}

function MattersExplorerInner({
  items,
  emptyHint = "No matters published yet.",
}: {
  items: MatterReelItem[];
  emptyHint?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const stage = (searchParams.get("stage") as StageFilter) || "all";
  const category = searchParams.get("category") ?? "";
  const status = searchParams.get("status") ?? "";
  const sort = (searchParams.get("sort") as SortMode) || "newest";
  const view = (searchParams.get("view") as ViewMode) || "list";

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      const defaults: Record<string, string> = { view: "list", sort: "newest" };
      const isDefault =
        !value ||
        value === "all" ||
        (defaults[key] !== undefined && value === defaults[key]);
      if (isDefault) next.delete(key);
      else next.set(key, value);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const categories = useMemo(() => {
    const set = new Set<MatterCategory>();
    for (const i of items) set.add(i.matter.category);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const statuses = useMemo(() => {
    const set = new Set<MatterStatus>();
    for (const i of items) set.add(i.matter.status);
    return [...set].sort((a, b) => matterProgressIndex(a) - matterProgressIndex(b));
  }, [items]);

  const stageCounts = useMemo(() => {
    const counts = { all: items.length, awaiting: 0, active: 0, closed: 0 };
    for (const i of items) counts[stageOf(i.matter)] += 1;
    return counts;
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = items.filter((item) => {
      const m = item.matter;
      if (stage !== "all" && stageOf(m) !== stage) return false;
      if (category && m.category !== category) return false;
      if (status && m.status !== status) return false;
      if (needle) {
        const hay = [
          m.title,
          m.summary,
          m.category,
          item.locationName,
          item.org?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "progress") {
        return matterProgressIndex(b.matter.status) - matterProgressIndex(a.matter.status);
      }
      return b.matter.publishedAt.localeCompare(a.matter.publishedAt);
    });

    return list;
  }, [items, q, stage, category, status, sort]);

  if (!items.length) {
    return <p className="text-sm text-ink-muted">{emptyHint}</p>;
  }

  const stages: { id: StageFilter; label: string }[] = [
    { id: "all", label: `All (${stageCounts.all})` },
    { id: "awaiting", label: `Awaiting NGO (${stageCounts.awaiting})` },
    { id: "active", label: `In progress (${stageCounts.active})` },
    { id: "closed", label: `Closed (${stageCounts.closed})` },
  ];

  return (
    <VizFrame
      eyebrow="On the record"
      title="Matters in motion"
      meta={`${filtered.length} of ${items.length}`}
    >
      <div className="space-y-4 border border-paper-border bg-paper-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <label className="block min-w-0 flex-1 text-xs text-ink-faint">
            Search
            <input
              type="search"
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              placeholder="Title, place, NGO, category…"
              className="mt-1 w-full border border-paper-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-civic-green"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <label className="text-xs text-ink-faint">
              Sort
              <select
                value={sort}
                onChange={(e) => setParam("sort", e.target.value)}
                className="ml-2 border border-paper-border bg-paper px-2 py-2 text-sm text-ink"
              >
                <option value="newest">Newest</option>
                <option value="progress">Furthest along</option>
              </select>
            </label>
            <div className="flex border border-paper-border">
              <button
                type="button"
                onClick={() => setParam("view", "list")}
                className={`px-3 py-2 text-xs uppercase tracking-wider ${
                  view === "list" ? "bg-ink text-paper" : "bg-paper text-ink-muted hover:text-ink"
                }`}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setParam("view", "grid")}
                className={`px-3 py-2 text-xs uppercase tracking-wider ${
                  view === "grid" ? "bg-ink text-paper" : "bg-paper text-ink-muted hover:text-ink"
                }`}
              >
                Grid
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Pipeline stage">
          {stages.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setParam("stage", s.id === "all" ? "" : s.id)}
              className={`border px-2.5 py-1.5 text-xs transition ${
                (stage === "all" && s.id === "all") || stage === s.id
                  ? "border-civic-green bg-civic-greenSoft text-civic-green"
                  : "border-paper-border bg-paper text-ink-muted hover:text-ink"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="text-xs text-ink-faint">
            Category
            <select
              value={category}
              onChange={(e) => setParam("category", e.target.value)}
              className="ml-2 border border-paper-border bg-paper px-2 py-1.5 text-sm text-ink"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-ink-faint">
            Status
            <select
              value={status}
              onChange={(e) => setParam("status", e.target.value)}
              className="ml-2 border border-paper-border bg-paper px-2 py-1.5 text-sm text-ink"
            >
              <option value="">All statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {MATTER_STATUS_TONE[s].label} · {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          {q || stage !== "all" || category || status ? (
            <button
              type="button"
              onClick={() => router.replace(pathname, { scroll: false })}
              className="self-end text-xs text-civic-green hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-ink-muted">
          No matters match these filters. Clear filters or try another search.
        </p>
      ) : view === "grid" ? (
        <ul className="mt-6 grid gap-px bg-paper-border sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <MatterGridCard key={item.matter.id} item={item} />
          ))}
        </ul>
      ) : (
        <ul className="mt-6 divide-y divide-paper-border border-y border-paper-border">
          {filtered.map((item) => (
            <MatterListRow key={item.matter.id} item={item} />
          ))}
        </ul>
      )}
    </VizFrame>
  );
}

function MatterListRow({ item }: { item: MatterReelItem }) {
  const { matter, locationName, org, evidence, href } = item;
  const progress = matterProgressIndex(matter.status);
  const pct = Math.round((progress / (MATTER_PROGRESS_STEPS - 1)) * 100);
  const tone = MATTER_STATUS_TONE[matter.status];
  const poster = evidence?.posterUrl || evidence?.mediaUrl;

  return (
    <li>
      <Link
        href={href}
        className="plane-link group grid gap-4 py-4 no-underline sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center"
      >
        <span className="relative hidden h-[4.5rem] w-[4.5rem] overflow-hidden border border-paper-border bg-ink/10 sm:block">
          {poster ? (
            <Image src={poster} alt="" fill className="object-cover" sizes="72px" />
          ) : (
            <span className="absolute inset-0 bg-gradient-to-br from-civic-slate to-ink" />
          )}
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span
              className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${tone.chip}`}
            >
              {tone.label}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-faint">
              {categoryLabel(matter.category)}
              {locationName ? ` · ${locationName}` : ""}
            </span>
          </span>
          <span className="mt-1.5 block font-display text-xl leading-snug text-ink group-hover:text-civic-green">
            {matter.title}
          </span>
          <span className="mt-1 block text-sm text-ink-muted line-clamp-2">{matter.summary}</span>
          <span className="mt-2 block text-xs text-ink-faint">
            {org ? (
              <>
                Handling · <span className="text-civic-green">{org.name}</span>
              </>
            ) : (
              <span className="text-civic-amber">Awaiting NGO</span>
            )}
            {" · "}
            Published {matter.publishedAt}
            {matter.evidenceIds.length
              ? ` · ${matter.evidenceIds.length} evidence`
              : ""}
          </span>
        </span>
        <span className="hidden w-28 shrink-0 sm:block">
          <span className="flex items-baseline justify-between gap-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            <span>Progress</span>
            <span>{pct}%</span>
          </span>
          <span className="mt-1.5 block h-1.5 w-full bg-ink/10" aria-hidden>
            <span
              className={`block h-full ${tone.bar}`}
              style={{ width: `${Math.max(8, pct)}%` }}
            />
          </span>
        </span>
      </Link>
    </li>
  );
}

function MatterGridCard({ item }: { item: MatterReelItem }) {
  const { matter, locationName, org, evidence, href } = item;
  const progress = matterProgressIndex(matter.status);
  const pct = Math.round((progress / (MATTER_PROGRESS_STEPS - 1)) * 100);
  const tone = MATTER_STATUS_TONE[matter.status];
  const poster = evidence?.posterUrl || evidence?.mediaUrl;
  const isVideo = evidence?.mediaKind === "video";

  return (
    <li className="bg-paper-card">
      <Link href={href} className="plane-link group block h-full no-underline">
        <div className="relative aspect-[16/10] overflow-hidden bg-ink/10">
          {poster ? (
            <Image
              src={poster}
              alt=""
              fill
              className="object-cover transition duration-300 group-hover:brightness-[0.97]"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-civic-slate to-ink" />
          )}
          {isVideo ? (
            <span className="absolute bottom-2 left-2 border border-paper bg-paper/90 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-ink">
              Video
            </span>
          ) : null}
        </div>
        <div className="space-y-2 px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${tone.chip}`}
            >
              {tone.label}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-ink-faint">
              {categoryLabel(matter.category)}
            </span>
          </div>
          <p className="font-display text-lg leading-snug text-ink group-hover:text-civic-green">
            {matter.title}
          </p>
          <p className="text-xs text-ink-faint">
            {locationName ? `${locationName} · ` : ""}
            {org ? org.name : "Awaiting NGO"}
          </p>
          <div className="h-1.5 w-full bg-ink/10" aria-hidden>
            <div className={`h-full ${tone.bar}`} style={{ width: `${Math.max(8, pct)}%` }} />
          </div>
        </div>
      </Link>
    </li>
  );
}

export function MattersExplorer(props: {
  items: MatterReelItem[];
  emptyHint?: string;
}) {
  return (
    <Suspense
      fallback={
        <VizFrame eyebrow="On the record" title="Matters in motion" meta="…">
          <p className="text-sm text-ink-muted">Loading matters…</p>
        </VizFrame>
      }
    >
      <MattersExplorerInner {...props} />
    </Suspense>
  );
}
