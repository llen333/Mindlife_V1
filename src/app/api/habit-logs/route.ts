import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const FALLBACK_USER_ID = 'user-admin';

// GET - Get logs for date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || FALLBACK_USER_ID;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const habitId = searchParams.get('habitId');

    const where: Record<string, unknown> = {
      userId,
    };

    if (habitId) {
      where.habitId = habitId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        (where.date as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.date as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const logs = await db.habitLog.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        Habit: {
          include: {
            Category: true,
          },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching habit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch habit logs' },
      { status: 500 }
    );
  }
}

// POST - Log habit completion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { habitId, date, completed, note, userId: bodyUserId } = body;
    const userId = bodyUserId || FALLBACK_USER_ID;

    if (!habitId) {
      return NextResponse.json(
        { error: 'Habit ID is required' },
        { status: 400 }
      );
    }

    const logDate = date ? new Date(date) : new Date();
    // Normalize to start of day
    const normalizedDate = new Date(logDate.setHours(0, 0, 0, 0));

    // Check if log already exists for this habit and date
    const existingLog = await db.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: normalizedDate,
        },
      },
    });

    if (existingLog) {
      // Update existing log
      const updatedLog = await db.habitLog.update({
        where: { id: existingLog.id },
        data: {
          completed: completed ?? true,
          note,
        },
        include: {
          Habit: true,
        },
      });
      return NextResponse.json({ log: updatedLog });
    }

    // Create new log
    const log = await db.habitLog.create({
      data: {
        id: `habitlog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        habitId,
        date: normalizedDate,
        completed: completed ?? true,
        note,
        userId,
      },
      include: {
        Habit: true,
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error('Error creating habit log:', error);
    return NextResponse.json(
      { error: 'Failed to create habit log' },
      { status: 500 }
    );
  }
}

// PUT - Update log
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, completed, note, userId: bodyUserId } = body;
    const userId = bodyUserId || FALLBACK_USER_ID;

    if (!id) {
      return NextResponse.json(
        { error: 'Log ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (completed !== undefined) updateData.completed = completed;
    if (note !== undefined) updateData.note = note;

    const log = await db.habitLog.update({
      where: { id, userId },
      data: updateData,
      include: {
        Habit: true,
      },
    });

    return NextResponse.json({ log });
  } catch (error) {
    console.error('Error updating habit log:', error);
    return NextResponse.json(
      { error: 'Failed to update habit log' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a habit log
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || FALLBACK_USER_ID;

    if (!id) {
      return NextResponse.json(
        { error: 'Log ID is required' },
        { status: 400 }
      );
    }

    await db.habitLog.delete({ where: { id, userId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit log:', error);
    return NextResponse.json(
      { error: 'Failed to delete habit log' },
      { status: 500 }
    );
  }
}
