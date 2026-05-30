// ============================================================
// NOTES STORE - Gestion des notes
// ============================================================

import { create } from 'zustand';
import { Note } from './types';
import { mapDBNoteToStore } from './mappers';

interface NotesState {
  notes: Note[];
  
  // Actions
  setNotes: (notes: Note[]) => void;
  loadNotes: (userId: string) => Promise<void>;
  addNote: (note: Note, userId: string) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>, userId: string) => Promise<void>;
  deleteNote: (id: string, userId: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  
  setNotes: (notes) => set({ notes }),
  
  loadNotes: async (userId) => {
    try {
      const res = await fetch(`/api/notes?userId=${userId}`);
      const data = await res.json();
      set({ notes: (data.notes || []).map(mapDBNoteToStore) });
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  },
  
  addNote: async (note, userId) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...note, userId }),
      });
      const data = await res.json();
      if (data.note) {
        set((state) => ({ notes: [mapDBNoteToStore(data.note), ...state.notes] }));
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  },
  
  updateNote: async (id, updates, userId) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates, userId }),
      });
      const data = await res.json();
      if (data.note) {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? mapDBNoteToStore(data.note) : n)),
        }));
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  },
  
  deleteNote: async (id, userId) => {
    try {
      await fetch(`/api/notes?id=${id}&userId=${userId}`, { method: 'DELETE' });
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  },
}));

// Sélecteurs optimisés
export const useNotes = () => useNotesStore((state) => state.notes);
export const usePinnedNotes = () => useNotesStore((state) => 
  state.notes.filter(n => n.isPinned)
);
export const useNoteById = (id: string) => useNotesStore((state) => 
  state.notes.find(n => n.id === id)
);
