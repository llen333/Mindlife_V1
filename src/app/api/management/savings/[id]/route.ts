import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

// PUT - Update a savings goal
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const { id } = params;
    const body = await request.json();
    
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.targetAmount !== undefined) updateData.targetAmount = parseFloat(body.targetAmount);
    if (body.currentAmount !== undefined) updateData.currentAmount = parseFloat(body.currentAmount);
    if (body.deadline !== undefined) updateData.deadline = body.deadline ? new Date(body.deadline) : null;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.status !== undefined) updateData.status = body.status;
    updateData.updatedAt = new Date();

    const goal = await db.savingsGoal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Error updating savings goal:', error);
    return NextResponse.json(
      { error: 'Failed to update savings goal' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a savings goal
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const { id } = params;

    await db.savingsGoal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete savings goal' },
      { status: 500 }
    );
  }
}
