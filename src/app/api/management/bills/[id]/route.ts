import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

// PUT - Update a recurring bill
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.amount !== undefined) updateData.amount = parseFloat(body.amount);
    if (body.category !== undefined) updateData.category = body.category;
    if (body.frequency !== undefined) updateData.frequency = body.frequency;
    if (body.nextDueDate !== undefined) updateData.nextDueDate = new Date(body.nextDueDate);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.lastPaidDate !== undefined) updateData.lastPaidDate = body.lastPaidDate ? new Date(body.lastPaidDate) : null;
    updateData.updatedAt = new Date();

    const bill = await db.recurringBill.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ bill });
  } catch (error) {
    console.error('Error updating recurring bill:', error);
    return NextResponse.json(
      { error: 'Failed to update recurring bill' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a recurring bill
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const { id } = params;

    await db.recurringBill.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recurring bill:', error);
    return NextResponse.json(
      { error: 'Failed to delete recurring bill' },
      { status: 500 }
    );
  }
}
