"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { FollowUpdatesPanel } from "./FollowUpdatesPanel";
import { followableLabel, formatFollowCount, type FollowableEntityType } from "@/lib/follow/types";

type Props = {
  entityType: FollowableEntityType;
  entityId: string;
  entityTitle?: string;
  /** For photo heroes — light text on dark. */
  variant?: "default" | "onDark";
  className?: string;
  /** Server-rendered initial count to avoid flash. */
  initialCount?: number;
};

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export function RecordFollowButton({
  entityType,
  entityId,
  entityTitle,
  variant = "default",
  className = "",
  initialCount,
}: Props) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(initialCount ?? 0);
  const [following, setFollowing] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/follow/count?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`,
        );
        const data = await readJson<{ total?: number }>(res);
        if (!cancelled && typeof data.total === "number") setCount(data.total);
      } catch {
        /* keep initial */
      }

      try {
        const mine = await fetch("/api/follow/mine");
        if (!mine.ok || cancelled) return;
        const data = await readJson<{
          follows?: { entityType: string; entityId: string }[];
        }>(mine);
        if (
          data.follows?.some((f) => f.entityType === entityType && f.entityId === entityId)
        ) {
          setFollowing(true);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entityType, entityId]);

  function refreshCount() {
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/follow/count?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`,
        );
        const data = await readJson<{ total?: number }>(res);
        if (typeof data.total === "number") setCount(data.total);
      } catch {
        /* ignore */
      }
    });
  }

  const onDark = variant === "onDark";
  const label = followableLabel(entityType);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          disabled={pending}
          onClick={() => setOpen((v) => !v)}
          className={
            onDark
              ? "border border-white/40 bg-white/10 px-4 py-2.5 text-sm text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-60"
              : "border border-civic-green bg-civic-green px-4 py-2.5 text-sm text-white transition hover:opacity-90 disabled:opacity-60"
          }
        >
          {following ? "Following" : `Follow this ${label}`}
        </button>
        <p
          className={
            onDark
              ? "font-mono text-xs tracking-wide text-white/70"
              : "font-mono text-xs tracking-wide text-ink-faint"
          }
        >
          <span className={onDark ? "text-white" : "text-ink"}>{formatFollowCount(count)}</span>
          {" · "}
          following
        </p>
      </div>

      {open ? (
        <div
          id={panelId}
          className={`mt-4 max-w-md ${onDark ? "rounded-sm bg-paper p-1 text-ink shadow-lg" : ""}`}
          onFocusCapture={() => {
            /* panel open */
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              /* keep open until user closes via panel */
            }
          }}
        >
          <FollowUpdatesPanel
            entityType={entityType}
            entityId={entityId}
            entityTitle={entityTitle}
          />
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              className="text-xs text-ink-faint hover:text-ink"
              onClick={() => {
                setOpen(false);
                // Re-check following + count after panel interaction
                refreshCount();
                void (async () => {
                  try {
                    const mine = await fetch("/api/follow/mine");
                    if (!mine.ok) return;
                    const data = await readJson<{
                      follows?: { entityType: string; entityId: string }[];
                    }>(mine);
                    setFollowing(
                      Boolean(
                        data.follows?.some(
                          (f) => f.entityType === entityType && f.entityId === entityId,
                        ),
                      ),
                    );
                  } catch {
                    /* ignore */
                  }
                })();
              }}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
