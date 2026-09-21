"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function ActionFollowingSection() {
  const [count, setCount] = useState<number | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/follow/mine");
        if (!res.ok || cancelled) {
          if (!cancelled) setCount(0);
          return;
        }
        const data = (await res.json()) as { email?: string; follows?: unknown[] };
        if (cancelled) return;
        setEmail(data.email ?? null);
        setCount(data.follows?.length ?? 0);
      } catch {
        if (!cancelled) setCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mt-16 border border-paper-border bg-civic-greenSoft/50 px-5 py-6" id="following">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-ink-faint">
            Email updates
          </p>
          <h2 className="mt-2 font-display text-2xl tracking-tight text-ink">Following</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Opt into updates on organizations, people, problems, projects, and cases.
            {count !== null && email
              ? ` You have ${count} active follow${count === 1 ? "" : "s"}.`
              : count === 0
                ? " Sign in or open /following to manage subscriptions."
                : null}
          </p>
        </div>
        <Link
          href="/following"
          className="shrink-0 border border-civic-green bg-civic-green px-4 py-2.5 text-sm text-white no-underline hover:opacity-90"
        >
          Manage follows
        </Link>
      </div>
    </section>
  );
}
