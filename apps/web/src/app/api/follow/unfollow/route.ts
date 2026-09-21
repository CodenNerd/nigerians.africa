import { NextRequest, NextResponse } from "next/server";
import { deactivateFollowById, deactivateFollowByToken, getSessionEmail } from "@/lib/follow";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: string; token?: string };
    if (body.token) {
      const row = await deactivateFollowByToken(body.token);
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ ok: true });
    }

    if (!body.id) {
      return NextResponse.json({ error: "id or token required" }, { status: 400 });
    }

    const sessionEmail = await getSessionEmail();
    const ok = await deactivateFollowById(body.id, sessionEmail ?? undefined);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[follow] unfollow failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not unfollow" },
      { status: 500 },
    );
  }
}
