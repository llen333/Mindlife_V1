import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List notes with search and tags filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-admin';
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');
    const categoryId = searchParams.get('categoryId');
    const isPinned = searchParams.get('isPinned');
    const isArchived = searchParams.get('isArchived');

    const where: Record<string, unknown> = {
      userId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (tags) {
      where.tags = { contains: tags };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isPinned !== null) {
      where.isPinned = isPinned === 'true';
    }

    if (isArchived !== null) {
      where.isArchived = isArchived === 'true';
    }

    const notes = await db.note.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' },
      ],
      include: {
        Category: true,
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST - Create note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, type, tags, isPinned, categoryId, userId } = body;
    const finalUserId = userId || 'user-admin';

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const note = await db.note.create({
      data: {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        content,
        type: type || 'text',
        tags,
        isPinned: isPinned || false,
        categoryId,
        userId: finalUserId,
      },
      include: {
        Category: true,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

// PUT - Update note
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, type, tags, isPinned, isArchived, categoryId, userId } = body;
    const finalUserId = userId || 'user-admin';

    if (!id) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (tags !== undefined) updateData.tags = tags;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (isArchived !== undefined) updateData.isArchived = isArchived;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    const note = await db.note.update({
      where: { id, userId: finalUserId },
      data: updateData,
      include: {
        Category: true,
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

// DELETE - Delete note
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || 'user-admin';

    if (!id) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }

    await db.note.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
