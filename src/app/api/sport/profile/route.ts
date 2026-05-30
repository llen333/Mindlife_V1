import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Récupérer le profil sportif
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';
    
    let profile = await db.sportProfile.findUnique({
      where: { userId },
      include: {
        sportGoals: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    // Créer le profil s'il n'existe pas
    if (!profile) {
      profile = await db.sportProfile.create({
        data: {
          userId,
          level: 'intermediate',
          goals: JSON.stringify(['force', 'hypertrophie']),
          preferredSports: JSON.stringify(['musculation', 'cardio'])
        },
        include: {
          sportGoals: true
        }
      });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching sport profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT - Mettre à jour le profil sportif
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || 'default-user';
    
    const { level, goals, preferredSports } = body;

    const profile = await db.sportProfile.upsert({
      where: { userId },
      update: {
        level: level || undefined,
        goals: goals ? JSON.stringify(goals) : undefined,
        preferredSports: preferredSports ? JSON.stringify(preferredSports) : undefined
      },
      create: {
        userId,
        level: level || 'intermediate',
        goals: JSON.stringify(goals || []),
        preferredSports: JSON.stringify(preferredSports || [])
      }
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error updating sport profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
