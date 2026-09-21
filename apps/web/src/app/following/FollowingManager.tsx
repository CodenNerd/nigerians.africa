"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { FollowCadence } from "@/lib/follow/types";

type FollowRow = {
  id: string;
  email: string;
  entityType: string;
  entityId: string;
  entitySlug: string;
  entityTitle: string;
  cadence: FollowCadence;
  href: string;
  createdAt?: string;
};

export function FollowingManager() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [follows, setFollows] = useState<FollowRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(async (forEmail?: string) => {
    setError(null);
    const q = forEmail ? `?email=${encodeURIComponent(forEmail)}` : "";
    const res = await fetch(`/api/follow/mine${q}`);
    const data = (await res.json()) as {
      error?: string;
      needsEmail?: boolean;
      email?: string;
      follows?: FollowRow[];
    };
    if (res.status === 401 && data.needsEmail) {
      setFollows([]);
      setEmail(null);
      return;
    }
    if (!res.ok) {
      setError(data.error || "Could not load follows");
      setFollows([]);
      return;
    }
    setEmail(data.email || forEmail || null);
    setFollows(data.follows || []);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/auth/me");
        const data = (await me.json()) as { session?: string | null };
        const session = data.session;
        if (session) {
          const colon = session.indexOf(":");
          const em = colon >= 0 ? session.slice(colon + 1).trim().toLowerCase() : "";
          if (em.includes("@")) {
            setSessionEmail(em);
            setEmail(em);
            await load();
            return;
          }
        }
      } catch {
        /* ignore */
      }
      await load();
    })();
  }, [load]);

  function lookup() {
    const em = emailInput.trim().toLowerCase();
    if (!em) return;
    startTransition(async () => {
      await load(em);
    });
  }

  function setCadence(id: string, cadence: FollowCadence) {
    startTransition(async () => {
      const res = await fetch("/api/follow/mine", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, cadence }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || "Could not update cadence");
        return;
      }
      setFollows((prev) => prev.map((f) => (f.id === id ? { ...f, cadence } : f)));
    });
  }

  function unfollow(id: string) {
    startTransition(async () => {
      const res = await fetch("/api/follow/unfollow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error || "Could not unfollow");
        return;
      }
      setFollows((prev) => prev.filter((f) => f.id !== id));
    });
  }

  return (
    <div className="mt-10 space-y-8">
      {!sessionEmail && !email ? (
        <div className="max-w-md border border-paper-border bg-paper/60 p-5">
          <p className="text-sm text-ink-muted">
            Enter the email you used when following to manage your subscriptions. Or{" "}
            <Link href="/signin" className="text-civic-green hover:underline">
              sign in
            </Link>
            .
          </p>
          <div className="mt-4 flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 border border-paper-border bg-paper px-3 py-2 text-sm outline-none focus:border-civic-green"
            />
            <button
              type="button"
              disabled={pending}
              onClick={lookup}
              className="border border-civic-green bg-civic-green px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              Load
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-ink-muted">
          Showing follows for <span className="font-medium text-ink">{email}</span>
          {!sessionEmail ? (
            <>
              {" · "}
              <button
                type="button"
                className="text-civic-green hover:underline"
                onClick={() => {
                  setEmail(null);
                  setFollows([]);
                }}
              >
                Change email
              </button>
            </>
          ) : null}
        </p>
      )}

      {error ? <p className="text-sm text-civic-amber">{error}</p> : null}

      {email && follows.length === 0 && !error ? (
        <p className="text-ink-muted">
          No active follows yet. Open an organization, person, problem, project, or case and use
          Follow by email.
        </p>
      ) : null}

      <ul className="divide-y divide-paper-border border-y border-paper-border">
        {follows.map((f) => (
          <li key={f.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href={f.href} className="font-display text-xl text-ink no-underline hover:text-civic-green">
                {f.entityTitle}
              </Link>
              <p className="mt-1 text-xs uppercase tracking-wider text-ink-faint">
                {f.entityType === "matter" ? "case" : f.entityType}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={f.cadence}
                disabled={pending}
                onChange={(e) => setCadence(f.id, e.target.value as FollowCadence)}
                className="border border-paper-border bg-paper px-2 py-1.5 text-sm"
              >
                <option value="instant">Instant</option>
                <option value="weekly">Weekly digest</option>
              </select>
              <button
                type="button"
                disabled={pending}
                onClick={() => unfollow(f.id)}
                className="text-sm text-ink-muted hover:text-ink disabled:opacity-60"
              >
                Unfollow
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
