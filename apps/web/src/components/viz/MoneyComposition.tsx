import type { FundingSource, FundingStatus } from "@nigeria-for-nigerians/domain";
import { FUNDING_STATUS_LABEL, store } from "@nigeria-for-nigerians/domain";

const SOURCE_TONES = [
  "bg-civic-amber",
  "bg-civic-blue",
  "bg-civic-green",
  "bg-civic-red",
  "bg-civic-slate",
];

export function MoneyComposition({
  budgetTarget,
  receivedTotal,
  spendTotal,
  fundingStatus,
  fundingPercent,
  sources,
  summary,
}: {
  budgetTarget: number;
  receivedTotal: number;
  spendTotal: number;
  fundingStatus: FundingStatus;
  fundingPercent: number;
  sources: FundingSource[];
  summary?: string;
}) {
  const scale = Math.max(budgetTarget, receivedTotal, spendTotal, 1);
  const row = (label: string, amount: number, barClass: string) => {
    const pct = Math.round((amount / scale) * 100);
    return (
      <div key={label}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
            {label}
          </span>
          <span className="font-mono text-sm text-ink">{store.formatNaira(amount)}</span>
        </div>
        <div className="mt-1.5 h-8 w-full bg-ink/5" aria-hidden>
          <div
            className={`meter-fill h-full ${barClass}`}
            style={{ width: `${amount === 0 ? 0 : Math.max(3, pct)}%` }}
          />
        </div>
      </div>
    );
  };

  const sourceTotal = sources.reduce((s, x) => s + x.receivedAmount, 0) || 1;
  const fundingTone =
    fundingStatus === "fully_funded"
      ? "border-civic-green bg-civic-greenSoft text-civic-green"
      : fundingStatus === "partially_funded"
        ? "border-civic-amber bg-civic-amberSoft text-civic-amber"
        : "border-paper-border bg-paper text-ink-faint";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`border px-2.5 py-1 text-xs font-medium uppercase tracking-wider ${fundingTone}`}>
          {FUNDING_STATUS_LABEL[fundingStatus]}
        </span>
        <span className="font-mono text-sm text-ink-muted">{fundingPercent}% of budget received</span>
      </div>

      <div className="space-y-4">
        {row("Budget target", budgetTarget, "bg-ink/25")}
        {row("Received", receivedTotal, "bg-civic-amber")}
        {row("Spent", spendTotal, "bg-civic-green")}
      </div>

      {summary ? <p className="text-sm text-ink-muted">{summary}</p> : null}

      {sources.length > 0 ? (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
            Source mix (received)
          </p>
          <div className="mt-2 flex h-4 w-full overflow-hidden bg-ink/5" aria-hidden>
            {sources.map((s, i) => {
              const w = (s.receivedAmount / sourceTotal) * 100;
              if (s.receivedAmount <= 0) return null;
              return (
                <div
                  key={s.id}
                  className={`plane-link h-full ${SOURCE_TONES[i % SOURCE_TONES.length]}`}
                  style={{ width: `${Math.max(2, w)}%` }}
                  title={`${s.label}: ${store.formatNaira(s.receivedAmount)}`}
                />
              );
            })}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {sources.map((s, i) => (
              <li key={s.id} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                <span
                  className={`inline-block h-2 w-2 ${SOURCE_TONES[i % SOURCE_TONES.length]}`}
                  aria-hidden
                />
                <span className="capitalize">{s.kind.replace(/_/g, " ")}</span>
                <span className="font-mono">{store.formatNaira(s.receivedAmount)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
