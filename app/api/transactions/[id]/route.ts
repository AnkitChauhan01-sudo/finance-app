import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { transactions } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  amount: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
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
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
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
    const validated = transactionSchema.parse(body);

    const updateData: any = {};
    if (validated.type) updateData.type = validated.type;
    if (validated.amount) updateData.amount = validated.amount;
    if (validated.category) updateData.category = validated.category;
    if (validated.description !== undefined) updateData.description = validated.description || null;
    if (validated.date) updateData.date = new Date(validated.date);
    updateData.updatedAt = new Date();

    const updated = await db
      .update(transactions)
      .set(updateData)
      .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

