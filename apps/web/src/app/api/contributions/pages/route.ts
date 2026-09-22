import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/follow/session";
import {
  isContributionEntityType,
  RateLimitError,
  submitPage,
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
  const userId = b.userId ? String(b.userId) : null;
  const title = String(b.title ?? "").trim();
  const text = String(b.body ?? "").trim();

  if (!isContributionEntityType(entityType) || !entityId) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  }
  if (!displayName || !isValidEmail(email)) {
    return NextResponse.json({ error: "Display name and email required" }, { status: 400 });
  }
  if (!title || title.length > 160 || !text || text.length > 8000) {
    return NextResponse.json({ error: "Title and body required" }, { status: 400 });
  }

  try {
    const page = await submitPage({
      entityType,
      entityId,
      identity: { displayName, email, userId },
      title,
      body: text,
    });
    return NextResponse.json({
      page,
      message: "Submitted for review. It will appear here once published.",
    });
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    throw err;
  }
}
