import { defineConfig } from "drizzle-kit";

// Clean the DATABASE_URL - remove quotes and psql command if present
let databaseUrl = process.env.DATABASE_URL?.trim() || "";
databaseUrl = databaseUrl.replace(/^['"]|['"]$/g, ""); // Remove quotes
databaseUrl = databaseUrl.replace(/^psql\s+['"]?|['"]?$/g, ""); // Remove psql command prefix

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});

