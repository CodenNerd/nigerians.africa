import { NextRequest, NextResponse } from "next/server";
import { store } from "@nigeria-for-nigerians/domain";
import type { EntityType } from "@nigeria-for-nigerians/domain";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ entityType: string; entityId: string }> },
) {
  const { entityType, entityId } = await ctx.params;
  const type = entityType as EntityType;

  const related = store.related(type, entityId);
  const evidence = store.evidenceFor(type, entityId);
  const timeline = store.memoryFor(type, entityId);
  const thread =
    entityId === "proj-allen-spur" || entityId === "prob-roads-ikeja"
      ? store.signatureThread()
      : related;

  return NextResponse.json({
    entity: { type, id: entityId },
    relationships: related,
    related_entities: related,
    evidence,
    timeline,
    sources: evidence
      .map((e) => store.sourceById(e.sourceId))
      .filter(Boolean),
    actions: [
      { label: "Report something", href: "/report" },
      { label: "Ask about this", href: "/ask" },
      { label: "Civic guidance", href: "/guidance" },
    ],
    thread,
  });
}
