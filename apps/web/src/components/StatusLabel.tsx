import clsx from "clsx";
import type { VerificationStatus } from "@nigeria-for-nigerians/domain";

const styles: Record<VerificationStatus, string> = {
  verified: "bg-civic-greenSoft text-civic-green border-civic-green/30",
  official_record: "bg-civic-blueSoft text-civic-blue border-civic-blue/30",
  reported: "bg-civic-amberSoft text-civic-amber border-civic-amber/30",
  unverified: "bg-paper text-ink-faint border-paper-border",
  disputed: "bg-civic-redSoft text-civic-red border-civic-red/30",
  corrected: "bg-civic-greenSoft text-civic-green border-civic-green/30",
  ai_generated: "bg-paper text-civic-slate border-paper-border",
  insufficient_evidence: "bg-paper text-ink-faint border-paper-border",
  under_review: "bg-civic-amberSoft text-civic-amber border-civic-amber/30",
  withdrawn: "bg-paper text-ink-faint border-paper-border line-through",
};

const labels: Record<VerificationStatus, string> = {
  verified: "Verified",
  official_record: "Official Record",
  reported: "Reported",
  unverified: "Unverified",
  disputed: "Disputed",
  corrected: "Corrected",
  ai_generated: "AI Generated",
  insufficient_evidence: "Insufficient Evidence",
  under_review: "Under Review",
  withdrawn: "Withdrawn",
};

export function StatusLabel({
  status,
  className,
}: {
  status: VerificationStatus;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center border px-2 py-0.5 text-xs font-medium tracking-wide uppercase",
        styles[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  );
}
