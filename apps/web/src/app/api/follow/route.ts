import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  followDeliveries,
  follows,
  getDb,
  isDatabaseConfigured,
} from "@nigeria-for-nigerians/database";
import {
  ackFollowHtml,
  getSessionEmail,
  isFollowCadence,
  isFollowableEntityType,
  isValidEmail,
  newId,
  resolveFollowable,
  sendFollowEmail,
} from "@/lib/follow";

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "DATABASE_URL is not set. Start Supabase local Postgres or set DATABASE_URL to enable Follow updates.",
      },
      { status: 503 },
    );
  }

  const body = (await req.json()) as {
    entityType?: string;
    entityId?: string;
    cadence?: string;
    email?: string;
  };

  if (!body.entityType || !isFollowableEntityType(body.entityType)) {
    return NextResponse.json({ error: "Invalid entityType" }, { status: 400 });
  }
  if (!body.entityId) {
    return NextResponse.json({ error: "entityId required" }, { status: 400 });
  }
  if (!body.cadence || !isFollowCadence(body.cadence)) {
    return NextResponse.json({ error: "cadence must be instant or weekly" }, { status: 400 });
  }

  const sessionEmail = await getSessionEmail();
  const emailRaw = (sessionEmail || body.email || "").trim().toLowerCase();
  if (!isValidEmail(emailRaw)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const resolved = resolveFollowable(body.entityType, body.entityId);
  if (!resolved) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const db = getDb();
  const existing = await db
    .select()
    .from(follows)
    .where(
      and(
        eq(follows.email, emailRaw),
        eq(follows.entityType, body.entityType),
        eq(follows.entityId, body.entityId),
        eq(follows.active, true),
      ),
    )
    .limit(1);

  if (existing[0]) {
    if (existing[0].cadence !== body.cadence) {
      await db
        .update(follows)
        .set({ cadence: body.cadence, updatedAt: new Date() })
        .where(eq(follows.id, existing[0].id));
    }
    return NextResponse.json({
      ok: true,
      alreadyFollowing: true,
      follow: { ...existing[0], cadence: body.cadence },
    });
  }

  // Reactivate inactive row for same email+entity if present
  const inactive = await db
    .select()
    .from(follows)
    .where(
      and(
        eq(follows.email, emailRaw),
        eq(follows.entityType, body.entityType),
        eq(follows.entityId, body.entityId),
        eq(follows.active, false),
      ),
    )
    .limit(1);

  let followId: string;
  let unsubToken: string;

  if (inactive[0]) {
    followId = inactive[0].id;
    unsubToken = inactive[0].unsubscribeToken;
    await db
      .update(follows)
      .set({
        active: true,
        cadence: body.cadence,
        entitySlug: resolved.entitySlug,
        entityTitle: resolved.entityTitle,
        sessionEmail: sessionEmail,
        updatedAt: new Date(),
      })
      .where(eq(follows.id, followId));
  } else {
    followId = newId("fol");
    unsubToken = crypto.randomUUID().replace(/-/g, "");
    await db.insert(follows).values({
      id: followId,
      email: emailRaw,
      entityType: body.entityType,
      entityId: body.entityId,
      entitySlug: resolved.entitySlug,
      entityTitle: resolved.entityTitle,
      cadence: body.cadence,
      unsubscribeToken: unsubToken,
      sessionEmail: sessionEmail,
      active: true,
    });
  }

  const ack = await sendFollowEmail({
    to: emailRaw,
    subject: `You're following ${resolved.entityTitle}`,
    html: ackFollowHtml({
      entityTitle: resolved.entityTitle,
      entityHref: resolved.href,
      cadence: body.cadence,
      unsubToken,
    }),
  });

  await db.insert(followDeliveries).values({
    id: newId("fdl"),
    followId,
    eventId: null,
    channel: "ack",
    providerId: ack.id,
  });

  return NextResponse.json({
    ok: true,
    follow: {
      id: followId,
      email: emailRaw,
      entityType: body.entityType,
      entityId: body.entityId,
      entitySlug: resolved.entitySlug,
      entityTitle: resolved.entityTitle,
      cadence: body.cadence,
      href: resolved.href,
    },
  });
}

export async function DELETE(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL is not set" }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    token?: string;
    entityType?: string;
    entityId?: string;
  };

  const sessionEmail = await getSessionEmail();
  const db = getDb();

  if (body.token) {
    const { deactivateFollowByToken } = await import("@/lib/follow");
    const row = await deactivateFollowByToken(body.token);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  if (body.id) {
    const { deactivateFollowById } = await import("@/lib/follow");
    const ok = await deactivateFollowById(body.id, sessionEmail ?? undefined);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  if (body.entityType && body.entityId && sessionEmail) {
    const updated = await db
      .update(follows)
      .set({ active: false, updatedAt: new Date() })
      .where(
        and(
          eq(follows.email, sessionEmail),
          eq(follows.entityType, body.entityType),
          eq(follows.entityId, body.entityId),
          eq(follows.active, true),
        ),
      )
      .returning({ id: follows.id });
    if (!updated.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "id, token, or entity + session required" }, { status: 400 });
}
