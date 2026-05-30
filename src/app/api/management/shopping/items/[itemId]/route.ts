import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteContext = {
  params: Promise<{ itemId: string }> | { itemId: string };
};

// PUT - Update a shopping item (checked status or actual price)
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const { itemId } = params;
    const body = await request.json();

    const updateData: any = {};
    if (body.isChecked !== undefined) updateData.isChecked = !!body.isChecked;
    if (body.actualPrice !== undefined) updateData.actualPrice = body.actualPrice !== null ? parseFloat(body.actualPrice) : null;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.quantity !== undefined) updateData.quantity = parseInt(body.quantity, 10);
    if (body.estimatedPrice !== undefined) updateData.estimatedPrice = parseFloat(body.estimatedPrice);
    if (body.category !== undefined) updateData.category = body.category;
    updateData.updatedAt = new Date();

    const item = await db.shoppingItem.update({
      where: { id: itemId },
      data: updateData,
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error updating shopping item:', error);
    return NextResponse.json(
      { error: 'Failed to update shopping item' },
      { status: 500 }
    );
  }
}
