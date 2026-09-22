import { NextResponse } from "next/server";
import {
  isContributionEntityType,
  listContributions,
} from "@/lib/contributions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType") ?? "";
  const entityId = searchParams.get("entityId") ?? "";
  if (!isContributionEntityType(entityType) || !entityId.trim()) {
    return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
  }
  const data = await listContributions(entityType, entityId.trim());
  return NextResponse.json(data);
}
