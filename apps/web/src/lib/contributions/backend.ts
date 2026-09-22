import { and, eq, inArray } from "drizzle-orm";
import {
  argumentReactions,
  argumentReplies,
  contributionArguments,
  contributionAuthors,
  contributionComments,
  contributionPages,
  contributionPolls,
  contributionSocialPosts,
  getDb,
  getDatabaseUrl,
  isDatabaseConfigured,
  pollOptions,
  pollVotes,
} from "@nigeria-for-nigerians/database";
import { checkRateLimit, memoryContributionStore } from "./memory-store";
import { seedContributionsFor } from "./seed";
import type {
  ArgumentReactionKind,
  ArgumentRecord,
  ArgumentReplyRecord,
  ArgumentSide,
  CommentRecord,
  ContributionPageRecord,
  ContributorIdentity,
  EntityContributions,
  PollOptionRecord,
  PollRecord,
  SocialPlatform,
  SocialPostRecord,
} from "./types";

export type ContributionsBackend = "postgres" | "memory";

let preferred: ContributionsBackend | null = null;
let probed = false;

export function preferredContributionsReset(backend: ContributionsBackend) {
  preferred = backend;
  probed = true;
}

/** Probe Postgres once; fall back to memory when URL missing or unreachable. */
export async function resolveContributionsBackend(): Promise<ContributionsBackend> {
  if (preferred) return preferred;
  if (!isDatabaseConfigured()) {
    preferred = "memory";
    return preferred;
  }
  if (probed && preferred) return preferred;
  probed = true;
  try {
    const db = getDb();
    await db.select({ id: contributionAuthors.id }).from(contributionAuthors).limit(1);
    preferred = "postgres";
  } catch (err) {
    console.warn(
      "[contributions] Postgres unavailable — using in-memory store.",
      err instanceof Error ? err.message : err,
    );
    preferred = "memory";
  }
  return preferred!;
}

export function contributionsBackendLabel(): ContributionsBackend {
  return preferred ?? (getDatabaseUrl() ? "postgres" : "memory");
}

export async function withContributionsBackend<T>(
  fn: (backend: ContributionsBackend) => Promise<T>,
): Promise<T> {
  const backend = await resolveContributionsBackend();
  try {
    return await fn(backend);
  } catch (err) {
    if (backend === "postgres") {
      console.warn("[contributions] Postgres error, switching to memory", err);
      preferred = "memory";
      return fn("memory");
    }
    throw err;
  }
}

function mergeEntity(
  seed: EntityContributions,
  live: EntityContributions,
): EntityContributions {
  const ids = {
    arguments: new Set(live.arguments.map((a) => a.id)),
    polls: new Set(live.polls.map((p) => p.id)),
    pages: new Set(live.pages.map((p) => p.id)),
    comments: new Set(live.comments.map((c) => c.id)),
    social: new Set(live.social.map((s) => s.id)),
  };
  return {
    arguments: [
      ...live.arguments,
      ...seed.arguments.filter((a) => !ids.arguments.has(a.id)),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    polls: [
      ...live.polls,
      ...seed.polls.filter((p) => !ids.polls.has(p.id)),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    pages: [
      ...live.pages,
      ...seed.pages.filter((p) => !ids.pages.has(p.id)),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    comments: [
      ...live.comments,
      ...seed.comments.filter((c) => !ids.comments.has(c.id)),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    social: [
      ...live.social,
      ...seed.social.filter((s) => !ids.social.has(s.id)),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

async function listPostgres(entityType: string, entityId: string): Promise<EntityContributions> {
  const db = getDb();
  const authors = await db.select().from(contributionAuthors);
  const authorName = (id: string) =>
    authors.find((a) => a.id === id)?.displayName ?? "Contributor";

  const args = await db
    .select()
    .from(contributionArguments)
    .where(
      and(
        eq(contributionArguments.entityType, entityType),
        eq(contributionArguments.entityId, entityId),
        eq(contributionArguments.status, "published"),
      ),
    );

  const argIds = args.map((a) => a.id);
  const replies =
    argIds.length === 0
      ? []
      : await db
          .select()
          .from(argumentReplies)
          .where(
            and(inArray(argumentReplies.argumentId, argIds), eq(argumentReplies.status, "published")),
          );
  const reactions =
    argIds.length === 0
      ? []
      : await db.select().from(argumentReactions).where(inArray(argumentReactions.argumentId, argIds));

  const argumentsOut: ArgumentRecord[] = args.map((a) => {
    const r = reactions.filter((x) => x.argumentId === a.id);
    return {
      id: a.id,
      entityType: a.entityType,
      entityId: a.entityId,
      authorId: a.authorId,
      authorDisplayName: authorName(a.authorId),
      side: a.side as ArgumentSide,
      title: a.title,
      body: a.body,
      evidenceUrl: a.evidenceUrl,
      status: "published",
      createdAt: a.createdAt.toISOString(),
      agreeCount: r.filter((x) => x.kind === "agree").length,
      disagreeCount: r.filter((x) => x.kind === "disagree").length,
      replies: replies
        .filter((x) => x.argumentId === a.id)
        .map(
          (x): ArgumentReplyRecord => ({
            id: x.id,
            argumentId: x.argumentId,
            authorId: x.authorId,
            authorDisplayName: authorName(x.authorId),
            body: x.body,
            status: "published",
            createdAt: x.createdAt.toISOString(),
          }),
        )
        .sort((x, y) => x.createdAt.localeCompare(y.createdAt)),
    };
  });

  const polls = await db
    .select()
    .from(contributionPolls)
    .where(
      and(
        eq(contributionPolls.entityType, entityType),
        eq(contributionPolls.entityId, entityId),
        eq(contributionPolls.status, "published"),
      ),
    );
  const pollIds = polls.map((p) => p.id);
  const options =
    pollIds.length === 0
      ? []
      : await db.select().from(pollOptions).where(inArray(pollOptions.pollId, pollIds));
  const votes =
    pollIds.length === 0
      ? []
      : await db.select().from(pollVotes).where(inArray(pollVotes.pollId, pollIds));

  const pollsOut: PollRecord[] = polls.map((p) => ({
    id: p.id,
    entityType: p.entityType,
    entityId: p.entityId,
    authorId: p.authorId,
    authorDisplayName: authorName(p.authorId),
    question: p.question,
    status: "published",
    createdAt: p.createdAt.toISOString(),
    options: options
      .filter((o) => o.pollId === p.id)
      .map(
        (o): PollOptionRecord => ({
          id: o.id,
          pollId: o.pollId,
          label: o.label,
          sortOrder: o.sortOrder,
          voteCount: votes.filter((v) => v.optionId === o.id).length,
        }),
      )
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  const pages = await db
    .select()
    .from(contributionPages)
    .where(
      and(
        eq(contributionPages.entityType, entityType),
        eq(contributionPages.entityId, entityId),
        eq(contributionPages.status, "published"),
      ),
    );
  const comments = await db
    .select()
    .from(contributionComments)
    .where(
      and(
        eq(contributionComments.entityType, entityType),
        eq(contributionComments.entityId, entityId),
        eq(contributionComments.status, "published"),
      ),
    );
  const social = await db
    .select()
    .from(contributionSocialPosts)
    .where(
      and(
        eq(contributionSocialPosts.entityType, entityType),
        eq(contributionSocialPosts.entityId, entityId),
        eq(contributionSocialPosts.status, "published"),
      ),
    );

  return {
    arguments: argumentsOut,
    polls: pollsOut,
    pages: pages.map(
      (p): ContributionPageRecord => ({
        id: p.id,
        entityType: p.entityType,
        entityId: p.entityId,
        authorId: p.authorId,
        authorDisplayName: authorName(p.authorId),
        title: p.title,
        body: p.body,
        status: "published",
        createdAt: p.createdAt.toISOString(),
      }),
    ),
    comments: comments.map(
      (c): CommentRecord => ({
        id: c.id,
        entityType: c.entityType,
        entityId: c.entityId,
        authorId: c.authorId,
        authorDisplayName: authorName(c.authorId),
        body: c.body,
        parentId: c.parentId,
        status: "published",
        createdAt: c.createdAt.toISOString(),
      }),
    ),
    social: social.map(
      (s): SocialPostRecord => ({
        id: s.id,
        entityType: s.entityType,
        entityId: s.entityId,
        authorId: s.authorId,
        authorDisplayName: authorName(s.authorId),
        platform: s.platform as SocialPlatform,
        url: s.url,
        title: s.title,
        snippet: s.snippet,
        status: "published",
        createdAt: s.createdAt.toISOString(),
      }),
    ),
  };
}

async function upsertAuthorPg(identity: ContributorIdentity) {
  const db = getDb();
  const email = identity.email.trim().toLowerCase();
  const existing = await db.select().from(contributionAuthors);
  const found = existing.find(
    (a) => (identity.userId && a.userId === identity.userId) || (a.email && a.email === email),
  );
  if (found) return found;
  const id = `cauth_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const row = {
    id,
    displayName: identity.displayName.trim(),
    email,
    userId: identity.userId ?? null,
    createdAt: new Date(),
  };
  await db.insert(contributionAuthors).values(row);
  return row;
}

export async function listContributions(
  entityType: string,
  entityId: string,
): Promise<EntityContributions> {
  return withContributionsBackend(async (backend) => {
    if (backend === "memory") {
      return memoryContributionStore.listForEntity(entityType, entityId);
    }
    const live = await listPostgres(entityType, entityId);
    return mergeEntity(seedContributionsFor(entityType, entityId), live);
  });
}

export async function createComment(input: {
  entityType: string;
  entityId: string;
  identity: ContributorIdentity;
  body: string;
}): Promise<CommentRecord> {
  if (!checkRateLimit(input.identity.email)) {
    throw new RateLimitError();
  }
  return withContributionsBackend(async (backend) => {
    if (backend === "memory") {
      return memoryContributionStore.createComment(input);
    }
    const db = getDb();
    const author = await upsertAuthorPg(input.identity);
    const id = `cmt_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const createdAt = new Date();
    await db.insert(contributionComments).values({
      id,
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: author.id,
      body: input.body.trim(),
      parentId: null,
      status: "published",
      createdAt,
    });
    return {
      id,
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: author.id,
      authorDisplayName: author.displayName,
      body: input.body.trim(),
      parentId: null,
      status: "published",
      createdAt: createdAt.toISOString(),
    };
  });
}

export async function createArgument(input: {
  entityType: string;
  entityId: string;
  identity: ContributorIdentity;
  side: ArgumentSide;
  title: string;
  body: string;
  evidenceUrl?: string | null;
}): Promise<ArgumentRecord> {
  if (!checkRateLimit(input.identity.email)) throw new RateLimitError();
  return withContributionsBackend(async (backend) => {
    if (backend === "memory") return memoryContributionStore.createArgument(input);
    const db = getDb();
    const author = await upsertAuthorPg(input.identity);
    const id = `arg_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const createdAt = new Date();
    await db.insert(contributionArguments).values({
      id,
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: author.id,
      side: input.side,
      title: input.title.trim(),
      body: input.body.trim(),
      evidenceUrl: input.evidenceUrl?.trim() || null,
      status: "published",
      createdAt,
    });
    return {
      id,
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: author.id,
      authorDisplayName: author.displayName,
      side: input.side,
      title: input.title.trim(),
      body: input.body.trim(),
      evidenceUrl: input.evidenceUrl?.trim() || null,
      status: "published",
      createdAt: createdAt.toISOString(),
      agreeCount: 0,
      disagreeCount: 0,
      replies: [],
    };
  });
}

export async function createReply(input: {
  argumentId: string;
  identity: ContributorIdentity;
  body: string;
}): Promise<ArgumentReplyRecord | null> {
  if (!checkRateLimit(input.identity.email)) throw new RateLimitError();
  return withContributionsBackend(async (backend) => {
    if (backend === "memory") return memoryContributionStore.createReply(input);
    const db = getDb();
    const [arg] = await db
      .select()
      .from(contributionArguments)
      .where(eq(contributionArguments.id, input.argumentId))
      .limit(1);
    if (!arg || arg.status !== "published") {
      // Seed-only argument: fall back to memory
      return memoryContributionStore.createReply(input);
    }
    const author = await upsertAuthorPg(input.identity);
    const id = `argrep_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const createdAt = new Date();
    await db.insert(argumentReplies).values({
      id,
      argumentId: input.argumentId,
      authorId: author.id,
      body: input.body.trim(),
      status: "published",
      createdAt,
    });
    return {
      id,
      argumentId: input.argumentId,
      authorId: author.id,
      authorDisplayName: author.displayName,
      body: input.body.trim(),
      status: "published",
      createdAt: createdAt.toISOString(),
    };
  });
}

export async function reactToArgument(input: {
  argumentId: string;
  voterKey: string;
  kind: ArgumentReactionKind;
}): Promise<{ agreeCount: number; disagreeCount: number } | null> {
  return withContributionsBackend(async (backend) => {
    if (backend === "memory") return memoryContributionStore.react(input);
    const db = getDb();
    const [arg] = await db
      .select()
      .from(contributionArguments)
      .where(eq(contributionArguments.id, input.argumentId))
      .limit(1);
    if (!arg) return memoryContributionStore.react(input);
    const existing = await db
      .select()
      .from(argumentReactions)
      .where(
        and(
          eq(argumentReactions.argumentId, input.argumentId),
          eq(argumentReactions.voterKey, input.voterKey),
        ),
      );
    if (existing[0]) {
      await db
        .update(argumentReactions)
        .set({ kind: input.kind })
        .where(eq(argumentReactions.id, existing[0].id));
    } else {
      await db.insert(argumentReactions).values({
        id: `react_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
        argumentId: input.argumentId,
        voterKey: input.voterKey,
        kind: input.kind,
        createdAt: new Date(),
      });
    }
    const all = await db
      .select()
      .from(argumentReactions)
      .where(eq(argumentReactions.argumentId, input.argumentId));
    return {
      agreeCount: all.filter((r) => r.kind === "agree").length,
      disagreeCount: all.filter((r) => r.kind === "disagree").length,
    };
  });
}

export async function createPoll(input: {
  entityType: string;
  entityId: string;
  identity: ContributorIdentity;
  question: string;
  options: string[];
}): Promise<PollRecord> {
  if (!checkRateLimit(input.identity.email)) throw new RateLimitError();
  return withContributionsBackend(async (backend) => {
    if (backend === "memory") return memoryContributionStore.createPoll(input);
    const db = getDb();
    const author = await upsertAuthorPg(input.identity);
    const id = `poll_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const createdAt = new Date();
    await db.insert(contributionPolls).values({
      id,
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: author.id,
      question: input.question.trim(),
      status: "published",
      createdAt,
    });
    const options: PollOptionRecord[] = [];
    for (let i = 0; i < input.options.length; i++) {
      const optId = `pollopt_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
      await db.insert(pollOptions).values({
        id: optId,
        pollId: id,
        label: input.options[i]!.trim(),
        sortOrder: i,
      });
      options.push({
        id: optId,
        pollId: id,
        label: input.options[i]!.trim(),
        sortOrder: i,
        voteCount: 0,
      });
    }
    return {
      id,
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: author.id,
      authorDisplayName: author.displayName,
      question: input.question.trim(),
      status: "published",
      createdAt: createdAt.toISOString(),
      options,
    };
  });
}

export async function votePoll(input: {
  pollId: string;
  optionId: string;
  voterKey: string;
}): Promise<PollRecord | null> {
  return withContributionsBackend(async (backend) => {
    if (backend === "memory") return memoryContributionStore.vote(input);
    const db = getDb();
    const [poll] = await db
      .select()
      .from(contributionPolls)
      .where(eq(contributionPolls.id, input.pollId))
      .limit(1);
    if (!poll) return memoryContributionStore.vote(input);
    const existing = await db
      .select()
      .from(pollVotes)
      .where(and(eq(pollVotes.pollId, input.pollId), eq(pollVotes.voterKey, input.voterKey)));
    if (existing[0]) {
      await db
        .update(pollVotes)
        .set({ optionId: input.optionId })
        .where(eq(pollVotes.id, existing[0].id));
    } else {
      await db.insert(pollVotes).values({
        id: `vote_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
        pollId: input.pollId,
        optionId: input.optionId,
        voterKey: input.voterKey,
        createdAt: new Date(),
      });
    }
    const live = await listPostgres(poll.entityType, poll.entityId);
    return live.polls.find((p) => p.id === input.pollId) ?? null;
  });
}

export async function submitPage(input: {
  entityType: string;
  entityId: string;
  identity: ContributorIdentity;
  title: string;
  body: string;
}): Promise<ContributionPageRecord> {
  if (!checkRateLimit(input.identity.email)) throw new RateLimitError();
  return withContributionsBackend(async (backend) => {
    if (backend === "memory") return memoryContributionStore.submitPage(input);
    const db = getDb();
    const author = await upsertAuthorPg(input.identity);
    const id = `cpage_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const createdAt = new Date();
    await db.insert(contributionPages).values({
      id,
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: author.id,
      title: input.title.trim(),
      body: input.body.trim(),
      status: "held",
      createdAt,
    });
    return {
      id,
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: author.id,
      authorDisplayName: author.displayName,
      title: input.title.trim(),
      body: input.body.trim(),
      status: "held",
      createdAt: createdAt.toISOString(),
    };
  });
}

export async function submitSocial(input: {
  entityType: string;
  entityId: string;
  identity: ContributorIdentity;
  platform: SocialPlatform;
  url: string;
  title: string;
  snippet?: string | null;
}): Promise<SocialPostRecord> {
  if (!checkRateLimit(input.identity.email)) throw new RateLimitError();
  return withContributionsBackend(async (backend) => {
    if (backend === "memory") return memoryContributionStore.submitSocial(input);
    const db = getDb();
    const author = await upsertAuthorPg(input.identity);
    const id = `soc_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const createdAt = new Date();
    await db.insert(contributionSocialPosts).values({
      id,
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: author.id,
      platform: input.platform,
      url: input.url.trim(),
      title: input.title.trim(),
      snippet: input.snippet?.trim() || null,
      status: "held",
      createdAt,
    });
    return {
      id,
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: author.id,
      authorDisplayName: author.displayName,
      platform: input.platform,
      url: input.url.trim(),
      title: input.title.trim(),
      snippet: input.snippet?.trim() || null,
      status: "held",
      createdAt: createdAt.toISOString(),
    };
  });
}

export class RateLimitError extends Error {
  constructor() {
    super("Too many contributions from this email. Try again later.");
    this.name = "RateLimitError";
  }
}

export { checkRateLimit };
