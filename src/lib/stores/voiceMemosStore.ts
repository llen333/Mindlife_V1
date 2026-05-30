// ============================================================
// VOICE MEMOS STORE - Gestion des mémos vocaux (local only)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VoiceMemo } from './types';

interface VoiceMemosState {
  voiceMemos: VoiceMemo[];
  
  // Actions
  addVoiceMemo: (memo: VoiceMemo) => void;
  updateVoiceMemo: (id: string, updates: Partial<VoiceMemo>) => void;
  deleteVoiceMemo: (id: string) => void;
}

export const useVoiceMemosStore = create<VoiceMemosState>()(
  persist(
    (set) => ({
      voiceMemos: [],
      
      addVoiceMemo: (memo) => set((state) => ({
        voiceMemos: [memo, ...state.voiceMemos],
      })),
      
      updateVoiceMemo: (id, updates) => set((state) => ({
        voiceMemos: state.voiceMemos.map((m) => (m.id === id ? { ...m, ...updates } : m)),
      })),
      
      deleteVoiceMemo: (id) => set((state) => ({
        voiceMemos: state.voiceMemos.filter((m) => m.id !== id),
      })),
    }),
    {
      name: 'mindlife-voice-memos-v1',
    }
  )
);

// Sélecteurs optimisés
export const useVoiceMemos = () => useVoiceMemosStore((state) => state.voiceMemos);
