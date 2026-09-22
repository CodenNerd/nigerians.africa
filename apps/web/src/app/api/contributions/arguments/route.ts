import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/follow/session";
import {
  createArgument,
  createReply,
  isContributionEntityType,
  RateLimitError,
  type ArgumentSide,
} from "@/lib/contributions";

const SIDES: ArgumentSide[] = ["for", "against", "nuance"];

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const action = String(b.action ?? "create");

  const displayName = String(b.displayName ?? "").trim();
  const email = String(b.email ?? "").trim().toLowerCase();
  const userId = b.userId ? String(b.userId) : null;
  if (!displayName || displayName.length > 80) {
    return NextResponse.json({ error: "Display name required (max 80)" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  try {
    if (action === "reply") {
      const argumentId = String(b.argumentId ?? "").trim();
      const text = String(b.body ?? "").trim();
      if (!argumentId || !text || text.length > 2000) {
        return NextResponse.json({ error: "Reply body required" }, { status: 400 });
      }
      const reply = await createReply({
        argumentId,
        identity: { displayName, email, userId },
        body: text,
      });
      if (!reply) return NextResponse.json({ error: "Argument not found" }, { status: 404 });
      return NextResponse.json({ reply });
    }

    const entityType = String(b.entityType ?? "");
    const entityId = String(b.entityId ?? "").trim();
    const side = String(b.side ?? "") as ArgumentSide;
    const title = String(b.title ?? "").trim();
    const text = String(b.body ?? "").trim();
    const evidenceUrl = b.evidenceUrl ? String(b.evidenceUrl).trim() : null;

    if (!isContributionEntityType(entityType) || !entityId) {
      return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
    }
    if (!SIDES.includes(side)) {
      return NextResponse.json({ error: "side must be for, against, or nuance" }, { status: 400 });
    }
    if (!title || title.length > 160 || !text || text.length > 4000) {
      return NextResponse.json({ error: "Title and body required" }, { status: 400 });
    }

    const argument = await createArgument({
      entityType,
      entityId,
      identity: { displayName, email, userId },
      side,
      title,
      body: text,
      evidenceUrl,
    });
    return NextResponse.json({ argument });
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    throw err;
  }
}
