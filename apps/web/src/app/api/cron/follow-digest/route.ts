import { NextRequest, NextResponse } from "next/server";
import { runWeeklyDigest } from "@/lib/follow";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
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

  try {
    const result = await runWeeklyDigest();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[follow] digest failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Digest failed" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
