"use client";

import clsx from "clsx";
import { useViewMode } from "./ViewModeProvider";

/**
 * Compact Record ↔ Progressive switch (light/dark pattern).
 * Thumb position is CSS-driven from html[data-view] so the bootstrap
 * script can paint the correct state before React hydrates.
 */
export function ViewToggle({ className }: { className?: string }) {
  const { view, toggleView } = useViewMode();
  const progressive = view === "progressive";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={progressive}
      aria-label="Progressive view"
      title={progressive ? "Switch to Record view" : "Switch to Progressive view"}
      onClick={toggleView}
      data-view-toggle=""
      className={clsx(
        "view-toggle group relative inline-flex h-7 w-[3.25rem] shrink-0 items-center rounded-full border border-paper-border bg-paper-card transition",
        className,
      )}
    >
      <span className="sr-only view-toggle-label-record">Record</span>
      <span className="sr-only view-toggle-label-progressive">Progressive</span>

      <span
        className="view-toggle-mark-record pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 opacity-70 transition-opacity"
        aria-hidden
      >
        <DocumentMark />
      </span>
      <span
        className="view-toggle-mark-map pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-30 transition-opacity"
        aria-hidden
      >
        <MapMark />
      </span>

      <span
        className="view-toggle-thumb pointer-events-none absolute top-0.5 h-5 w-5 translate-x-0.5 rounded-full border border-paper-border bg-paper-card shadow-sm transition-transform duration-200 ease-out"
        aria-hidden
      />
    </button>
  );
}

function DocumentMark() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <rect
        x="1.5"
        y="1"
        width="7"
        height="8"
        rx="0.5"
        stroke="currentColor"
        strokeWidth="1"
        className="text-ink-faint"
      />
      <path
        d="M3 3.5h4M3 5.5h4M3 7.5h2.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        className="text-ink-faint"
      />
    </svg>
  );
}

function MapMark() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="M1.5 2.5L4 1.5l2 1 2.5-1v7L6 7.5l-2-1-2.5 1v-5z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
        className="text-ink-faint"
      />
    </svg>
  );
}
