import { store } from "@nigeria-for-nigerians/domain";
import { emitFollowEvent } from "@/lib/follow";
import type { FollowableEntityType } from "@/lib/follow/types";
import { isFollowableEntityType } from "@/lib/follow/types";

/** Best-effort emit after admin/demo mutations — never throws to callers. */
export async function safeEmitFollowEvent(
  input: Parameters<typeof emitFollowEvent>[0],
): Promise<void> {
  try {
    await emitFollowEvent(input);
  } catch (err) {
    console.warn("[follow] emit failed", err);
  }
}

export async function emitAfterClaimReview(claimId: string, status: string): Promise<void> {
  const claim = store.raw.claims.find((c) => c.id === claimId);
  if (!claim?.personId) return;
  await safeEmitFollowEvent({
    entityType: "person",
    entityId: claim.personId,
    kind: "claim_update",
    title: "Claim status updated",
    summary: `A claim linked to this person is now “${status.replace(/_/g, " ")}”.`,
  });
}

export async function emitAfterEvidenceReview(
  evidenceId: string,
  status: string,
): Promise<void> {
  const evidence = store.evidenceById(evidenceId);
  if (!evidence) return;

  const relatedType = evidence.relatedEntityType as string;
  if (!isFollowableEntityType(relatedType)) return;

  const kindMap: Partial<Record<FollowableEntityType, string>> = {
    person: "related_evidence",
    problem: "new_evidence",
    project: "new_evidence",
    matter: "new_evidence",
  };
  const eventKind = kindMap[relatedType];
  if (!eventKind) return;

  await safeEmitFollowEvent({
    entityType: relatedType,
    entityId: evidence.relatedEntityId,
    kind: eventKind,
    title: "Evidence verification updated",
    summary: `Linked evidence “${evidence.title}” is now ${status.replace(/_/g, " ")}.`,
  });
}

export async function emitAfterReportStatus(report: {
  id: string;
  title: string;
  status: string;
  personId?: string;
  problemId?: string;
}): Promise<void> {
  if (report.problemId) {
    await safeEmitFollowEvent({
      entityType: "problem",
      entityId: report.problemId,
      kind: "linked_report",
      title: "Linked report updated",
      summary: `Report “${report.title}” is now ${report.status.replace(/_/g, " ")}.`,
    });
  }
  if (report.personId) {
    await safeEmitFollowEvent({
      entityType: "person",
      entityId: report.personId,
      kind: "related_evidence",
      title: "Related report updated",
      summary: `A report linked to this person is now ${report.status.replace(/_/g, " ")}.`,
    });
  }
}
