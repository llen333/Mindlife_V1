import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFAULT_USER_ID } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || DEFAULT_USER_ID;
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = { userId };

    if (date) {
      const target = new Date(date);
      where.date = {
        gte: new Date(target.getFullYear(), target.getMonth(), target.getDate()),
        lt: new Date(target.getFullYear(), target.getMonth(), target.getDate() + 1),
      };
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const plans = await db.mealPlan.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meal plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, meals, totalCalories, notes, userId } = body;
    const finalUserId = userId || DEFAULT_USER_ID;

    if (!date || !meals) {
      return NextResponse.json(
        { error: 'Date and meals are required' },
        { status: 400 }
      );
    }

    const plan = await db.mealPlan.create({
      data: {
        id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: finalUserId,
        date: new Date(date),
        meals: typeof meals === 'string' ? meals : JSON.stringify(meals),
        totalCalories: totalCalories || 0,
        notes: notes || null,
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error('Error creating meal plan:', error);
    return NextResponse.json(
      { error: 'Failed to create meal plan' },
      { status: 500 }
    );
  }
}
