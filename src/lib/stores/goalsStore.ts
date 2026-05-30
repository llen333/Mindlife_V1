// ============================================================
// GOALS STORE - Gestion des objectifs
// ============================================================

import { create } from 'zustand';
import { Goal } from './types';
import { mapDBGoalToStore } from './mappers';
import { useEventsStore } from './eventsStore';

interface GoalsState {
  goals: Goal[];
  
  // Actions
  setGoals: (goals: Goal[]) => void;
  loadGoals: (userId: string) => Promise<void>;
  addGoal: (goal: Goal, userId: string) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>, userId: string) => Promise<void>;
  deleteGoal: (id: string, userId: string) => Promise<void>;
}

export const useGoalsStore = create<GoalsState>()((set, get) => ({
  goals: [],
  
  setGoals: (goals) => set({ goals }),
  
  loadGoals: async (userId) => {
    try {
      const res = await fetch(`/api/goals?userId=${userId}`);
      const data = await res.json();
      set({ goals: (data.goals || []).map(mapDBGoalToStore) });
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  },
  
  addGoal: async (goal, userId) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...goal, userId }),
      });
      const data = await res.json();
      if (data.goal) {
        set((state) => ({ goals: [...state.goals, mapDBGoalToStore(data.goal)] }));
        // 🔥 Recharger les événements (l'API a créé les événements calendrier)
        await useEventsStore.getState().loadEvents(userId);
      }
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  },
  
  updateGoal: async (id, updates, userId) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates, userId }),
      });
      const data = await res.json();
      if (data.goal) {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? mapDBGoalToStore(data.goal) : g)),
        }));
        // 🔥 Recharger les événements (l'API a mis à jour les événements calendrier)
        await useEventsStore.getState().loadEvents(userId);
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  },
  
  deleteGoal: async (id, userId) => {
    try {
      await fetch(`/api/goals?id=${id}&userId=${userId}`, { method: 'DELETE' });
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
      }));
      // 🔥 Recharger les événements (l'API a supprimé les événements calendrier)
      await useEventsStore.getState().loadEvents(userId);
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  },
}));

// Sélecteurs optimisés
export const useGoals = () => useGoalsStore((state) => state.goals);
export const useGoalById = (id: string) => useGoalsStore((state) => 
  state.goals.find(g => g.id === id)
);
export const useGoalsByStatus = (status: string) => useGoalsStore((state) => 
  state.goals.filter(g => g.status === status)
);
export const useGoalsStats = () => useGoalsStore((state) => ({
  total: state.goals.length,
  completed: state.goals.filter(g => g.status === 'completed').length,
  inProgress: state.goals.filter(g => g.status === 'in_progress').length,
}));
