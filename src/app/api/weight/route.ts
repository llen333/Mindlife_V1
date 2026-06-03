import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List weight entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'mindlife-user';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');

    const where: Record<string, unknown> = {
      userId,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        (where.date as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.date as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const entries = await db.weightEntry.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching weight entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weight entries' },
      { status: 500 }
    );
  }
}

// POST - Create weight entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weight, date, note, userId } = body;
    const finalUserId = userId || 'mindlife-user';

    if (!weight) {
      return NextResponse.json(
        { error: 'Weight is required' },
        { status: 400 }
      );
    }

    const entry = await db.weightEntry.create({
      data: {
        id: `weight-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        weight: parseFloat(weight),
        date: date ? new Date(date) : new Date(),
        note,
        userId: finalUserId,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Error creating weight entry:', error);
    return NextResponse.json(
      { error: 'Failed to create weight entry' },
      { status: 500 }
    );
  }
}

// PUT - Update weight entry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, weight, date, note, userId } = body;
    const finalUserId = userId || 'mindlife-user';

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (weight !== undefined) updateData.weight = parseFloat(weight);
    if (date !== undefined) updateData.date = new Date(date);
    if (note !== undefined) updateData.note = note;

    const entry = await db.weightEntry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error updating weight entry:', error);
    return NextResponse.json(
      { error: 'Failed to update weight entry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete weight entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    await db.weightEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting weight entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete weight entry' },
      { status: 500 }
    );
  }
}
