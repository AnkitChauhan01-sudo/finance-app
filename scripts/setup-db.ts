import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in .env file");
}

// Clean the DATABASE_URL
let databaseUrl = process.env.DATABASE_URL.trim();
if (databaseUrl.startsWith("psql")) {
  databaseUrl = databaseUrl.replace(/^psql\s+/, "");
}
databaseUrl = databaseUrl.replace(/^['"]+|['"]+$/g, "");

const sql = neon(databaseUrl);

async function setupDatabase() {
  try {
    console.log("Setting up database...");

    // Create enum type
    console.log("Creating transaction_type enum...");
    await sql`
      DO $$ BEGIN
        CREATE TYPE "transaction_type" AS ENUM('income', 'expense');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    // Create transactions table
    console.log("Creating transactions table...");
    await sql`
      CREATE TABLE IF NOT EXISTS "transactions" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "type" "transaction_type" NOT NULL,
        "amount" numeric(10, 2) NOT NULL,
        "category" varchar(100) NOT NULL,
        "description" text,
        "date" timestamp DEFAULT now() NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;

    // Create budgets table
    console.log("Creating budgets table...");
    await sql`
      CREATE TABLE IF NOT EXISTS "budgets" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "category" varchar(100) NOT NULL,
        "amount" numeric(10, 2) NOT NULL,
        "period" varchar(20) DEFAULT 'monthly' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;

    console.log("✅ Database setup completed successfully!");
    console.log("Tables created: transactions, budgets");
    console.log("Enum created: transaction_type");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    process.exit(1);
  }
}

setupDatabase();

