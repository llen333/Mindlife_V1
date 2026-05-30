import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

type RouteContext = {
  params: Promise<{ listId: string }> | { listId: string };
};

// POST - Add a new item to an existing shopping list
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;
    const { listId } = params;
    const body = await request.json();
    const { name, quantity, estimatedPrice, category } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Item name is required' },
        { status: 400 }
      );
    }

    const item = await db.shoppingItem.create({
      data: {
        id: randomUUID(),
        listId,
        name,
        quantity: quantity !== undefined ? parseInt(quantity, 10) : 1,
        estimatedPrice: estimatedPrice !== undefined ? parseFloat(estimatedPrice) : 0,
        category: category || 'Général',
        isChecked: false,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error adding item to shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to add item to shopping list' },
      { status: 500 }
    );
  }
}
