import Link from "next/link";
import type { Office, OfficeTenure } from "@nigeria-for-nigerians/domain";
import { SectionHead } from "./visual";

type TenureItem = {
  tenure: OfficeTenure;
  office: Office;
};

export function TenureTimeline({ items }: { items: TenureItem[] }) {
  const sorted = [...items].sort((a, b) => a.tenure.startDate.localeCompare(b.tenure.startDate));
  if (!sorted.length) {
    return (
      <section id="offices" className="scroll-mt-28">
        <SectionHead title="Offices held" subtitle="No office tenures in the public record yet." />
      </section>
    );
  }

  const years = sorted.flatMap((i) => {
    const start = parseInt(i.tenure.startDate.slice(0, 4), 10);
    const end = i.tenure.endDate
      ? parseInt(i.tenure.endDate.slice(0, 4), 10)
      : new Date().getFullYear();
    return [start, end];
  });
  const minY = Math.min(...years);
  const maxY = Math.max(...years);
  const span = Math.max(maxY - minY, 1);

  return (
    <section id="offices" className="scroll-mt-28">
      <SectionHead
        title="Offices held"
        subtitle="Tenure as a visual spine. Current office is the green plane."
        meta={`${minY}–${maxY}`}
      />

      <div className="mt-8 space-y-2.5" aria-hidden>
        {sorted.map((item) => {
          const start = parseInt(item.tenure.startDate.slice(0, 4), 10);
          const end = item.tenure.endDate
            ? parseInt(item.tenure.endDate.slice(0, 4), 10)
            : maxY;
          const left = ((start - minY) / span) * 100;
          const width = Math.max(((end - start) / span) * 100, 4);
          const current = !item.tenure.endDate;
          return (
            <div key={`bar-${item.tenure.id}`} className="relative h-2.5 bg-paper-border/70">
              <div
                className={`absolute inset-y-0 ${current ? "bg-civic-green" : "bg-civic-blue/65"}`}
                style={{ left: `${left}%`, width: `${width}%` }}
              />
            </div>
          );
        })}
        <div className="flex justify-between pt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          <span>{minY}</span>
          <span>{maxY}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-px bg-paper-border">
        {sorted.map((item) => {
          const current = !item.tenure.endDate;
          const start = parseInt(item.tenure.startDate.slice(0, 4), 10);
          const end = item.tenure.endDate
            ? parseInt(item.tenure.endDate.slice(0, 4), 10)
            : new Date().getFullYear();
          const yearsHeld = Math.max(end - start, 1);
          return (
            <Link
              key={item.tenure.id}
              href={`/government/offices/${item.office.slug}`}
              className={`group grid gap-4 p-6 no-underline transition hover:brightness-[0.97] sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center sm:gap-8 sm:p-7 ${
                current ? "bg-civic-greenSoft" : "bg-civic-blueSoft"
              }`}
            >
              <div>
                <div
                  className={`font-display text-4xl leading-none ${
                    current ? "text-civic-green" : "text-civic-blue"
                  }`}
                >
                  {yearsHeld}
                  <span className="text-lg">y</span>
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                  {item.tenure.startDate.slice(0, 4)}–{item.tenure.endDate?.slice(0, 4) ?? "now"}
                </div>
              </div>
              <div>
                <span
                  className={`text-[10px] font-medium uppercase tracking-[0.2em] ${
                    current ? "text-civic-green" : "text-civic-blue"
                  }`}
                >
                  {current ? "Current" : "Former"}
                </span>
                <span className="mt-1.5 block font-display text-2xl leading-snug text-ink sm:text-3xl">
                  {item.office.title}
                </span>
                <p className="mt-2 max-w-xl text-sm text-ink-muted">{item.office.mandate}</p>
              </div>
              <span
                className={`hidden font-mono text-[11px] uppercase tracking-wider sm:block ${
                  current ? "text-civic-green" : "text-civic-blue"
                }`}
              >
                Open →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
