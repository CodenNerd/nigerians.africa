import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const follows = pgTable(
  "follows",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    entitySlug: text("entity_slug").notNull(),
    entityTitle: text("entity_title").notNull(),
    cadence: text("cadence").notNull(),
    unsubscribeToken: text("unsubscribe_token").notNull().unique(),
    sessionEmail: text("session_email"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("follows_active_email_entity_uidx")
      .on(t.email, t.entityType, t.entityId)
      .where(sql`${t.active} = true`),
    index("follows_email_idx").on(t.email),
    index("follows_entity_idx").on(t.entityType, t.entityId),
  ],
);

export const followEvents = pgTable(
  "follow_events",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    href: text("href").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("follow_events_entity_created_idx").on(t.entityType, t.entityId, t.createdAt)],
);

export const followDeliveries = pgTable(
  "follow_deliveries",
  {
    id: text("id").primaryKey(),
    followId: text("follow_id")
      .notNull()
      .references(() => follows.id, { onDelete: "cascade" }),
    eventId: text("event_id").references(() => followEvents.id, { onDelete: "set null" }),
    channel: text("channel").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
    providerId: text("provider_id"),
  },
  (t) => [
    uniqueIndex("follow_deliveries_instant_uidx")
      .on(t.followId, t.eventId)
      .where(sql`${t.channel} = 'instant' and ${t.eventId} is not null`),
    index("follow_deliveries_follow_idx").on(t.followId),
  ],
);

export type Follow = typeof follows.$inferSelect;
export type NewFollow = typeof follows.$inferInsert;
export type FollowEvent = typeof followEvents.$inferSelect;
export type NewFollowEvent = typeof followEvents.$inferInsert;
export type FollowDelivery = typeof followDeliveries.$inferSelect;

/* ── Public contributions ─────────────────────────────────────────── */

export const contributionAuthors = pgTable(
  "contribution_authors",
  {
    id: text("id").primaryKey(),
    displayName: text("display_name").notNull(),
    email: text("email"),
    userId: text("user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("contribution_authors_email_idx").on(t.email),
    index("contribution_authors_user_idx").on(t.userId),
  ],
);

export const contributionArguments = pgTable(
  "contribution_arguments",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => contributionAuthors.id),
    side: text("side").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    evidenceUrl: text("evidence_url"),
    status: text("status").notNull().default("published"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("contribution_arguments_entity_idx").on(t.entityType, t.entityId, t.createdAt),
    index("contribution_arguments_status_idx").on(t.status),
  ],
);

export const argumentReplies = pgTable(
  "argument_replies",
  {
    id: text("id").primaryKey(),
    argumentId: text("argument_id")
      .notNull()
      .references(() => contributionArguments.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => contributionAuthors.id),
    body: text("body").notNull(),
    status: text("status").notNull().default("published"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("argument_replies_argument_idx").on(t.argumentId, t.createdAt)],
);

export const argumentReactions = pgTable(
  "argument_reactions",
  {
    id: text("id").primaryKey(),
    argumentId: text("argument_id")
      .notNull()
      .references(() => contributionArguments.id, { onDelete: "cascade" }),
    voterKey: text("voter_key").notNull(),
    kind: text("kind").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("argument_reactions_voter_uidx").on(t.argumentId, t.voterKey),
    index("argument_reactions_argument_idx").on(t.argumentId),
  ],
);

export const contributionPolls = pgTable(
  "contribution_polls",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => contributionAuthors.id),
    question: text("question").notNull(),
    status: text("status").notNull().default("published"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("contribution_polls_entity_idx").on(t.entityType, t.entityId, t.createdAt)],
);

export const pollOptions = pgTable(
  "poll_options",
  {
    id: text("id").primaryKey(),
    pollId: text("poll_id")
      .notNull()
      .references(() => contributionPolls.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("poll_options_poll_idx").on(t.pollId)],
);

export const pollVotes = pgTable(
  "poll_votes",
  {
    id: text("id").primaryKey(),
    pollId: text("poll_id")
      .notNull()
      .references(() => contributionPolls.id, { onDelete: "cascade" }),
    optionId: text("option_id")
      .notNull()
      .references(() => pollOptions.id, { onDelete: "cascade" }),
    voterKey: text("voter_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("poll_votes_voter_uidx").on(t.pollId, t.voterKey),
    index("poll_votes_poll_idx").on(t.pollId),
  ],
);

export const contributionPages = pgTable(
  "contribution_pages",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => contributionAuthors.id),
    title: text("title").notNull(),
    body: text("body").notNull(),
    status: text("status").notNull().default("held"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("contribution_pages_entity_idx").on(t.entityType, t.entityId, t.createdAt)],
);

export const contributionComments = pgTable(
  "contribution_comments",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => contributionAuthors.id),
    body: text("body").notNull(),
    parentId: text("parent_id"),
    status: text("status").notNull().default("published"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("contribution_comments_entity_idx").on(t.entityType, t.entityId, t.createdAt)],
);

export const contributionSocialPosts = pgTable(
  "contribution_social_posts",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => contributionAuthors.id),
    platform: text("platform").notNull(),
    url: text("url").notNull(),
    title: text("title").notNull(),
    snippet: text("snippet"),
    status: text("status").notNull().default("held"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("contribution_social_entity_idx").on(t.entityType, t.entityId, t.createdAt)],
);

export type ContributionAuthorRow = typeof contributionAuthors.$inferSelect;
export type ContributionArgumentRow = typeof contributionArguments.$inferSelect;
export type ArgumentReplyRow = typeof argumentReplies.$inferSelect;
export type ArgumentReactionRow = typeof argumentReactions.$inferSelect;
export type ContributionPollRow = typeof contributionPolls.$inferSelect;
export type PollOptionRow = typeof pollOptions.$inferSelect;
export type PollVoteRow = typeof pollVotes.$inferSelect;
export type ContributionPageRow = typeof contributionPages.$inferSelect;
export type ContributionCommentRow = typeof contributionComments.$inferSelect;
export type ContributionSocialPostRow = typeof contributionSocialPosts.$inferSelect;
