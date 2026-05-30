import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

// GET - List transactions for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'mindlife-user';

    const transactions = await db.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, type, category, description, date, userId } = body;
    const finalUserId = userId || 'mindlife-user';

    if (amount === undefined || !type || !category || !description || !date) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const transaction = await db.transaction.create({
      data: {
        id: randomUUID(),
        userId: finalUserId,
        amount: parseFloat(amount),
        type,
        category,
        description,
        date: new Date(date),
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
