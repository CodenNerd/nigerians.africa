import Link from "next/link";
import type { ReactNode } from "react";
import { planeTone, type PlaneTone } from "./SectionHead";

export type EntityListItem = {
  href: string;
  title: string;
  description?: string;
  kind?: string;
  date?: string;
  meta?: ReactNode;
  tone?: PlaneTone;
};

export function EntityList({
  items,
  empty = "Nothing in this record yet.",
}: {
  items: EntityListItem[];
  empty?: string;
}) {
  if (!items.length) {
    return <p className="mt-6 text-ink-muted">{empty}</p>;
  }

  return (
    <ul className="mt-6 grid gap-px bg-paper-border">
      {items.map((item) => {
        const t = planeTone[item.tone ?? "green"];
        return (
          <li key={item.href + item.title}>
            <Link
              href={item.href}
              className={`group plane-link relative block ${t.plane} p-5 no-underline sm:p-6`}
            >
              <span className={`absolute left-0 top-0 h-full w-1 ${t.accent} opacity-80`} />
              <div className="flex flex-wrap items-start justify-between gap-3 pl-3">
                <div className="min-w-0 flex-1">
                  {item.kind ? (
                    <span
                      className={`text-[10px] font-medium uppercase tracking-[0.2em] ${t.ink}`}
                    >
                      {item.kind}
                    </span>
                  ) : null}
                  <span className="mt-1.5 block font-display text-xl leading-snug text-ink sm:text-2xl">
                    {item.title}
                  </span>
                  {item.description ? (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                      {item.description}
                    </p>
                  ) : null}
                  {item.meta ? <div className="mt-3 text-sm text-ink-faint">{item.meta}</div> : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {item.date ? (
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                      {item.date}
                    </span>
                  ) : null}
                  <span
                    className={`font-mono text-[11px] uppercase tracking-wider opacity-0 transition group-hover:opacity-100 ${t.ink}`}
                  >
                    Open →
                  </span>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
