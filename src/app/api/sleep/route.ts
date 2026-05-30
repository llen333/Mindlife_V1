import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

// GET - List sleep entries for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-admin';
    const limit = searchParams.get('limit');

    const where = { userId };

    const sleepEntries = await db.sleepEntry.findMany({
      where,
      orderBy: [
        { date: 'desc' },
      ],
      take: limit ? parseInt(limit, 10) : undefined,
    });

    return NextResponse.json({ sleepEntries });
  } catch (error) {
    console.error('Error fetching sleep entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sleep entries' },
      { status: 500 }
    );
  }
}

// POST - Log a new sleep entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, date, bedtime, wakeup, quality, notes, userId } = body;
    const finalUserId = userId || 'user-admin';

    if (!bedtime || !wakeup || quality === undefined) {
      return NextResponse.json(
        { error: 'Bedtime, wakeup, and quality are required' },
        { status: 400 }
      );
    }

    // Parse dates to calculate duration
    const bedDate = new Date(bedtime);
    const wakeDate = new Date(wakeup);
    const durationHours = (wakeDate.getTime() - bedDate.getTime()) / (1000 * 60 * 60);

    const sleepEntry = await db.sleepEntry.create({
      data: {
        id: id || randomUUID(),
        userId: finalUserId,
        date: date ? new Date(date) : new Date(wakeDate.toISOString().split('T')[0]),
        bedtime: bedDate,
        wakeup: wakeDate,
        duration: Math.round(durationHours * 10) / 10,
        quality: parseInt(quality, 10),
        notes: notes || null,
      },
    });

    return NextResponse.json({ sleepEntry }, { status: 201 });
  } catch (error) {
    console.error('Error creating sleep entry:', error);
    return NextResponse.json(
      { error: 'Failed to create sleep entry' },
      { status: 500 }
    );
  }
}

// PUT - Update a sleep entry
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, date, bedtime, wakeup, quality, notes, userId } = body;
    const finalUserId = userId || 'user-admin';

    if (!id) {
      return NextResponse.json(
        { error: 'Sleep entry ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
    if (date !== undefined) updateData.date = new Date(date);
    
    if (bedtime !== undefined || wakeup !== undefined) {
      // If either is updated, re-fetch or use values to calculate duration
      const existing = await db.sleepEntry.findFirst({
        where: { id, userId: finalUserId },
      });
      if (!existing) {
        return NextResponse.json({ error: 'Sleep entry not found' }, { status: 404 });
      }

      const finalBedtime = bedtime ? new Date(bedtime) : existing.bedtime;
      const finalWakeup = wakeup ? new Date(wakeup) : existing.wakeup;
      
      updateData.bedtime = finalBedtime;
      updateData.wakeup = finalWakeup;
      const durationHours = (finalWakeup.getTime() - finalBedtime.getTime()) / (1000 * 60 * 60);
      updateData.duration = Math.round(durationHours * 10) / 10;
    }

    if (quality !== undefined) updateData.quality = parseInt(quality, 10);
    if (notes !== undefined) updateData.notes = notes;

    const sleepEntry = await db.sleepEntry.update({
      where: { id, userId: finalUserId },
      data: updateData,
    });

    return NextResponse.json({ sleepEntry });
  } catch (error) {
    console.error('Error updating sleep entry:', error);
    return NextResponse.json(
      { error: 'Failed to update sleep entry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a sleep entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || 'user-admin';

    if (!id) {
      return NextResponse.json(
        { error: 'Sleep entry ID is required' },
        { status: 400 }
      );
    }

    await db.sleepEntry.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sleep entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete sleep entry' },
      { status: 500 }
    );
  }
}
