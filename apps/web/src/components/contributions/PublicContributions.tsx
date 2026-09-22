"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  ArgumentRecord,
  CommentRecord,
  ContributionPageRecord,
  ContributionsTab,
  EntityContributions,
  PollRecord,
  SocialPostRecord,
} from "@/lib/contributions/types";

const TABS: { id: ContributionsTab; label: string }[] = [
  { id: "arguments", label: "Arguments" },
  { id: "polls", label: "Polls & votes" },
  { id: "pages", label: "Pages" },
  { id: "comments", label: "Comments" },
  { id: "social", label: "Social" },
];

const SIDE_TONE: Record<string, string> = {
  for: "border-civic-green/30 bg-civic-greenSoft text-civic-green",
  against: "border-civic-red/30 bg-civic-redSoft text-civic-red",
  nuance: "border-civic-blue/30 bg-civic-blueSoft text-civic-blue",
};

type IdentityFields = { displayName: string; email: string };

function IdentityInputs({
  value,
  onChange,
}: {
  value: IdentityFields;
  onChange: (v: IdentityFields) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="block text-xs text-ink-faint">
        Display name
        <input
          value={value.displayName}
          onChange={(e) => onChange({ ...value, displayName: e.target.value })}
          className="mt-1 w-full border border-paper-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-civic-green"
          maxLength={80}
          required
        />
      </label>
      <label className="block text-xs text-ink-faint">
        Email <span className="normal-case tracking-normal">(not shown publicly)</span>
        <input
          type="email"
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          className="mt-1 w-full border border-paper-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-civic-green"
          required
        />
      </label>
    </div>
  );
}

export function PublicContributions({
  entityType,
  entityId,
  entityTitle,
}: {
  entityType: string;
  entityId: string;
  entityTitle: string;
}) {
  const [tab, setTab] = useState<ContributionsTab>("arguments");
  const [data, setData] = useState<EntityContributions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [identity, setIdentity] = useState<IdentityFields>({ displayName: "", email: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/contributions?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`,
      );
      if (!res.ok) throw new Error("Failed to load contributions");
      setData((await res.json()) as EntityContributions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function postJson(url: string, body: unknown) {
    setBusy(true);
    setNotice(null);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(json.error || "Request failed");
      if (json.message) setNotice(json.message);
      await reload();
      return json;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      return null;
    } finally {
      setBusy(false);
    }
  }

  const counts = data
    ? {
        arguments: data.arguments.length,
        polls: data.polls.length,
        pages: data.pages.length,
        comments: data.comments.length,
        social: data.social.length,
      }
    : null;

  return (
    <section id="public-contributions" className="scroll-mt-28 border-t border-paper-border pt-14">
      <div className="max-w-3xl">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
          Community
        </p>
        <h2 className="mt-2 font-display text-3xl tracking-tight text-ink">Public contributions</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Arguments, polls, pages, comments, and social pointers about{" "}
          <span className="text-ink">{entityTitle}</span>. Community content is not platform
          verification or a court finding.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5" role="tablist" aria-label="Contribution types">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`border px-2.5 py-1.5 text-xs transition ${
              tab === t.id
                ? "border-civic-green bg-civic-greenSoft text-civic-green"
                : "border-paper-border bg-paper text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
            {counts ? ` (${counts[t.id]})` : ""}
          </button>
        ))}
      </div>

      {notice ? (
        <p className="mt-4 border border-civic-green/30 bg-civic-greenSoft px-3 py-2 text-sm text-civic-green">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 border border-civic-red/30 bg-civic-redSoft px-3 py-2 text-sm text-civic-red">
          {error}
        </p>
      ) : null}

      <div className="mt-6">
        {loading && !data ? (
          <p className="text-sm text-ink-muted">Loading contributions…</p>
        ) : tab === "arguments" ? (
          <ArgumentsPanel
            items={data?.arguments ?? []}
            identity={identity}
            onIdentity={setIdentity}
            busy={busy}
            onCreate={(payload) =>
              postJson("/api/contributions/arguments", {
                ...payload,
                entityType,
                entityId,
                displayName: identity.displayName,
                email: identity.email,
              })
            }
            onReply={(argumentId, body) =>
              postJson("/api/contributions/arguments", {
                action: "reply",
                argumentId,
                body,
                displayName: identity.displayName,
                email: identity.email,
              })
            }
            onReact={(argumentId, kind) =>
              postJson("/api/contributions/arguments/react", {
                argumentId,
                kind,
                email: identity.email,
              })
            }
          />
        ) : tab === "polls" ? (
          <PollsPanel
            items={data?.polls ?? []}
            identity={identity}
            onIdentity={setIdentity}
            busy={busy}
            onCreate={(payload) =>
              postJson("/api/contributions/polls", {
                ...payload,
                entityType,
                entityId,
                displayName: identity.displayName,
                email: identity.email,
              })
            }
            onVote={(pollId, optionId) =>
              postJson("/api/contributions/polls", {
                action: "vote",
                pollId,
                optionId,
                email: identity.email,
              })
            }
          />
        ) : tab === "pages" ? (
          <PagesPanel
            items={data?.pages ?? []}
            identity={identity}
            onIdentity={setIdentity}
            busy={busy}
            onSubmit={(payload) =>
              postJson("/api/contributions/pages", {
                ...payload,
                entityType,
                entityId,
                displayName: identity.displayName,
                email: identity.email,
              })
            }
          />
        ) : tab === "comments" ? (
          <CommentsPanel
            items={data?.comments ?? []}
            identity={identity}
            onIdentity={setIdentity}
            busy={busy}
            onSubmit={(body) =>
              postJson("/api/contributions/comments", {
                entityType,
                entityId,
                body,
                displayName: identity.displayName,
                email: identity.email,
              })
            }
          />
        ) : (
          <SocialPanel
            items={data?.social ?? []}
            identity={identity}
            onIdentity={setIdentity}
            busy={busy}
            onSubmit={(payload) =>
              postJson("/api/contributions/social", {
                ...payload,
                entityType,
                entityId,
                displayName: identity.displayName,
                email: identity.email,
              })
            }
          />
        )}
      </div>
    </section>
  );
}

function ArgumentsPanel({
  items,
  identity,
  onIdentity,
  busy,
  onCreate,
  onReply,
  onReact,
}: {
  items: ArgumentRecord[];
  identity: IdentityFields;
  onIdentity: (v: IdentityFields) => void;
  busy: boolean;
  onCreate: (p: { side: string; title: string; body: string }) => Promise<unknown>;
  onReply: (argumentId: string, body: string) => Promise<unknown>;
  onReact: (argumentId: string, kind: "agree" | "disagree") => Promise<unknown>;
}) {
  const [side, setSide] = useState<"for" | "against" | "nuance">("nuance");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-muted">
        Structured for / against / nuance positions. Community argument — not a verified claim on
        this record.
      </p>

      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-ink-muted">No arguments yet. Start one below.</li>
        ) : (
          items.map((a) => (
            <li
              key={a.id}
              className="relative border border-paper-border bg-paper-card px-4 py-4 pl-5 sm:px-5"
            >
              <span
                className={`absolute inset-y-0 left-0 w-1 ${
                  a.side === "for"
                    ? "bg-civic-green"
                    : a.side === "against"
                      ? "bg-civic-red"
                      : "bg-civic-blue"
                }`}
              />
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${SIDE_TONE[a.side]}`}
                >
                  {a.side}
                </span>
                <span className="text-xs text-ink-faint">{a.authorDisplayName}</span>
              </div>
              <p className="mt-2 font-display text-xl text-ink">{a.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted whitespace-pre-wrap">
                {a.body}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  disabled={busy || !identity.email}
                  onClick={() => onReact(a.id, "agree")}
                  className="border border-civic-green/30 bg-civic-greenSoft px-2 py-1 text-civic-green disabled:opacity-50"
                >
                  Agree · {a.agreeCount}
                </button>
                <button
                  type="button"
                  disabled={busy || !identity.email}
                  onClick={() => onReact(a.id, "disagree")}
                  className="border border-paper-border bg-paper px-2 py-1 text-ink-muted disabled:opacity-50"
                >
                  Disagree · {a.disagreeCount}
                </button>
                <button
                  type="button"
                  onClick={() => setReplyFor(replyFor === a.id ? null : a.id)}
                  className="text-civic-blue hover:underline"
                >
                  Reply
                </button>
              </div>
              {a.replies.length > 0 ? (
                <ul className="mt-3 space-y-2 border-l border-paper-border pl-4">
                  {a.replies.map((r) => (
                    <li key={r.id} className="text-sm">
                      <span className="font-medium text-ink">{r.authorDisplayName}</span>
                      <span className="mt-0.5 block text-ink-muted whitespace-pre-wrap">{r.body}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {replyFor === a.id ? (
                <form
                  className="mt-3 space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void onReply(a.id, replyBody).then((ok) => {
                      if (ok) {
                        setReplyBody("");
                        setReplyFor(null);
                      }
                    });
                  }}
                >
                  <IdentityInputs value={identity} onChange={onIdentity} />
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={3}
                    className="w-full border border-paper-border bg-paper px-3 py-2 text-sm"
                    required
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="border border-ink bg-ink px-3 py-2 text-xs uppercase tracking-wider text-paper disabled:opacity-50"
                  >
                    Post reply
                  </button>
                </form>
              ) : null}
            </li>
          ))
        )}
      </ul>

      <form
        className="space-y-3 border border-paper-border bg-paper-card p-4 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void onCreate({ side, title, body }).then((ok) => {
            if (ok) {
              setTitle("");
              setBody("");
            }
          });
        }}
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
          Add an argument
        </p>
        <IdentityInputs value={identity} onChange={onIdentity} />
        <label className="block text-xs text-ink-faint">
          Side
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as typeof side)}
            className="mt-1 w-full border border-paper-border bg-paper px-3 py-2 text-sm"
          >
            <option value="for">For</option>
            <option value="against">Against</option>
            <option value="nuance">Nuance</option>
          </select>
        </label>
        <label className="block text-xs text-ink-faint">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full border border-paper-border bg-paper px-3 py-2 text-sm"
            maxLength={160}
            required
          />
        </label>
        <label className="block text-xs text-ink-faint">
          Position
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="mt-1 w-full border border-paper-border bg-paper px-3 py-2 text-sm"
            required
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="border border-ink bg-ink px-3 py-2 text-xs uppercase tracking-wider text-paper disabled:opacity-50"
        >
          Publish argument
        </button>
      </form>
    </div>
  );
}

function PollsPanel({
  items,
  identity,
  onIdentity,
  busy,
  onCreate,
  onVote,
}: {
  items: PollRecord[];
  identity: IdentityFields;
  onIdentity: (v: IdentityFields) => void;
  busy: boolean;
  onCreate: (p: { question: string; options: string[] }) => Promise<unknown>;
  onVote: (pollId: string, optionId: string) => Promise<unknown>;
}) {
  const [question, setQuestion] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");

  return (
    <div className="space-y-6">
      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-ink-muted">No polls yet.</li>
        ) : (
          items.map((p) => {
            const total = Math.max(
              1,
              p.options.reduce((n, o) => n + o.voteCount, 0),
            );
            return (
              <li key={p.id} className="border border-paper-border bg-paper-card px-4 py-4 sm:px-5">
                <p className="font-display text-xl text-ink">{p.question}</p>
                <p className="mt-1 text-xs text-ink-faint">by {p.authorDisplayName}</p>
                <ul className="mt-4 space-y-2">
                  {p.options.map((o) => {
                    const pct = Math.round((o.voteCount / total) * 100);
                    return (
                      <li key={o.id}>
                        <button
                          type="button"
                          disabled={busy || !identity.email}
                          onClick={() => onVote(p.id, o.id)}
                          className="group w-full text-left disabled:opacity-60"
                        >
                          <div className="flex justify-between gap-2 text-sm">
                            <span className="text-ink group-hover:text-civic-green">{o.label}</span>
                            <span className="font-mono text-xs text-ink-faint">
                              {o.voteCount} · {pct}%
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full bg-ink/10">
                            <div
                              className="h-full bg-civic-blue"
                              style={{ width: `${Math.max(4, pct)}%` }}
                            />
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {!identity.email ? (
                  <p className="mt-2 text-xs text-ink-faint">Enter your email below to vote.</p>
                ) : null}
              </li>
            );
          })
        )}
      </ul>

      <form
        className="space-y-3 border border-paper-border bg-paper-card p-4 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const options = [optA, optB, optC].map((s) => s.trim()).filter(Boolean);
          void onCreate({ question, options }).then((ok) => {
            if (ok) {
              setQuestion("");
              setOptA("");
              setOptB("");
              setOptC("");
            }
          });
        }}
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
          Create a poll
        </p>
        <IdentityInputs value={identity} onChange={onIdentity} />
        <label className="block text-xs text-ink-faint">
          Question
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="mt-1 w-full border border-paper-border bg-paper px-3 py-2 text-sm"
            required
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            [optA, setOptA, "Option A"],
            [optB, setOptB, "Option B"],
            [optC, setOptC, "Option C (optional)"],
          ].map(([val, set, label], i) => (
            <label key={i} className="block text-xs text-ink-faint">
              {label as string}
              <input
                value={val as string}
                onChange={(e) => (set as (v: string) => void)(e.target.value)}
                className="mt-1 w-full border border-paper-border bg-paper px-3 py-2 text-sm"
                required={i < 2}
              />
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="border border-ink bg-ink px-3 py-2 text-xs uppercase tracking-wider text-paper disabled:opacity-50"
        >
          Publish poll
        </button>
      </form>
    </div>
  );
}

function PagesPanel({
  items,
  identity,
  onIdentity,
  busy,
  onSubmit,
}: {
  items: ContributionPageRecord[];
  identity: IdentityFields;
  onIdentity: (v: IdentityFields) => void;
  busy: boolean;
  onSubmit: (p: { title: string; body: string }) => Promise<unknown>;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-muted">
        Short articles that mention or relate to this record. New submissions are held for review
        before they appear publicly.
      </p>
      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-ink-muted">No published pages yet.</li>
        ) : (
          items.map((p) => (
            <li key={p.id} className="border border-paper-border bg-paper-card px-4 py-4 sm:px-5">
              <p className="font-display text-xl text-ink">{p.title}</p>
              <p className="mt-1 text-xs text-ink-faint">{p.authorDisplayName}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted whitespace-pre-wrap">
                {p.body}
              </p>
            </li>
          ))
        )}
      </ul>
      <form
        className="space-y-3 border border-paper-border bg-paper-card p-4 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit({ title, body }).then((ok) => {
            if (ok) {
              setTitle("");
              setBody("");
            }
          });
        }}
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
          Submit a page
        </p>
        <IdentityInputs value={identity} onChange={onIdentity} />
        <label className="block text-xs text-ink-faint">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full border border-paper-border bg-paper px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="block text-xs text-ink-faint">
          Article (plain text)
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className="mt-1 w-full border border-paper-border bg-paper px-3 py-2 text-sm"
            required
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="border border-ink bg-ink px-3 py-2 text-xs uppercase tracking-wider text-paper disabled:opacity-50"
        >
          Submit for review
        </button>
      </form>
    </div>
  );
}

function CommentsPanel({
  items,
  identity,
  onIdentity,
  busy,
  onSubmit,
}: {
  items: CommentRecord[];
  identity: IdentityFields;
  onIdentity: (v: IdentityFields) => void;
  busy: boolean;
  onSubmit: (body: string) => Promise<unknown>;
}) {
  const [body, setBody] = useState("");

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-paper-border border-y border-paper-border">
        {items.length === 0 ? (
          <li className="py-4 text-sm text-ink-muted">No comments yet.</li>
        ) : (
          items.map((c) => (
            <li key={c.id} className="py-4">
              <p className="text-xs text-ink-faint">{c.authorDisplayName}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink whitespace-pre-wrap">{c.body}</p>
            </li>
          ))
        )}
      </ul>
      <form
        className="space-y-3 border border-paper-border bg-paper-card p-4 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit(body).then((ok) => {
            if (ok) setBody("");
          });
        }}
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
          Add a comment
        </p>
        <IdentityInputs value={identity} onChange={onIdentity} />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          className="w-full border border-paper-border bg-paper px-3 py-2 text-sm"
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="border border-ink bg-ink px-3 py-2 text-xs uppercase tracking-wider text-paper disabled:opacity-50"
        >
          Post comment
        </button>
      </form>
    </div>
  );
}

function SocialPanel({
  items,
  identity,
  onIdentity,
  busy,
  onSubmit,
}: {
  items: SocialPostRecord[];
  identity: IdentityFields;
  onIdentity: (v: IdentityFields) => void;
  busy: boolean;
  onSubmit: (p: {
    platform: string;
    url: string;
    title: string;
    snippet?: string;
  }) => Promise<unknown>;
}) {
  const [platform, setPlatform] = useState("x");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [snippet, setSnippet] = useState("");

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-muted">
        Links to public social posts about this record. Submissions are held for review; only
        published pointers appear in the list.
      </p>
      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-ink-muted">No social pointers yet.</li>
        ) : (
          items.map((s) => (
            <li key={s.id} className="border border-paper-border bg-paper-card px-4 py-4 sm:px-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-civic-blue">
                {s.platform}
              </p>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block font-display text-xl text-ink hover:text-civic-green"
              >
                {s.title}
              </a>
              {s.snippet ? (
                <p className="mt-2 text-sm text-ink-muted">{s.snippet}</p>
              ) : null}
              <p className="mt-2 text-xs text-ink-faint">submitted by {s.authorDisplayName}</p>
            </li>
          ))
        )}
      </ul>
      <form
        className="space-y-3 border border-paper-border bg-paper-card p-4 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit({ platform, url, title, snippet: snippet || undefined }).then((ok) => {
            if (ok) {
              setUrl("");
              setTitle("");
              setSnippet("");
            }
          });
        }}
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
          Submit a social link
        </p>
        <IdentityInputs value={identity} onChange={onIdentity} />
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block text-xs text-ink-faint">
            Platform
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="mt-1 w-full border border-paper-border bg-paper px-3 py-2 text-sm"
            >
              <option value="x">X</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="block text-xs text-ink-faint">
            URL
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 w-full border border-paper-border bg-paper px-3 py-2 text-sm"
              required
            />
          </label>
        </div>
        <label className="block text-xs text-ink-faint">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full border border-paper-border bg-paper px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="block text-xs text-ink-faint">
          Snippet (optional)
          <input
            value={snippet}
            onChange={(e) => setSnippet(e.target.value)}
            className="mt-1 w-full border border-paper-border bg-paper px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="border border-ink bg-ink px-3 py-2 text-xs uppercase tracking-wider text-paper disabled:opacity-50"
        >
          Submit for review
        </button>
      </form>
    </div>
  );
}
