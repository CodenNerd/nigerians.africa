"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { DemoReport } from "@/lib/demo-store";

export function LiveReportsList() {
  const [reports, setReports] = useState<DemoReport[]>([]);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => setReports(d.reports || []))
      .catch(() => setReports([]));
  }, []);

  if (!reports.length) {
    return (
      <p className="mt-3 text-sm text-ink-muted">
        No live submissions yet.{" "}
        <Link href="/report" className="text-civic-green hover:underline">
          See something? Report it
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="mt-4 grid gap-px bg-paper-border">
      {reports.map((r) => (
        <li key={r.id} className="bg-civic-redSoft p-5">
          <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-civic-red">
            Live · {r.status}
            {r.kind ? ` · ${r.kind}` : ""}
          </div>
          <div className="mt-2 font-display text-xl text-ink">{r.title}</div>
          <p className="mt-2 text-sm text-ink-muted">{r.description}</p>
          <p className="mt-3 font-mono text-[11px] text-ink-faint">
            {r.location} · {r.createdAt.slice(0, 10)}
            {r.fileLabel ? ` · ${r.fileLabel}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
