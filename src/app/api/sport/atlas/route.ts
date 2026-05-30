import { NextRequest, NextResponse } from 'next/server';
import { aiChat } from '@/lib/ai-provider';
import {
  getExercisesByMuscle,
  getWorkoutProgram,
  getWeeklyProgram,
  generateQuickWorkout,
} from '@/lib/sport-fallback';

// GET - Get exercises, programs, or advice
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'program';
    const muscle = searchParams.get('muscle');
    const level = searchParams.get('level') || 'intermédiaire';
    const duration = searchParams.get('duration');

    switch (action) {
      case 'exercises':
        if (!muscle) {
          return NextResponse.json(
            { error: 'Paramètre muscle requis' },
            { status: 400 }
          );
        }
        const exercises = getExercisesByMuscle(muscle);
        return NextResponse.json({ exercises });

      case 'program':
        const program = getWorkoutProgram(level);
        return NextResponse.json({ program });

      case 'weekly':
        const weeklyProgram = getWeeklyProgram();
        return NextResponse.json({ schedule: weeklyProgram });

      case 'quick':
        const quickWorkout = generateQuickWorkout(parseInt(duration || '30'));
        return NextResponse.json({ workout: quickWorkout });

      default:
        const defaultProgram = getWorkoutProgram(level);
        return NextResponse.json({ program: defaultProgram });
    }
  } catch (error) {
    console.error('Sport atlas error:', error);
    return NextResponse.json({ program: getWorkoutProgram('intermédiaire') });
  }
}

// POST - Generate custom workout or get advice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, query, level, duration, muscles } = body;

    // Construire le message utilisateur
    const userMessage = query || `Créer un programme ${type || 'sport'} de ${duration || 30} minutes`;

    // Utiliser le provider configuré pour sport
    const result = await aiChat(userMessage, {
      func: 'sport',
      history: [],
    });

    if (result.success && result.content && result.provider !== 'local') {
      return NextResponse.json({ advice: result.content, provider: result.provider });
    }

    // Fallback local
    let fallbackContent: string;
    
    switch (type) {
      case 'exercises':
        const exerciseList = muscles
          ? muscles.flatMap((m: string) => getExercisesByMuscle(m))
          : getExercisesByMuscle('full body');
        fallbackContent = `Voici quelques exercices : ${exerciseList.slice(0, 5).map((e: any) => e.name).join(', ')}`;
        break;

      case 'program':
        const program = getWorkoutProgram(level || 'intermédiaire');
        fallbackContent = `Programme : ${program.name} (${program.duration})`;
        break;

      case 'quick':
        const quick = generateQuickWorkout(duration || 30);
        fallbackContent = `Workout express : ${quick.name}`;
        break;

      default:
        const defaultProgram = getWorkoutProgram(level || 'intermédiaire');
        fallbackContent = `Programme recommandé : ${defaultProgram.name} (${defaultProgram.duration}). Dis-moi ce que tu veux travailler !`;
    }

    return NextResponse.json({ advice: fallbackContent, provider: 'local' });

  } catch (error) {
    console.error('Sport atlas POST error:', error);
    
    const program = getWorkoutProgram('intermédiaire');
    return NextResponse.json({ program, provider: 'local' });
  }
}
