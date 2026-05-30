import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

// GET - List all savings goals for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'mindlife-user';

    const goals = await db.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch savings goals' },
      { status: 500 }
    );
  }
}

// POST - Create a new savings goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, targetAmount, currentAmount, deadline, icon, color, userId } = body;
    const finalUserId = userId || 'mindlife-user';

    if (!name || targetAmount === undefined) {
      return NextResponse.json(
        { error: 'Name and target amount are required' },
        { status: 400 }
      );
    }

    const goal = await db.savingsGoal.create({
      data: {
        id: randomUUID(),
        userId: finalUserId,
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : 0,
        deadline: deadline ? new Date(deadline) : null,
        icon: icon || '🏦',
        color: color || 'emerald',
        status: 'active',
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Error creating savings goal:', error);
    return NextResponse.json(
      { error: 'Failed to create savings goal' },
      { status: 500 }
    );
  }
}
