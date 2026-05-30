import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Récupérer les sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // planned, in_progress, completed, skipped

    const profile = await db.sportProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return NextResponse.json({ sessions: [], todaySession: null });
    }

    const whereClause: Record<string, unknown> = { profileId: profile.id };
    if (status) {
      whereClause.status = status;
    }

    const sessions = await db.workoutSession.findMany({
      where: whereClause,
      include: {
        SessionExercise: {
          orderBy: { order: 'asc' }
        },
        ProgramDay: true
      },
      orderBy: { date: 'desc' },
      take: limit
    });

    // Session du jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySession = await db.workoutSession.findFirst({
      where: {
        profileId: profile.id,
        date: { gte: today }
      },
      include: {
        SessionExercise: {
          orderBy: { order: 'asc' }
        },
        ProgramDay: true
      }
    });

    // Transform for frontend compatibility
    const transformedSessions = sessions.map(session => ({
      ...session,
      exercises: session.SessionExercise,
      day: session.ProgramDay
    }));

    const transformedTodaySession = todaySession ? {
      ...todaySession,
      exercises: todaySession.SessionExercise,
      day: todaySession.ProgramDay
    } : null;

    return NextResponse.json({ sessions: transformedSessions, todaySession: transformedTodaySession });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// POST - Créer une nouvelle session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || 'default-user';

    const profile = await db.sportProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const sessionId = `session-${profile.id}-${Date.now()}`;
    const session = await db.workoutSession.create({
      data: {
        id: sessionId,
        profileId: profile.id,
        dayId: body.dayId,
        name: body.name,
        status: body.status || 'planned',
        intensity: body.intensity,
        SessionExercise: body.exercises ? {
          create: body.exercises.map((ex: { name: string; sets: number; reps: string; weight?: number; order: number }, i: number) => ({
            id: `${sessionId}-ex-${i}`,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight || null,
            order: ex.order || i
          }))
        } : undefined
      },
      include: {
        SessionExercise: true
      }
    });

    // Transform for frontend compatibility
    const transformedSession = {
      ...session,
      exercises: session.SessionExercise
    };

    return NextResponse.json({ session: transformedSession });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// PUT - Mettre à jour une session (démarrer, terminer, etc.)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, status, duration, intensity, rating, notes, exercises } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (duration) updateData.duration = duration;
    if (intensity) updateData.intensity = intensity;
    if (rating) updateData.rating = rating;
    if (notes) updateData.notes = notes;

    const session = await db.workoutSession.update({
      where: { id: sessionId },
      data: updateData,
      include: {
        SessionExercise: true
      }
    });

    // Mettre à jour les exercices si fournis
    if (exercises && Array.isArray(exercises)) {
      for (const ex of exercises) {
        if (ex.id) {
          await db.sessionExercise.update({
            where: { id: ex.id },
            data: {
              completed: ex.completed,
              weight: ex.weight,
              reps: ex.reps
            }
          });
        }
      }
    }

    // Transform for frontend compatibility
    const transformedSession = {
      ...session,
      exercises: session.SessionExercise
    };

    return NextResponse.json({ session: transformedSession });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
