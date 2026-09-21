import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured } from "@nigeria-for-nigerians/database";
import { runWeeklyDigest } from "@/lib/follow";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    // Allow in local/dev when CRON_SECRET unset
    return process.env.NODE_ENV !== "production";
  }
  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  const query = req.nextUrl.searchParams.get("secret");
  return query === secret;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL is not set" }, { status: 503 });
  }

  const result = await runWeeklyDigest();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
