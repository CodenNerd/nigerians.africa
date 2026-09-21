import { NextRequest, NextResponse } from "next/server";
import { getFollowCount } from "@/lib/follow/counts";
import { isFollowableEntityType } from "@/lib/follow/types";
import { formatFollowCount } from "@/lib/follow/types";

export async function GET(req: NextRequest) {
  try {
    const entityType = req.nextUrl.searchParams.get("entityType")?.trim() ?? "";
    const entityId = req.nextUrl.searchParams.get("entityId")?.trim() ?? "";
    if (!isFollowableEntityType(entityType) || !entityId) {
      return NextResponse.json({ error: "entityType and entityId required" }, { status: 400 });
    }
    const counts = await getFollowCount(entityType, entityId);
    return NextResponse.json({
      ...counts,
      label: formatFollowCount(counts.total),
    });
  } catch (err) {
    console.error("[follow] count failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load count" },
      { status: 500 },
    );
  }
}
