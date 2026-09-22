import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/follow/session";
import {
  createPoll,
  isContributionEntityType,
  RateLimitError,
  votePoll,
} from "@/lib/contributions";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const action = String(b.action ?? "create");

  try {
    if (action === "vote") {
      const pollId = String(b.pollId ?? "").trim();
      const optionId = String(b.optionId ?? "").trim();
      const email = String(b.email ?? "").trim().toLowerCase();
      const userId = b.userId ? String(b.userId) : null;
      if (!pollId || !optionId) {
        return NextResponse.json({ error: "pollId and optionId required" }, { status: 400 });
      }
      if (!userId && !isValidEmail(email)) {
        return NextResponse.json({ error: "Valid email required to vote" }, { status: 400 });
      }
      const voterKey = userId ? `user:${userId}` : `email:${email}`;
      const poll = await votePoll({ pollId, optionId, voterKey });
      if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });
      return NextResponse.json({ poll });
    }

    const entityType = String(b.entityType ?? "");
    const entityId = String(b.entityId ?? "").trim();
    const displayName = String(b.displayName ?? "").trim();
    const email = String(b.email ?? "").trim().toLowerCase();
    const userId = b.userId ? String(b.userId) : null;
    const question = String(b.question ?? "").trim();
    const options = Array.isArray(b.options)
      ? b.options.map((o) => String(o).trim()).filter(Boolean)
      : [];

    if (!isContributionEntityType(entityType) || !entityId) {
      return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
    }
    if (!displayName || !isValidEmail(email)) {
      return NextResponse.json({ error: "Display name and email required" }, { status: 400 });
    }
    if (!question || question.length > 240 || options.length < 2 || options.length > 6) {
      return NextResponse.json(
        { error: "Question and 2–6 options required" },
        { status: 400 },
      );
    }

    const poll = await createPoll({
      entityType,
      entityId,
      identity: { displayName, email, userId },
      question,
      options,
    });
    return NextResponse.json({ poll });
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    throw err;
  }
}
