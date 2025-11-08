import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { budgets } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const budgetSchema = z.object({
  category: z.string().optional(),
  amount: z.string().optional(),
  period: z.enum(["monthly", "weekly", "yearly"]).optional(),
});

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await db
      .delete(budgets)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json(
      { error: "Failed to delete budget" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = budgetSchema.parse(body);

    const updateData: any = {};
    if (validated.category) updateData.category = validated.category;
    if (validated.amount) updateData.amount = validated.amount;
    if (validated.period) updateData.period = validated.period;
    updateData.updatedAt = new Date();

    const updated = await db
      .update(budgets)
      .set(updateData)
      .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      const errorMessages = zodError.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
      return NextResponse.json({ error: `Validation error: ${errorMessages}` }, { status: 400 });
    }
    console.error("Error updating budget:", error);
    return NextResponse.json(
      { error: "Failed to update budget" },
      { status: 500 }
    );
  }
}

