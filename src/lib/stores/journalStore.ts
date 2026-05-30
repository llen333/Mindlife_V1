// ============================================================
// JOURNAL STORE - Gestion des entrées de journal
// ============================================================

import { create } from 'zustand';
import { JournalEntry } from './types';
import { mapDBJournalToStore } from './mappers';

interface JournalState {
  journalEntries: JournalEntry[];
  
  // Actions
  setJournalEntries: (entries: JournalEntry[]) => void;
  loadJournal: (userId: string) => Promise<void>;
  addJournalEntry: (entry: JournalEntry) => Promise<void>;
  updateJournalEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;
}

export const useJournalStore = create<JournalState>()((set, get) => ({
  journalEntries: [],
  
  setJournalEntries: (entries) => set({ journalEntries: entries }),
  
  loadJournal: async (userId) => {
    try {
      const res = await fetch(`/api/journal?userId=${userId}`);
      const data = await res.json();
      set({ journalEntries: (data.entries || []).map(mapDBJournalToStore) });
    } catch (error) {
      console.error('Error loading journal:', error);
    }
  },
  
  addJournalEntry: async (entry) => {
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          gratitude: entry.gratitude,
          wins: entry.wins,
          challenges: entry.challenges,
        }),
      });
      const data = await res.json();
      if (data.entry) {
        set((state) => ({ journalEntries: [mapDBJournalToStore(data.entry), ...state.journalEntries] }));
      }
    } catch (error) {
      console.error('Error adding journal entry:', error);
    }
  },
  
  updateJournalEntry: async (id, updates) => {
    try {
      const res = await fetch('/api/journal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (data.entry) {
        set((state) => ({
          journalEntries: state.journalEntries.map((e) => (e.id === id ? mapDBJournalToStore(data.entry) : e)),
        }));
      }
    } catch (error) {
      console.error('Error updating journal entry:', error);
    }
  },
  
  deleteJournalEntry: async (id) => {
    try {
      await fetch(`/api/journal?id=${id}`, { method: 'DELETE' });
      set((state) => ({
        journalEntries: state.journalEntries.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  },
}));

// Sélecteurs optimisés
export const useJournalEntries = () => useJournalStore((state) => state.journalEntries);
export const useJournalEntryByDate = (date: string) => useJournalStore((state) => 
  state.journalEntries.find(e => e.date === date)
);
