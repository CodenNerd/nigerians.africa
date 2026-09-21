import { NextRequest, NextResponse } from "next/server";
import {
  getSessionEmail,
  isValidEmail,
  listActiveFollowsForEmail,
  resolveFollowable,
  updateFollowCadence,
  isFollowCadence,
  type FollowableEntityType,
} from "@/lib/follow";

export async function GET(req: NextRequest) {
  try {
    const sessionEmail = await getSessionEmail();
    const queryEmail = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
    const email = sessionEmail || queryEmail;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Sign in or provide ?email= to list follows", needsEmail: !sessionEmail },
        { status: 401 },
      );
    }

    const rows = await listActiveFollowsForEmail(email);
    const follows = rows.map((f) => {
      const resolved = resolveFollowable(f.entityType as FollowableEntityType, f.entityId);
      return {
        id: f.id,
        email: f.email,
        entityType: f.entityType,
        entityId: f.entityId,
        entitySlug: f.entitySlug,
        entityTitle: f.entityTitle,
        cadence: f.cadence,
        createdAt: f.createdAt,
        href: resolved?.href ?? `/${f.entityType}`,
      };
    });

    return NextResponse.json({ email, follows });
  } catch (err) {
    console.error("[follow] mine GET failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not list follows" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: string; cadence?: string };
    if (!body.id || !body.cadence || !isFollowCadence(body.cadence)) {
      return NextResponse.json({ error: "id and cadence required" }, { status: 400 });
    }

    const sessionEmail = await getSessionEmail();
    const ok = await updateFollowCadence(body.id, body.cadence, sessionEmail ?? undefined);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[follow] mine PATCH failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not update" },
      { status: 500 },
    );
  }
}
