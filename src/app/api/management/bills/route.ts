import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

// GET - List recurring bills for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'mindlife-user';

    const bills = await db.recurringBill.findMany({
      where: { userId },
      orderBy: { nextDueDate: 'asc' },
    });

    return NextResponse.json({ bills });
  } catch (error) {
    console.error('Error fetching recurring bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring bills' },
      { status: 500 }
    );
  }
}

// POST - Create a new recurring bill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, amount, category, frequency, nextDueDate, status, userId } = body;
    const finalUserId = userId || 'mindlife-user';

    if (!name || amount === undefined || !category || !frequency || !nextDueDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const bill = await db.recurringBill.create({
      data: {
        id: randomUUID(),
        userId: finalUserId,
        name,
        amount: parseFloat(amount),
        category,
        frequency,
        nextDueDate: new Date(nextDueDate),
        status: status || 'active',
      },
    });

    return NextResponse.json({ bill }, { status: 201 });
  } catch (error) {
    console.error('Error creating recurring bill:', error);
    return NextResponse.json(
      { error: 'Failed to create recurring bill' },
      { status: 500 }
    );
  }
}
