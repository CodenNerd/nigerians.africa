import type { SeedDatabase } from "../types";

const KEYS: (keyof SeedDatabase)[] = [
  "sources",
  "locations",
  "people",
  "institutions",
  "offices",
  "tenures",
  "problems",
  "projects",
  "budgets",
  "allocations",
  "contracts",
  "fundingSources",
  "donationCampaigns",
  "fundingInflows",
  "projectSpends",
  "organizations",
  "evidence",
  "claims",
  "reports",
  "responses",
  "memory",
  "relationships",
  "events",
  "politicalCandidates",
  "electionResults",
  "discrepancies",
  "guidance",
  "actions",
  "publicRecord",
];

export function emptySeed(): SeedDatabase {
  return {
    sources: [],
    locations: [],
    people: [],
    institutions: [],
    offices: [],
    tenures: [],
    problems: [],
    projects: [],
    budgets: [],
    allocations: [],
    contracts: [],
    fundingSources: [],
    donationCampaigns: [],
    fundingInflows: [],
    projectSpends: [],
    organizations: [],
    evidence: [],
    claims: [],
    reports: [],
    responses: [],
    memory: [],
    relationships: [],
    events: [],
    politicalCandidates: [],
    electionResults: [],
    discrepancies: [],
    guidance: [],
    actions: [],
    publicRecord: [],
  };
}

function idOf(item: unknown): string | undefined {
  if (item && typeof item === "object" && "id" in item) {
    const id = (item as { id: unknown }).id;
    return typeof id === "string" ? id : undefined;
  }
  return undefined;
}

/**
 * Merge seed fragments. Later fragments win on matching `id`.
 * Arrays without ids are appended as-is from later fragments only if unique by JSON.
 */
export function mergeSeed(...fragments: Array<Partial<SeedDatabase> | SeedDatabase>): SeedDatabase {
  const out = emptySeed();

  for (const frag of fragments) {
    for (const key of KEYS) {
      const incoming = frag[key];
      if (!incoming || !Array.isArray(incoming) || incoming.length === 0) continue;

      const existing = out[key] as unknown[];
      const byId = new Map<string, unknown>();
      const noId: unknown[] = [];

      for (const item of existing) {
        const id = idOf(item);
        if (id) byId.set(id, item);
        else noId.push(item);
      }

      for (const item of incoming) {
        const id = idOf(item);
        if (id) byId.set(id, item);
        else noId.push(item);
      }

      (out as unknown as Record<string, unknown[]>)[key] = [...byId.values(), ...noId];
    }
  }

  return out;
}

export function seedKeys(): (keyof SeedDatabase)[] {
  return [...KEYS];
}

export function countsOf(db: Partial<SeedDatabase>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const key of KEYS) {
    const arr = db[key];
    counts[key] = Array.isArray(arr) ? arr.length : 0;
  }
  return counts;
}
