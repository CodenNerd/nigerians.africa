export const claimKindTheme: Record<
  string,
  { plane: string; ink: string; accent: string; label: string }
> = {
  official_record: {
    plane: "bg-civic-blueSoft",
    ink: "text-civic-blue",
    accent: "bg-civic-blue",
    label: "Official record",
  },
  public_statement: {
    plane: "bg-paper",
    ink: "text-civic-slate",
    accent: "bg-civic-slate",
    label: "Public statement",
  },
  promise: {
    plane: "bg-civic-greenSoft",
    ink: "text-civic-green",
    accent: "bg-civic-green",
    label: "Promise",
  },
  claim: {
    plane: "bg-civic-amberSoft",
    ink: "text-civic-amber",
    accent: "bg-civic-amber",
    label: "Claim",
  },
  allegation: {
    plane: "bg-civic-redSoft",
    ink: "text-civic-red",
    accent: "bg-civic-red",
    label: "Allegation",
  },
  rumour: {
    plane: "bg-paper",
    ink: "text-ink-faint",
    accent: "bg-ink-faint",
    label: "Rumour",
  },
};

export type PlaneTone = "green" | "blue" | "amber" | "red" | "slate" | "paper";

export const planeTone: Record<
  PlaneTone,
  { plane: string; ink: string; accent: string }
> = {
  green: { plane: "bg-civic-greenSoft", ink: "text-civic-green", accent: "bg-civic-green" },
  blue: { plane: "bg-civic-blueSoft", ink: "text-civic-blue", accent: "bg-civic-blue" },
  amber: { plane: "bg-civic-amberSoft", ink: "text-civic-amber", accent: "bg-civic-amber" },
  red: { plane: "bg-civic-redSoft", ink: "text-civic-red", accent: "bg-civic-red" },
  slate: { plane: "bg-paper", ink: "text-civic-slate", accent: "bg-civic-slate" },
  paper: { plane: "bg-paper-card", ink: "text-ink", accent: "bg-ink-faint" },
};

export function SectionHead({
  title,
  subtitle,
  meta,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-paper-border pb-5">
      <div className="max-w-2xl">
        <h2 className="font-display text-2xl leading-[1.15] tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{subtitle}</p>
        ) : null}
      </div>
      {meta ? (
        <p className="pb-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
          {meta}
        </p>
      ) : null}
    </div>
  );
}
