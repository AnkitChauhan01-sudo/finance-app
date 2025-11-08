import { pgTable, text, timestamp, decimal, varchar, pgEnum } from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense"]);

export const transactions = pgTable("transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  type: transactionTypeEnum("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const budgets = pgTable("budgets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  period: varchar("period", { length: 20 }).notNull().default("monthly"), // monthly, weekly, yearly
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;

