"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { NIGERIA_STATE_PATHS } from "./nigeria-state-paths";

/**
 * Standalone interactive map of Nigeria (all 36 states + FCT).
 * Geometry: Simplemaps.com admin1 SVG (free commercial use).
 * Hover highlights; click deep-links seeded states, else /places.
 */
export function NigeriaStateMap({
  className,
  dimmed = false,
}: {
  className?: string;
  /** Softer fills when used as hero art beside brand */
  dimmed?: boolean;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const active = NIGERIA_STATE_PATHS.find((s) => s.slug === hovered);

  function hrefFor(slug: string, seeded: boolean) {
    return seeded ? `/places/states/${slug}` : "/places";
  }

  return (
    <div className={clsx("relative select-none", className)}>
      <svg
        viewBox="0 0 1000 812"
        className="h-full w-full"
        role="img"
        aria-label="Map of Nigeria showing all states — hover a state, click to open its place record"
      >
        <title>Map of Nigeria by state</title>
        <g strokeLinecap="round" strokeLinejoin="round">
          {NIGERIA_STATE_PATHS.map((s) => {
            const isHot = hovered === s.slug;
            return (
              <path
                key={s.slug}
                d={s.d}
                role="link"
                tabIndex={0}
                aria-label={`${s.name}${s.seeded ? "" : " (browse Places)"}`}
                className={clsx(
                  "cursor-pointer outline-none transition-[fill,stroke,stroke-width] duration-150",
                  isHot
                    ? "fill-civic-green stroke-white"
                    : s.seeded
                      ? dimmed
                        ? "fill-[#6f9c76]/70 stroke-white"
                        : "fill-[#6f9c76] stroke-white"
                      : dimmed
                        ? "fill-[#8fb896]/55 stroke-white"
                        : "fill-[#8fb896] stroke-white",
                )}
                strokeWidth={isHot ? 1.75 : 0.6}
                onMouseEnter={() => setHovered(s.slug)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(s.slug)}
                onBlur={() => setHovered(null)}
                onClick={() => router.push(hrefFor(s.slug, s.seeded))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(hrefFor(s.slug, s.seeded));
                  }
                }}
              />
            );
          })}
        </g>
      </svg>

      <div
        className={clsx(
          "pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 border border-paper-border bg-paper/95 px-3 py-1.5 text-center shadow-sm backdrop-blur-sm transition",
          active ? "opacity-100" : "opacity-70",
        )}
        aria-live="polite"
      >
        {active ? (
          <p className="text-xs text-ink">
            <span className="font-medium">{active.name}</span>
            <span className="text-ink-faint">
              {active.seeded ? " · Open place record" : " · More places coming"}
            </span>
          </p>
        ) : (
          <p className="text-xs text-ink-faint">Hover a state</p>
        )}
      </div>

      <p className="mt-2 text-center text-[10px] text-ink-faint">
        Map data{" "}
        <a
          href="https://simplemaps.com"
          className="underline-offset-2 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Simplemaps
        </a>
      </p>

      <p className="sr-only">
        Seeded states with full records:{" "}
        {NIGERIA_STATE_PATHS.filter((s) => s.seeded).map((s) => (
          <Link key={s.slug} href={`/places/states/${s.slug}`}>
            {s.name}{" "}
          </Link>
        ))}
      </p>
    </div>
  );
}
