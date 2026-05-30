import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List journal entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-admin';
    const mood = searchParams.get('mood');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    const where: Record<string, unknown> = {
      userId,
    };

    if (mood) {
      where.mood = mood;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const entries = await db.journalEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

// POST - Create journal entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, mood, gratitude, wins, challenges, userId } = body;
    const finalUserId = userId || 'user-admin';

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const entry = await db.journalEntry.create({
      data: {
        title,
        content,
        mood,
        gratitude,
        wins,
        challenges,
        userId: finalUserId,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}

// PUT - Update journal entry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, mood, gratitude, wins, challenges, userId } = body;
    const finalUserId = userId || 'user-admin';

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (mood !== undefined) updateData.mood = mood;
    if (gratitude !== undefined) updateData.gratitude = gratitude;
    if (wins !== undefined) updateData.wins = wins;
    if (challenges !== undefined) updateData.challenges = challenges;

    const entry = await db.journalEntry.update({
      where: { id, userId: finalUserId },
      data: updateData,
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to update journal entry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete journal entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || 'user-admin';

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    await db.journalEntry.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
}
