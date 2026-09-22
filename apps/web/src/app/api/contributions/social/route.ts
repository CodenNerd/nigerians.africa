import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/follow/session";
import {
  isContributionEntityType,
  RateLimitError,
  submitSocial,
  type SocialPlatform,
} from "@/lib/contributions";

const PLATFORMS: SocialPlatform[] = [
  "x",
  "facebook",
  "instagram",
  "youtube",
  "tiktok",
  "other",
];

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
  const platform = String(b.platform ?? "other") as SocialPlatform;
  const url = String(b.url ?? "").trim();
  const title = String(b.title ?? "").trim();
  const snippet = b.snippet ? String(b.snippet).trim() : null;

  if (!isContributionEntityType(entityType) || !entityId) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  }
  if (!displayName || !isValidEmail(email)) {
    return NextResponse.json({ error: "Display name and email required" }, { status: 400 });
  }
  if (!PLATFORMS.includes(platform)) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }
  if (!url || !/^https?:\/\//i.test(url) || !title || title.length > 160) {
    return NextResponse.json({ error: "Public https URL and title required" }, { status: 400 });
  }

  try {
    const post = await submitSocial({
      entityType,
      entityId,
      identity: { displayName, email, userId },
      platform,
      url,
      title,
      snippet,
    });
    return NextResponse.json({
      post,
      message: "Submitted for review. It will appear here once published.",
    });
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    throw err;
  }
}
