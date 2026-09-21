import { store } from "@nigeria-for-nigerians/domain";
import type { FollowableEntityType } from "./types";

/** Explicit high-visibility counts for flagship records. */
const FEATURED: Record<string, number> = {
  "person:person-tinubu": 12840,
  "person:person-adebayo": 2140,
  "project:proj-allen-spur": 3920,
  "project:proj-omole-drain": 1680,
  "project:proj-rural-power": 2210,
  "problem:prob-roads-ikeja": 2840,
  "problem:prob-flooding": 3100,
  "problem:prob-electricity": 2560,
  "problem:prob-healthcare": 1890,
  "organization:org-tracka": 4120,
  "organization:org-public-justice": 2760,
  "organization:org-legal-rights": 1980,
  "organization:org-survivors-justice": 1540,
  "matter:matter-checkpoint-ikeja": 980,
  "matter:matter-electoral-ikeja": 1240,
  "matter:matter-office-assault": 760,
};

function hashCount(key: string, min: number, max: number): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const span = max - min + 1;
  return min + (Math.abs(h) % span);
}

export function seedFollowBase(
  entityType: FollowableEntityType,
  entityId: string,
): number {
  const key = `${entityType}:${entityId}`;
  if (FEATURED[key] != null) return FEATURED[key];

  switch (entityType) {
    case "organization":
      return hashCount(key, 180, 1400);
    case "person":
      return hashCount(key, 90, 2200);
    case "problem":
      return hashCount(key, 220, 1800);
    case "project":
      return hashCount(key, 160, 1600);
    case "matter":
      return hashCount(key, 60, 900);
  }
}

/** Build seeded counts for every followable entity currently in the domain store. */
export function allSeedFollowTargets(): {
  entityType: FollowableEntityType;
  entityId: string;
  count: number;
}[] {
  const out: { entityType: FollowableEntityType; entityId: string; count: number }[] = [];

  for (const o of store.allOrganizations()) {
    out.push({
      entityType: "organization",
      entityId: o.id,
      count: seedFollowBase("organization", o.id),
    });
  }
  for (const p of store.allPeople()) {
    out.push({
      entityType: "person",
      entityId: p.id,
      count: seedFollowBase("person", p.id),
    });
  }
  for (const p of store.allProblems()) {
    out.push({
      entityType: "problem",
      entityId: p.id,
      count: seedFollowBase("problem", p.id),
    });
  }
  for (const p of store.allProjects()) {
    out.push({
      entityType: "project",
      entityId: p.id,
      count: seedFollowBase("project", p.id),
    });
  }
  for (const m of store.allProsecutionMatters()) {
    out.push({
      entityType: "matter",
      entityId: m.id,
      count: seedFollowBase("matter", m.id),
    });
  }

  return out;
}
