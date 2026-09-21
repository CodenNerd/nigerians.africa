import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export * from "./schema";

let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL?.trim() || undefined;
}

export function requireDatabaseUrl(): string {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Start Supabase local Postgres or set DATABASE_URL to enable Follow updates.",
    );
  }
  return url;
}

/** Lazy Drizzle client for Follow tables. */
export function getDb() {
  if (db) return db;
  const url = requireDatabaseUrl();
  client = postgres(url, { max: 5, prepare: false });
  db = drizzle(client, { schema });
  return db;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}
