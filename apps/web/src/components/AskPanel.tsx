"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusLabel } from "./StatusLabel";

type AskResult = {
  answer: string;
  mode: "llm" | "retrieval";
  citations: { title: string; href: string; type: string }[];
  related: { title: string; href: string; type: string }[];
};

export function AskPanel({ context }: { context: string }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context }),
      });
      if (!res.ok) throw new Error("Ask failed");
      const data = (await res.json()) as AskResult;
      setResult(data);
    } catch {
      setError("Could not reach the Ask service. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-civic-blueSoft p-5">
      <h3 className="font-display text-lg tracking-tight text-ink">Ask about this page</h3>
      <p className="mt-1 text-sm text-ink-muted">
        Answers are grounded in the public record and labelled when AI-generated.
      </p>
      <form onSubmit={onSubmit} className="mt-3 space-y-2">
        <label className="sr-only" htmlFor="ask-input">
          Your question
        </label>
        <textarea
          id="ask-input"
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder='e.g. "Why is this project delayed?"'
          className="w-full border border-civic-blue/20 bg-paper/80 px-3 py-2 text-sm text-ink outline-none focus:border-civic-blue"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-civic-blue px-3 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Searching the record…" : "Ask"}
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-civic-red">{error}</p> : null}
      {result ? (
        <div className="mt-4 space-y-3 border-t border-civic-blue/20 pt-4">
          <StatusLabel status="ai_generated" />
          <p className="text-sm leading-relaxed text-ink-muted">{result.answer}</p>
          {result.citations.length ? (
            <div>
              <h4 className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">Sources</h4>
              <ul className="mt-2 space-y-1">
                {result.citations.map((c) => (
                  <li key={c.href + c.title}>
                    <Link href={c.href} className="text-sm text-civic-blue hover:underline">
                      {c.title}
                    </Link>
                    <span className="text-xs text-ink-faint"> · {c.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
