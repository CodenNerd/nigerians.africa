"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { NAV_MEGA } from "@/lib/nav-mega";
import { BrandMark, FlagStripe } from "@/components/BrandMark";
import { MegaMenuPanel } from "@/components/nav/MegaMenu";

const OPEN_DELAY = 100;
const CLOSE_DELAY = 200;

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaId, setMegaId] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const scheduleOpen = useCallback(
    (id: string) => {
      clearTimers();
      openTimer.current = setTimeout(() => setMegaId(id), OPEN_DELAY);
    },
    [clearTimers],
  );

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(() => setMegaId(null), CLOSE_DELAY);
  }, [clearTimers]);

  const openNow = useCallback(
    (id: string) => {
      clearTimers();
      setMegaId(id);
    },
    [clearTimers],
  );

  const closeNow = useCallback(() => {
    clearTimers();
    setMegaId(null);
  }, [clearTimers]);

  useEffect(() => {
    closeNow();
    setMobileOpen(false);
    setMobileAccordion(null);
  }, [pathname, closeNow]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeNow();
        setMobileAccordion(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeNow]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const activeMega = NAV_MEGA.find((m) => m.id === megaId) ?? null;

  return (
    <header
      ref={headerRef}
      className="relative sticky top-0 z-50 border-b border-paper-border bg-paper backdrop-blur-md"
      onMouseLeave={scheduleClose}
    >
      <FlagStripe />
      <div className="relative z-50 bg-paper">
        <div className="site-container">
          <div className="flex items-center justify-between gap-4 py-3.5">
            <Link href="/" className="group no-underline" onClick={closeNow}>
              <BrandMark size="md" />
              <span className="mt-0.5 block text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                Public record
              </span>
            </Link>
            <div className="hidden items-center gap-5 md:flex">
              <Link href="/search" className="text-sm text-ink-muted no-underline hover:text-ink">
                Search
              </Link>
              <Link href="/ask" className="text-sm text-ink-muted no-underline hover:text-ink">
                Ask
              </Link>
              <Link href="/about" className="text-sm text-ink-muted no-underline hover:text-ink">
                About
              </Link>
              <Link
                href="/signin"
                className="border border-civic-green/25 bg-civic-greenSoft/50 px-3 py-1.5 text-sm text-civic-green no-underline transition hover:border-civic-green/50 hover:bg-civic-greenSoft"
              >
                Sign in
              </Link>
            </div>
            <button
              type="button"
              className="border border-paper-border px-3 py-1.5 text-sm md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              Menu
            </button>
          </div>

          {/* Desktop primary nav */}
          <nav className="hidden border-t border-paper-border py-2.5 md:block" aria-label="Primary">
            <ul className="flex flex-row flex-wrap gap-x-1 gap-y-1">
              {NAV_MEGA.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const isOpen = megaId === item.id;
                return (
                  <li
                    key={item.id}
                    onMouseEnter={() => scheduleOpen(item.id)}
                    onFocusCapture={() => openNow(item.id)}
                  >
                    <Link
                      href={item.href}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      className={clsx(
                        "block border-b-2 px-2.5 py-1.5 text-sm no-underline transition",
                        active || isOpen
                          ? "border-civic-green font-medium text-civic-green"
                          : "border-transparent text-ink-muted hover:text-ink",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Desktop mega panel — opaque surface + dimmed page behind */}
      {activeMega ? (
        <>
          <div
            className="fixed inset-0 z-40 hidden bg-ink/50 md:block"
            aria-hidden
            onClick={closeNow}
            onMouseEnter={scheduleClose}
          />
          <div
            className="absolute left-0 right-0 top-full z-50 hidden border-b border-paper-border bg-paper shadow-[0_24px_48px_rgba(0,0,0,0.14)] md:block"
            onMouseEnter={clearTimers}
            onMouseLeave={scheduleClose}
            role="region"
            aria-label={`${activeMega.label} menu`}
          >
            <MegaMenuPanel menu={activeMega} onNavigate={closeNow} />
          </div>
        </>
      ) : null}

      {/* Mobile drawer with accordion mega content */}
      <nav
        id="mobile-nav"
        className={clsx(
          "border-t border-paper-border md:hidden",
          mobileOpen ? "block" : "hidden",
        )}
        aria-label="Primary mobile"
      >
        <ul className="flex flex-col">
          {NAV_MEGA.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const expanded = mobileAccordion === item.id;
            return (
              <li key={item.id} className="border-b border-paper-border">
                <div className="flex items-stretch">
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      "flex-1 px-4 py-3 text-sm no-underline",
                      active ? "font-medium text-civic-green" : "text-ink-muted",
                    )}
                  >
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    className="border-l border-paper-border px-4 text-sm text-ink-faint"
                    aria-expanded={expanded}
                    aria-controls={`mega-mobile-${item.id}`}
                    onClick={() =>
                      setMobileAccordion((cur) => (cur === item.id ? null : item.id))
                    }
                  >
                    {expanded ? "−" : "+"}
                  </button>
                </div>
                {expanded ? (
                  <div id={`mega-mobile-${item.id}`} className="border-t border-paper-border bg-paper">
                    <MegaMenuPanel
                      menu={item}
                      compact
                      onNavigate={() => {
                        setMobileOpen(false);
                        setMobileAccordion(null);
                      }}
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
          <li>
            <Link
              href="/search"
              className="block px-4 py-3 text-sm text-ink-muted no-underline"
              onClick={() => setMobileOpen(false)}
            >
              Search
            </Link>
          </li>
          <li>
            <Link
              href="/ask"
              className="block px-4 py-3 text-sm text-ink-muted no-underline"
              onClick={() => setMobileOpen(false)}
            >
              Ask
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className="block px-4 py-3 text-sm text-ink-muted no-underline"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              href="/signin"
              className="block px-4 py-3 text-sm text-civic-green no-underline"
              onClick={() => setMobileOpen(false)}
            >
              Sign in
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
