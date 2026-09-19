import Link from "next/link";
import type { FundingStatus, ProjectHandler, ProjectHandlerKind } from "@nigeria-for-nigerians/domain";
import { FUNDING_STATUS_LABEL } from "@nigeria-for-nigerians/domain";

const HANDLER_TONE: Record<ProjectHandlerKind, string> = {
  government: "bg-civic-blueSoft text-civic-blue",
  business: "bg-civic-amberSoft text-civic-amber",
  ngo: "bg-civic-greenSoft text-civic-green",
  community: "bg-paper text-civic-slate",
};

const HANDLER_LABEL: Record<ProjectHandlerKind, string> = {
  government: "Government",
  business: "Business",
  ngo: "NGO",
  community: "Community",
};

const FUNDING_TONE: Record<FundingStatus, string> = {
  fully_funded: "border-civic-green bg-civic-greenSoft text-civic-green",
  partially_funded: "border-civic-amber bg-civic-amberSoft text-civic-amber",
  unfunded: "border-paper-border bg-paper text-ink-faint",
};

function Meter({
  label,
  percent,
  tone,
}: {
  label: string;
  percent: number;
  tone: "green" | "amber";
}) {
  const pct = Math.min(100, Math.max(0, percent));
  const bar = tone === "green" ? "bg-civic-green" : "bg-civic-amber";
  const ink = tone === "green" ? "text-civic-green" : "text-civic-amber";
  return (
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">{label}</p>
      <p className={`mt-1 font-mono text-4xl leading-none sm:text-5xl ${ink}`}>{pct}%</p>
      <div className="mt-3 h-3 w-full bg-ink/10" aria-hidden>
        <div
          className={`meter-fill h-full ${bar}`}
          style={{ width: `${pct === 0 ? 0 : Math.max(4, pct)}%` }}
        />
      </div>
    </div>
  );
}

export function ProjectGlance({
  workPercent,
  fundingPercent,
  fundingStatus,
  locationName,
  workStatus,
  handlers,
  gapLabel,
  summaryLine,
  campaignPlatform,
}: {
  workPercent: number;
  fundingPercent: number;
  fundingStatus: FundingStatus;
  locationName?: string;
  workStatus: string;
  handlers: ProjectHandler[];
  gapLabel?: string;
  summaryLine: string;
  /** When set, shows a CTA link to #funding-request */
  campaignPlatform?: string;
}) {
  return (
    <div className="anim-rise border border-paper-border bg-civic-greenSoft/50">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-border px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint">
            At a glance
          </span>
          {locationName ? (
            <span className="font-mono text-[11px] text-ink-muted">· {locationName}</span>
          ) : null}
          <span className="border border-paper-border bg-paper px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-faint">
            {workStatus.replace(/_/g, " ")}
          </span>
          <span
            className={`border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${FUNDING_TONE[fundingStatus]}`}
          >
            {FUNDING_STATUS_LABEL[fundingStatus]}
          </span>
        </div>
        {campaignPlatform ? (
          <a
            href="#funding-request"
            className="border border-civic-blue bg-civic-blueSoft px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-civic-blue no-underline hover:underline"
          >
            Funding request · {campaignPlatform}
          </a>
        ) : null}
      </div>

      <div className="grid gap-8 px-4 py-6 sm:grid-cols-2 sm:px-5 sm:py-8">
        <Meter label="Work progress" percent={workPercent} tone="green" />
        <Meter label="Funding received" percent={fundingPercent} tone="amber" />
      </div>

      <div className="border-t border-paper-border px-4 py-4 sm:px-5">
        <p className="text-sm text-ink-muted">{summaryLine}</p>
        {gapLabel ? (
          <p className="mt-2 border border-civic-amber bg-civic-amberSoft px-3 py-2 text-sm text-civic-amber">
            {gapLabel}
          </p>
        ) : null}
        {handlers.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {handlers.map((h) => (
              <Link
                key={h.kind + h.href}
                href={h.href}
                className={`inline-flex items-center gap-1.5 border border-transparent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider no-underline ${HANDLER_TONE[h.kind]}`}
              >
                {HANDLER_LABEL[h.kind]}
                <span className="font-normal normal-case tracking-normal opacity-80">
                  · {h.label.length > 28 ? h.label.slice(0, 28) + "…" : h.label}
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
