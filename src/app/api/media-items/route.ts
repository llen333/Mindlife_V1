// API Media Items - CRUD pour vidéos/audio
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Récupérer tous les médias d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'mindlife-user';
    const type = searchParams.get('type'); // 'video' ou 'audio'
    const source = searchParams.get('source');
    const category = searchParams.get('category');

    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;
    if (source) where.source = source;
    if (category) where.category = category;

    const items = await db.mediaItem.findMany({
      where,
      orderBy: [
        { isFavorite: 'desc' },
        { lastPlayed: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching media items:', error);
    return NextResponse.json({ error: 'Failed to fetch media items' }, { status: 500 });
  }
}

// POST - Créer un nouveau média
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId = 'mindlife-user',
      title,
      author,
      type = 'video',
      url,
      imageUrl,
      description,
      source,
      category,
      duration,
    } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    const id = `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const item = await db.mediaItem.create({
      data: {
        id,
        userId,
        title,
        author,
        type,
        url,
        imageUrl,
        description,
        source,
        category,
        duration,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error creating media item:', error);
    return NextResponse.json({ error: 'Failed to create media item' }, { status: 500 });
  }
}

// PUT - Mettre à jour un média
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const item = await db.mediaItem.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error updating media item:', error);
    return NextResponse.json({ error: 'Failed to update media item' }, { status: 500 });
  }
}

// DELETE - Supprimer un média
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // deleteMany ne lève pas d'erreur si l'enregistrement n'existe pas
    // (contrairement à delete qui lance P2025 pour les ressources statiques)
    await db.mediaItem.deleteMany({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media item:', error);
    return NextResponse.json({ error: 'Failed to delete media item' }, { status: 500 });
  }
}
