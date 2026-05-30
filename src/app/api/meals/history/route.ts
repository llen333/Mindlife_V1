import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/meals/history - Get available weeks with meals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Get all meals for the user
    const meals = await db.meal.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: 'desc' },
    });

    // Calculate week offsets
    const today = new Date();
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - today.getDay());

    const weeks: { offset: number; count: number }[] = [];
    const weekMap = new Map<number, number>();

    meals.forEach((meal) => {
      const mealDate = new Date(meal.date);
      const diffDays = Math.floor((startOfCurrentWeek.getTime() - mealDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const offset = -diffDays;
      
      weekMap.set(offset, (weekMap.get(offset) || 0) + 1);
    });

    weekMap.forEach((count, offset) => {
      if (offset !== 0) { // Don't include current week
        weeks.push({ offset, count });
      }
    });

    weeks.sort((a, b) => b.offset - a.offset);

    return NextResponse.json({ weeks });
  } catch (error) {
    console.error('Error loading meal history:', error);
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 });
  }
}
