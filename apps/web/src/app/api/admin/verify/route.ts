import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRecordPatchStore } from "@/lib/demo-store";
import { emitAfterClaimReview, emitAfterEvidenceReview } from "@/lib/follow/hooks";

export async function GET() {
  const patch = getRecordPatchStore();
  return NextResponse.json({ patch });
}

export async function POST(req: NextRequest) {
  const jar = await cookies();
  const session = jar.get("na_session")?.value || "";
  const role = session.split(":")[0];
  if (!["verifier", "admin", "government"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as {
    entity?: "claim" | "evidence";
    id?: string;
    status?: string;
  };

  if (!body.id || !body.entity || !body.status) {
    return NextResponse.json({ error: "id, entity, status required" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const by = session;
  const patch = getRecordPatchStore();

  if (body.entity === "claim") {
    patch.claims[body.id] = {
      status: body.status,
      lastReviewedAt: now,
      lastReviewedBy: by,
    };
    await emitAfterClaimReview(body.id, body.status);
  } else {
    patch.evidence[body.id] = {
      verificationStatus: body.status,
      lastReviewedAt: now,
      lastReviewedBy: by,
    };
    await emitAfterEvidenceReview(body.id, body.status);
  }

  return NextResponse.json({ ok: true, patch });
}
