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

export function RecordStreamItem({ item }: { item: PublicRecordItem }) {
  const plane = tonePlane[toneFor(item)];

  return (
    <li>
      <Link
        href={item.href}
        className={clsx(
          "plane-link group block px-4 py-3 no-underline transition",
          plane,
        )}
      >
        {/* L1 chrome */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
              {item.kind}
            </span>
            <StatusLabel status={item.status as VerificationStatus} className="scale-90 origin-left" />
          </div>
          <time className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
            {item.date}
          </time>
        </div>

        {/* L1 primary */}
        <p className="mt-1.5 text-[15px] font-medium leading-snug text-ink sm:text-base">
          {item.title}
        </p>

        {/* L2 skim */}
        <p className="mt-1 line-clamp-1 text-sm text-ink-muted">{item.summary}</p>

        {/* L3 affordance */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          {item.relatedLabel ? (
            <span className="border border-paper-border/80 bg-paper/50 px-2 py-0.5 text-[11px] text-ink-faint">
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
}: {
  items: PublicRecordItem[];
  title?: string;
  subtitle?: string;
  meta?: string;
  footerHref?: string;
  footerLabel?: string;
  showHeader?: boolean;
}) {
  return (
    <div>
      {showHeader ? (
        <SectionHead title={title} subtitle={subtitle} meta={meta ?? `${items.length} shown`} />
      ) : null}
      {items.length === 0 ? (
        <p className="mt-6 text-ink-muted">Nothing in the stream yet.</p>
      ) : (
        <ul className={clsx("grid gap-px bg-paper-border", showHeader ? "mt-6" : "mt-0")}>
          {items.map((item) => (
            <RecordStreamItem key={item.id} item={item} />
          ))}
        </ul>
      )}
      {footerHref ? (
        <p className="mt-4">
          <Link href={footerHref} className="text-sm text-civic-green no-underline hover:underline">
            {footerLabel}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
