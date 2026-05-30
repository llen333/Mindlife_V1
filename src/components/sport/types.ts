// SportPage Types

export interface Exercise {
  id: string;
  name: string;
  category: string;
  sets: number;
  reps: string;
  weight: number | null;
  completed?: boolean;
  order: number;
}

export interface ProgramDay {
  id: string;
  dayOfWeek: number;
  name: string;
  type: string;
  intensity: number | null;
  description?: string;
  estimatedDuration?: number | null;
  exercises: Exercise[];
}

export interface WeeklyProgram {
  id: string;
  name: string;
  weekNumber: number;
  year: number;
  days: ProgramDay[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  status: 'planned' | 'in_progress' | 'completed' | 'skipped';
  duration?: number;
  intensity?: number;
  rating?: number;
  notes?: string;
  exercises: Exercise[];
  day?: ProgramDay;
  date: string;
}

export interface Biometrics {
  id?: string;
  weight?: number;
  muscleMass?: number;
  bodyFat?: number;
  hydration?: number;
  heartRateRest?: number;
  hrv?: number;
  recoveryScore?: number;
  energyLevel?: number;
  date?: string;
}

export interface AtlasRecommendation {
  type: 'recovery' | 'performance';
  context?: {
    biometrics?: Biometrics | null;
    sessionsCount?: number;
    program?: WeeklyProgram | null;
  };
}
