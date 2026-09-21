import { and, eq, sql } from "drizzle-orm";
import { follows, getDb } from "@nigeria-for-nigerians/database";
import { memoryFollowStore, resolveFollowBackend } from "./backend";
import { seedFollowBase } from "./seed-counts";
import type { FollowableEntityType } from "./types";
import { resolveFollowable } from "./resolve";

let seededRows = false;

/**
 * Insert sample seeded follower rows so demos feel populated.
 * Display totals use seedFollowBase + non-seed live follows.
 */
export async function ensureSeedFollowRows(): Promise<void> {
  if (seededRows) return;
  seededRows = true;

  const backend = await resolveFollowBackend();
  const samples: { type: FollowableEntityType; id: string; n: number }[] = [
    { type: "organization", id: "org-tracka", n: 48 },
    { type: "organization", id: "org-public-justice", n: 36 },
    { type: "organization", id: "org-legal-rights", n: 28 },
    { type: "organization", id: "org-survivors-justice", n: 22 },
    { type: "organization", id: "org-healthwatch", n: 30 },
    { type: "organization", id: "org-election-obs", n: 26 },
    { type: "organization", id: "org-omole-cda", n: 18 },
    { type: "person", id: "person-tinubu", n: 64 },
    { type: "person", id: "person-adebayo", n: 40 },
    { type: "person", id: "person-okonkwo", n: 22 },
    { type: "person", id: "person-bello", n: 18 },
    { type: "problem", id: "prob-roads-ikeja", n: 42 },
    { type: "problem", id: "prob-flooding", n: 38 },
    { type: "problem", id: "prob-electricity", n: 34 },
    { type: "problem", id: "prob-healthcare", n: 26 },
    { type: "problem", id: "prob-water", n: 20 },
    { type: "problem", id: "prob-security", n: 24 },
    { type: "project", id: "proj-allen-spur", n: 52 },
    { type: "project", id: "proj-omole-drain", n: 28 },
    { type: "project", id: "proj-rural-power", n: 32 },
    { type: "project", id: "proj-phc-rivers", n: 24 },
    { type: "project", id: "proj-lagos-water", n: 22 },
    { type: "matter", id: "matter-checkpoint-ikeja", n: 24 },
    { type: "matter", id: "matter-electoral-ikeja", n: 20 },
    { type: "matter", id: "matter-office-assault", n: 18 },
    { type: "matter", id: "matter-market-violence", n: 16 },
    { type: "matter", id: "matter-traffic-kano", n: 14 },
  ];

  for (const sample of samples) {
    const resolved = resolveFollowable(sample.type, sample.id);
    if (!resolved) continue;

    for (let i = 0; i < sample.n; i++) {
      const email = `seed.${sample.type}.${sample.id}.${i}@followers.seed`;
      const id = `fol_seed_${sample.type}_${sample.id}_${i}`.replace(/[^a-zA-Z0-9_]/g, "_");

      if (backend === "memory") {
        if (memoryFollowStore.findActive(email, sample.type, sample.id)) continue;
        memoryFollowStore.upsert({
          id,
          email,
          entityType: sample.type,
          entityId: sample.id,
          entitySlug: resolved.entitySlug,
          entityTitle: resolved.entityTitle,
          cadence: i % 3 === 0 ? "weekly" : "instant",
          unsubscribeToken: `seedtok_${sample.type}_${sample.id}_${i}`,
          sessionEmail: null,
          active: true,
          createdAt: new Date(Date.now() - i * 86_400_000),
          updatedAt: new Date(),
        });
      } else {
        try {
          const db = getDb();
          const existing = await db
            .select({ id: follows.id })
            .from(follows)
            .where(
              and(
                eq(follows.email, email),
                eq(follows.entityType, sample.type),
                eq(follows.entityId, sample.id),
              ),
            )
            .limit(1);
          if (existing.length) continue;
          await db.insert(follows).values({
            id,
            email,
            entityType: sample.type,
            entityId: sample.id,
            entitySlug: resolved.entitySlug,
            entityTitle: resolved.entityTitle,
            cadence: i % 3 === 0 ? "weekly" : "instant",
            unsubscribeToken: `seedtok_${sample.type}_${sample.id}_${i}`,
            sessionEmail: null,
            active: true,
          });
        } catch {
          /* ignore conflicts / offline */
        }
      }
    }
  }
}

async function humanLiveCount(
  entityType: FollowableEntityType,
  entityId: string,
): Promise<number> {
  const backend = await resolveFollowBackend();
  if (backend === "memory") {
    return memoryFollowStore.countActiveForEntity(entityType, entityId, {
      excludeSeed: true,
    });
  }
  try {
    const db = getDb();
    const rows = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(follows)
      .where(
        and(
          eq(follows.active, true),
          eq(follows.entityType, entityType),
          eq(follows.entityId, entityId),
          sql`${follows.email} not like '%@followers.seed'`,
        ),
      );
    return Number(rows[0]?.n ?? 0);
  } catch {
    return memoryFollowStore.countActiveForEntity(entityType, entityId, {
      excludeSeed: true,
    });
  }
}

/** Display total = curated seed base + real (non-seed) live follows. */
export async function getFollowCount(
  entityType: FollowableEntityType,
  entityId: string,
): Promise<{ total: number; seed: number; live: number }> {
  await ensureSeedFollowRows();
  const seed = seedFollowBase(entityType, entityId);
  const live = await humanLiveCount(entityType, entityId);
  return { total: seed + live, seed, live };
}
