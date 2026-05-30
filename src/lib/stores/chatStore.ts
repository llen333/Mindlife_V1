// ============================================================
// CHAT STORE - Gestion des messages de chat (local only)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage } from './types';

interface ChatState {
  chatMessages: ChatMessage[];
  
  // Actions
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      chatMessages: [],
      
      addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, message],
      })),
      
      clearChat: () => set({ chatMessages: [] }),
    }),
    {
      name: 'mindlife-chat-v1',
    }
  )
);

// Sélecteurs optimisés
export const useChatMessages = () => useChatStore((state) => state.chatMessages);
