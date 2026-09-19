"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DemoReport = {
  id: string;
  title: string;
  description: string;
  location: string;
  createdAt: string;
  status: string;
  user: string;
};

const DEMO_CLAIMS = [
  { id: "claim-tinubu-renewed-hope", label: "Renewed Hope promise" },
  { id: "claim-tinubu-allegation", label: "Tinubu allegation" },
  { id: "claim-rumour-resign", label: "Resignation rumour" },
  { id: "claim-allegation-diversion", label: "Diversion allegation" },
  { id: "claim-promise-roads", label: "Roads promise" },
];

const DEMO_EVIDENCE = [
  { id: "ev-allen-photo-1", label: "Allen Avenue photo 1" },
  { id: "ev-allen-photo-2", label: "Allen Avenue photo 2" },
  { id: "ev-pu-observer", label: "Observer tally sheet" },
  { id: "ev-foi-payments", label: "FOI payments response" },
];

const CLAIM_STATUSES = ["unverified", "under_review", "disputed", "verified", "official_record", "withdrawn"];
const EVIDENCE_STATUSES = ["unverified", "reported", "under_review", "disputed", "verified", "official_record"];

export default function AdminPage() {
  const [session, setSession] = useState<string | null>(null);
  const [reports, setReports] = useState<DemoReport[]>([]);
  const [note, setNote] = useState("");
  const [reviews, setReviews] = useState<
    Record<string, { status?: string; lastReviewedAt?: string; lastReviewedBy?: string }>
  >({});

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setSession(d.session));
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => setReports(d.reports || []));
    fetch("/api/admin/verify")
      .then((r) => r.json())
      .then((d) => {
        const p = d.patch || { claims: {}, evidence: {} };
        setReviews({ ...p.claims, ...Object.fromEntries(
          Object.entries(p.evidence || {}).map(([k, v]) => [
            k,
            {
              status: (v as { verificationStatus?: string }).verificationStatus,
              lastReviewedAt: (v as { lastReviewedAt?: string }).lastReviewedAt,
              lastReviewedBy: (v as { lastReviewedBy?: string }).lastReviewedBy,
            },
          ]),
        ) });
      });
  }, []);

  const role = session?.split(":")[0];
  const allowed = role === "verifier" || role === "admin" || role === "government";

  async function setStatus(id: string, status: string) {
    const res = await fetch("/api/admin/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const data = await res.json();
      setReports(data.reports);
      setNote(`Updated ${id} → ${status}`);
    } else {
      setNote("Not authorized or update failed");
    }
  }

  async function reviewEntity(entity: "claim" | "evidence", id: string, status: string) {
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity, id, status }),
    });
    if (res.ok) {
      const data = await res.json();
      const p = data.patch;
      const next: typeof reviews = {};
      for (const [k, v] of Object.entries(p.claims || {})) {
        next[k] = v as (typeof reviews)[string];
      }
      for (const [k, v] of Object.entries(p.evidence || {})) {
        const ev = v as {
          verificationStatus?: string;
          lastReviewedAt?: string;
          lastReviewedBy?: string;
        };
        next[k] = {
          status: ev.verificationStatus,
          lastReviewedAt: ev.lastReviewedAt,
          lastReviewedBy: ev.lastReviewedBy,
        };
      }
      setReviews(next);
      setNote(`Reviewed ${entity} ${id} → ${status}`);
    } else {
      setNote("Not authorized or review failed");
    }
  }

  async function publishResponse() {
    const res = await fetch("/api/admin/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        statement:
          "Demo official response: the institution acknowledges the report and will review the evidence package.",
      }),
    });
    const data = await res.json();
    setNote(data.message || "Response recorded in demo store");
  }

  if (!session) {
    return (
      <div className="site-container py-16">
        <h1 className="font-display text-3xl">Verifier desk</h1>
        <p className="mt-3 text-ink-muted">
          Sign in as <code>verify@demo.ng</code> or <code>gov@demo.ng</code> to review reports.
        </p>
        <Link href="/signin" className="mt-4 inline-block text-civic-green">
          Sign in →
        </Link>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="site-container py-16">
        <h1 className="font-display text-3xl">Verifier desk</h1>
        <p className="mt-3 text-ink-muted">
          Signed in as {session}. Switch to a verifier or government demo account.
        </p>
        <Link href="/signin" className="mt-4 inline-block text-civic-green">
          Switch account →
        </Link>
      </div>
    );
  }

  return (
    <div className="site-container py-12">
      <h1 className="font-display text-4xl text-ink">Verifier desk</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Session: {session}. Light moderation loop — not a full CMS. Status labels never collapse to
        true/false.
      </p>
      {note ? <p className="mt-4 border border-civic-green bg-civic-greenSoft px-3 py-2 text-sm">{note}</p> : null}

      <section className="mt-10">
        <h2 className="font-display text-2xl">Incoming demo reports</h2>
        {reports.length === 0 ? (
          <p className="mt-3 text-ink-muted">
            No demo submissions yet.{" "}
            <Link href="/report" className="text-civic-green">
              Submit one as a citizen
            </Link>{" "}
            first.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reports.map((r) => (
              <li key={r.id} className="border border-paper-border bg-paper-card p-4">
                <div className="font-medium">{r.title}</div>
                <p className="mt-1 text-sm text-ink-muted">{r.description}</p>
                <p className="mt-2 text-xs text-ink-faint">
                  {r.location} · {r.createdAt} · {r.user} · status {r.status}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["screened", "under_review", "published", "connected"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(r.id, s)}
                      className="border border-paper-border px-2 py-1 text-xs hover:border-civic-green"
                    >
                      Mark {s}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">PPP claim review</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Toggle claim status for demo IDs. “Last reviewed” appears on Public Personality Profile
          claim cards.
        </p>
        <ul className="mt-4 space-y-3">
          {DEMO_CLAIMS.map((c) => {
            const rev = reviews[c.id];
            return (
              <li key={c.id} className="border border-paper-border bg-paper-card p-4">
                <div className="font-medium">{c.label}</div>
                <p className="mt-1 font-mono text-xs text-ink-faint">
                  {c.id}
                  {rev?.status ? ` · ${rev.status}` : ""}
                  {rev?.lastReviewedAt ? ` · last reviewed ${rev.lastReviewedAt.slice(0, 16)}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CLAIM_STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => reviewEntity("claim", c.id, s)}
                      className="border border-paper-border px-2 py-1 text-xs hover:border-civic-amber"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Evidence verification</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Update evidence verificationStatus for demo packages. Provenance stays visible.
        </p>
        <ul className="mt-4 space-y-3">
          {DEMO_EVIDENCE.map((e) => {
            const rev = reviews[e.id];
            return (
              <li key={e.id} className="border border-paper-border bg-paper-card p-4">
                <div className="font-medium">{e.label}</div>
                <p className="mt-1 font-mono text-xs text-ink-faint">
                  {e.id}
                  {rev?.status ? ` · ${rev.status}` : ""}
                  {rev?.lastReviewedAt ? ` · last reviewed ${rev.lastReviewedAt.slice(0, 16)}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {EVIDENCE_STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => reviewEntity("evidence", e.id, s)}
                      className="border border-paper-border px-2 py-1 text-xs hover:border-civic-blue"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Official response</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Government demo accounts can publish a placeholder response into the session store.
        </p>
        <button
          type="button"
          onClick={publishResponse}
          className="mt-3 bg-civic-blue px-4 py-2 text-sm text-white"
        >
          Publish demo official response
        </button>
      </section>
    </div>
  );
}
