import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Clean the DATABASE_URL - remove quotes and psql command if present
let databaseUrl = process.env.DATABASE_URL.trim();
// Remove psql command prefix if present
if (databaseUrl.startsWith("psql")) {
  databaseUrl = databaseUrl.replace(/^psql\s+/, "");
}
// Remove quotes from start and end
databaseUrl = databaseUrl.replace(/^['"]+|['"]+$/g, "");

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });

