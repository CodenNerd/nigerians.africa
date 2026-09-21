import {
  boolean,
  index,
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
