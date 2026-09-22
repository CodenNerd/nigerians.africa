import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/follow/session";
import {
  createComment,
  isContributionEntityType,
  RateLimitError,
} from "@/lib/contributions";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const entityType = String(b.entityType ?? "");
  const entityId = String(b.entityId ?? "").trim();
  const displayName = String(b.displayName ?? "").trim();
  const email = String(b.email ?? "").trim().toLowerCase();
  const text = String(b.body ?? "").trim();
  const userId = b.userId ? String(b.userId) : null;

  if (!isContributionEntityType(entityType) || !entityId) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  }
  if (!displayName || displayName.length > 80) {
    return NextResponse.json({ error: "Display name required (max 80)" }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (!text || text.length > 2000) {
    return NextResponse.json({ error: "Comment body required (max 2000)" }, { status: 400 });
  }

  try {
    const row = await createComment({
      entityType,
      entityId,
      identity: { displayName, email, userId },
      body: text,
    });
    return NextResponse.json({ comment: row });
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    throw err;
  }
}
