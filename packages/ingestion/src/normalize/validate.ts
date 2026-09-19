import type { SeedDatabase } from "@nigeria-for-nigerians/domain";

export type ValidationIssue = {
  level: "error" | "warning";
  path: string;
  message: string;
};

/**
 * Fail promote when tenures/claims/evidence/allocations lack required source links.
 */
export function requiredSourceViolations(partial: Partial<SeedDatabase>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const t of partial.tenures ?? []) {
    if (!t.sourceId) {
      issues.push({
        level: "error",
        path: `tenures.${t.id}`,
        message: "Tenure missing sourceId",
      });
    }
  }

  for (const c of partial.claims ?? []) {
    if (!c.evidenceIds?.length) {
      issues.push({
        level: "error",
        path: `claims.${c.id}`,
        message: "Claim missing evidenceIds",
      });
    }
  }

  for (const e of partial.evidence ?? []) {
    if (!e.sourceId) {
      issues.push({
        level: "error",
        path: `evidence.${e.id}`,
        message: "Evidence missing sourceId",
      });
    }
  }

  for (const a of partial.allocations ?? []) {
    if (!a.sourceId) {
      issues.push({
        level: "error",
        path: `allocations.${a.id}`,
        message: "Allocation missing sourceId",
      });
    }
  }

  const sourceIds = new Set((partial.sources ?? []).map((s) => s.id));
  // Also allow cross-layer sources by not failing on missing source row if sourceId set —
  // promote merges layers. Warn only when sourceId present but sources array empty in same file.
  for (const t of partial.tenures ?? []) {
    if (t.sourceId && (partial.sources?.length ?? 0) > 0 && !sourceIds.has(t.sourceId)) {
      issues.push({
        level: "warning",
        path: `tenures.${t.id}`,
        message: `sourceId ${t.sourceId} not in this partial's sources[] (may exist in another layer)`,
      });
    }
  }

  return issues;
}

export function validatePartialSeed(partial: Partial<SeedDatabase>): ValidationIssue[] {
  const issues = requiredSourceViolations(partial);

  for (const p of partial.people ?? []) {
    if (p.photoUrl && !p.imageCredit) {
      issues.push({
        level: "warning",
        path: `people.${p.id}`,
        message: "Person has photoUrl without imageCredit",
      });
    }
  }

  for (const b of partial.budgets ?? []) {
    if (!b.documentSourceId) {
      issues.push({
        level: "warning",
        path: `budgets.${b.id}`,
        message: "Budget missing documentSourceId",
      });
    }
  }

  return issues;
}
