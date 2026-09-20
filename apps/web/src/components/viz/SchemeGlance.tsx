import type { MatterCategory, MatterStatus, SchemeGlance } from "@nigeria-for-nigerians/domain";
import { VizFrame } from "./VizFrame";

const STATUS_SEGMENTS: { key: MatterStatus; label: string; tone: string }[] = [
  { key: "published", label: "Published", tone: "bg-civic-amber" },
  { key: "under_review", label: "Review", tone: "bg-civic-slate" },
  { key: "accepted", label: "Accepted", tone: "bg-civic-blue" },
  { key: "filed", label: "Filed", tone: "bg-civic-green" },
  { key: "in_hearing", label: "Hearing", tone: "bg-civic-green" },
  { key: "closed_won", label: "Closed won", tone: "bg-civic-green" },
  { key: "closed_lost", label: "Closed lost", tone: "bg-ink/40" },
  { key: "closed_withdrawn", label: "Withdrawn", tone: "bg-ink/30" },
  { key: "archived", label: "Archived", tone: "bg-ink/20" },
];

function categoryLabel(c: MatterCategory): string {
  return c.replace(/_/g, " ");
}

export function SchemeGlance({ glance }: { glance: SchemeGlance }) {
  const statusTotal = Math.max(
    STATUS_SEGMENTS.reduce((n, s) => n + (glance.byStatus[s.key] ?? 0), 0),
    1,
  );
  const maxCategory = Math.max(...glance.byCategory.map((c) => c.count), 1);

  const figures = [
    { label: "Matters", value: glance.totalMatters, tone: "text-ink" },
    { label: "Awaiting NGO", value: glance.awaitingNgo, tone: "text-civic-amber" },
    { label: "In progress", value: glance.inProgress, tone: "text-civic-blue" },
    { label: "Closed", value: glance.closed, tone: "text-civic-green" },
    { label: "Evidence", value: glance.evidenceCount, tone: "text-ink" },
    { label: "Partners", value: glance.partnerCount, tone: "text-civic-green" },
  ];

  return (
    <VizFrame eyebrow="At a glance" title="Scheme pulse" meta={`${glance.totalMatters} matters`}>
      <div className="anim-rise border border-paper-border bg-civic-greenSoft/40">
        <div className="grid grid-cols-2 gap-px bg-paper-border sm:grid-cols-3 lg:grid-cols-6">
          {figures.map((f) => (
            <div key={f.label} className="bg-paper-card px-4 py-5 sm:px-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
                {f.label}
              </p>
              <p className={`mt-2 font-mono text-4xl leading-none sm:text-5xl ${f.tone}`}>
                {f.value}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-paper-border px-4 py-6 sm:px-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
            Status pipeline
          </p>
          <div className="mt-3 flex h-10 w-full overflow-hidden bg-ink/5" aria-hidden>
            {STATUS_SEGMENTS.map((s) => {
              const n = glance.byStatus[s.key] ?? 0;
              if (n === 0) return null;
              const pct = Math.max(4, Math.round((n / statusTotal) * 100));
              return (
                <div
                  key={s.key}
                  className={`meter-fill h-full ${s.tone}`}
                  style={{ width: `${pct}%` }}
                  title={`${s.label}: ${n}`}
                />
              );
            })}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {STATUS_SEGMENTS.filter((s) => (glance.byStatus[s.key] ?? 0) > 0).map((s) => (
              <li key={s.key} className="flex items-center gap-1.5 font-mono text-[11px] text-ink-muted">
                <span className={`inline-block h-2 w-2 ${s.tone}`} aria-hidden />
                {s.label} · {glance.byStatus[s.key]}
              </li>
            ))}
          </ul>
        </div>

        {glance.byCategory.length > 0 ? (
          <div className="border-t border-paper-border px-4 py-6 sm:px-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
              By category
            </p>
            <ul className="mt-4 space-y-3">
              {glance.byCategory.map((row) => {
                const pct = Math.round((row.count / maxCategory) * 100);
                return (
                  <li key={row.category}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm capitalize text-ink">{categoryLabel(row.category)}</span>
                      <span className="font-mono text-sm text-ink-faint">{row.count}</span>
                    </div>
                    <div className="mt-1.5 h-3 w-full bg-ink/10" aria-hidden>
                      <div
                        className="meter-fill h-full bg-civic-green"
                        style={{ width: `${Math.max(6, pct)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </VizFrame>
  );
}
