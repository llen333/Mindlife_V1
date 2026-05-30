// ============================================================
// HABITS STORE - Gestion des habitudes
// ============================================================

import { create } from 'zustand';
import { Habit } from './types';
import { mapDBHabitToStore } from './mappers';

interface HabitsState {
  habits: Habit[];
  
  // Actions
  setHabits: (habits: Habit[]) => void;
  loadHabits: (userId: string) => Promise<void>;
  addHabit: (habit: Habit, userId: string) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>, userId: string) => Promise<void>;
  deleteHabit: (id: string, userId: string) => Promise<void>;
  toggleHabitComplete: (id: string, date: string) => Promise<void>;
}

export const useHabitsStore = create<HabitsState>()((set, get) => ({
  habits: [],
  
  setHabits: (habits) => set({ habits }),
  
  loadHabits: async (userId) => {
    try {
      const res = await fetch(`/api/habits?userId=${userId}`);
      const data = await res.json();
      set({ habits: (data.habits || []).map((h: any) => mapDBHabitToStore(h, h.logs || [])) });
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  },
  
  addHabit: async (habit, userId) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: habit.title,
          icon: habit.icon,
          description: habit.description,
          frequency: habit.frequency,
          color: habit.color,
          categoryId: habit.categoryId,
          userId,
        }),
      });
      const data = await res.json();
      if (data.habit) {
        set((state) => ({ habits: [...state.habits, mapDBHabitToStore(data.habit, [])] }));
      }
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  },
  
  updateHabit: async (id, updates, userId) => {
    try {
      const res = await fetch('/api/habits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: updates.title,
          icon: updates.icon,
          description: updates.description,
          frequency: updates.frequency,
          color: updates.color,
          isActive: updates.isActive,
          userId,
        }),
      });
      const data = await res.json();
      if (data.habit) {
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? mapDBHabitToStore(data.habit, []) : h)),
        }));
      }
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  },
  
  deleteHabit: async (id, userId) => {
    try {
      await fetch(`/api/habits?id=${id}&userId=${userId}`, { method: 'DELETE' });
      set((state) => ({
        habits: state.habits.filter((h) => h.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  },
  
  toggleHabitComplete: async (id, date) => {
    try {
      await fetch('/api/habit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId: id, date, completed: true }),
      });
      // Update local state
      set((state) => ({
        habits: state.habits.map((h) => {
          if (h.id === id) {
            const isCompleted = h.completedDates.includes(date);
            return {
              ...h,
              completedDates: isCompleted
                ? h.completedDates.filter((d) => d !== date)
                : [...h.completedDates, date],
              streak: isCompleted ? Math.max(0, h.streak - 1) : h.streak + 1,
            };
          }
          return h;
        }),
      }));
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  },
}));

// Sélecteurs optimisés
export const useHabits = () => useHabitsStore((state) => state.habits);
export const useActiveHabits = () => useHabitsStore((state) => 
  state.habits.filter(h => h.isActive)
);
export const useHabitById = (id: string) => useHabitsStore((state) => 
  state.habits.find(h => h.id === id)
);
