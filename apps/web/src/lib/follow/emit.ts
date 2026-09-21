import { and, eq, gte, inArray } from "drizzle-orm";
import {
  followDeliveries,
  followEvents,
  follows,
  getDb,
  type Follow,
} from "@nigeria-for-nigerians/database";
import { sendFollowEmail } from "./email";
import { resolveFollowable } from "./resolve";
import { instantEventHtml, weeklyDigestHtml } from "./templates";
import {
  isFollowEventKind,
  type FollowableEntityType,
} from "./types";
import { memoryFollowStore, resolveFollowBackend, toFollow } from "./backend";

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

export type EmitFollowEventInput = {
  entityType: FollowableEntityType;
  entityId: string;
  kind: string;
  title: string;
  summary: string;
  href?: string;
};

export async function emitFollowEvent(
  input: EmitFollowEventInput,
): Promise<{ eventId: string | null; emailed: number; error?: string }> {
  if (!isFollowEventKind(input.entityType, input.kind)) {
    return { eventId: null, emailed: 0, error: `Unknown event kind: ${input.kind}` };
  }

  const resolved = resolveFollowable(input.entityType, input.entityId);
  if (!resolved) {
    return { eventId: null, emailed: 0, error: "Entity not found" };
  }

  const href = input.href || resolved.href;
  const eventId = newId("fev");
  const backend = await resolveFollowBackend();

  if (backend === "memory") {
    memoryFollowStore.insertEvent({
      id: eventId,
      entityType: input.entityType,
      entityId: input.entityId,
      kind: input.kind,
      title: input.title,
      summary: input.summary,
      href,
      createdAt: new Date(),
    });

    let emailed = 0;
    for (const follow of memoryFollowStore.listInstantSubscribers(
      input.entityType,
      input.entityId,
    )) {
      if (memoryFollowStore.hasInstantDelivery(follow.id, eventId)) continue;
      const sent = await sendFollowEmail({
        to: follow.email,
        subject: `${input.title} · ${resolved.entityTitle}`,
        html: instantEventHtml({
          entityTitle: resolved.entityTitle,
          entityHref: href,
          eventTitle: input.title,
          eventSummary: input.summary,
          unsubToken: follow.unsubscribeToken,
        }),
      });
      memoryFollowStore.insertDelivery({
        id: newId("fdl"),
        followId: follow.id,
        eventId,
        channel: "instant",
        sentAt: new Date(),
        providerId: sent.id,
      });
      if (!sent.error) emailed += 1;
    }
    return { eventId, emailed };
  }

  try {
    const db = getDb();
    await db.insert(followEvents).values({
      id: eventId,
      entityType: input.entityType,
      entityId: input.entityId,
      kind: input.kind,
      title: input.title,
      summary: input.summary,
      href,
    });

    const subscribers = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.active, true),
          eq(follows.entityType, input.entityType),
          eq(follows.entityId, input.entityId),
          eq(follows.cadence, "instant"),
        ),
      );

    let emailed = 0;
    for (const follow of subscribers) {
      const already = await db
        .select({ id: followDeliveries.id })
        .from(followDeliveries)
        .where(
          and(
            eq(followDeliveries.followId, follow.id),
            eq(followDeliveries.eventId, eventId),
            eq(followDeliveries.channel, "instant"),
          ),
        )
        .limit(1);
      if (already.length) continue;

      const sent = await sendFollowEmail({
        to: follow.email,
        subject: `${input.title} · ${resolved.entityTitle}`,
        html: instantEventHtml({
          entityTitle: resolved.entityTitle,
          entityHref: href,
          eventTitle: input.title,
          eventSummary: input.summary,
          unsubToken: follow.unsubscribeToken,
        }),
      });

      await db.insert(followDeliveries).values({
        id: newId("fdl"),
        followId: follow.id,
        eventId,
        channel: "instant",
        providerId: sent.id,
      });
      if (!sent.error) emailed += 1;
    }

    return { eventId, emailed };
  } catch (err) {
    console.warn("[follow] emit postgres failed, using memory", err);
    // Force memory path for this and future calls in this process
    const { memoryFollowStore: mem } = await import("./memory-store");
    const { preferredReset } = await import("./backend");
    preferredReset("memory");

    mem.insertEvent({
      id: eventId,
      entityType: input.entityType,
      entityId: input.entityId,
      kind: input.kind,
      title: input.title,
      summary: input.summary,
      href,
      createdAt: new Date(),
    });

    let emailed = 0;
    for (const follow of mem.listInstantSubscribers(input.entityType, input.entityId)) {
      if (mem.hasInstantDelivery(follow.id, eventId)) continue;
      const sent = await sendFollowEmail({
        to: follow.email,
        subject: `${input.title} · ${resolved.entityTitle}`,
        html: instantEventHtml({
          entityTitle: resolved.entityTitle,
          entityHref: href,
          eventTitle: input.title,
          eventSummary: input.summary,
          unsubToken: follow.unsubscribeToken,
        }),
      });
      mem.insertDelivery({
        id: newId("fdl"),
        followId: follow.id,
        eventId,
        channel: "instant",
        sentAt: new Date(),
        providerId: sent.id,
      });
      if (!sent.error) emailed += 1;
    }
    return { eventId, emailed };
  }
}

export function inventSimulateEvent(
  entityType: FollowableEntityType,
  entityId: string,
): EmitFollowEventInput | null {
  const resolved = resolveFollowable(entityType, entityId);
  if (!resolved) return null;

  const samples: Record<FollowableEntityType, EmitFollowEventInput> = {
    organization: {
      entityType,
      entityId,
      kind: "spend_line",
      title: "New spend line published",
      summary: `${resolved.entityTitle} published a new spending line on the public record.`,
    },
    person: {
      entityType,
      entityId,
      kind: "claim_update",
      title: "Claim status updated",
      summary: `A claim linked to ${resolved.entityTitle} was reviewed on the public record.`,
    },
    problem: {
      entityType,
      entityId,
      kind: "status_change",
      title: "Problem status updated",
      summary: `${resolved.entityTitle} has a status change on the registry.`,
    },
    project: {
      entityType,
      entityId,
      kind: "progress_update",
      title: "Project progress update",
      summary: `${resolved.entityTitle} recorded new progress on the public record.`,
    },
    matter: {
      entityType,
      entityId,
      kind: "status_change",
      title: "Case status updated",
      summary: `${resolved.entityTitle} moved forward in the Make Nigeria Better pipeline.`,
    },
  };

  return samples[entityType];
}

export async function listActiveFollowsForEmail(email: string): Promise<Follow[]> {
  const backend = await resolveFollowBackend();
  if (backend === "memory") {
    return memoryFollowStore.listActiveByEmail(email).map(toFollow);
  }
  const db = getDb();
  return db
    .select()
    .from(follows)
    .where(and(eq(follows.email, email.toLowerCase()), eq(follows.active, true)));
}

export async function deactivateFollowByToken(token: string): Promise<Follow | null> {
  const backend = await resolveFollowBackend();
  if (backend === "memory") {
    const row = memoryFollowStore.findByToken(token);
    if (!row) return null;
    if (!row.active) return toFollow(row);
    const updated = { ...row, active: false, updatedAt: new Date() };
    memoryFollowStore.upsert(updated);
    return toFollow(updated);
  }
  const db = getDb();
  const rows = await db
    .select()
    .from(follows)
    .where(eq(follows.unsubscribeToken, token))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (!row.active) return row;
  await db
    .update(follows)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(follows.id, row.id));
  return { ...row, active: false };
}

export async function deactivateFollowById(id: string, email?: string): Promise<boolean> {
  const backend = await resolveFollowBackend();
  if (backend === "memory") {
    const row = memoryFollowStore.findById(id);
    if (!row || !row.active) return false;
    if (email && row.email !== email.toLowerCase()) return false;
    memoryFollowStore.upsert({ ...row, active: false, updatedAt: new Date() });
    return true;
  }
  const db = getDb();
  const conditions = [eq(follows.id, id), eq(follows.active, true)];
  if (email) conditions.push(eq(follows.email, email.toLowerCase()));
  const updated = await db
    .update(follows)
    .set({ active: false, updatedAt: new Date() })
    .where(and(...conditions))
    .returning({ id: follows.id });
  return updated.length > 0;
}

export async function updateFollowCadence(
  id: string,
  cadence: "instant" | "weekly",
  email?: string,
): Promise<boolean> {
  const backend = await resolveFollowBackend();
  if (backend === "memory") {
    const row = memoryFollowStore.findById(id);
    if (!row || !row.active) return false;
    if (email && row.email !== email.toLowerCase()) return false;
    memoryFollowStore.upsert({ ...row, cadence, updatedAt: new Date() });
    return true;
  }
  const db = getDb();
  const conditions = [eq(follows.id, id), eq(follows.active, true)];
  if (email) conditions.push(eq(follows.email, email.toLowerCase()));
  const updated = await db
    .update(follows)
    .set({ cadence, updatedAt: new Date() })
    .where(and(...conditions))
    .returning({ id: follows.id });
  return updated.length > 0;
}

export async function runWeeklyDigest(): Promise<{
  sent: number;
  skipped: number;
  errors: string[];
}> {
  const backend = await resolveFollowBackend();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  if (backend === "memory") {
    for (const follow of memoryFollowStore.listWeekly()) {
      const events = memoryFollowStore.eventsSince(follow.entityType, follow.entityId, since);
      if (!events.length) {
        skipped += 1;
        continue;
      }
      const delivered = memoryFollowStore.deliveredEventIds(
        follow.id,
        events.map((e) => e.id),
      );
      const undelivered = events.filter((e) => !delivered.has(e.id));
      if (!undelivered.length) {
        skipped += 1;
        continue;
      }
      const html = weeklyDigestHtml({
        groups: [
          {
            entityTitle: follow.entityTitle,
            entityHref:
              resolveFollowable(follow.entityType as FollowableEntityType, follow.entityId)
                ?.href ?? `/${follow.entityType}`,
            events: undelivered.map((e) => ({ title: e.title, summary: e.summary })),
          },
        ],
        unsubToken: follow.unsubscribeToken,
      });
      const result = await sendFollowEmail({
        to: follow.email,
        subject: `Weekly digest · ${follow.entityTitle}`,
        html,
      });
      if (result.error) {
        errors.push(`${follow.email}: ${result.error}`);
        continue;
      }
      for (const e of undelivered) {
        memoryFollowStore.insertDelivery({
          id: newId("fdl"),
          followId: follow.id,
          eventId: e.id,
          channel: "digest",
          sentAt: new Date(),
          providerId: result.id,
        });
      }
      sent += 1;
    }
    return { sent, skipped, errors };
  }

  const db = getDb();
  const weekly = await db
    .select()
    .from(follows)
    .where(and(eq(follows.active, true), eq(follows.cadence, "weekly")));

  for (const follow of weekly) {
    const events = await db
      .select()
      .from(followEvents)
      .where(
        and(
          eq(followEvents.entityType, follow.entityType),
          eq(followEvents.entityId, follow.entityId),
          gte(followEvents.createdAt, since),
        ),
      );

    if (!events.length) {
      skipped += 1;
      continue;
    }

    const eventIds = events.map((e) => e.id);
    const prior = await db
      .select({ eventId: followDeliveries.eventId })
      .from(followDeliveries)
      .where(
        and(
          eq(followDeliveries.followId, follow.id),
          inArray(followDeliveries.eventId, eventIds),
        ),
      );
    const delivered = new Set(prior.map((p) => p.eventId).filter(Boolean));
    const undelivered = events.filter((e) => !delivered.has(e.id));
    if (!undelivered.length) {
      skipped += 1;
      continue;
    }

    const html = weeklyDigestHtml({
      groups: [
        {
          entityTitle: follow.entityTitle,
          entityHref:
            resolveFollowable(follow.entityType as FollowableEntityType, follow.entityId)?.href ??
            `/${follow.entityType}`,
          events: undelivered.map((e) => ({ title: e.title, summary: e.summary })),
        },
      ],
      unsubToken: follow.unsubscribeToken,
    });

    const result = await sendFollowEmail({
      to: follow.email,
      subject: `Weekly digest · ${follow.entityTitle}`,
      html,
    });

    if (result.error) {
      errors.push(`${follow.email}: ${result.error}`);
      continue;
    }

    for (const e of undelivered) {
      await db.insert(followDeliveries).values({
        id: newId("fdl"),
        followId: follow.id,
        eventId: e.id,
        channel: "digest",
        providerId: result.id,
      });
    }
    sent += 1;
  }

  return { sent, skipped, errors };
}
