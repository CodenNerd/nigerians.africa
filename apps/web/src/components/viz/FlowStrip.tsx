import type { ReactNode } from "react";
import { store } from "@nigeria-for-nigerians/domain";

export type FlowStripItem = {
  id: string;
  date: string;
  title: string;
  subtitle?: ReactNode;
  notes?: string;
  amount: number;
  meta?: ReactNode;
};

export function FlowStrip({
  items,
  emptyLabel,
  barTone = "amber",
}: {
  items: FlowStripItem[];
  emptyLabel: string;
  barTone?: "amber" | "green" | "ink";
}) {
  if (!items.length) {
    return <p className="text-sm text-ink-muted">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((i) => i.amount), 1);
  const bar =
    barTone === "green" ? "bg-civic-green" : barTone === "ink" ? "bg-ink/40" : "bg-civic-amber";

  return (
    <ul className="divide-y divide-paper-border border border-paper-border">
      {items.map((row) => {
        const pct = Math.round((row.amount / max) * 100);
        return (
          <li key={row.id} className="px-3 py-3 sm:px-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] text-ink-faint">{row.date}</p>
                <p className="mt-0.5 text-sm font-medium text-ink">{row.title}</p>
                {row.subtitle ? (
                  <div className="mt-1 text-xs text-ink-muted">{row.subtitle}</div>
                ) : null}
                {row.notes ? <p className="mt-1 text-xs text-ink-faint">{row.notes}</p> : null}
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-ink">{store.formatNaira(row.amount)}</p>
                {row.meta ? <div className="mt-1">{row.meta}</div> : null}
              </div>
            </div>
            <div className="mt-2.5 h-2 w-full bg-ink/5" aria-hidden>
              <div
                className={`meter-fill h-full ${bar}`}
                style={{ width: `${Math.max(4, pct)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
