import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/follow/session";
import {
  reactToArgument,
  type ArgumentReactionKind,
} from "@/lib/contributions";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const argumentId = String(b.argumentId ?? "").trim();
  const kind = String(b.kind ?? "") as ArgumentReactionKind;
  const email = String(b.email ?? "").trim().toLowerCase();
  const userId = b.userId ? String(b.userId) : null;

  if (!argumentId || (kind !== "agree" && kind !== "disagree")) {
    return NextResponse.json({ error: "argumentId and kind required" }, { status: 400 });
  }
  if (!userId && !isValidEmail(email)) {
    return NextResponse.json({ error: "Valid email required to react" }, { status: 400 });
  }
  const voterKey = userId ? `user:${userId}` : `email:${email}`;
  const counts = await reactToArgument({ argumentId, voterKey, kind });
  if (!counts) return NextResponse.json({ error: "Argument not found" }, { status: 404 });
  return NextResponse.json(counts);
}
