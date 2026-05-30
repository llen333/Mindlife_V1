import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

// PUT - Update a transaction
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    
    const updateData: any = {};
    if (body.amount !== undefined) updateData.amount = parseFloat(body.amount);
    if (body.type !== undefined) updateData.type = body.type;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.date !== undefined) updateData.date = new Date(body.date);
    updateData.updatedAt = new Date();

    const transaction = await db.transaction.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a transaction
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const { id } = params;

    await db.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
