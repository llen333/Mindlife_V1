import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserId } from '@/lib/api/get-user-id';

// GET - List events with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categoryId = searchParams.get('categoryId');
    const userId = getUserId(searchParams);

    const where: Record<string, unknown> = {
      userId,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.startAt = {};
      if (startDate) {
        (where.startAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.startAt as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const events = await db.event.findMany({
      where,
      orderBy: [
        { startAt: 'asc' },
      ],
      include: {
        Category: true,
        Task: true,
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST - Create event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, description, location, startAt, endAt, isAllDay, isRecurring,
      recurrence, reminder, color, categoryId, userId: bodyUserId,
      goalId, milestoneId  // Nouveaux champs pour lier aux objectifs
    } = body;
    const userId = bodyUserId || 'mindlife-user';

    if (!title || !startAt) {
      return NextResponse.json(
        { error: 'Title and startAt are required' },
        { status: 400 }
      );
    }

    // Validate categoryId if provided
    if (categoryId) {
      const category = await db.category.findFirst({
        where: { id: categoryId, userId }
      });
      if (!category) {
        console.log('⚠️ Category not found, creating event without category');
      }
    }

    const event = await db.event.create({
      data: {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        description,
        location,
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : undefined,
        isAllDay: isAllDay ?? false,
        isRecurring: isRecurring ?? false,
        recurrence,
        reminder,
        color,
        categoryId: categoryId || null,
        goalId: goalId || null,
        milestoneId: milestoneId || null,
        userId,
      },
      include: {
        Category: true,
        Goal: true,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// PUT - Update event
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, title, description, location, startAt, endAt, isAllDay, isRecurring,
      recurrence, reminder, color, categoryId, userId: bodyUserId,
      goalId, milestoneId  // Nouveaux champs pour lier aux objectifs
    } = body;
    const userId = bodyUserId || 'mindlife-user';

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (startAt !== undefined) updateData.startAt = new Date(startAt);
    if (endAt !== undefined) updateData.endAt = endAt ? new Date(endAt) : null;
    if (isAllDay !== undefined) updateData.isAllDay = isAllDay;
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
    if (recurrence !== undefined) updateData.recurrence = recurrence;
    if (reminder !== undefined) updateData.reminder = reminder;
    if (color !== undefined) updateData.color = color;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (goalId !== undefined) updateData.goalId = goalId || null;
    if (milestoneId !== undefined) updateData.milestoneId = milestoneId || null;

    const event = await db.event.update({
      where: { id, userId },
      data: updateData,
      include: {
        Category: true,
        Goal: true,
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE - Delete event
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = getUserId(searchParams);

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    await db.event.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
