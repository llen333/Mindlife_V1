// Hook principal pour la page Croissance - Gestion des données
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import type { 
  GrowthHabit, GrowthGoal, GrowthJournal, GrowthRoutine,
  GrowthStats, Achievement, IdentityStatement, WeeklyReview,
  CreateHabitInput, CreateGoalInput, CreateJournalInput, CreateRoutineInput
} from '../types';

export function useGrowthData() {
  const { userProfile: user } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // Data states
  const [habits, setHabits] = useState<GrowthHabit[]>([]);
  const [goals, setGoals] = useState<GrowthGoal[]>([]);
  const [routines, setRoutines] = useState<GrowthRoutine[]>([]);
  const [journals, setJournals] = useState<GrowthJournal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [identities, setIdentities] = useState<IdentityStatement[]>([]);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReview | null>(null);
  const [stats, setStats] = useState<GrowthStats>({
    totalHabits: 0,
    activeHabits: 0,
    completedToday: 0,
    currentStreak: 0,
    bestStreak: 0,
    longestStreak: 0,
    totalCompletions: 0,
    weeklyCompletion: 0,
    monthlyCompletion: 0,
    totalXp: 0,
    level: 1,
    achievementsUnlocked: 0,
    goalsCompleted: 0,
    journalsWritten: 0,
  });

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const [habitsRes, goalsRes, routinesRes, journalsRes, achievementsRes, statsRes] = await Promise.all([
        fetch('/api/growth/habits'),
        fetch('/api/growth/goals'),
        fetch('/api/growth/routines'),
        fetch('/api/growth/journal'),
        fetch('/api/growth/achievements'),
        fetch('/api/growth/stats'),
      ]);

      const [habitsData, goalsData, routinesData, journalsData, achievementsData, statsData] = await Promise.all([
        habitsRes.json(),
        goalsRes.json(),
        routinesRes.json(),
        journalsRes.json(),
        achievementsRes.json(),
        statsRes.json(),
      ]);

      if (habitsData.success) setHabits(habitsData.data || []);
      if (goalsData.success) setGoals(goalsData.data || []);
      if (routinesData.success) setRoutines(routinesData.data || []);
      if (journalsData.success) setJournals(journalsData.data || []);
      if (achievementsData.success) setAchievements(achievementsData.data || []);
      if (statsData.success) setStats(statsData.data || stats);
    } catch (error) {
      console.error('Error fetching growth data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ============================================
  // HABITS
  // ============================================

  const addHabit = useCallback(async (input: CreateHabitInput): Promise<boolean> => {
    try {
      const res = await fetch('/api/growth/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data.success) {
        setHabits(prev => [...prev, data.data]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding habit:', error);
      return false;
    }
  }, []);

  const updateHabit = useCallback(async (id: string, input: Partial<CreateHabitInput>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/growth/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data.success) {
        setHabits(prev => prev.map(h => h.id === id ? { ...h, ...data.data } : h));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating habit:', error);
      return false;
    }
  }, []);

  const deleteHabit = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/growth/habits/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setHabits(prev => prev.filter(h => h.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting habit:', error);
      return false;
    }
  }, []);

  const toggleHabit = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/growth/habits/${id}/complete`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setHabits(prev => prev.map(h => h.id === id ? { ...h, ...data.data.habit } : h));
        setStats(prev => ({ ...prev, ...data.data.stats }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error toggling habit:', error);
      return false;
    }
  }, []);

  // ============================================
  // GOALS
  // ============================================

  const addGoal = useCallback(async (input: CreateGoalInput): Promise<boolean> => {
    try {
      const res = await fetch('/api/growth/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data.success) {
        setGoals(prev => [...prev, data.data]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding goal:', error);
      return false;
    }
  }, []);

  const updateGoal = useCallback(async (id: string, input: Partial<CreateGoalInput>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/growth/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data.success) {
        setGoals(prev => prev.map(g => g.id === id ? { ...g, ...data.data } : g));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating goal:', error);
      return false;
    }
  }, []);

  const deleteGoal = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/growth/goals/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setGoals(prev => prev.filter(g => g.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }, []);

  // ============================================
  // ROUTINES
  // ============================================

  const addRoutine = useCallback(async (input: CreateRoutineInput): Promise<boolean> => {
    try {
      const res = await fetch('/api/growth/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data.success) {
        setRoutines(prev => [...prev, data.data]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding routine:', error);
      return false;
    }
  }, []);

  const updateRoutine = useCallback(async (id: string, input: Partial<CreateRoutineInput>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/growth/routines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data.success) {
        setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...data.data } : r));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating routine:', error);
      return false;
    }
  }, []);

  const completeRoutineStep = useCallback(async (routineId: string, stepId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/growth/routines/${routineId}/steps/${stepId}/complete`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRoutines(prev => prev.map(r => r.id === routineId ? { ...r, ...data.data } : r));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error completing routine step:', error);
      return false;
    }
  }, []);

  // ============================================
  // JOURNAL
  // ============================================

  const saveJournal = useCallback(async (input: CreateJournalInput, date?: Date): Promise<boolean> => {
    try {
      const res = await fetch('/api/growth/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, date }),
      });
      const data = await res.json();
      if (data.success) {
        setJournals(prev => {
          const exists = prev.find(j => j.id === data.data.id);
          if (exists) {
            return prev.map(j => j.id === data.data.id ? data.data : j);
          }
          return [...prev, data.data];
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving journal:', error);
      return false;
    }
  }, []);

  // ============================================
  // IDENTITY
  // ============================================

  const addIdentity = useCallback(async (statement: string, category: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/growth/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statement, category }),
      });
      const data = await res.json();
      if (data.success) {
        setIdentities(prev => [...prev, data.data]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding identity:', error);
      return false;
    }
  }, []);

  const updateIdentity = useCallback(async (id: string, progress: number, evidence?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/growth/identity/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress, evidence }),
      });
      const data = await res.json();
      if (data.success) {
        setIdentities(prev => prev.map(i => i.id === id ? { ...i, ...data.data } : i));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating identity:', error);
      return false;
    }
  }, []);

  // ============================================
  // WEEKLY REVIEW
  // ============================================

  const saveWeeklyReview = useCallback(async (input: Partial<WeeklyReview>): Promise<boolean> => {
    try {
      const res = await fetch('/api/growth/weekly-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data.success) {
        setWeeklyReview(data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving weekly review:', error);
      return false;
    }
  }, []);

  return {
    // Data
    habits,
    goals,
    routines,
    journals,
    achievements,
    identities,
    weeklyReview,
    stats,
    isLoading,
    
    // Habits
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    
    // Goals
    addGoal,
    updateGoal,
    deleteGoal,
    
    // Routines
    addRoutine,
    updateRoutine,
    completeRoutineStep,
    
    // Journal
    saveJournal,
    
    // Identity
    addIdentity,
    updateIdentity,
    
    // Weekly Review
    saveWeeklyReview,
    
    // Refresh
    fetchData,
  };
}
