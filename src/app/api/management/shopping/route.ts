import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

// GET - List all shopping lists for a user, including their items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'mindlife-user';

    const lists = await db.shoppingList.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ lists });
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shopping lists' },
      { status: 500 }
    );
  }
}

// POST - Create a new shopping list and its items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, budget, items, scheduledDate, userId } = body;
    const finalUserId = userId || 'mindlife-user';

    if (!name || budget === undefined) {
      return NextResponse.json(
        { error: 'Name and budget are required' },
        { status: 400 }
      );
    }

    const listId = randomUUID();

    // Create shopping list inside a transaction with its items
    const list = await db.$transaction(async (tx) => {
      const createdList = await tx.shoppingList.create({
        data: {
          id: listId,
          userId: finalUserId,
          name,
          budget: parseFloat(budget),
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        },
      });

      if (items && Array.isArray(items) && items.length > 0) {
        await tx.shoppingItem.createMany({
          data: items.map((item: any) => ({
            id: randomUUID(),
            listId,
            name: item.name,
            quantity: item.quantity !== undefined ? parseInt(item.quantity, 10) : 1,
            estimatedPrice: item.estimatedPrice !== undefined ? parseFloat(item.estimatedPrice) : 0,
            actualPrice: item.actualPrice !== undefined && item.actualPrice !== null ? parseFloat(item.actualPrice) : null,
            category: item.category || 'Général',
            isChecked: !!item.isChecked,
          })),
        });
      }

      // Re-fetch with items
      return tx.shoppingList.findUnique({
        where: { id: listId },
        include: { items: true },
      });
    });

    return NextResponse.json({ list }, { status: 201 });
  } catch (error) {
    console.error('Error creating shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to create shopping list' },
      { status: 500 }
    );
  }
}
