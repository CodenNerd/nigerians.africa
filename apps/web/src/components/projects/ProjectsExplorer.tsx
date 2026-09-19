"use client";

import { Suspense, useCallback, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  KANBAN_STATUSES,
  store,
  type ProjectHandlerKind,
  type ProjectIndexEntry,
  type ProjectStatus,
} from "@nigeria-for-nigerians/domain";
import { StatusLabel } from "@/components/StatusLabel";

const HANDLER_LABEL: Record<ProjectHandlerKind, string> = {
  government: "Government",
  business: "Business",
  ngo: "NGO",
  community: "Community",
};

const HANDLER_TONE: Record<ProjectHandlerKind, string> = {
  government: "bg-civic-blueSoft text-civic-blue",
  business: "bg-civic-amberSoft text-civic-amber",
  ngo: "bg-civic-greenSoft text-civic-green",
  community: "bg-paper text-civic-slate",
};

type ViewMode = "list" | "kanban";
type CompletionFilter = "any" | "complete" | "incomplete";

type Filters = {
  state: string;
  status: string;
  handler: string;
  dateFrom: string;
  dateTo: string;
  fundingMin: string;
  fundingMax: string;
  spendMin: string;
  spendMax: string;
  progressMin: string;
  completion: CompletionFilter;
  budget: string;
  allocation: string;
  view: ViewMode;
};

function parseNum(v: string): number | undefined {
  if (!v.trim()) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function readFilters(params: URLSearchParams): Filters {
  const view = params.get("view") === "kanban" ? "kanban" : "list";
  const completionRaw = params.get("completion");
  const completion: CompletionFilter =
    completionRaw === "complete" || completionRaw === "incomplete" ? completionRaw : "any";
  return {
    state: params.get("state") ?? "",
    status: params.get("status") ?? "",
    handler: params.get("handler") ?? "",
    dateFrom: params.get("dateFrom") ?? "",
    dateTo: params.get("dateTo") ?? "",
    fundingMin: params.get("fundingMin") ?? "",
    fundingMax: params.get("fundingMax") ?? "",
    spendMin: params.get("spendMin") ?? "",
    spendMax: params.get("spendMax") ?? "",
    progressMin: params.get("progressMin") ?? "",
    completion,
    budget: params.get("budget") ?? "",
    allocation: params.get("allocation") ?? "",
    view,
  };
}

function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  const set = (k: keyof Filters, skipEmpty = true) => {
    const v = f[k];
    if (skipEmpty && (!v || v === "any" || (k === "view" && v === "list"))) return;
    p.set(k, v);
  };
  set("state");
  set("status");
  set("handler");
  set("dateFrom");
  set("dateTo");
  set("fundingMin");
  set("fundingMax");
  set("spendMin");
  set("spendMax");
  set("progressMin");
  set("completion");
  set("budget");
  set("allocation");
  set("view");
  return p;
}

function projectInDateRange(e: ProjectIndexEntry, from: string, to: string): boolean {
  const dates = [e.startDate, e.expectedEndDate, e.actualEndDate].filter(Boolean) as string[];
  if (!from && !to) return true;
  if (!dates.length) return false;
  if (from && dates.every((d) => d < from)) return false;
  if (to && dates.every((d) => d > to)) return false;
  return true;
}

function applyFilters(entries: ProjectIndexEntry[], f: Filters): ProjectIndexEntry[] {
  const fundingMin = parseNum(f.fundingMin);
  const fundingMax = parseNum(f.fundingMax);
  const spendMin = parseNum(f.spendMin);
  const spendMax = parseNum(f.spendMax);
  const progressMin = parseNum(f.progressMin);

  return entries.filter((e) => {
    if (f.state && e.stateSlug !== f.state) return false;
    if (f.status && e.status !== f.status) return false;
    if (f.handler && !e.handlerKinds.includes(f.handler as ProjectHandlerKind)) return false;
    if (!projectInDateRange(e, f.dateFrom, f.dateTo)) return false;
    if (fundingMin != null && e.approvedAmount < fundingMin) return false;
    if (fundingMax != null && e.approvedAmount > fundingMax) return false;
    if (spendMin != null && e.reportedSpend < spendMin) return false;
    if (spendMax != null && e.reportedSpend > spendMax) return false;
    if (progressMin != null && e.progressPercent < progressMin) return false;
    if (f.completion === "complete" && !e.completed) return false;
    if (f.completion === "incomplete" && e.completed) return false;
    if (f.budget && e.budgetId !== f.budget) return false;
    if (f.allocation && e.allocationId !== f.allocation && e.allocationSlug !== f.allocation) {
      return false;
    }
    return true;
  });
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">{label}</span>
      {children}
    </label>
  );
}

const controlClass =
  "w-full border border-paper-border bg-paper-card px-2.5 py-1.5 text-sm text-ink outline-none focus:border-civic-green";

function ProjectsExplorerInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => readFilters(searchParams), [searchParams]);

  const index = useMemo(() => store.projectIndex(), []);
  const facets = useMemo(() => store.projectFacets(index), [index]);
  const filtered = useMemo(() => applyFilters(index, filters), [index, filters]);

  const pushFilters = useCallback(
    (next: Filters) => {
      const qs = filtersToParams(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const patch = useCallback(
    (partial: Partial<Filters>) => {
      pushFilters({ ...filters, ...partial });
    },
    [filters, pushFilters],
  );

  const clear = () => {
    pushFilters({
      state: "",
      status: "",
      handler: "",
      dateFrom: "",
      dateTo: "",
      fundingMin: "",
      fundingMax: "",
      spendMin: "",
      spendMax: "",
      progressMin: "",
      completion: "any",
      budget: "",
      allocation: "",
      view: filters.view,
    });
  };

  const activeCount = [
    filters.state,
    filters.status,
    filters.handler,
    filters.dateFrom,
    filters.dateTo,
    filters.fundingMin,
    filters.fundingMax,
    filters.spendMin,
    filters.spendMax,
    filters.progressMin,
    filters.completion !== "any" ? filters.completion : "",
    filters.budget,
    filters.allocation,
  ].filter(Boolean).length;

  return (
    <div className="anim-rise">
      <div className="border border-paper-border bg-paper-card/80">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-paper-border px-4 py-3 sm:px-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint">
              Sift the archive
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {filtered.length} of {index.length} projects
              {activeCount ? ` · ${activeCount} filter${activeCount === 1 ? "" : "s"}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex border border-paper-border" role="group" aria-label="View">
              <button
                type="button"
                onClick={() => patch({ view: "list" })}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider ${
                  filters.view === "list"
                    ? "bg-civic-greenSoft text-civic-green"
                    : "bg-paper text-ink-muted hover:text-ink"
                }`}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => patch({ view: "kanban" })}
                className={`border-l border-paper-border px-3 py-1.5 text-xs uppercase tracking-wider ${
                  filters.view === "kanban"
                    ? "bg-civic-greenSoft text-civic-green"
                    : "bg-paper text-ink-muted hover:text-ink"
                }`}
              >
                Board
              </button>
            </div>
            {activeCount ? (
              <button
                type="button"
                onClick={clear}
                className="text-xs uppercase tracking-wider text-civic-green hover:underline"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-4 xl:grid-cols-5">
          <Field label="State">
            <select
              className={controlClass}
              value={filters.state}
              onChange={(e) => patch({ state: e.target.value })}
            >
              <option value="">Any state</option>
              {facets.states.map((s) => (
                <option key={s.id} value={s.slug}>
                  {s.name} ({s.count})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className={controlClass}
              value={filters.status}
              onChange={(e) => patch({ status: e.target.value })}
            >
              <option value="">Any status</option>
              {KANBAN_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
              <option value="cancelled">cancelled</option>
            </select>
          </Field>
          <Field label="Handler">
            <select
              className={controlClass}
              value={filters.handler}
              onChange={(e) => patch({ handler: e.target.value })}
            >
              <option value="">Any handler</option>
              {(Object.keys(HANDLER_LABEL) as ProjectHandlerKind[]).map((k) => (
                <option key={k} value={k}>
                  {HANDLER_LABEL[k]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Completion">
            <select
              className={controlClass}
              value={filters.completion}
              onChange={(e) => patch({ completion: e.target.value as CompletionFilter })}
            >
              <option value="any">Any</option>
              <option value="complete">Complete</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </Field>
          <Field label="Budget">
            <select
              className={controlClass}
              value={filters.budget}
              onChange={(e) => patch({ budget: e.target.value })}
            >
              <option value="">Any budget</option>
              {facets.budgets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Allocation">
            <select
              className={controlClass}
              value={filters.allocation}
              onChange={(e) => patch({ allocation: e.target.value })}
            >
              <option value="">Any allocation</option>
              {facets.allocations.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date from">
            <input
              type="date"
              className={controlClass}
              value={filters.dateFrom}
              onChange={(e) => patch({ dateFrom: e.target.value })}
            />
          </Field>
          <Field label="Date to">
            <input
              type="date"
              className={controlClass}
              value={filters.dateTo}
              onChange={(e) => patch({ dateTo: e.target.value })}
            />
          </Field>
          <Field label="Funding min (₦)">
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 500000000"
              className={controlClass}
              value={filters.fundingMin}
              onChange={(e) => patch({ fundingMin: e.target.value })}
            />
          </Field>
          <Field label="Funding max (₦)">
            <input
              type="number"
              inputMode="numeric"
              className={controlClass}
              value={filters.fundingMax}
              onChange={(e) => patch({ fundingMax: e.target.value })}
            />
          </Field>
          <Field label="Spend min (₦)">
            <input
              type="number"
              inputMode="numeric"
              className={controlClass}
              value={filters.spendMin}
              onChange={(e) => patch({ spendMin: e.target.value })}
            />
          </Field>
          <Field label="Spend max (₦)">
            <input
              type="number"
              inputMode="numeric"
              className={controlClass}
              value={filters.spendMax}
              onChange={(e) => patch({ spendMax: e.target.value })}
            />
          </Field>
          <Field label="Progress min %">
            <input
              type="number"
              min={0}
              max={100}
              inputMode="numeric"
              className={controlClass}
              value={filters.progressMin}
              onChange={(e) => patch({ progressMin: e.target.value })}
            />
          </Field>
        </div>
      </div>

      {filters.view === "list" ? (
        <ProjectListView entries={filtered} />
      ) : (
        <ProjectKanbanView entries={filtered} />
      )}
    </div>
  );
}

function HandlerChips({ entry }: { entry: ProjectIndexEntry }) {
  if (!entry.handlers.length) {
    return (
      <span className="border border-paper-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-faint">
        Handler not linked
      </span>
    );
  }
  return (
    <>
      {entry.handlers.map((h) => (
        <span
          key={h.kind + h.href}
          className={`inline-flex items-center gap-1 border border-transparent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${HANDLER_TONE[h.kind]}`}
          title={h.label}
        >
          {HANDLER_LABEL[h.kind]}
        </span>
      ))}
    </>
  );
}

function FundingBar({ entry }: { entry: ProjectIndexEntry }) {
  const pct =
    entry.approvedAmount > 0
      ? Math.round((entry.releasedAmount / entry.approvedAmount) * 100)
      : 0;
  return (
    <div className="min-w-[7rem]">
      <p className="font-mono text-[11px] text-ink-faint">
        {store.formatNaira(entry.releasedAmount)} / {store.formatNaira(entry.approvedAmount)}
      </p>
      <div className="mt-1 h-1.5 w-full bg-ink/10" aria-hidden>
        <div
          className="h-full bg-civic-green"
          style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
        />
      </div>
    </div>
  );
}

function ProjectListView({ entries }: { entries: ProjectIndexEntry[] }) {
  if (!entries.length) {
    return (
      <p className="mt-8 border border-dashed border-paper-border px-4 py-8 text-center text-sm text-ink-muted">
        No projects match these filters.
      </p>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-paper-border border border-paper-border bg-paper-card">
      {entries.map((e) => (
        <li key={e.id}>
          <Link
            href={`/projects/${e.slug}`}
            className="plane-link group flex flex-col gap-3 px-4 py-4 no-underline sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                  {e.status.replace(/_/g, " ")}
                  {e.stateName ? ` · ${e.stateName}` : ""}
                </span>
                <StatusLabel status={e.verificationStatus} />
              </div>
              <h3 className="mt-1 font-display text-xl text-ink group-hover:underline sm:text-2xl">
                {e.name}
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <HandlerChips entry={e} />
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-6 sm:justify-end">
              <FundingBar entry={e} />
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-ink-faint">Progress</p>
                <p className="font-mono text-lg text-civic-green">{e.progressPercent}%</p>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ProjectKanbanView({ entries }: { entries: ProjectIndexEntry[] }) {
  const byStatus = useMemo(() => {
    const map = new Map<ProjectStatus, ProjectIndexEntry[]>();
    for (const s of KANBAN_STATUSES) map.set(s, []);
    for (const e of entries) {
      if (!map.has(e.status)) continue;
      map.get(e.status)!.push(e);
    }
    return map;
  }, [entries]);

  const columns = KANBAN_STATUSES;

  return (
    <div className="mt-6 -mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex min-w-max gap-3 pb-4">
        {columns.map((status) => {
          const cards = byStatus.get(status) ?? [];
          return (
            <section
              key={status}
              className="flex w-64 shrink-0 flex-col border border-paper-border bg-paper-card/90"
              aria-label={`${status.replace(/_/g, " ")} column`}
            >
              <header className="border-b border-paper-border px-3 py-2.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                  {status.replace(/_/g, " ")}
                </p>
                <p className="mt-0.5 font-mono text-xs text-ink-muted">{cards.length}</p>
              </header>
              <ul className="flex flex-1 flex-col gap-px bg-paper-border p-px">
                {cards.length === 0 ? (
                  <li className="bg-paper px-3 py-6 text-center text-[11px] text-ink-faint">Empty</li>
                ) : (
                  cards.map((e) => (
                    <li key={e.id} className="bg-paper">
                      <Link
                        href={`/projects/${e.slug}`}
                        className="plane-link block px-3 py-3 no-underline"
                      >
                        <p className="font-display text-base leading-snug text-ink">{e.name}</p>
                        <p className="mt-1 text-[11px] text-ink-faint">
                          {e.stateName ?? e.locationName ?? "—"} · {e.progressPercent}%
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <HandlerChips entry={e} />
                        </div>
                        <div className="mt-2">
                          <FundingBar entry={e} />
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function ProjectsExplorer() {
  return (
    <Suspense
      fallback={
        <p className="mt-8 text-sm text-ink-muted">Loading project archive…</p>
      }
    >
      <ProjectsExplorerInner />
    </Suspense>
  );
}
