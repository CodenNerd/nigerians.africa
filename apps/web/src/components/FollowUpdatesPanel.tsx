"use client";

import { useEffect, useState, useTransition } from "react";
import { followableLabel, type FollowCadence, type FollowableEntityType } from "@/lib/follow/types";

type Props = {
  entityType: FollowableEntityType;
  entityId: string;
  entityTitle?: string;
  /** Compact: single button that expands the form */
  compact?: boolean;
};

type Status = "idle" | "following" | "done" | "error";

export function FollowUpdatesPanel({
  entityType,
  entityId,
  entityTitle,
  compact = false,
}: Props) {
  const [open, setOpen] = useState(!compact);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [cadence, setCadence] = useState<FollowCadence>("instant");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [followId, setFollowId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await fetch("/api/auth/me");
        const data = (await me.json()) as { session?: string | null };
        const session = data.session;
        if (!session || cancelled) return;
        const colon = session.indexOf(":");
        const role = colon >= 0 ? session.slice(0, colon) : session;
        const em = colon >= 0 ? session.slice(colon + 1).trim().toLowerCase() : "";
        if (["admin", "verifier", "government"].includes(role)) {
          setIsAdmin(true);
        }
        if (em.includes("@")) {
          setSessionEmail(em);
          setEmail(em);
        }
      } catch {
        /* ignore */
      }

      try {
        const mine = await fetch("/api/follow/mine");
        if (!mine.ok || cancelled) return;
        const data = (await mine.json()) as {
          follows?: { id: string; entityType: string; entityId: string; cadence: FollowCadence }[];
        };
        const hit = data.follows?.find(
          (f) => f.entityType === entityType && f.entityId === entityId,
        );
        if (hit) {
          setFollowId(hit.id);
          setCadence(hit.cadence);
          setStatus("following");
        }
      } catch {
        /* ignore — DB may be down */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entityType, entityId]);

  function follow() {
    setMessage(null);
    startTransition(async () => {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          cadence,
          email: sessionEmail ? undefined : email,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        alreadyFollowing?: boolean;
        follow?: { id: string };
      };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Could not follow");
        return;
      }
      setFollowId(data.follow?.id ?? null);
      setStatus("following");
      setMessage(
        data.alreadyFollowing
          ? "You're already following — cadence updated."
          : "You're following. Check your inbox for a confirmation.",
      );
    });
  }

  function unfollow() {
    setMessage(null);
    startTransition(async () => {
      const res = await fetch("/api/follow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          followId ? { id: followId } : { entityType, entityId },
        ),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setStatus("error");
        setMessage(data.error || "Could not unfollow");
        return;
      }
      setFollowId(null);
      setStatus("idle");
      setMessage("Unfollowed.");
    });
  }

  function simulate() {
    setMessage(null);
    startTransition(async () => {
      const res = await fetch("/api/follow/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId }),
      });
      const data = (await res.json()) as { error?: string; emailed?: number };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Simulate failed");
        return;
      }
      setMessage(
        `Simulated update sent to ${data.emailed ?? 0} instant follower(s).`,
      );
    });
  }

  const label = followableLabel(entityType);
  const titleBit = entityTitle ? entityTitle : `this ${label}`;

  if (compact && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="plane-link block w-full bg-paper/70 px-3 py-2.5 text-left text-sm text-ink no-underline hover:bg-paper"
      >
        {status === "following" ? `Following · ${titleBit}` : `Follow this ${label}`}
      </button>
    );
  }

  return (
    <div className="border border-paper-border bg-paper/80 p-4">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-display text-base tracking-tight text-ink">
          {status === "following" ? "Following updates" : `Follow this ${label}`}
        </h4>
        {compact ? (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-ink-faint hover:text-ink"
          >
            Close
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
        Get email when material updates land on {titleBit}. Choose instant alerts or a weekly
        digest. Unsubscribe anytime.
      </p>

      <div className="mt-4 space-y-3">
        {sessionEmail ? (
          <p className="text-sm text-ink">
            Email{" "}
            <span className="font-medium">{sessionEmail}</span>
          </p>
        ) : (
          <label className="block text-xs text-ink-faint">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mt-1 w-full border border-paper-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-civic-green"
            />
          </label>
        )}

        <fieldset className="space-y-2">
          <legend className="text-xs text-ink-faint">Cadence</legend>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="radio"
              name={`cadence-${entityId}`}
              checked={cadence === "instant"}
              onChange={() => setCadence("instant")}
            />
            Instant — as updates happen
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="radio"
              name={`cadence-${entityId}`}
              checked={cadence === "weekly"}
              onChange={() => setCadence("weekly")}
            />
            Weekly digest
          </label>
        </fieldset>

        <div className="flex flex-wrap gap-2">
          {status === "following" ? (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={follow}
                className="border border-civic-green bg-civic-greenSoft px-3 py-2 text-sm text-civic-green disabled:opacity-60"
              >
                {pending ? "Saving…" : "Update cadence"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={unfollow}
                className="border border-paper-border px-3 py-2 text-sm text-ink-muted hover:text-ink disabled:opacity-60"
              >
                Unfollow
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={pending || (!sessionEmail && !email.trim())}
              onClick={follow}
              className="border border-civic-green bg-civic-green px-3 py-2 text-sm text-white disabled:opacity-60"
            >
              {pending ? "Following…" : "Follow by email"}
            </button>
          )}
        </div>

        {message ? (
          <p
            className={`text-xs leading-relaxed ${status === "error" ? "text-civic-amber" : "text-civic-green"}`}
          >
            {message}
          </p>
        ) : null}

        {isAdmin ? (
          <button
            type="button"
            disabled={pending}
            onClick={simulate}
            className="text-xs text-ink-faint underline-offset-2 hover:text-ink hover:underline disabled:opacity-60"
          >
            Simulate update (admin)
          </button>
        ) : null}

        <p className="text-[11px] text-ink-faint">
          Manage all follows on{" "}
          <a href="/following" className="text-civic-green underline-offset-2 hover:underline">
            /following
          </a>
          .
        </p>
      </div>
    </div>
  );
}
