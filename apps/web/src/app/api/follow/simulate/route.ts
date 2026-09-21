import { NextRequest, NextResponse } from "next/server";
import {
  emitFollowEvent,
  getSessionRole,
  inventSimulateEvent,
  isFollowableEntityType,
} from "@/lib/follow";

export async function POST(req: NextRequest) {
  try {
    const role = await getSessionRole();
    if (!role || !["admin", "verifier", "government"].includes(role)) {
      return NextResponse.json({ error: "Forbidden — admin/demo session required" }, { status: 403 });
    }

    const body = (await req.json()) as {
      entityType?: string;
      entityId?: string;
      kind?: string;
      title?: string;
      summary?: string;
    };

    if (!body.entityType || !isFollowableEntityType(body.entityType) || !body.entityId) {
      return NextResponse.json({ error: "entityType and entityId required" }, { status: 400 });
    }

    const invented = inventSimulateEvent(body.entityType, body.entityId);
    if (!invented) {
      return NextResponse.json({ error: "Entity not found" }, { status: 404 });
    }

    const result = await emitFollowEvent({
      entityType: body.entityType,
      entityId: body.entityId,
      kind: body.kind || invented.kind,
      title: body.title || invented.title,
      summary: body.summary || invented.summary,
    });

    if (result.error && !result.eventId) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[follow] simulate failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Simulate failed" },
      { status: 500 },
    );
  }
}
