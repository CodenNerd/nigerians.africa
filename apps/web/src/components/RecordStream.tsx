import Link from "next/link";
import clsx from "clsx";
import type { EntityType, PublicRecordItem, VerificationStatus } from "@nigeria-for-nigerians/domain";
import { StatusLabel } from "@/components/StatusLabel";
import { SectionHead } from "@/components/ui";

type StreamTone = "green" | "blue" | "amber" | "red" | "slate" | "paper";

const tonePlane: Record<StreamTone, string> = {
  green: "bg-civic-greenSoft",
  blue: "bg-civic-blueSoft",
  amber: "bg-civic-amberSoft",
  red: "bg-civic-redSoft",
  slate: "bg-paper",
  paper: "bg-paper-card",
};

function toneFor(item: PublicRecordItem): StreamTone {
  const kind = `${item.kind} ${item.entityType ?? ""}`.toLowerCase();
  if (/(problem|report|allegation|disput)/.test(kind)) return "red";
  if (/(money|budget|alloc|contract|spend)/.test(kind)) return "amber";
  if (/(office|official|foi|institution|government|response)/.test(kind)) return "blue";
  if (/(project|organization|vetted|guidance|verified)/.test(kind)) return "green";
  if (/(claim|rumour|memory|election)/.test(kind)) return "slate";
  const byType: Partial<Record<EntityType, StreamTone>> = {
    problem: "red",
    report: "red",
    money: "amber",
    office: "blue",
    institution: "blue",
    response: "blue",
    project: "green",
    organization: "green",
    claim: "slate",
    event: "amber",
    evidence: "blue",
    person: "green",
  };
  if (item.entityType && byType[item.entityType]) return byType[item.entityType]!;
  return "paper";
}

export function RecordStreamItem({
  item,
  compact = false,
}: {
  item: PublicRecordItem;
  compact?: boolean;
}) {
  const plane = tonePlane[toneFor(item)];

  return (
    <li>
      <Link
        href={item.href}
        className={clsx(
          "plane-link group block no-underline transition",
          plane,
          compact ? "px-3 py-2.5" : "px-4 py-3",
        )}
      >
        {/* L1 chrome */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
              {item.kind}
            </span>
            {!compact ? (
              <StatusLabel status={item.status as VerificationStatus} className="scale-90 origin-left" />
            ) : null}
          </div>
          <time className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
            {item.date}
          </time>
        </div>

        {/* L1 primary */}
        <p
          className={clsx(
            "mt-1 font-medium leading-snug text-ink",
            compact ? "line-clamp-2 text-sm" : "text-[15px] sm:text-base",
          )}
        >
          {item.title}
        </p>

        {/* L2 skim */}
        {!compact ? (
          <p className="mt-1 line-clamp-1 text-sm text-ink-muted">{item.summary}</p>
        ) : (
          <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">{item.summary}</p>
        )}

        {/* L3 affordance */}
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
          {item.relatedLabel ? (
            <span
              className={clsx(
                "border border-paper-border/80 bg-paper/50 text-ink-faint",
                compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
              )}
            >
              {item.relatedLabel}
            </span>
          ) : (
            <span />
          )}
          <span className="font-mono text-[10px] uppercase tracking-wider text-civic-green opacity-0 transition group-hover:opacity-100">
            Open →
          </span>
        </div>
      </Link>
    </li>
  );
}

export function RecordStream({
  items,
  title = "Public record",
  subtitle = "A dense stream of meaningful records — newest first. Same shape every row.",
  meta,
  footerHref = "/record",
  footerLabel = "View full stream →",
  showHeader = true,
  compact = false,
}: {
  items: PublicRecordItem[];
  title?: string;
  subtitle?: string;
  meta?: string;
  footerHref?: string;
  footerLabel?: string;
  showHeader?: boolean;
  /** Tighter rows and header for a sidebar rail. */
  compact?: boolean;
}) {
  return (
    <div>
      {showHeader ? (
        compact ? (
          <div className="border-b border-paper-border pb-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
              {meta ?? `${items.length} records`}
            </p>
            <h2 className="mt-1.5 font-display text-xl leading-tight tracking-tight text-ink">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{subtitle}</p>
            ) : null}
          </div>
        ) : (
          <SectionHead title={title} subtitle={subtitle} meta={meta ?? `${items.length} shown`} />
        )
      ) : null}
      {items.length === 0 ? (
        <p className="mt-6 text-ink-muted">Nothing in the stream yet.</p>
      ) : (
        <ul className={clsx("grid gap-px bg-paper-border", showHeader ? "mt-4" : "mt-0")}>
          {items.map((item) => (
            <RecordStreamItem key={item.id} item={item} compact={compact} />
          ))}
        </ul>
      )}
      {footerHref ? (
        <p className="mt-3">
          <Link href={footerHref} className="text-sm text-civic-green no-underline hover:underline">
            {footerLabel}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

