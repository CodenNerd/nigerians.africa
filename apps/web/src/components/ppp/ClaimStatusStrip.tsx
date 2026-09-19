"use client";

import { useEffect, useState } from "react";
import type { Claim, ClaimKind } from "@nigeria-for-nigerians/domain";
import { StatusLabel } from "@/components/StatusLabel";
import { SectionHead, claimKindTheme } from "./visual";
import type { RecordPatch } from "@/lib/demo-store";

const kindOrder: ClaimKind[] = [
  "official_record",
  "promise",
  "public_statement",
  "claim",
  "allegation",
  "rumour",
];

type PatchedClaim = Claim & { lastReviewedAt?: string; lastReviewedBy?: string };

export function ClaimStatusStrip({ claims }: { claims: Claim[] }) {
  const [patch, setPatch] = useState<RecordPatch | null>(null);

  useEffect(() => {
    fetch("/api/admin/verify")
      .then((r) => r.json())
      .then((d) => setPatch(d.patch || null))
      .catch(() => setPatch(null));
  }, []);

  const merged: PatchedClaim[] = claims.map((c) => {
    const p = patch?.claims[c.id];
    if (!p) return c;
    return {
      ...c,
      status: (p.status as Claim["status"]) || c.status,
      lastReviewedAt: p.lastReviewedAt ?? c.lastReviewedAt,
      lastReviewedBy: p.lastReviewedBy ?? c.lastReviewedBy,
    };
  });

  const grouped = kindOrder
    .map((kind) => ({
      kind,
      items: merged
        .filter((c) => c.kind === kind)
        .sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <section id="claims" className="scroll-mt-28">
      <SectionHead
        title="Promises, statements, claims & allegations"
        subtitle="Separated by kind. Status labels stay visible — nothing collapses into true/false."
        meta={`${claims.length} entries`}
      />

      <div className="mt-6 space-y-3">
        {grouped.map((group) => {
          const theme = claimKindTheme[group.kind];
          return (
            <div key={group.kind}>
              <div className={`${theme.plane} px-5 py-3`}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className={`text-xs font-medium uppercase tracking-[0.22em] ${theme.ink}`}>
                    {theme.label}
                  </h3>
                  <span className={`font-mono text-sm ${theme.ink}`}>{group.items.length}</span>
                </div>
              </div>

              <ul className="divide-y divide-paper-border border-x border-b border-paper-border">
                {group.items.map((c) => (
                  <li key={c.id} className="relative bg-paper-card p-5 sm:p-6">
                    <div className={`absolute left-0 top-0 h-full w-1 ${theme.accent}`} />
                    <div className="flex flex-wrap items-center gap-2 pl-2">
                      <StatusLabel status={c.status} />
                      <span className="font-mono text-xs text-ink-faint">{c.date}</span>
                    </div>
                    <blockquote className="mt-4 pl-2 font-display text-2xl leading-snug text-ink sm:text-3xl">
                      “{c.statement}”
                    </blockquote>
                    <p className="mt-3 max-w-2xl pl-2 text-sm text-ink-muted">{c.context}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-6 pl-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-ink-faint">Evidence</div>
                        <div className="mt-1 flex items-center gap-1.5" aria-hidden>
                          {c.evidenceIds.length === 0 ? (
                            <span className="h-2 w-16 border border-dashed border-paper-border" />
                          ) : (
                            Array.from({ length: Math.min(c.evidenceIds.length, 8) }).map((_, i) => (
                              <span key={i} className={`h-2 w-5 ${theme.accent} opacity-80`} />
                            ))
                          )}
                          <span className="ml-1 font-mono text-xs text-ink">{c.evidenceIds.length}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-ink-faint">Responses</div>
                        <div className="mt-1 font-mono text-xs text-ink">{c.responseIds.length}</div>
                      </div>
                      {c.lastReviewedAt ? (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-ink-faint">
                            Last reviewed
                          </div>
                          <div className="mt-1 font-mono text-xs text-ink">
                            {c.lastReviewedAt.slice(0, 10)}
                            {c.lastReviewedBy ? ` · ${c.lastReviewedBy.split(":")[0]}` : ""}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
