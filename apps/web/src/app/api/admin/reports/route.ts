import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getDemoReportsStore } from "@/lib/demo-store";

export async function POST(req: NextRequest) {
  const jar = await cookies();
  const session = jar.get("na_session")?.value || "";
  const role = session.split(":")[0];
  if (!["verifier", "admin", "government"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as { id?: string; status?: string };
  const store = getDemoReportsStore();
  const reports = store.__demoReports || [];
  const idx = reports.findIndex((r) => r.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  reports[idx] = { ...reports[idx], status: body.status || reports[idx].status };
  store.__demoReports = reports;
  return NextResponse.json({ reports });
}
