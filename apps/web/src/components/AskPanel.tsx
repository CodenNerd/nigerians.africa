"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { StatusLabel } from "./StatusLabel";

type Citation = { title: string; href: string; type: string };

type AskResult = {
  answer: string;
  mode: "llm" | "retrieval";
  citations: Citation[];
  related: Citation[];
};

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      text: string;
      mode?: "llm" | "retrieval";
      citations?: Citation[];
      error?: boolean;
    };

const STARTERS = [
  "Why is this delayed?",
  "Who is responsible?",
  "Where did the money go?",
  "What evidence exists?",
];

function newId() {
  return `m_${Math.random().toString(36).slice(2, 10)}`;
}

export function AskPanel({
  context,
  variant = "sidebar",
}: {
  context: string;
  /** sidebar = compact sticky column; page = taller /ask layout */
  variant?: "sidebar" | "page";
}) {
  const listId = useId();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, pending]);

  function send(text: string) {
    const question = text.trim();
    if (!question || pending) return;

    const userMsg: ChatMessage = { id: newId(), role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");

    startTransition(async () => {
      try {
        const history = [...messages, userMsg]
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-8)
          .map((m) => ({
            role: m.role,
            content: m.role === "user" ? m.text : m.text,
          }));

        const res = await fetch("/api/ai/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, context, history }),
        });
        if (!res.ok) throw new Error("Ask failed");
        const data = (await res.json()) as AskResult;
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "assistant",
            text: data.answer,
            mode: data.mode,
            citations: data.citations,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "assistant",
            text: "Could not reach the Ask service. Try again in a moment.",
            error: true,
          },
        ]);
      }
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(draft);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(draft);
    }
  }

  const tall = variant === "page";
  const threadMax = tall ? "max-h-[28rem] min-h-[16rem]" : "max-h-[14rem] min-h-[7.5rem]";

  return (
    <div
      className={`flex flex-col border border-civic-blue/20 bg-civic-blueSoft ${tall ? "p-6" : "p-4"}`}
    >
      <div className="shrink-0">
        <h3 className="font-display text-lg tracking-tight text-ink">Ask the record</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          Chat grounded in this page’s public record. AI answers are labelled and cite sources.
        </p>
      </div>

      <div
        id={listId}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className={`mt-3 flex-1 space-y-3 overflow-y-auto border border-civic-blue/15 bg-paper/70 px-3 py-3 ${threadMax}`}
      >
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-ink-faint">Try a prompt to start:</p>
            <ul className="flex flex-wrap gap-1.5">
              {STARTERS.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => send(s)}
                    className="border border-civic-blue/25 bg-paper px-2.5 py-1 text-left text-xs text-civic-blue transition hover:border-civic-blue/50 hover:bg-civic-blueSoft"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[95%] bg-civic-blue px-3 py-2 text-sm leading-relaxed text-white">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-start">
              <div
                className={`max-w-[95%] space-y-2 border px-3 py-2 text-sm leading-relaxed ${
                  m.error
                    ? "border-civic-red/30 bg-civic-redSoft text-ink"
                    : "border-paper-border bg-paper text-ink"
                }`}
              >
                {!m.error ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusLabel status="ai_generated" />
                    {m.mode === "retrieval" ? (
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                        Record retrieval
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <p className="whitespace-pre-wrap text-ink-muted">{m.text}</p>
                {m.citations && m.citations.length > 0 ? (
                  <div className="border-t border-paper-border pt-2">
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-faint">
                      Sources
                    </p>
                    <ul className="mt-1.5 space-y-1">
                      {m.citations.slice(0, 4).map((c) => (
                        <li key={c.href + c.title}>
                          <Link
                            href={c.href}
                            className="text-xs text-civic-blue no-underline hover:underline"
                          >
                            {c.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ),
        )}

        {pending ? (
          <div className="flex justify-start">
            <div className="border border-paper-border bg-paper px-3 py-2 text-xs text-ink-faint">
              Searching the record…
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="mt-3 shrink-0 space-y-2">
        <label className="sr-only" htmlFor={`${listId}-input`}>
          Message
        </label>
        <textarea
          ref={inputRef}
          id={`${listId}-input`}
          rows={tall ? 3 : 2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a follow-up… (Enter to send)"
          disabled={pending}
          className="w-full resize-none border border-civic-blue/25 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-civic-blue disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-2">
          {messages.length > 0 ? (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="text-xs text-ink-faint hover:text-ink"
            >
              Clear chat
            </button>
          ) : (
            <span className="text-[11px] text-ink-faint">Shift+Enter for new line</span>
          )}
          <button
            type="submit"
            disabled={pending || !draft.trim()}
            className="bg-civic-blue px-4 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
          >
            {pending ? "…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
