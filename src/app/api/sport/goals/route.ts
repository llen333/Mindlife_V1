import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Récupérer les objectifs sportifs
export async function GET() {
  try {
    const userId = 'default-user';

    const profile = await db.sportProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return NextResponse.json({ goals: [] });
    }

    const goals = await db.sportGoal.findMany({
      where: { profileId: profile.id },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Error fetching sport goals:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

// POST - Créer un objectif
export async function POST(request: NextRequest) {
  try {
    const userId = 'default-user';
    const body = await request.json();

    const profile = await db.sportProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const goal = await db.sportGoal.create({
      data: {
        id: `sport-goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        profileId: profile.id,
        name: body.name,
        description: body.description,
        type: body.type || 'strength',
        targetValue: body.targetValue,
        currentValue: body.currentValue || 0,
        unit: body.unit,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        progress: body.progress || 0
      }
    });

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

// PUT - Mettre à jour un objectif
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { goalId, ...updates } = body;

    const goal = await db.sportGoal.update({
      where: { id: goalId },
      data: {
        ...updates,
        endDate: updates.endDate ? new Date(updates.endDate) : undefined
      }
    });

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

// DELETE - Supprimer un objectif
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('id');

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
    }

    await db.sportGoal.delete({
      where: { id: goalId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
