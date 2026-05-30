// ============================================================
// SLEEP STORE - Gestion du sommeil
// ============================================================

import { create } from 'zustand';
import { SleepEntry } from './types';
import { mapDBSleepToStore } from './mappers';

interface SleepState {
  sleepEntries: SleepEntry[];
  
  // Actions
  setSleepEntries: (sleepEntries: SleepEntry[]) => void;
  loadSleepEntries: (userId: string) => Promise<void>;
  addSleepEntry: (entry: Omit<SleepEntry, 'id' | 'userId' | 'createdAt' | 'duration'>, userId: string) => Promise<void>;
  deleteSleepEntry: (id: string, userId: string) => Promise<void>;
}

export const useSleepStore = create<SleepState>()((set) => ({
  sleepEntries: [],
  
  setSleepEntries: (sleepEntries) => set({ sleepEntries }),
  
  loadSleepEntries: async (userId) => {
    try {
      const res = await fetch(`/api/sleep?userId=${userId}`);
      const data = await res.json();
      set({ sleepEntries: (data.sleepEntries || []).map(mapDBSleepToStore) });
    } catch (error) {
      console.error('Error loading sleep entries:', error);
    }
  },
  
  addSleepEntry: async (entry, userId) => {
    try {
      const res = await fetch('/api/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...entry, userId }),
      });
      const data = await res.json();
      if (data.sleepEntry) {
        set((state) => ({
          sleepEntries: [mapDBSleepToStore(data.sleepEntry), ...state.sleepEntries],
        }));
      }
    } catch (error) {
      console.error('Error adding sleep entry:', error);
    }
  },
  
  deleteSleepEntry: async (id, userId) => {
    try {
      await fetch(`/api/sleep?id=${id}&userId=${userId}`, { method: 'DELETE' });
      set((state) => ({
        sleepEntries: state.sleepEntries.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting sleep entry:', error);
    }
  },
}));

// Sélecteurs optimisés
export const useSleepEntries = () => useSleepStore((state) => state.sleepEntries);
