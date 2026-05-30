'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================
// TYPES
// ============================================

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

export interface WorkoutSession {
  id: string;
  name: string;
  status: 'planned' | 'in_progress' | 'completed' | 'skipped';
  duration?: number;
  intensity?: number;
  rating?: number;
  notes?: string;
  exercises: Exercise[];
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

export interface WeeklyProgram {
  id: string;
  name: string;
  weekNumber: number;
  year: number;
  days: ProgramDay[];
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

export interface AtlasRecommendation {
  message: string;
  type: 'info' | 'warning' | 'success';
  actions?: string[];
}

// ============================================
// QUERY KEYS
// ============================================

export const sportKeys = {
  all: ['sport'] as const,
  program: (userId: string) => [...sportKeys.all, 'program', userId] as const,
  sessions: (userId: string) => [...sportKeys.all, 'sessions', userId] as const,
  session: (sessionId: string) => [...sportKeys.all, 'session', sessionId] as const,
  todaySession: (userId: string) =>
    [...sportKeys.all, 'todaySession', userId] as const,
  biometrics: (userId: string) => [...sportKeys.all, 'biometrics', userId] as const,
  biometricsHistory: (userId: string, days: number) =>
    [...sportKeys.all, 'biometrics', userId, 'history', days] as const,
  atlas: (userId: string) => [...sportKeys.all, 'atlas', userId] as const,
};

// ============================================
// FETCHERS
// ============================================

const fetchProgram = async (userId: string): Promise<WeeklyProgram | null> => {
  const res = await fetch(`/api/sport/program?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch program');
  const data = await res.json();
  return data.program;
};

const fetchTodaySession = async (
  userId: string
): Promise<WorkoutSession | null> => {
  const res = await fetch(`/api/sport/session?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch today session');
  const data = await res.json();
  return data.todaySession;
};

const fetchSessionsHistory = async (
  userId: string
): Promise<WorkoutSession[]> => {
  const res = await fetch(`/api/sport/sessions?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  const data = await res.json();
  return data.sessions || [];
};

const fetchBiometrics = async (
  userId: string,
  days: number = 150
): Promise<{ latest: Biometrics | null; biometrics: Biometrics[] }> => {
  const res = await fetch(`/api/sport/biometrics?userId=${userId}&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch biometrics');
  return res.json();
};

const fetchAtlasRecommendation = async (
  userId: string
): Promise<AtlasRecommendation> => {
  const res = await fetch(`/api/sport/atlas?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch Atlas recommendation');
  const data = await res.json();
  return {
    message: data.recommendation || 'Aucune recommandation disponible',
    type: 'info',
  };
};

const startSession = async ({
  userId,
  dayId,
  name,
  intensity,
  exercises,
}: {
  userId: string;
  dayId: string;
  name: string;
  intensity?: number;
  exercises: Omit<Exercise, 'id'>[];
}): Promise<WorkoutSession> => {
  const res = await fetch('/api/sport/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, dayId, name, intensity, exercises }),
  });
  if (!res.ok) throw new Error('Failed to start session');
  const data = await res.json();
  return data.session;
};

const updateSession = async ({
  sessionId,
  exercises,
  status,
  duration,
}: {
  sessionId: string;
  exercises?: Exercise[];
  status?: string;
  duration?: number;
}): Promise<WorkoutSession> => {
  const res = await fetch('/api/sport/session', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, exercises, status, duration }),
  });
  if (!res.ok) throw new Error('Failed to update session');
  const data = await res.json();
  return data.session;
};

const updateBiometrics = async ({
  userId,
  data,
}: {
  userId: string;
  data: Biometrics;
}): Promise<Biometrics> => {
  const res = await fetch('/api/sport/biometrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...data }),
  });
  if (!res.ok) throw new Error('Failed to update biometrics');
  const result = await res.json();
  return result.biometrics;
};

// ============================================
// HOOKS
// ============================================

// ID utilisateur par défaut (à remplacer par le vrai système d'auth)
const DEFAULT_USER_ID = 'user-admin';

/**
 * Hook pour récupérer le programme hebdomadaire
 */
export function useWeeklyProgram(userId: string = DEFAULT_USER_ID) {
  return useQuery({
    queryKey: sportKeys.program(userId),
    queryFn: () => fetchProgram(userId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook pour récupérer la session du jour
 */
export function useTodaySession(userId: string = DEFAULT_USER_ID) {
  return useQuery({
    queryKey: sportKeys.todaySession(userId),
    queryFn: () => fetchTodaySession(userId),
    staleTime: 30 * 1000, // 30 secondes (refresh fréquent pendant workout)
  });
}

/**
 * Hook pour récupérer l'historique des sessions
 */
export function useSessionsHistory(userId: string = DEFAULT_USER_ID) {
  return useQuery({
    queryKey: sportKeys.sessions(userId),
    queryFn: () => fetchSessionsHistory(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook pour récupérer les biométries
 */
export function useBiometrics(
  userId: string = DEFAULT_USER_ID,
  days: number = 150
) {
  return useQuery({
    queryKey: sportKeys.biometricsHistory(userId, days),
    queryFn: () => fetchBiometrics(userId, days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook pour récupérer la recommandation Atlas (IA)
 */
export function useAtlasRecommendation(userId: string = DEFAULT_USER_ID) {
  return useQuery({
    queryKey: sportKeys.atlas(userId),
    queryFn: () => fetchAtlasRecommendation(userId),
    staleTime: 30 * 60 * 1000, // 30 minutes (analyse IA coûteuse)
    enabled: false, // Lazy loading par défaut
  });
}

/**
 * Hook pour démarrer une session de workout
 */
export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startSession,

    onSuccess: (newSession, { userId }) => {
      // Mettre à jour le cache de la session du jour
      queryClient.setQueryData(
        sportKeys.todaySession(userId),
        newSession
      );

      // Invalider l'historique des sessions
      queryClient.invalidateQueries({
        queryKey: sportKeys.sessions(userId),
      });
    },
  });
}

/**
 * Hook pour mettre à jour une session (exercices, statut, durée)
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSession,

    onSuccess: (updatedSession) => {
      // Mettre à jour le cache
      queryClient.setQueryData(
        sportKeys.session(updatedSession.id),
        updatedSession
      );

      // Invalider les requêtes liées
      queryClient.invalidateQueries({
        queryKey: sportKeys.all,
      });
    },
  });
}

/**
 * Hook pour compléter un exercice dans une session
 * Optimistic update pour une UX fluide
 */
export function useToggleExerciseComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      exerciseId,
      completed,
    }: {
      sessionId: string;
      exerciseId: string;
      completed: boolean;
    }) => {
      // Récupérer la session actuelle
      const session = queryClient.getQueryData<WorkoutSession>(
        sportKeys.session(sessionId)
      );
      
      if (!session) throw new Error('Session not found');

      // Mettre à jour l'exercice
      const updatedExercises = session.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, completed } : ex
      );

      return updateSession({ sessionId, exercises: updatedExercises });
    },

    onMutate: async ({ sessionId, exerciseId, completed }) => {
      await queryClient.cancelQueries({
        queryKey: sportKeys.session(sessionId),
      });

      const previousSession = queryClient.getQueryData<WorkoutSession>(
        sportKeys.session(sessionId)
      );

      if (previousSession) {
        queryClient.setQueryData<WorkoutSession>(
          sportKeys.session(sessionId),
          {
            ...previousSession,
            exercises: previousSession.exercises.map((ex) =>
              ex.id === exerciseId ? { ...ex, completed } : ex
            ),
          }
        );
      }

      return { previousSession };
    },

    onError: (err, { sessionId }, context) => {
      if (context?.previousSession) {
        queryClient.setQueryData(
          sportKeys.session(sessionId),
          context.previousSession
        );
      }
    },
  });
}

/**
 * Hook pour mettre à jour les biométries
 */
export function useUpdateBiometrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBiometrics,

    onSuccess: (_, { userId }) => {
      // Invalider les caches biométries
      queryClient.invalidateQueries({
        queryKey: sportKeys.biometrics(userId),
      });
      queryClient.invalidateQueries({
        queryKey: sportKeys.atlas(userId),
      });
    },
  });
}

/**
 * Hook pour invalider tout le cache sport
 */
export function useInvalidateSportCache() {
  const queryClient = useQueryClient();

  return (userId?: string) => {
    if (userId) {
      queryClient.invalidateQueries({
        queryKey: sportKeys.all,
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: sportKeys.all,
      });
    }
  };
}
