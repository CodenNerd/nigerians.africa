import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured } from "@nigeria-for-nigerians/database";
import { deactivateFollowById, getSessionEmail } from "@/lib/follow";

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL is not set" }, { status: 503 });
  }

  const body = (await req.json()) as { id?: string; token?: string };
  if (body.token) {
    const { deactivateFollowByToken } = await import("@/lib/follow");
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
}
