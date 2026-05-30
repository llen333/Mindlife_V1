import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Programme par défaut
const defaultProgram = [
  { dayOfWeek: 0, name: 'POUSSÉE FORCE', type: 'workout', intensity: 88, tag: 'Banc de musculation' },
  { dayOfWeek: 1, name: 'TIRAGE FORCE', type: 'workout', intensity: 75, tag: 'Traction / Dos' },
  { dayOfWeek: 2, name: 'JAMBES VOLUME', type: 'workout', intensity: 85, tag: 'Squat / Rack' },
  { dayOfWeek: 3, name: 'ÉPAULES / ABS', type: 'workout', intensity: 80, tag: 'Développé Haltères' },
  { dayOfWeek: 4, name: 'BRAS DENSITÉ', type: 'workout', intensity: 70, tag: 'Curl Biceps' },
  { dayOfWeek: 5, name: 'CARDIO HIIT', type: 'workout', intensity: 65, tag: 'Battle ropes' },
  { dayOfWeek: 6, name: 'REPOS', type: 'rest', intensity: 0, tag: 'Yoga Zen' }
];

// GET - Récupérer le programme de la semaine
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';
    const weekNumber = parseInt(searchParams.get('week') || getCurrentWeekNumber().toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    let profile = await db.sportProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      profile = await db.sportProfile.create({
        data: { 
          id: `sportprofile-${userId}-${Date.now()}`,
          userId,
          level: 'intermediate',
          goals: JSON.stringify(['force', 'endurance']),
          preferredSports: JSON.stringify(['Musculation', 'Running']),
        }
      });
    }

    let program = await db.weeklyProgram.findFirst({
      where: {
        profileId: profile.id,
        weekNumber,
        year
      },
      include: {
        ProgramDay: {
          include: {
            DayExercise: true,
            WorkoutSession: {
              where: { status: 'completed' },
              take: 1
            }
          },
          orderBy: { dayOfWeek: 'asc' }
        }
      }
    });

    // Créer le programme par défaut s'il n'existe pas
    if (!program) {
      const programId = `program-${profile.id}-${year}-${weekNumber}`;
      program = await db.weeklyProgram.create({
        data: {
          id: programId,
          profileId: profile.id,
          name: `Semaine ${weekNumber}`,
          weekNumber,
          year,
          ProgramDay: {
            create: defaultProgram.map((day, dayIndex) => ({
              id: `${programId}-day-${dayIndex}`,
              dayOfWeek: day.dayOfWeek,
              name: day.name,
              type: day.type,
              intensity: day.intensity,
              DayExercise: {
                create: generateDefaultExercises(day, `${programId}-day-${dayIndex}`)
              }
            }))
          }
        },
        include: {
          ProgramDay: {
            include: {
              DayExercise: true,
              WorkoutSession: true
            },
            orderBy: { dayOfWeek: 'asc' }
          }
        }
      });
    }

    // Transform response for frontend compatibility
    const transformedProgram = {
      ...program,
      days: program.ProgramDay?.map(day => ({
        ...day,
        exercises: day.DayExercise || []
      })) || []
    };

    return NextResponse.json({ program: transformedProgram });
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json({ error: 'Failed to fetch program' }, { status: 500 });
  }
}

// Helper: Obtenir le numéro de semaine actuel
function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil((diff + start.getDay() * 86400000) / oneWeek);
}

// Helper: Générer les exercices par défaut pour un jour
function generateDefaultExercises(day: { name: string; type: string; tag: string }, dayId: string): Array<{
  id: string;
  name: string;
  category: string;
  sets: number;
  reps: string;
  weight: number | null;
  order: number;
}> {
  if (day.type === 'rest') {
    return [{
      id: `${dayId}-ex-0`,
      name: 'Récupération active',
      category: 'recovery',
      sets: 1,
      reps: '30min',
      weight: null,
      order: 0
    }];
  }

  const exercisesMap: Record<string, Array<{ name: string; category: string; sets: number; reps: string; weight: number | null; order: number }>> = {
    'POUSSÉE FORCE': [
      { name: 'Développé Couché', category: 'main', sets: 4, reps: '8', weight: 105, order: 0 },
      { name: 'Écarté Poulie', category: 'isolation', sets: 3, reps: '15', weight: null, order: 1 },
      { name: 'Gainage Hollow', category: 'bonus', sets: 3, reps: '60s', weight: null, order: 2 }
    ],
    'TIRAGE FORCE': [
      { name: 'Tractions', category: 'main', sets: 4, reps: '8', weight: null, order: 0 },
      { name: 'Rowing Barre', category: 'main', sets: 4, reps: '10', weight: 80, order: 1 },
      { name: 'Face Pull', category: 'isolation', sets: 3, reps: '15', weight: null, order: 2 }
    ],
    'JAMBES VOLUME': [
      { name: 'Squat', category: 'main', sets: 4, reps: '8', weight: 100, order: 0 },
      { name: 'Presse à cuisses', category: 'main', sets: 4, reps: '12', weight: 200, order: 1 },
      { name: 'Leg Extension', category: 'isolation', sets: 3, reps: '15', weight: null, order: 2 }
    ],
    'ÉPAULES / ABS': [
      { name: 'Développé Haltères', category: 'main', sets: 4, reps: '10', weight: 20, order: 0 },
      { name: 'Élévations Latérales', category: 'isolation', sets: 3, reps: '15', weight: 10, order: 1 },
      { name: 'Crunch', category: 'bonus', sets: 3, reps: '20', weight: null, order: 2 }
    ],
    'BRAS DENSITÉ': [
      { name: 'Curl Biceps', category: 'main', sets: 4, reps: '12', weight: 15, order: 0 },
      { name: 'Extension Triceps', category: 'main', sets: 4, reps: '12', weight: 20, order: 1 },
      { name: 'Hammer Curl', category: 'isolation', sets: 3, reps: '15', weight: 12, order: 2 }
    ],
    'CARDIO HIIT': [
      { name: 'Battle Ropes', category: 'main', sets: 5, reps: '30s', weight: null, order: 0 },
      { name: 'Burpees', category: 'main', sets: 3, reps: '10', weight: null, order: 1 },
      { name: 'Jump Rope', category: 'bonus', sets: 3, reps: '60s', weight: null, order: 2 }
    ]
  };

  const exercises = exercisesMap[day.name] || [];
  return exercises.map((ex, index) => ({
    id: `${dayId}-ex-${index}`,
    ...ex
  }));
}
