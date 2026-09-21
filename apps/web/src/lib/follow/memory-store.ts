/**
 * In-memory Follow store for local/demo when Postgres is unreachable.
 * Same shape as Drizzle rows; not durable across server restarts.
 */

export type MemoryFollow = {
  id: string;
  email: string;
  entityType: string;
  entityId: string;
  entitySlug: string;
  entityTitle: string;
  cadence: string;
  unsubscribeToken: string;
  sessionEmail: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MemoryFollowEvent = {
  id: string;
  entityType: string;
  entityId: string;
  kind: string;
  title: string;
  summary: string;
  href: string;
  createdAt: Date;
};

export type MemoryFollowDelivery = {
  id: string;
  followId: string;
  eventId: string | null;
  channel: string;
  sentAt: Date;
  providerId: string | null;
};

type Bucket = {
  follows: MemoryFollow[];
  events: MemoryFollowEvent[];
  deliveries: MemoryFollowDelivery[];
};

function bucket(): Bucket {
  const g = globalThis as unknown as { __followMemory?: Bucket };
  if (!g.__followMemory) {
    g.__followMemory = { follows: [], events: [], deliveries: [] };
  }
  return g.__followMemory;
}

export const memoryFollowStore = {
  listActiveByEmail(email: string): MemoryFollow[] {
    return bucket().follows.filter((f) => f.active && f.email === email.toLowerCase());
  },

  findActive(email: string, entityType: string, entityId: string): MemoryFollow | undefined {
    return bucket().follows.find(
      (f) =>
        f.active &&
        f.email === email.toLowerCase() &&
        f.entityType === entityType &&
        f.entityId === entityId,
    );
  },

  findInactive(email: string, entityType: string, entityId: string): MemoryFollow | undefined {
    return bucket().follows.find(
      (f) =>
        !f.active &&
        f.email === email.toLowerCase() &&
        f.entityType === entityType &&
        f.entityId === entityId,
    );
  },

  findByToken(token: string): MemoryFollow | undefined {
    return bucket().follows.find((f) => f.unsubscribeToken === token);
  },

  findById(id: string): MemoryFollow | undefined {
    return bucket().follows.find((f) => f.id === id);
  },

  upsert(follow: MemoryFollow): MemoryFollow {
    const b = bucket();
    const idx = b.follows.findIndex((f) => f.id === follow.id);
    if (idx >= 0) b.follows[idx] = follow;
    else b.follows.push(follow);
    return follow;
  },

  insertEvent(event: MemoryFollowEvent): MemoryFollowEvent {
    bucket().events.push(event);
    return event;
  },

  insertDelivery(d: MemoryFollowDelivery): void {
    bucket().deliveries.push(d);
  },

  listInstantSubscribers(entityType: string, entityId: string): MemoryFollow[] {
    return bucket().follows.filter(
      (f) =>
        f.active &&
        f.entityType === entityType &&
        f.entityId === entityId &&
        f.cadence === "instant",
    );
  },

  listWeekly(): MemoryFollow[] {
    return bucket().follows.filter((f) => f.active && f.cadence === "weekly");
  },

  eventsSince(entityType: string, entityId: string, since: Date): MemoryFollowEvent[] {
    return bucket().events.filter(
      (e) =>
        e.entityType === entityType &&
        e.entityId === entityId &&
        e.createdAt >= since,
    );
  },

  deliveredEventIds(followId: string, eventIds: string[]): Set<string> {
    const set = new Set<string>();
    for (const d of bucket().deliveries) {
      if (d.followId === followId && d.eventId && eventIds.includes(d.eventId)) {
        set.add(d.eventId);
      }
    }
    return set;
  },

  hasInstantDelivery(followId: string, eventId: string): boolean {
    return bucket().deliveries.some(
      (d) => d.followId === followId && d.eventId === eventId && d.channel === "instant",
    );
  },
};
