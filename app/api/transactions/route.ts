import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { transactions } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.string(),
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));

    return NextResponse.json(userTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = transactionSchema.parse(body);

    const newTransaction = await db
      .insert(transactions)
      .values({
        userId,
        type: validated.type,
        amount: validated.amount,
        category: validated.category,
        description: validated.description || null,
        date: new Date(validated.date),
      })
      .returning();

    return NextResponse.json(newTransaction[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
      return NextResponse.json({ error: `Validation error: ${errorMessages}` }, { status: 400 });
    }
    console.error("Error creating transaction:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create transaction: ${errorMessage}. Please check if the database is set up correctly.` },
      { status: 500 }
    );
  }
}

