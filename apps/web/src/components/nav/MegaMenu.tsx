"use client";

import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import type { MegaFeatured, MegaMenuConfig, NavTone } from "@/lib/nav-mega";
import { NavIcon } from "./NavIcons";

const tonePlane: Record<NavTone, { plane: string; ink: string; accent: string }> = {
  green: { plane: "bg-civic-greenSoft", ink: "text-civic-green", accent: "bg-civic-green" },
  blue: { plane: "bg-civic-blueSoft", ink: "text-civic-blue", accent: "bg-civic-blue" },
  amber: { plane: "bg-civic-amberSoft", ink: "text-civic-amber", accent: "bg-civic-amber" },
  red: { plane: "bg-civic-redSoft", ink: "text-civic-red", accent: "bg-civic-red" },
  slate: { plane: "bg-paper", ink: "text-civic-slate", accent: "bg-civic-slate" },
};

function FeaturedTile({
  item,
  onNavigate,
  compact,
}: {
  item: MegaFeatured;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const t = tonePlane[item.tone];
  const large = item.large && !compact;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={clsx(
        "plane-link group relative flex overflow-hidden no-underline",
        t.plane,
        large ? "min-h-[9.5rem] flex-col sm:min-h-[11rem]" : "min-h-[4.5rem] items-center gap-3 p-3",
        large && "p-0",
      )}
    >
      {large && item.imageUrl ? (
        <div className="relative h-28 w-full sm:absolute sm:inset-y-0 sm:left-0 sm:h-auto sm:w-36">
          <Image
            src={item.imageUrl}
            alt=""
            fill
            className="object-cover object-top"
            sizes="144px"
          />
        </div>
      ) : null}
      {large && !item.imageUrl ? (
        <div
          className={clsx(
            "flex h-28 w-full items-center justify-center font-display text-4xl sm:absolute sm:inset-y-0 sm:left-0 sm:h-auto sm:w-36",
            t.ink,
          )}
        >
          {item.initials}
        </div>
      ) : null}

      {!large && (item.imageUrl || item.initials) ? (
        <div
          className={clsx(
            "relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden bg-paper font-display text-sm",
            t.ink,
          )}
        >
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="48px" />
          ) : (
            item.initials
          )}
        </div>
      ) : null}

      <div className={clsx(large && "flex flex-1 flex-col justify-end p-4 sm:pl-40")}>
        {item.kind ? (
          <span className={clsx("text-[10px] font-medium uppercase tracking-[0.2em]", t.ink)}>
            {item.kind}
          </span>
        ) : null}
        <span
          className={clsx(
            "mt-1 block font-display leading-snug text-ink",
            large ? "text-xl sm:text-2xl" : "text-base",
          )}
        >
          {item.title}
        </span>
        {large && item.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{item.description}</p>
        ) : null}
      </div>
    </Link>
  );
}

export function MegaMenuPanel({
  menu,
  onNavigate,
  compact = false,
}: {
  menu: MegaMenuConfig;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const large = menu.featured.find((f) => f.large) ?? menu.featured[0];
  const rest = menu.featured.filter((f) => f !== large);

  return (
    <div className={clsx(!compact && "anim-rise")}>
      <div className="site-container py-6 lg:py-8">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
              {menu.eyebrow}
            </p>
            <p className="mt-1 font-display text-2xl text-ink">{menu.label}</p>
          </div>
          <Link
            href={menu.browseAll.href}
            onClick={onNavigate}
            className="font-mono text-[11px] uppercase tracking-wider text-civic-green no-underline hover:underline"
          >
            {menu.browseAll.label} →
          </Link>
        </div>

        <div
          className={clsx(
            "grid gap-6",
            compact ? "grid-cols-1" : "lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.85fr)]",
          )}
        >
          <div>
            <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint">
              Featured
            </h3>
            <div className="mt-3 grid gap-px bg-paper-border">
              {large ? <FeaturedTile item={large} onNavigate={onNavigate} compact={compact} /> : null}
              <div className={clsx("grid gap-px", rest.length > 1 ? "sm:grid-cols-2" : "")}>
                {rest.map((item) => (
                  <FeaturedTile key={item.href + item.title} item={item} onNavigate={onNavigate} compact />
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint">
              Quick paths
            </h3>
            <ul className="mt-3 space-y-0.5">
              {menu.quickLinks.map((q) => (
                <li key={q.href + q.label}>
                  <Link
                    href={q.href}
                    onClick={onNavigate}
                    className="plane-link flex items-start gap-3 bg-paper-card px-3 py-2.5 no-underline hover:bg-civic-greenSoft/60"
                  >
                    <span className="mt-0.5 text-civic-green">
                      <NavIcon id={q.icon} />
                    </span>
                    <span>
                      <span className="block text-sm font-medium text-ink">{q.label}</span>
                      {q.hint ? (
                        <span className="mt-0.5 block text-xs text-ink-faint">{q.hint}</span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-faint">
              Popular searches
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {menu.popular.map((p) => (
                <Link
                  key={p.href + p.label}
                  href={p.href}
                  onClick={onNavigate}
                  className="border border-paper-border bg-paper px-3 py-1.5 text-sm text-ink-muted no-underline transition hover:border-civic-green/40 hover:text-civic-green"
                >
                  {p.label}
                </Link>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-ink-faint">
              Jump straight to a known record, or open Search for anything else in the public graph.
            </p>
            <Link
              href="/search"
              onClick={onNavigate}
              className="mt-3 inline-flex items-center gap-2 text-sm text-civic-green no-underline hover:underline"
            >
              <NavIcon id="search" />
              Open search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
