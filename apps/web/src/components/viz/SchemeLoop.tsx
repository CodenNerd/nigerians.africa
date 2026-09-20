import Link from "next/link";
import type { SchemeGlance } from "@nigeria-for-nigerians/domain";
import { VizFrame } from "./VizFrame";

type LoopNode = {
  id: string;
  label: string;
  caption: string;
  tone: string;
  accent: string;
  bar: string;
  mark: "eye" | "phone" | "upload" | "scale" | "check";
  annotation?: string;
  href?: string;
  hrefLabel?: string;
};

function NodeMark({ mark }: { mark: LoopNode["mark"] }) {
  const common = "h-10 w-10 text-current";
  if (mark === "eye") {
    return (
      <svg viewBox="0 0 40 40" className={common} aria-hidden>
        <circle cx="20" cy="20" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="20" cy="20" r="2.5" fill="currentColor" />
        <path
          d="M4 20c4-8 12-12 16-12s12 4 16 12c-4 8-12 12-16 12S8 28 4 20z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    );
  }
  if (mark === "phone") {
    return (
      <svg viewBox="0 0 40 40" className={common} aria-hidden>
        <rect
          x="12"
          y="4"
          width="16"
          height="32"
          rx="3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="20" cy="30" r="1.5" fill="currentColor" />
        <path d="M16 12h8M16 16h8M18 20h4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  if (mark === "upload") {
    return (
      <svg viewBox="0 0 40 40" className={common} aria-hidden>
        <path
          d="M20 28V10M20 10l-6 6M20 10l6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
        />
        <path d="M8 30h24" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (mark === "scale") {
    return (
      <svg viewBox="0 0 40 40" className={common} aria-hidden>
        <path d="M20 6v28M10 12h20" stroke="currentColor" strokeWidth="2" />
        <path
          d="M10 12l-4 10h8l-4-10zM30 12l-4 10h8l-4-10z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" className={common} aria-hidden>
      <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 20l5 5 11-12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

function Connector({ vertical }: { vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="flex justify-center py-1" aria-hidden>
        <svg width="24" height="36" viewBox="0 0 24 36" className="text-civic-green">
          <path
            d="M12 2v26M12 28l-5-5M12 28l5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="anim-fade"
          />
        </svg>
      </div>
    );
  }
  return (
    <div className="hidden items-center self-center lg:flex" aria-hidden>
      <svg width="40" height="24" viewBox="0 0 40 24" className="text-civic-green">
        <path
          d="M2 12h30M32 12l-5-5M32 12l-5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="anim-fade"
        />
      </svg>
    </div>
  );
}

export function SchemeLoop({
  glance,
  schemeSlug,
}: {
  glance: SchemeGlance;
  schemeSlug: string;
}) {
  const nodes: LoopNode[] = [
    {
      id: "witness",
      label: "Witness event",
      caption: "See lawlessness in public",
      tone: "bg-civic-amberSoft",
      accent: "text-civic-amber",
      bar: "bg-civic-amber",
      mark: "eye",
    },
    {
      id: "app",
      label: "Citizen app",
      caption: "Film & upload (app later)",
      tone: "bg-civic-blueSoft",
      accent: "text-civic-blue",
      bar: "bg-civic-blue",
      mark: "phone",
      href: `/report?scheme=${schemeSlug}`,
      hrefLabel: "Use report form →",
    },
    {
      id: "publish",
      label: "Publish to scheme",
      caption: "On the public record",
      tone: "bg-civic-greenSoft",
      accent: "text-civic-green",
      bar: "bg-civic-green",
      mark: "upload",
      annotation: `${glance.awaitingNgo} awaiting NGO`,
    },
    {
      id: "ngo",
      label: "Legal NGO accepts",
      caption: "Screen & pursue case",
      tone: "bg-civic-blueSoft",
      accent: "text-civic-blue",
      bar: "bg-civic-blue",
      mark: "scale",
      annotation: `${glance.inProgress + glance.closed} with NGO`,
    },
    {
      id: "outcome",
      label: "Accountability",
      caption: "Progress, not a verdict",
      tone: "bg-civic-greenSoft",
      accent: "text-civic-green",
      bar: "bg-civic-green",
      mark: "check",
      annotation: `${glance.closed} closed`,
    },
  ];

  return (
    <VizFrame eyebrow="How it works" title="From street to accountability" meta="Visual loop">
      <div className="border border-paper-border bg-paper">
        {/* Desktop: horizontal linked rail */}
        <ol className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch lg:gap-0">
          {nodes.map((node, i) => (
            <li key={node.id} className="contents">
              <div
                className={`anim-rise relative flex min-h-[14rem] flex-col p-5 ${node.tone}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <span className={`absolute left-0 top-0 h-full w-1 ${node.bar}`} />
                <span className={`font-mono text-[10px] ${node.accent}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={`mt-3 ${node.accent}`}>
                  <NodeMark mark={node.mark} />
                </div>
                <h3 className="mt-4 font-display text-xl leading-tight text-ink">{node.label}</h3>
                <p className="mt-1 text-sm text-ink-muted">{node.caption}</p>
                {node.annotation ? (
                  <p className="mt-auto pt-4 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                    {node.annotation}
                  </p>
                ) : null}
                {node.href ? (
                  <Link
                    href={node.href}
                    className="mt-3 inline-block font-mono text-[11px] uppercase tracking-wider text-civic-blue no-underline hover:underline"
                  >
                    {node.hrefLabel}
                  </Link>
                ) : (
                  <span className="mt-auto" />
                )}
              </div>
              {i < nodes.length - 1 ? <Connector /> : null}
            </li>
          ))}
        </ol>

        {/* Mobile / tablet: vertical linked stack */}
        <ol className="flex flex-col lg:hidden">
          {nodes.map((node, i) => (
            <li key={node.id}>
              <div
                className={`anim-rise relative flex gap-4 p-5 ${node.tone}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <span className={`absolute left-0 top-0 h-full w-1 ${node.bar}`} />
                <div className={`shrink-0 ${node.accent}`}>
                  <NodeMark mark={node.mark} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className={`font-mono text-[10px] ${node.accent}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1 font-display text-xl leading-tight text-ink">{node.label}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{node.caption}</p>
                  {node.annotation ? (
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                      {node.annotation}
                    </p>
                  ) : null}
                  {node.href ? (
                    <Link
                      href={node.href}
                      className="mt-2 inline-block font-mono text-[11px] uppercase tracking-wider text-civic-blue no-underline hover:underline"
                    >
                      {node.hrefLabel}
                    </Link>
                  ) : null}
                </div>
              </div>
              {i < nodes.length - 1 ? <Connector vertical /> : null}
            </li>
          ))}
        </ol>
      </div>
    </VizFrame>
  );
}
