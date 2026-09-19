import type { Claim, ClaimKind, VerificationStatus } from "@nigeria-for-nigerians/domain";
import { SectionHead, claimKindTheme } from "./visual";

const kindOrder: ClaimKind[] = [
  "official_record",
  "public_statement",
  "promise",
  "claim",
  "allegation",
  "rumour",
];

const barColors: Record<ClaimKind, string> = {
  official_record: "bg-civic-blue",
  public_statement: "bg-civic-slate",
  promise: "bg-civic-green",
  claim: "bg-civic-amber",
  allegation: "bg-civic-red",
  rumour: "bg-ink-faint",
};

function statusBucket(status: VerificationStatus): "solid" | "open" | "weak" {
  if (status === "official_record" || status === "verified" || status === "corrected") return "solid";
  if (status === "disputed" || status === "under_review" || status === "reported") return "open";
  return "weak";
}

export function RecordGlance({ claims }: { claims: Claim[] }) {
  const byKind = kindOrder
    .map((kind) => ({
      kind,
      count: claims.filter((c) => c.kind === kind).length,
    }))
    .filter((x) => x.count > 0);

  const total = claims.length || 1;
  const solid = claims.filter((c) => statusBucket(c.status) === "solid").length;
  const open = claims.filter((c) => statusBucket(c.status) === "open").length;
  const weak = claims.filter((c) => statusBucket(c.status) === "weak").length;

  const buckets = [
    {
      label: "Established",
      value: solid,
      hint: "Official / verified",
      plane: "bg-civic-blueSoft",
      ink: "text-civic-blue",
    },
    {
      label: "Contested",
      value: open,
      hint: "Reported / under review",
      plane: "bg-civic-amberSoft",
      ink: "text-civic-amber",
    },
    {
      label: "Thin evidence",
      value: weak,
      hint: "Rumour / insufficient",
      plane: "bg-civic-redSoft",
      ink: "text-civic-red",
    },
  ];

  return (
    <section id="overview" className="scroll-mt-28">
      <SectionHead
        title="Record at a glance"
        subtitle="Composition of this dossier. Colour encodes information kind — not guilt or popularity."
        meta={`${claims.length} entries`}
      />

      <div className="mt-6 flex h-14 w-full overflow-hidden sm:h-16">
        {byKind.map((seg) => (
          <div
            key={seg.kind}
            className={`${barColors[seg.kind]} relative flex items-end justify-center pb-2`}
            style={{ width: `${(seg.count / total) * 100}%`, minWidth: seg.count ? "2.5rem" : 0 }}
            title={`${claimKindTheme[seg.kind]?.label}: ${seg.count}`}
          >
            <span className="font-mono text-xs font-medium text-white/95">{seg.count}</span>
          </div>
        ))}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {byKind.map((seg) => (
          <li key={seg.kind} className="flex items-center gap-2 text-sm">
            <span className={`inline-block h-3 w-3 ${barColors[seg.kind]}`} />
            <span className="text-ink-muted">{claimKindTheme[seg.kind]?.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-px bg-paper-border sm:grid-cols-3">
        {buckets.map((b) => (
          <div key={b.label} className={`${b.plane} p-6`}>
            <div className={`font-display text-5xl leading-none ${b.ink}`}>{b.value}</div>
            <div className="mt-3 text-sm font-medium uppercase tracking-[0.15em] text-ink">
              {b.label}
            </div>
            <div className="mt-1 font-mono text-xs text-ink-faint">{b.hint}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
