import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  followDeliveries,
  follows,
  getDb,
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
import { memoryFollowStore, resolveFollowBackend, withFollowBackend } from "@/lib/follow/backend";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      entityType?: string;
      entityId?: string;
      cadence?: string;
      email?: string;
    };

    if (!body.entityType || !isFollowableEntityType(body.entityType)) {
      return jsonError("Invalid entityType", 400);
    }
    if (!body.entityId) {
      return jsonError("entityId required", 400);
    }
    if (!body.cadence || !isFollowCadence(body.cadence)) {
      return jsonError("cadence must be instant or weekly", 400);
    }

    const sessionEmail = await getSessionEmail();
    const emailRaw = (sessionEmail || body.email || "").trim().toLowerCase();
    if (!isValidEmail(emailRaw)) {
      return jsonError("Valid email required", 400);
    }

    const resolved = resolveFollowable(body.entityType, body.entityId);
    if (!resolved) {
      return jsonError("Entity not found", 404);
    }

    return await withFollowBackend(async (backend) => {
      if (backend === "memory") {
        const existing = memoryFollowStore.findActive(emailRaw, body.entityType!, body.entityId!);
        if (existing) {
          if (existing.cadence !== body.cadence) {
            existing.cadence = body.cadence!;
            existing.updatedAt = new Date();
            memoryFollowStore.upsert(existing);
          }
          return NextResponse.json({
            ok: true,
            alreadyFollowing: true,
            backend: "memory",
            follow: {
              id: existing.id,
              email: existing.email,
              entityType: existing.entityType,
              entityId: existing.entityId,
              entitySlug: existing.entitySlug,
              entityTitle: existing.entityTitle,
              cadence: body.cadence,
              href: resolved.href,
            },
          });
        }

        const inactive = memoryFollowStore.findInactive(emailRaw, body.entityType!, body.entityId!);
        let followId: string;
        let unsubToken: string;
        if (inactive) {
          followId = inactive.id;
          unsubToken = inactive.unsubscribeToken;
          memoryFollowStore.upsert({
            ...inactive,
            active: true,
            cadence: body.cadence!,
            entitySlug: resolved.entitySlug,
            entityTitle: resolved.entityTitle,
            sessionEmail,
            updatedAt: new Date(),
          });
        } else {
          followId = newId("fol");
          unsubToken = crypto.randomUUID().replace(/-/g, "");
          memoryFollowStore.upsert({
            id: followId,
            email: emailRaw,
            entityType: body.entityType!,
            entityId: body.entityId!,
            entitySlug: resolved.entitySlug,
            entityTitle: resolved.entityTitle,
            cadence: body.cadence!,
            unsubscribeToken: unsubToken,
            sessionEmail,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        const ack = await sendFollowEmail({
          to: emailRaw,
          subject: `You're following ${resolved.entityTitle}`,
          html: ackFollowHtml({
            entityTitle: resolved.entityTitle,
            entityHref: resolved.href,
            cadence: body.cadence!,
            unsubToken,
          }),
        });
        memoryFollowStore.insertDelivery({
          id: newId("fdl"),
          followId,
          eventId: null,
          channel: "ack",
          sentAt: new Date(),
          providerId: ack.id,
        });

        return NextResponse.json({
          ok: true,
          backend: "memory",
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

      const db = getDb();
      const existing = await db
        .select()
        .from(follows)
        .where(
          and(
            eq(follows.email, emailRaw),
            eq(follows.entityType, body.entityType!),
            eq(follows.entityId, body.entityId!),
            eq(follows.active, true),
          ),
        )
        .limit(1);

      if (existing[0]) {
        if (existing[0].cadence !== body.cadence) {
          await db
            .update(follows)
            .set({ cadence: body.cadence!, updatedAt: new Date() })
            .where(eq(follows.id, existing[0].id));
        }
        return NextResponse.json({
          ok: true,
          alreadyFollowing: true,
          backend: "postgres",
          follow: {
            id: existing[0].id,
            email: existing[0].email,
            entityType: existing[0].entityType,
            entityId: existing[0].entityId,
            entitySlug: existing[0].entitySlug,
            entityTitle: existing[0].entityTitle,
            cadence: body.cadence,
            href: resolved.href,
          },
        });
      }

      const inactive = await db
        .select()
        .from(follows)
        .where(
          and(
            eq(follows.email, emailRaw),
            eq(follows.entityType, body.entityType!),
            eq(follows.entityId, body.entityId!),
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
            cadence: body.cadence!,
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
          entityType: body.entityType!,
          entityId: body.entityId!,
          entitySlug: resolved.entitySlug,
          entityTitle: resolved.entityTitle,
          cadence: body.cadence!,
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
          cadence: body.cadence!,
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
        backend: "postgres",
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
    });
  } catch (err) {
    console.error("[follow] POST failed", err);
    return jsonError(
      err instanceof Error ? err.message : "Could not save follow",
      500,
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      id?: string;
      token?: string;
      entityType?: string;
      entityId?: string;
    };

    const sessionEmail = await getSessionEmail();

    return await withFollowBackend(async (backend) => {
      if (backend === "memory") {
        if (body.token) {
          const row = memoryFollowStore.findByToken(body.token);
          if (!row) return jsonError("Not found", 404);
          memoryFollowStore.upsert({ ...row, active: false, updatedAt: new Date() });
          return NextResponse.json({ ok: true });
        }
        if (body.id) {
          const row = memoryFollowStore.findById(body.id);
          if (!row || (sessionEmail && row.email !== sessionEmail)) {
            return jsonError("Not found", 404);
          }
          memoryFollowStore.upsert({ ...row, active: false, updatedAt: new Date() });
          return NextResponse.json({ ok: true });
        }
        if (body.entityType && body.entityId && sessionEmail) {
          const row = memoryFollowStore.findActive(sessionEmail, body.entityType, body.entityId);
          if (!row) return jsonError("Not found", 404);
          memoryFollowStore.upsert({ ...row, active: false, updatedAt: new Date() });
          return NextResponse.json({ ok: true });
        }
        return jsonError("id, token, or entity + session required", 400);
      }

      const db = getDb();

      if (body.token) {
        const { deactivateFollowByToken } = await import("@/lib/follow");
        const row = await deactivateFollowByToken(body.token);
        if (!row) return jsonError("Not found", 404);
        return NextResponse.json({ ok: true });
      }

      if (body.id) {
        const { deactivateFollowById } = await import("@/lib/follow");
        const ok = await deactivateFollowById(body.id, sessionEmail ?? undefined);
        if (!ok) return jsonError("Not found", 404);
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
        if (!updated.length) return jsonError("Not found", 404);
        return NextResponse.json({ ok: true });
      }

      return jsonError("id, token, or entity + session required", 400);
    });
  } catch (err) {
    console.error("[follow] DELETE failed", err);
    return jsonError(err instanceof Error ? err.message : "Could not unfollow", 500);
  }
}

void resolveFollowBackend;
