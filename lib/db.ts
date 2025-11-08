import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let _db: NeonHttpDatabase<typeof schema> | null = null;

function getDatabaseUrl(): string {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Please configure it in your environment variables.");
  }

  // Clean the DATABASE_URL - remove quotes and psql command if present
  let databaseUrl = process.env.DATABASE_URL.trim();
  // Remove psql command prefix if present
  if (databaseUrl.startsWith("psql")) {
    databaseUrl = databaseUrl.replace(/^psql\s+/, "");
  }
  // Remove quotes from start and end
  databaseUrl = databaseUrl.replace(/^['"]+|['"]+$/g, "");

  return databaseUrl;
}

function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    // Only validate and connect when db is actually used (runtime, not build time)
    const databaseUrl = getDatabaseUrl();
    const sql = neon(databaseUrl);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// Export a proxy that lazily initializes the db only when accessed
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    return getDb()[prop as keyof NeonHttpDatabase<typeof schema>];
  },
});

