import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const globalStore = globalThis as unknown as {
  __demoResponses?: { statement: string; at: string; by: string }[];
};

export async function POST(req: NextRequest) {
  const jar = await cookies();
  const session = jar.get("na_session")?.value || "";
  const role = session.split(":")[0];
  if (!["government", "admin"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = (await req.json()) as { statement?: string };
  if (!globalStore.__demoResponses) globalStore.__demoResponses = [];
  globalStore.__demoResponses.unshift({
    statement: body.statement || "",
    at: new Date().toISOString(),
    by: session,
  });
  return NextResponse.json({
    ok: true,
    message: "Demo official response stored. In production this would link to the target report with a source.",
  });
}
