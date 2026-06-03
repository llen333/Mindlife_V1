import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const FALLBACK_USER_ID = 'mindlife-user';

// GET - List voice memos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || FALLBACK_USER_ID;
    const category = searchParams.get('category');
    const processed = searchParams.get('processed');
    const limit = searchParams.get('limit');

    const where: Record<string, unknown> = {
      userId,
    };

    if (category) {
      where.category = category;
    }

    if (processed !== null) {
      where.processed = processed === 'true';
    }

    const memos = await db.voiceMemo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json({ memos });
  } catch (error) {
    console.error('Error fetching voice memos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voice memos' },
      { status: 500 }
    );
  }
}

// POST - Save voice memo with transcript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, transcript, audioUrl, duration, category, processed, userId: bodyUserId } = body;
    const userId = bodyUserId || FALLBACK_USER_ID;

    if (!audioUrl && !transcript) {
      return NextResponse.json(
        { error: 'Audio URL or transcript is required' },
        { status: 400 }
      );
    }

    const memo = await db.voiceMemo.create({
      data: {
        id: `voicememo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        transcript,
        audioUrl,
        duration,
        category: category || 'note',
        processed: processed || false,
        userId,
      },
    });

    return NextResponse.json({ memo }, { status: 201 });
  } catch (error) {
    console.error('Error creating voice memo:', error);
    return NextResponse.json(
      { error: 'Failed to create voice memo' },
      { status: 500 }
    );
  }
}

// PUT - Update memo
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, transcript, audioUrl, duration, category, processed, userId: bodyUserId } = body;
    const userId = bodyUserId || FALLBACK_USER_ID;

    if (!id) {
      return NextResponse.json(
        { error: 'Memo ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (title !== undefined) updateData.title = title;
    if (transcript !== undefined) updateData.transcript = transcript;
    if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
    if (duration !== undefined) updateData.duration = duration;
    if (category !== undefined) updateData.category = category;
    if (processed !== undefined) updateData.processed = processed;

    const memo = await db.voiceMemo.update({
      where: { id, userId },
      data: updateData,
    });

    return NextResponse.json({ memo });
  } catch (error) {
    console.error('Error updating voice memo:', error);
    return NextResponse.json(
      { error: 'Failed to update voice memo' },
      { status: 500 }
    );
  }
}

// DELETE - Delete memo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || FALLBACK_USER_ID;

    if (!id) {
      return NextResponse.json(
        { error: 'Memo ID is required' },
        { status: 400 }
      );
    }

    await db.voiceMemo.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting voice memo:', error);
    return NextResponse.json(
      { error: 'Failed to delete voice memo' },
      { status: 500 }
    );
  }
}
