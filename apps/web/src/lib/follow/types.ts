/** Followable entity types for v1 — extend FOLLOWABLE_TYPES to add more later. */
export const FOLLOWABLE_TYPES = [
  "organization",
  "person",
  "problem",
  "project",
  "matter",
] as const;

export type FollowableEntityType = (typeof FOLLOWABLE_TYPES)[number];

export type FollowCadence = "instant" | "weekly";

export function isFollowableEntityType(value: string): value is FollowableEntityType {
  return (FOLLOWABLE_TYPES as readonly string[]).includes(value);
}

export function isFollowCadence(value: string): value is FollowCadence {
  return value === "instant" || value === "weekly";
}

export type ResolvedFollowable = {
  entityType: FollowableEntityType;
  entityId: string;
  entitySlug: string;
  entityTitle: string;
  href: string;
};

/** Curated event kinds per entity (material + related activity). */
export const FOLLOW_EVENT_KINDS = {
  organization: [
    "spend_line",
    "income_line",
    "project_allocation",
    "vetting_change",
    "matter_update",
  ],
  person: ["claim_update", "memory_added", "tenure_change", "related_evidence"],
  problem: ["status_change", "new_evidence", "linked_project", "linked_report"],
  project: ["status_change", "progress_update", "funding_change", "new_evidence"],
  matter: ["status_change", "progress_step", "new_evidence", "ngo_assignment"],
} as const satisfies Record<FollowableEntityType, readonly string[]>;

export type FollowEventKind =
  (typeof FOLLOW_EVENT_KINDS)[FollowableEntityType][number];

export function eventKindsFor(type: FollowableEntityType): readonly string[] {
  return FOLLOW_EVENT_KINDS[type];
}

export function isFollowEventKind(
  entityType: FollowableEntityType,
  kind: string,
): boolean {
  return (FOLLOW_EVENT_KINDS[entityType] as readonly string[]).includes(kind);
}

export function followableLabel(type: FollowableEntityType): string {
  switch (type) {
    case "organization":
      return "organization";
    case "person":
      return "person";
    case "problem":
      return "problem";
    case "project":
      return "project";
    case "matter":
      return "case";
  }
}

export function formatFollowCount(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString("en-NG");
}
