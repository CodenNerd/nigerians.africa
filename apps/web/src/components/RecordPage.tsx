import Link from "next/link";
import type { ReactNode } from "react";
import { StatusLabel } from "./StatusLabel";
import type { VerificationStatus } from "@nigeria-for-nigerians/domain";
import { AskPanel } from "./AskPanel";
import { WhatCanYouDo } from "./WhatCanYouDo";
import { SectionHead } from "@/components/ui";

export function RecordPage({
  eyebrow,
  title,
  subtitle,
  status,
  meta,
  children,
  askContext,
  actions,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  status?: VerificationStatus;
  meta?: ReactNode;
  children: ReactNode;
  askContext?: string;
  actions?: { label: string; href: string }[];
}) {
  return (
    <article className="site-container py-10 lg:py-14">
      <header className="anim-rise max-w-3xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-ink-faint">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">{subtitle}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {status ? <StatusLabel status={status} /> : null}
          {meta}
        </div>
      </header>

      <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,1fr)_16.5rem] lg:gap-12">
        <div className="space-y-16">{children}</div>
        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <AskPanel context={askContext || title} />
          <WhatCanYouDo actions={actions} />
        </aside>
      </div>
    </article>
  );
}

export function RecordSection({
  id,
  title,
  subtitle,
  meta,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <SectionHead title={title} subtitle={subtitle} meta={meta} />
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function SourceList({
  items,
}: {
  items: { id: string; title: string; publisher: string; date?: string }[];
}) {
  if (!items.length) {
    return <p className="text-ink-muted">No sources attached to this record yet.</p>;
  }
  const sorted = [...items].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return (
    <ul className="grid gap-px bg-paper-border">
      {sorted.map((s) => (
        <li key={s.id} className="relative bg-civic-blueSoft px-5 py-4">
          <span className="absolute left-0 top-0 h-full w-1 bg-civic-blue" />
          <div className="pl-2 font-medium text-ink">{s.title}</div>
          <div className="mt-1 pl-2 font-mono text-xs text-ink-faint">
            {s.publisher}
            {s.date ? ` · ${s.date}` : ""}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function RelatedLinks({
  items,
}: {
  items: { href: string; label: string; hint?: string }[];
}) {
  if (!items.length) return <p className="text-ink-muted">No related records linked yet.</p>;
  return (
    <ul className="grid gap-px bg-paper-border sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.href + item.label}>
          <Link
            href={item.href}
            className="plane-link block bg-civic-greenSoft px-5 py-4 no-underline"
          >
            <span className="font-display text-lg text-ink">{item.label}</span>
            {item.hint ? (
              <span className="mt-1 block text-sm text-ink-muted">{item.hint}</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Timeline({
  items,
}: {
  items: { date: string; title: string; description?: string }[];
}) {
  if (!items.length) return <p className="text-ink-muted">No timeline events yet.</p>;
  return (
    <ol className="grid gap-px bg-paper-border">
      {items.map((item, i) => (
        <li
          key={`${item.date}-${i}`}
          className="grid grid-cols-[5.5rem_minmax(0,1fr)] bg-paper-card sm:grid-cols-[6.5rem_minmax(0,1fr)]"
        >
          <div className="bg-civic-greenSoft px-3 py-4">
            <time className="font-mono text-xs text-civic-green">{item.date}</time>
          </div>
          <div className="relative px-5 py-4">
            <span className="absolute left-0 top-0 h-full w-1 bg-civic-green" />
            <div className="pl-2 font-medium text-ink">{item.title}</div>
            {item.description ? (
              <p className="mt-1 pl-2 text-sm text-ink-muted">{item.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function MoneyFigure({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-civic-amberSoft px-5 py-4">
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-civic-amber">
        {label}
      </div>
      <div className="mt-2 font-display text-2xl text-ink">{value}</div>
    </div>
  );
}
