import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List habits with completion status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-admin';
    const date = searchParams.get('date');
    const categoryId = searchParams.get('categoryId');

    const where: Record<string, unknown> = {
      userId,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const habits = await db.habit.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        Category: true,
        HabitLog: {
          where: date ? {
            date: {
              gte: new Date(date + 'T00:00:00'),
              lte: new Date(date + 'T23:59:59'),
            },
          } : {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
      },
    });

    // Add completion status for today or specified date
    const habitsWithStatus = habits.map((habit) => ({
      ...habit,
      completedToday: habit.HabitLog.length > 0 && habit.HabitLog[0].completed,
      logId: habit.HabitLog.length > 0 ? habit.HabitLog[0].id : null,
    }));

    return NextResponse.json({ habits: habitsWithStatus });
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 }
    );
  }
}

// POST - Create habit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, frequency, targetDays, color, icon, categoryId, userId } = body;
    const finalUserId = userId || 'user-admin';

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const habit = await db.habit.create({
      data: {
        id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        frequency: frequency || 'daily',
        targetDays,
        color,
        icon,
        categoryId,
        userId: finalUserId,
      },
      include: {
        Category: true,
      },
    });

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    );
  }
}

// PUT - Update habit
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, frequency, targetDays, color, icon, isActive, categoryId, userId } = body;
    const finalUserId = userId || 'user-admin';

    if (!id) {
      return NextResponse.json(
        { error: 'Habit ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (targetDays !== undefined) updateData.targetDays = targetDays;
    if (color !== undefined) updateData.color = color;
    if (icon !== undefined) updateData.icon = icon;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    const habit = await db.habit.update({
      where: { id, userId: finalUserId },
      data: updateData,
      include: {
        Category: true,
      },
    });

    return NextResponse.json({ habit });
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json(
      { error: 'Failed to update habit' },
      { status: 500 }
    );
  }
}

// DELETE - Delete habit
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || 'user-admin';

    if (!id) {
      return NextResponse.json(
        { error: 'Habit ID is required' },
        { status: 400 }
      );
    }

    await db.habit.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { error: 'Failed to delete habit' },
      { status: 500 }
    );
  }
}
