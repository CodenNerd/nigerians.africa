import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { StatusLabel } from "./StatusLabel";
import type { VerificationStatus } from "@nigeria-for-nigerians/domain";
import { AskPanel } from "./AskPanel";
import { WhatCanYouDo } from "./WhatCanYouDo";
import { SectionHead } from "@/components/ui";
import type { FollowableEntityType } from "@/lib/follow/types";

export function RecordPage({
  eyebrow,
  title,
  subtitle,
  status,
  meta,
  children,
  askContext,
  actions,
  follow,
  hero,
  hideHeader,
  avatarUrl,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  status?: VerificationStatus;
  meta?: ReactNode;
  children: ReactNode;
  askContext?: string;
  actions?: { label: string; href: string }[];
  follow?: {
    entityType: FollowableEntityType;
    entityId: string;
    entityTitle?: string;
  };
  /** Optional full-bleed hero above the container (e.g. project cover). */
  hero?: ReactNode;
  /** When true with hero, skip the in-container title block. */
  hideHeader?: boolean;
  /** Optional logo / mark beside the title. */
  avatarUrl?: string;
}) {
  return (
    <article>
      {hero}
      <div className={`site-container ${hero ? "pb-10 pt-8 lg:pb-12 lg:pt-9" : "py-10 lg:py-14"}`}>
        {!hideHeader ? (
          <header className="anim-rise max-w-3xl">
            <div className="flex items-start gap-5">
              {avatarUrl ? (
                <span className="relative mt-1 h-16 w-16 shrink-0 overflow-hidden border border-paper-border bg-paper sm:h-20 sm:w-20">
                  <Image src={avatarUrl} alt="" fill className="object-cover" sizes="80px" />
                </span>
              ) : null}
              <div className="min-w-0 flex-1">
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
              </div>
            </div>
          </header>
        ) : null}

        <div className={`${hideHeader ? "mt-0" : "mt-12"} grid gap-14 lg:grid-cols-[minmax(0,1fr)_16.5rem] lg:gap-12`}>
          <div className="space-y-16">{children}</div>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <AskPanel context={askContext || title} />
            <WhatCanYouDo actions={actions} follow={follow} />
          </aside>
        </div>
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
  items: {
    date: string;
    title: string;
    description?: string;
    kind?: string;
    href?: string;
  }[];
}) {
  if (!items.length) return <p className="text-ink-muted">No timeline events yet.</p>;

  const toneFor = (kind?: string) => {
    switch (kind) {
      case "funding":
      case "campaign":
        return { plane: "bg-civic-amberSoft", ink: "text-civic-amber", bar: "bg-civic-amber" };
      case "spend":
      case "contract":
        return { plane: "bg-civic-amberSoft", ink: "text-civic-amber", bar: "bg-civic-amber" };
      case "evidence":
        return { plane: "bg-civic-blueSoft", ink: "text-civic-blue", bar: "bg-civic-blue" };
      case "report":
        return { plane: "bg-civic-redSoft", ink: "text-civic-red", bar: "bg-civic-red" };
      case "response":
        return { plane: "bg-civic-blueSoft", ink: "text-civic-blue", bar: "bg-civic-blue" };
      case "memory":
        return { plane: "bg-paper", ink: "text-civic-slate", bar: "bg-civic-slate" };
      case "status":
      default:
        return { plane: "bg-civic-greenSoft", ink: "text-civic-green", bar: "bg-civic-green" };
    }
  };

  return (
    <ol className="grid gap-px bg-paper-border">
      {items.map((item, i) => {
        const tone = toneFor(item.kind);
        const body = (
          <>
            <div className="pl-2 font-medium text-ink">{item.title}</div>
            {item.description ? (
              <p className="mt-1 pl-2 text-sm text-ink-muted">{item.description}</p>
            ) : null}
            {item.kind ? (
              <p className={`mt-1.5 pl-2 text-[10px] uppercase tracking-wider ${tone.ink}`}>
                {item.kind}
              </p>
            ) : null}
          </>
        );
        return (
          <li
            key={`${item.date}-${item.title}-${i}`}
            className="grid grid-cols-[5.5rem_minmax(0,1fr)] bg-paper-card sm:grid-cols-[6.5rem_minmax(0,1fr)]"
          >
            <div className={`${tone.plane} px-3 py-4`}>
              <time className={`font-mono text-xs ${tone.ink}`}>{item.date}</time>
            </div>
            <div className="relative px-5 py-4">
              <span className={`absolute left-0 top-0 h-full w-1 ${tone.bar}`} />
              {item.href ? (
                <Link href={item.href} className="block no-underline hover:opacity-90">
                  {body}
                </Link>
              ) : (
                body
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function MoneyFigure({
  label,
  value,
  href,
  hint,
  tone = "amber",
}: {
  label: string;
  value: string;
  href?: string;
  hint?: string;
  tone?: "amber" | "green" | "blue";
}) {
  const plane =
    tone === "green"
      ? "bg-civic-greenSoft"
      : tone === "blue"
        ? "bg-civic-blueSoft"
        : "bg-civic-amberSoft";
  const ink =
    tone === "green"
      ? "text-civic-green"
      : tone === "blue"
        ? "text-civic-blue"
        : "text-civic-amber";

  const body = (
    <>
      <div className={`text-[10px] font-medium uppercase tracking-[0.18em] ${ink}`}>{label}</div>
      <div className="mt-2 font-display text-2xl text-ink">{value}</div>
      {hint ? <div className={`mt-1.5 text-xs ${ink} opacity-80`}>{hint}</div> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`plane-link block ${plane} px-5 py-4 no-underline transition hover:brightness-[0.97]`}
      >
        {body}
      </Link>
    );
  }

  return <div className={`${plane} px-5 py-4`}>{body}</div>;
}
