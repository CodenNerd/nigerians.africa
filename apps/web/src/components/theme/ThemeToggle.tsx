"use client";

import clsx from "clsx";
import { useTheme } from "./ThemeProvider";

/**
 * Light ↔ dark switch.
 * Thumb position is CSS-driven from html[data-theme] so the bootstrap
 * script can paint the correct state before React hydrates.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      data-theme-toggle=""
      className={clsx(
        "theme-toggle group relative inline-flex h-7 w-[3.25rem] shrink-0 items-center rounded-full border border-paper-border bg-paper-card transition",
        className,
      )}
    >
      <span className="sr-only theme-toggle-label-light">Light</span>
      <span className="sr-only theme-toggle-label-dark">Dark</span>

      <span
        className="theme-toggle-mark-sun pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 opacity-70 transition-opacity"
        aria-hidden
      >
        <SunMark />
      </span>
      <span
        className="theme-toggle-mark-moon pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-30 transition-opacity"
        aria-hidden
      >
        <MoonMark />
      </span>

      <span
        className="theme-toggle-thumb pointer-events-none absolute top-0.5 h-5 w-5 translate-x-0.5 rounded-full border border-paper-border bg-paper shadow-sm transition-transform duration-200 ease-out"
        aria-hidden
      />
    </button>
  );
}

function SunMark() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1" className="text-ink-faint" />
      <path
        d="M5 1v1.2M5 7.8V9M1 5h1.2M7.8 5H9M2.2 2.2l.85.85M6.95 6.95l.85.85M2.2 7.8l.85-.85M6.95 3.05l.85-.85"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        className="text-ink-faint"
      />
    </svg>
  );
}

function MoonMark() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="M7.2 6.4A3.2 3.2 0 0 1 3.6 2.8c0-.2.01-.4.05-.58A3.5 3.5 0 1 0 7.78 6.35c-.19.03-.38.05-.58.05z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
        className="text-ink-faint"
      />
    </svg>
  );
}
