import { randomUUID } from "crypto";
import { allSeedContributions } from "./seed";
import type {
  ArgumentReactionKind,
  ArgumentRecord,
  ArgumentReplyRecord,
  ArgumentSide,
  CommentRecord,
  ContributionAuthor,
  ContributionPageRecord,
  ContributionStatus,
  ContributorIdentity,
  EntityContributions,
  PollOptionRecord,
  PollRecord,
  SocialPlatform,
  SocialPostRecord,
} from "./types";

type ReactionRow = {
  id: string;
  argumentId: string;
  voterKey: string;
  kind: ArgumentReactionKind;
};

type VoteRow = {
  id: string;
  pollId: string;
  optionId: string;
  voterKey: string;
};

type RateHit = { at: number };

type Bucket = {
  seeded: boolean;
  authors: ContributionAuthor[];
  arguments: ArgumentRecord[];
  replies: ArgumentReplyRecord[];
  reactions: ReactionRow[];
  polls: PollRecord[];
  votes: VoteRow[];
  pages: ContributionPageRecord[];
  comments: CommentRecord[];
  social: SocialPostRecord[];
  rateHits: RateHit[];
};

function bucket(): Bucket {
  const g = globalThis as unknown as { __contribMemory?: Bucket };
  if (!g.__contribMemory) {
    g.__contribMemory = {
      seeded: false,
      authors: [],
      arguments: [],
      replies: [],
      reactions: [],
      polls: [],
      votes: [],
      pages: [],
      comments: [],
      social: [],
      rateHits: [],
    };
  }
  return g.__contribMemory;
}

function ensureSeeded() {
  const b = bucket();
  if (b.seeded) return;
  b.seeded = true;
  const seed = allSeedContributions();
  const authorIds = new Set<string>();
  const upsertAuthor = (id: string, displayName: string) => {
    if (authorIds.has(id)) return;
    authorIds.add(id);
    b.authors.push({
      id,
      displayName,
      email: null,
      userId: null,
      createdAt: new Date().toISOString(),
    });
  };

  for (const a of seed.arguments) {
    upsertAuthor(a.authorId, a.authorDisplayName);
    for (const r of a.replies) upsertAuthor(r.authorId, r.authorDisplayName);
    b.arguments.push({ ...a, replies: [] });
    b.replies.push(...a.replies);
    // Materialize seed reaction counts as synthetic rows so counts stay stable
    for (let i = 0; i < a.agreeCount; i++) {
      b.reactions.push({
        id: `seed-react-agree-${a.id}-${i}`,
        argumentId: a.id,
        voterKey: `seed:agree:${a.id}:${i}`,
        kind: "agree",
      });
    }
    for (let i = 0; i < a.disagreeCount; i++) {
      b.reactions.push({
        id: `seed-react-disagree-${a.id}-${i}`,
        argumentId: a.id,
        voterKey: `seed:disagree:${a.id}:${i}`,
        kind: "disagree",
      });
    }
  }
  for (const p of seed.polls) {
    upsertAuthor(p.authorId, p.authorDisplayName);
    b.polls.push({
      ...p,
      options: p.options.map((o) => ({ ...o, voteCount: 0 })),
    });
    for (const o of p.options) {
      for (let i = 0; i < o.voteCount; i++) {
        b.votes.push({
          id: `seed-vote-${o.id}-${i}`,
          pollId: p.id,
          optionId: o.id,
          voterKey: `seed:vote:${o.id}:${i}`,
        });
      }
    }
  }
  for (const page of seed.pages) {
    upsertAuthor(page.authorId, page.authorDisplayName);
    b.pages.push(page);
  }
  for (const c of seed.comments) {
    upsertAuthor(c.authorId, c.authorDisplayName);
    b.comments.push(c);
  }
  for (const s of seed.social) {
    upsertAuthor(s.authorId, s.authorDisplayName);
    b.social.push(s);
  }
}

function newId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function resolveAuthor(identity: ContributorIdentity): ContributionAuthor {
  ensureSeeded();
  const b = bucket();
  const email = identity.email.trim().toLowerCase();
  const existing = b.authors.find(
    (a) =>
      (identity.userId && a.userId === identity.userId) ||
      (a.email && a.email === email),
  );
  if (existing) {
    if (existing.displayName !== identity.displayName.trim()) {
      existing.displayName = identity.displayName.trim();
    }
    return existing;
  }
  const author: ContributionAuthor = {
    id: newId("cauth"),
    displayName: identity.displayName.trim(),
    email,
    userId: identity.userId ?? null,
    createdAt: new Date().toISOString(),
  };
  b.authors.push(author);
  return author;
}

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 20;

export function checkRateLimit(email: string): boolean {
  ensureSeeded();
  const b = bucket();
  const key = email.trim().toLowerCase();
  const now = Date.now();
  b.rateHits = b.rateHits.filter((h) => now - h.at < RATE_WINDOW_MS);
  // Store email in rateHits via encoding in at? Use parallel array - simpler: count by appending marker
  const hits = (b as Bucket & { rateByEmail?: Record<string, number[]> }).rateByEmail ?? {};
  (b as Bucket & { rateByEmail?: Record<string, number[]> }).rateByEmail = hits;
  const list = (hits[key] ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (list.length >= RATE_MAX) return false;
  list.push(now);
  hits[key] = list;
  return true;
}

function publishedOnly<T extends { status: ContributionStatus }>(rows: T[]): T[] {
  return rows.filter((r) => r.status === "published");
}

function assembleArgument(a: ArgumentRecord): ArgumentRecord {
  const b = bucket();
  const replies = publishedOnly(b.replies.filter((r) => r.argumentId === a.id)).sort((x, y) =>
    x.createdAt.localeCompare(y.createdAt),
  );
  const reactions = b.reactions.filter((r) => r.argumentId === a.id);
  return {
    ...a,
    replies,
    agreeCount: reactions.filter((r) => r.kind === "agree").length,
    disagreeCount: reactions.filter((r) => r.kind === "disagree").length,
  };
}

function assemblePoll(p: PollRecord): PollRecord {
  const b = bucket();
  const options: PollOptionRecord[] = p.options
    .map((o) => ({
      ...o,
      voteCount: b.votes.filter((v) => v.optionId === o.id).length,
    }))
    .sort((x, y) => x.sortOrder - y.sortOrder);
  return { ...p, options };
}

export const memoryContributionStore = {
  listForEntity(entityType: string, entityId: string): EntityContributions {
    ensureSeeded();
    const b = bucket();
    return {
      arguments: publishedOnly(
        b.arguments.filter((a) => a.entityType === entityType && a.entityId === entityId),
      )
        .map(assembleArgument)
        .sort((a, c) => c.createdAt.localeCompare(a.createdAt)),
      polls: publishedOnly(
        b.polls.filter((p) => p.entityType === entityType && p.entityId === entityId),
      )
        .map(assemblePoll)
        .sort((a, c) => c.createdAt.localeCompare(a.createdAt)),
      pages: publishedOnly(
        b.pages.filter((p) => p.entityType === entityType && p.entityId === entityId),
      ).sort((a, c) => c.createdAt.localeCompare(a.createdAt)),
      comments: publishedOnly(
        b.comments.filter((c) => c.entityType === entityType && c.entityId === entityId),
      ).sort((a, c) => c.createdAt.localeCompare(a.createdAt)),
      social: publishedOnly(
        b.social.filter((s) => s.entityType === entityType && s.entityId === entityId),
      ).sort((a, c) => c.createdAt.localeCompare(a.createdAt)),
    };
  },

  createComment(input: {
    entityType: string;
    entityId: string;
    identity: ContributorIdentity;
    body: string;
    parentId?: string | null;
  }): CommentRecord {
    ensureSeeded();
    const author = resolveAuthor(input.identity);
    const row: CommentRecord = {
      id: newId("cmt"),
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: author.id,
      authorDisplayName: author.displayName,
      body: input.body.trim(),
      parentId: input.parentId ?? null,
      status: "published",
      createdAt: new Date().toISOString(),
    };
    bucket().comments.push(row);
    return row;
  },

  createArgument(input: {
    entityType: string;
    entityId: string;
    identity: ContributorIdentity;
    side: ArgumentSide;
    title: string;
    body: string;
    evidenceUrl?: string | null;
  }): ArgumentRecord {
    ensureSeeded();
    const author = resolveAuthor(input.identity);
    const row: ArgumentRecord = {
      id: newId("arg"),
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: author.id,
      authorDisplayName: author.displayName,
      side: input.side,
      title: input.title.trim(),
      body: input.body.trim(),
      evidenceUrl: input.evidenceUrl?.trim() || null,
      status: "published",
      createdAt: new Date().toISOString(),
      agreeCount: 0,
      disagreeCount: 0,
      replies: [],
    };
    bucket().arguments.push(row);
    return row;
  },

  createReply(input: {
    argumentId: string;
    identity: ContributorIdentity;
    body: string;
  }): ArgumentReplyRecord | null {
    ensureSeeded();
    const b = bucket();
    const arg = b.arguments.find((a) => a.id === input.argumentId && a.status === "published");
    if (!arg) return null;
    const author = resolveAuthor(input.identity);
    const row: ArgumentReplyRecord = {
      id: newId("argrep"),
      argumentId: input.argumentId,
      authorId: author.id,
      authorDisplayName: author.displayName,
      body: input.body.trim(),
      status: "published",
      createdAt: new Date().toISOString(),
    };
    b.replies.push(row);
    return row;
  },

  react(input: {
    argumentId: string;
    voterKey: string;
    kind: ArgumentReactionKind;
  }): { agreeCount: number; disagreeCount: number } | null {
    ensureSeeded();
    const b = bucket();
    const arg = b.arguments.find((a) => a.id === input.argumentId && a.status === "published");
    if (!arg) return null;
    const existing = b.reactions.find(
      (r) => r.argumentId === input.argumentId && r.voterKey === input.voterKey,
    );
    if (existing) {
      existing.kind = input.kind;
    } else {
      b.reactions.push({
        id: newId("react"),
        argumentId: input.argumentId,
        voterKey: input.voterKey,
        kind: input.kind,
      });
    }
    const reactions = b.reactions.filter((r) => r.argumentId === input.argumentId);
    return {
      agreeCount: reactions.filter((r) => r.kind === "agree").length,
      disagreeCount: reactions.filter((r) => r.kind === "disagree").length,
    };
  },

  createPoll(input: {
    entityType: string;
    entityId: string;
    identity: ContributorIdentity;
    question: string;
    options: string[];
  }): PollRecord {
    ensureSeeded();
    const author = resolveAuthor(input.identity);
    const pollId = newId("poll");
    const options: PollOptionRecord[] = input.options.map((label, i) => ({
      id: newId("pollopt"),
      pollId,
      label: label.trim(),
      sortOrder: i,
      voteCount: 0,
    }));
    const row: PollRecord = {
      id: pollId,
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: author.id,
      authorDisplayName: author.displayName,
      question: input.question.trim(),
      status: "published",
      createdAt: new Date().toISOString(),
      options,
    };
    bucket().polls.push(row);
    return row;
  },

  vote(input: {
    pollId: string;
    optionId: string;
    voterKey: string;
  }): PollRecord | null {
    ensureSeeded();
    const b = bucket();
    const poll = b.polls.find((p) => p.id === input.pollId && p.status === "published");
    if (!poll) return null;
    if (!poll.options.some((o) => o.id === input.optionId)) return null;
    const existing = b.votes.find((v) => v.pollId === input.pollId && v.voterKey === input.voterKey);
    if (existing) {
      existing.optionId = input.optionId;
    } else {
      b.votes.push({
        id: newId("vote"),
        pollId: input.pollId,
        optionId: input.optionId,
        voterKey: input.voterKey,
      });
    }
    return assemblePoll(poll);
  },

  submitPage(input: {
    entityType: string;
    entityId: string;
    identity: ContributorIdentity;
    title: string;
    body: string;
  }): ContributionPageRecord {
    ensureSeeded();
    const author = resolveAuthor(input.identity);
    const row: ContributionPageRecord = {
      id: newId("cpage"),
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: author.id,
      authorDisplayName: author.displayName,
      title: input.title.trim(),
      body: input.body.trim(),
      status: "held",
      createdAt: new Date().toISOString(),
    };
    bucket().pages.push(row);
    return row;
  },

  submitSocial(input: {
    entityType: string;
    entityId: string;
    identity: ContributorIdentity;
    platform: SocialPlatform;
    url: string;
    title: string;
    snippet?: string | null;
  }): SocialPostRecord {
    ensureSeeded();
    const author = resolveAuthor(input.identity);
    const row: SocialPostRecord = {
      id: newId("soc"),
      entityType: input.entityType,
      entityId: input.entityId,
      authorId: author.id,
      authorDisplayName: author.displayName,
      platform: input.platform,
      url: input.url.trim(),
      title: input.title.trim(),
      snippet: input.snippet?.trim() || null,
      status: "held",
      createdAt: new Date().toISOString(),
    };
    bucket().social.push(row);
    return row;
  },
};
