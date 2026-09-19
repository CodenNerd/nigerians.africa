import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDemoReportsStore, type DemoReport } from "@/lib/demo-store";

export async function GET() {
  const store = getDemoReportsStore();
  return NextResponse.json({ reports: store.__demoReports });
}

export async function POST(req: NextRequest) {
  const jar = await cookies();
  const session = jar.get("na_session")?.value;
  if (!session) {
    return NextResponse.json(
      { error: "Sign in required to submit a report", signin: "/signin" },
      { status: 401 },
    );
  }

  const body = (await req.json()) as {
    title?: string;
    description?: string;
    location?: string;
    kind?: string;
    officeId?: string;
    personId?: string;
    problemId?: string;
    electionId?: string;
    pollingUnitId?: string;
    fileLabel?: string;
    mediaType?: string;
  };

  if (!body.description?.trim()) {
    return NextResponse.json({ error: "Description required" }, { status: 400 });
  }

  const report: DemoReport = {
    id: `demo-${Date.now()}`,
    title: body.title?.trim() || "Citizen report",
    description: body.description.trim(),
    location: body.location?.trim() || "Location not specified",
    createdAt: new Date().toISOString(),
    status: "submitted",
    user: session,
    kind: body.kind,
    officeId: body.officeId,
    personId: body.personId,
    problemId: body.problemId,
    electionId: body.electionId,
    pollingUnitId: body.pollingUnitId,
    fileLabel: body.fileLabel,
    mediaType: body.mediaType,
  };

  const store = getDemoReportsStore();
  store.__demoReports!.unshift(report);

  return NextResponse.json({ ok: true, report });
}
