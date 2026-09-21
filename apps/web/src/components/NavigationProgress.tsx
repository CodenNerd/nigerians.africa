"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import clsx from "clsx";

/**
 * Thin top-of-viewport line that runs while App Router navigations are in flight.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams?.toString() ?? ""}`;

  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(false);
  const routeKeyRef = useRef(routeKey);

  const clearTimers = useCallback(() => {
    if (trickleRef.current) clearInterval(trickleRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
    trickleRef.current = null;
    hideRef.current = null;
  }, []);

  const start = useCallback(() => {
    clearTimers();
    pendingRef.current = true;
    setVisible(true);
    setActive(true);
    setWidth(12);
    trickleRef.current = setInterval(() => {
      setWidth((w) => {
        if (w >= 88) return w;
        const step = w < 40 ? 8 : w < 70 ? 3.5 : 1.2;
        return Math.min(88, w + step);
      });
    }, 280);
  }, [clearTimers]);

  const finish = useCallback(() => {
    if (!pendingRef.current && !active) return;
    pendingRef.current = false;
    clearTimers();
    setActive(true);
    setVisible(true);
    setWidth(100);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setActive(false);
      setWidth(0);
    }, 280);
  }, [active, clearTimers]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!anchor.href) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      const nextKey = `${url.pathname}?${url.searchParams.toString()}`;
      const currentKey = `${window.location.pathname}?${window.location.search.replace(/^\?/, "")}`;
      if (nextKey === currentKey && url.hash) return;
      if (nextKey === currentKey) return;

      start();
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  useEffect(() => {
    if (routeKeyRef.current === routeKey) return;
    routeKeyRef.current = routeKey;
    finish();
  }, [routeKey, finish]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100]"
      aria-hidden={!active}
      role="presentation"
    >
      <div
        className={clsx(
          "h-[2px] origin-left bg-civic-green shadow-[0_0_8px_rgba(27,94,59,0.45)] transition-[width,opacity] ease-out",
          visible ? "opacity-100" : "opacity-0",
          width >= 100 ? "duration-200" : "duration-300",
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
