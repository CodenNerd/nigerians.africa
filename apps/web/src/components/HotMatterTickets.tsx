import Link from "next/link";
import clsx from "clsx";
import type { MatterStatus } from "@nigeria-for-nigerians/domain";

export type HotMatterTicket = {
  key: string;
  title: string;
  href: string;
  reportedBy: string;
  followedUpBy: string;
  progress: string;
  status: MatterStatus;
  location: string;
  evidenceCount: number;
};

const STATUS_TONE: Record<
  MatterStatus,
  { bar: string; chip: string; label: string }
> = {
  published: {
    bar: "bg-civic-amber",
    chip: "border-civic-amber/30 bg-civic-amberSoft text-civic-amber",
    label: "Intake",
  },
  under_review: {
    bar: "bg-civic-amber",
    chip: "border-civic-amber/30 bg-civic-amberSoft text-civic-amber",
    label: "Screening",
  },
  accepted: {
    bar: "bg-civic-green",
    chip: "border-civic-green/30 bg-civic-greenSoft text-civic-green",
    label: "Accepted",
  },
  filed: {
    bar: "bg-civic-blue",
    chip: "border-civic-blue/30 bg-civic-blueSoft text-civic-blue",
    label: "Filed",
  },
  in_hearing: {
    bar: "bg-civic-red",
    chip: "border-civic-red/30 bg-civic-redSoft text-civic-red",
    label: "In hearing",
  },
  closed_won: {
    bar: "bg-civic-green",
    chip: "border-civic-green/30 bg-civic-greenSoft text-civic-green",
    label: "Closed",
  },
  closed_lost: {
    bar: "bg-civic-slate",
    chip: "border-paper-border bg-paper text-ink-faint",
    label: "Closed",
  },
  closed_withdrawn: {
    bar: "bg-civic-slate",
    chip: "border-paper-border bg-paper text-ink-faint",
    label: "Withdrawn",
  },
  archived: {
    bar: "bg-civic-slate",
    chip: "border-paper-border bg-paper text-ink-faint",
    label: "Archived",
  },
};

/**
 * Stacked Jira-style matter tickets — civic paper planes, ticket chrome in mono.
 * Cards sit one on another; the front ticket is fully readable.
 */
export function HotMatterTickets({
  items,
  className,
}: {
  items: HotMatterTicket[];
  className?: string;
}) {
  if (!items.length) return null;

  const stackH = 11.5 + Math.max(0, items.length - 1) * 1.15;

  return (
    <div className={clsx("anim-rise", className)}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
          Hottest cases
        </p>
        <Link
          href="/schemes/make-nigeria-better"
          className="font-mono text-[10px] uppercase tracking-wider text-civic-green no-underline hover:underline"
        >
          All matters →
        </Link>
      </div>

      <ul
        className="relative"
        style={{ height: `${stackH}rem` }}
        aria-label="Hottest cases being followed by legal NGOs"
      >
        {items.map((ticket, i) => {
          const tone = STATUS_TONE[ticket.status];
          const depth = items.length - 1 - i;
          // Front of stack = last visual layer (highest z). Array order: front first.
          const z = items.length - i;
          const offsetY = i * 1.05;
          const offsetX = i * 0.35;
          const scale = 1 - i * 0.018;

          return (
            <li
              key={ticket.key}
              className="absolute left-0 right-0 top-0 transition-[transform,box-shadow] duration-300 ease-out hover:z-30 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.1)]"
              style={{
                zIndex: z,
                transform: `translate(${offsetX}rem, ${offsetY}rem) scale(${scale})`,
                transformOrigin: "top center",
              }}
            >
              <Link
                href={ticket.href}
                className="group relative block border border-paper-border bg-paper-card no-underline shadow-[0_1px_0_rgba(0,0,0,0.04)]"
              >
                <span
                  className={clsx("absolute inset-y-0 left-0 w-[3px]", tone.bar)}
                  aria-hidden
                />

                <div className="pl-4 pr-3.5 py-3.5 sm:pl-5 sm:pr-4 sm:py-4">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <span className="font-mono text-[11px] font-medium tracking-wide text-civic-blue">
                      {ticket.key}
                    </span>
                    <span
                      className={clsx(
                        "border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em]",
                        tone.chip,
                      )}
                    >
                      {tone.label}
                    </span>
                    {depth === 0 && i === 0 ? (
                      <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-ink-faint opacity-0 transition group-hover:opacity-100">
                        Open →
                      </span>
                    ) : null}
                  </div>

                  <h2 className="mt-2 font-display text-lg leading-snug tracking-tight text-ink group-hover:text-civic-green sm:text-xl">
                    {ticket.title}
                  </h2>

                  <dl className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2 sm:gap-x-4">
                    <Field label="Reported by" value={ticket.reportedBy} />
                    <Field label="Followed up by" value={ticket.followedUpBy} accent />
                    <Field label="Progress" value={ticket.progress} />
                    <Field label="Location" value={ticket.location} />
                  </dl>

                  <div className="mt-3 flex items-center gap-1.5 border-t border-paper-border pt-2.5 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                    <PaperclipIcon />
                    <span>
                      {ticket.evidenceCount} evidence
                      {ticket.evidenceCount === 1 ? "" : "s"} attached
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Field({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[9px] font-medium uppercase tracking-[0.16em] text-ink-faint">{label}</dt>
      <dd
        className={clsx(
          "mt-0.5 truncate text-[13px] leading-snug",
          accent ? "text-civic-green" : "text-ink-muted",
        )}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function PaperclipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M3.5 6.5l3.2-3.2a1.6 1.6 0 012.3 2.3L5.2 9.4a2.4 2.4 0 01-3.4-3.4l4-4"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function matterProgressLabel(status: MatterStatus): string {
  return STATUS_TONE[status].label;
}
