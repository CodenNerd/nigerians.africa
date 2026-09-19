import Link from "next/link";
import type { PersonRelatedItem } from "@nigeria-for-nigerians/domain";
import { SectionHead } from "./visual";

const kindTheme: Record<
  string,
  { plane: string; ink: string; accent: string; diagram: "budget" | "election" | "institution" | "problem" | "default" }
> = {
  Budget: {
    plane: "bg-civic-amberSoft",
    ink: "text-civic-amber",
    accent: "bg-civic-amber",
    diagram: "budget",
  },
  Election: {
    plane: "bg-civic-blueSoft",
    ink: "text-civic-blue",
    accent: "bg-civic-blue",
    diagram: "election",
  },
  Institution: {
    plane: "bg-civic-greenSoft",
    ink: "text-civic-green",
    accent: "bg-civic-green",
    diagram: "institution",
  },
  Problem: {
    plane: "bg-civic-redSoft",
    ink: "text-civic-red",
    accent: "bg-civic-red",
    diagram: "problem",
  },
};

function themeFor(kind: string) {
  return (
    kindTheme[kind] ?? {
      plane: "bg-paper",
      ink: "text-ink",
      accent: "bg-ink-faint",
      diagram: "default" as const,
    }
  );
}

function Diagram({ kind }: { kind: string }) {
  const t = themeFor(kind);
  const stroke = "currentColor";

  if (t.diagram === "budget") {
    return (
      <svg viewBox="0 0 280 100" className={`h-24 w-full ${t.ink}`} aria-hidden>
        <text x="0" y="18" fill="currentColor" style={{ fontSize: 10, fontFamily: "ui-monospace", letterSpacing: "0.12em" }}>
          NATIONAL ENVELOPE
        </text>
        <rect x="0" y="32" width="168" height="14" fill="currentColor" opacity="0.9" />
        <rect x="168" y="32" width="112" height="14" fill="currentColor" opacity="0.25" />
        <path d="M20 62 L20 78 L100 78" fill="none" stroke={stroke} strokeWidth="1.5" />
        <path d="M100 70 L100 78 L180 78 L180 70" fill="none" stroke={stroke} strokeWidth="1.5" />
        <path d="M180 70 L180 78 L260 78" fill="none" stroke={stroke} strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="8" y="96" fill="currentColor" opacity="0.7" style={{ fontSize: 9, fontFamily: "ui-monospace" }}>
          BUDGET → ALLOCATION → RELEASE
        </text>
      </svg>
    );
  }

  if (t.diagram === "election") {
    return (
      <svg viewBox="0 0 280 100" className={`h-24 w-full ${t.ink}`} aria-hidden>
        <rect x="0" y="8" width="72" height="72" fill="none" stroke={stroke} strokeWidth="2" />
        <line x1="0" y1="28" x2="72" y2="28" stroke={stroke} strokeWidth="1.5" />
        <text x="10" y="58" fill="currentColor" style={{ fontSize: 28, fontFamily: "Georgia, serif" }}>
          27
        </text>
        <g transform="translate(100, 28)">
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              cx={i * 36}
              cy="20"
              r="8"
              fill={i === 0 ? "currentColor" : "none"}
              stroke={stroke}
              strokeWidth="2"
              strokeDasharray={i > 1 ? "3 2" : undefined}
              opacity={i === 3 ? 0.4 : 1}
            />
          ))}
          <path d="M8 20 H28 M44 20 H64 M80 20 H100" stroke={stroke} strokeWidth="1.5" />
        </g>
        <text x="100" y="88" fill="currentColor" opacity="0.7" style={{ fontSize: 9, fontFamily: "ui-monospace" }}>
          CYCLE OPEN → RESULTS → MEMORY
        </text>
      </svg>
    );
  }

  if (t.diagram === "institution") {
    return (
      <svg viewBox="0 0 120 80" className={`h-16 w-full ${t.ink}`} aria-hidden>
        <rect x="20" y="28" width="80" height="44" fill="none" stroke={stroke} strokeWidth="2" />
        <polygon points="60,8 12,28 108,28" fill="none" stroke={stroke} strokeWidth="2" />
        <rect x="52" y="48" width="16" height="24" fill="currentColor" opacity="0.35" />
      </svg>
    );
  }

  if (t.diagram === "problem") {
    return (
      <svg viewBox="0 0 120 80" className={`h-16 w-full ${t.ink}`} aria-hidden>
        <circle cx="60" cy="40" r="28" fill="none" stroke={stroke} strokeWidth="2" />
        <circle cx="60" cy="40" r="8" fill="currentColor" />
        <circle cx="60" cy="40" r="18" fill="none" stroke={stroke} strokeWidth="1" opacity="0.5" />
      </svg>
    );
  }

  return (
    <div className={`h-16 font-display text-5xl opacity-30 ${t.ink}`}>{kind.charAt(0)}</div>
  );
}

export function RelatedRecords({ items }: { items: PersonRelatedItem[] }) {
  if (!items.length) return null;

  const featured = items.slice(0, 2);
  const rest = items.slice(2);

  return (
    <section id="related" className="scroll-mt-28">
      <SectionHead
        title="Related"
        subtitle="Adjacent public records — follow the thread outward from this personality."
        meta={`${items.length} connected`}
      />

      <div className="mt-6 grid gap-px bg-paper-border lg:grid-cols-2">
        {featured.map((item) => {
          const t = themeFor(item.kind);
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`group relative block ${t.plane} p-6 sm:p-8 no-underline transition hover:brightness-[0.97]`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`text-xs font-medium uppercase tracking-[0.22em] ${t.ink}`}>
                  {item.kind}
                </span>
                <span
                  className={`h-2 w-2 rounded-full ${t.accent} opacity-70 transition group-hover:scale-125`}
                  aria-hidden
                />
              </div>

              <div className="mt-8">
                <Diagram kind={item.kind} />
              </div>

              <h3 className="mt-6 font-display text-3xl leading-[1.1] text-ink sm:text-4xl lg:text-5xl">
                {item.label}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted sm:text-base">
                {item.description}
              </p>

              {item.kind === "Budget" ? (
                <div className="mt-6 flex items-baseline gap-3 font-mono text-sm">
                  <span className={t.ink}>₦54.99tn</span>
                  <span className="text-ink-faint">FY2025 · demo envelope</span>
                </div>
              ) : null}
              {item.kind === "Election" ? (
                <div className="mt-6 flex items-baseline gap-3 font-mono text-sm">
                  <span className={t.ink}>Upcoming</span>
                  <span className="text-ink-faint">results attach when cycle opens</span>
                </div>
              ) : null}

              <span className={`mt-8 inline-block text-sm font-medium ${t.ink} underline-offset-4 group-hover:underline`}>
                Enter record
              </span>
            </Link>
          );
        })}
      </div>

      {rest.length > 0 ? (
        <ul className="mt-px divide-y divide-paper-border border border-paper-border bg-paper-card">
          {rest.map((item) => {
            const t = themeFor(item.kind);
            return (
              <li key={item.href + item.label}>
                <Link
                  href={item.href}
                  className="group grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 no-underline sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className={`flex min-h-[5.5rem] items-center justify-center ${t.plane} px-2`}>
                    <Diagram kind={item.kind} />
                  </div>
                  <div className="py-4 pr-4">
                    <span className={`text-[10px] uppercase tracking-[0.2em] ${t.ink}`}>{item.kind}</span>
                    <span className="mt-1 block font-display text-xl text-ink group-hover:text-civic-green sm:text-2xl">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-sm text-ink-muted">{item.description}</span>
                  </div>
                  <span className="hidden pr-5 font-mono text-xs text-ink-faint sm:block">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
