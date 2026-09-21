import { and, eq, gte, inArray } from "drizzle-orm";
import {
  followDeliveries,
  followEvents,
  follows,
  getDb,
  getDatabaseUrl,
  isDatabaseConfigured,
  type Follow,
} from "@nigeria-for-nigerians/database";
import { memoryFollowStore, type MemoryFollow } from "./memory-store";

export type FollowBackend = "postgres" | "memory";

let preferred: FollowBackend | null = null;
let probed = false;

export function preferredReset(backend: FollowBackend) {
  preferred = backend;
  probed = true;
}

function toFollow(row: MemoryFollow): Follow {
  return {
    id: row.id,
    email: row.email,
    entityType: row.entityType,
    entityId: row.entityId,
    entitySlug: row.entitySlug,
    entityTitle: row.entityTitle,
    cadence: row.cadence,
    unsubscribeToken: row.unsubscribeToken,
    sessionEmail: row.sessionEmail,
    active: row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Probe Postgres once; fall back to memory when URL missing or unreachable. */
export async function resolveFollowBackend(): Promise<FollowBackend> {
  if (preferred) return preferred;
  if (!isDatabaseConfigured()) {
    preferred = "memory";
    return preferred;
  }
  if (probed && preferred) return preferred;
  probed = true;
  try {
    const db = getDb();
    await db.select({ id: follows.id }).from(follows).limit(1);
    preferred = "postgres";
  } catch (err) {
    console.warn(
      "[follow] Postgres unavailable — using in-memory store (follows won't persist across restarts).",
      err instanceof Error ? err.message : err,
    );
    preferred = "memory";
  }
  return preferred!;
}

export function followBackendLabel(): FollowBackend {
  return preferred ?? (getDatabaseUrl() ? "postgres" : "memory");
}

export async function withFollowBackend<T>(
  fn: (backend: FollowBackend) => Promise<T>,
): Promise<T> {
  const backend = await resolveFollowBackend();
  try {
    return await fn(backend);
  } catch (err) {
    if (backend === "postgres") {
      console.warn("[follow] Postgres error, switching to memory", err);
      preferred = "memory";
      return fn("memory");
    }
    throw err;
  }
}

export { memoryFollowStore, toFollow, and, eq, gte, inArray, follows, followEvents, followDeliveries, getDb };
