import { and, eq, gte, inArray } from "drizzle-orm";
import {
  followDeliveries,
  followEvents,
  follows,
  getDb,
  isDatabaseConfigured,
  type Follow,
} from "@nigeria-for-nigerians/database";
import { sendFollowEmail } from "./email";
import { resolveFollowable } from "./resolve";
import { instantEventHtml } from "./templates";
import {
  isFollowEventKind,
  type FollowableEntityType,
} from "./types";

function newId(prefix: string): string {
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
  if (!isDatabaseConfigured()) {
    return { eventId: null, emailed: 0, error: "DATABASE_URL not configured" };
  }
  if (!isFollowEventKind(input.entityType, input.kind)) {
    return { eventId: null, emailed: 0, error: `Unknown event kind: ${input.kind}` };
  }

  const resolved = resolveFollowable(input.entityType, input.entityId);
  if (!resolved) {
    return { eventId: null, emailed: 0, error: "Entity not found" };
  }

  const db = getDb();
  const eventId = newId("fev");
  const href = input.href || resolved.href;

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
}

/** Sample simulate payloads for demos. */
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
  const db = getDb();
  return db
    .select()
    .from(follows)
    .where(and(eq(follows.email, email.toLowerCase()), eq(follows.active, true)));
}

export async function deactivateFollowByToken(token: string): Promise<Follow | null> {
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

export { newId };

/** Weekly digest runner — gather undelivered events for weekly follows. */
export async function runWeeklyDigest(): Promise<{
  sent: number;
  skipped: number;
  errors: string[];
}> {
  const db = getDb();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekly = await db
    .select()
    .from(follows)
    .where(and(eq(follows.active, true), eq(follows.cadence, "weekly")));

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

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

    const { weeklyDigestHtml } = await import("./templates");
    const html = weeklyDigestHtml({
      groups: [
        {
          entityTitle: follow.entityTitle,
          entityHref: resolveFollowable(follow.entityType as FollowableEntityType, follow.entityId)
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
