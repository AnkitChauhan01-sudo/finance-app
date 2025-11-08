import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { budgets } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

const budgetSchema = z.object({
  category: z.string().min(1),
  amount: z.string().min(1),
  period: z.enum(["monthly", "weekly", "yearly"]).default("monthly"),
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userBudgets = await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId));

    return NextResponse.json(userBudgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
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
    const validated = budgetSchema.parse(body);

    const newBudget = await db
      .insert(budgets)
      .values({
        userId,
        category: validated.category,
        amount: validated.amount,
        period: validated.period,
      })
      .returning();

    return NextResponse.json(newBudget[0], { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      const zodError = error as ZodError;
      const errorMessages = zodError.issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join(".") : "root";
        return `${path}: ${issue.message}`;
      }).join(", ");
      return NextResponse.json({ error: `Validation error: ${errorMessages}` }, { status: 400 });
    }
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 }
    );
  }
}

