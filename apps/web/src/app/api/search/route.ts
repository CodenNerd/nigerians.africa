import { NextRequest, NextResponse } from "next/server";
import { store } from "@nigeria-for-nigerians/domain";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const results = store.search(q);
  return NextResponse.json({ query: q, results });
}
