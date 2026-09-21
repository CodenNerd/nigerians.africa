"use client";

import Link from "next/link";
import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MATTER_STATUS_TONE,
  type HotMatterTicket,
} from "@/lib/hot-matter-tickets";

export type { HotMatterTicket };

const VISIBLE_DEPTH = 4;
const FLIP_MS = 650;
const HOLD_MS = 4200;

/**
 * Stacked Jira-style matter tickets with an auto flip through the deck.
 * The exiting card animates in its own layer so stack transforms never fight the flip.
 */
export function HotMatterTickets({
  items,
  className,
}: {
  items: HotMatterTicket[];
  className?: string;
}) {
  const count = items.length;
  const [front, setFront] = useState(0);
  const [exiting, setExiting] = useState<HotMatterTicket | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);

  const clearTimers = useCallback(() => {
    if (flipTimer.current) clearTimeout(flipTimer.current);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    flipTimer.current = null;
    holdTimer.current = null;
  }, []);

  const advance = useCallback(() => {
    if (count < 2 || busy.current) return;
    busy.current = true;
    const leaving = items[front]!;
    if (reduceMotion) {
      setFront((i) => (i + 1) % count);
      busy.current = false;
      return;
    }
    setExiting(leaving);
    setFront((i) => (i + 1) % count);
    flipTimer.current = setTimeout(() => {
      setExiting(null);
      busy.current = false;
    }, FLIP_MS);
  }, [count, front, items, reduceMotion]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    clearTimers();
    if (count < 2 || paused || reduceMotion || exiting) return;
    holdTimer.current = setTimeout(advance, HOLD_MS);
    return clearTimers;
  }, [front, paused, reduceMotion, exiting, count, advance, clearTimers]);

  if (!count) return null;

  const stackH = 12.25 + (VISIBLE_DEPTH - 1) * 0.95;

  const layers = Array.from({ length: Math.min(VISIBLE_DEPTH, count) }, (_, depth) => {
    const index = (front + depth) % count;
    return { ticket: items[index]!, depth };
  });

  return (
    <div
      className={clsx("anim-rise", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
          Hottest cases
          <span className="ml-2 font-mono tracking-wider text-ink-faint/80">
            {front + 1}/{count}
          </span>
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="font-mono text-[10px] uppercase tracking-wider text-ink-faint transition hover:text-civic-green disabled:opacity-40"
            disabled={Boolean(exiting)}
            onClick={() => {
              clearTimers();
              advance();
            }}
            aria-label="Flip to next case"
          >
            Flip →
          </button>
          <Link
            href="/schemes/make-nigeria-better"
            className="font-mono text-[10px] uppercase tracking-wider text-civic-green no-underline hover:underline"
          >
            All matters →
          </Link>
        </div>
      </div>

      <div className="[perspective:1400px]">
        <ul
          className="relative"
          style={{ height: `${stackH}rem` }}
          aria-label="Hottest cases being followed by legal NGOs"
          aria-live="polite"
        >
          {[...layers].reverse().map(({ ticket, depth }) => {
            const tone = MATTER_STATUS_TONE[ticket.status];
            const isFront = depth === 0;
            const offsetY = depth * 0.9;
            const offsetX = depth * 0.28;
            const scale = 1 - depth * 0.022;

            return (
              <li
                key={ticket.key}
                className="absolute left-0 right-0 top-0 origin-top transition-[transform,opacity,filter] duration-500 ease-out"
                style={{
                  zIndex: VISIBLE_DEPTH - depth,
                  transform: `translate(${offsetX}rem, ${offsetY}rem) scale(${scale})`,
                  opacity: 1 - depth * 0.06,
                  filter: depth > 0 ? `brightness(${1 - depth * 0.03})` : undefined,
                }}
              >
                <TicketCard ticket={ticket} tone={tone} isFront={isFront && !exiting} />
              </li>
            );
          })}

          {exiting ? (
            <li
              key={`exit-${exiting.key}`}
              className="ticket-flip-out pointer-events-none absolute left-0 right-0 top-0 origin-top"
              style={{ zIndex: VISIBLE_DEPTH + 2 }}
              aria-hidden
            >
              <TicketCard
                ticket={exiting}
                tone={MATTER_STATUS_TONE[exiting.status]}
                isFront={false}
              />
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

function TicketCard({
  ticket,
  tone,
  isFront,
}: {
  ticket: HotMatterTicket;
  tone: { bar: string; chip: string; label: string };
  isFront: boolean;
}) {
  return (
    <Link
      href={ticket.href}
      tabIndex={isFront ? 0 : -1}
      aria-hidden={!isFront}
      className="group relative block border border-paper-border bg-paper-card no-underline shadow-[0_1px_0_rgba(0,0,0,0.04)]"
    >
      <span className={clsx("absolute inset-y-0 left-0 w-[3px]", tone.bar)} aria-hidden />

      <div className="py-3.5 pl-4 pr-3.5 sm:py-4 sm:pl-5 sm:pr-4">
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
          {isFront ? (
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
