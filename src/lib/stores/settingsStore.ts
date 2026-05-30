// ============================================================
// SETTINGS STORE - Langue, thème, et paramètres UI
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, t, TranslationKey } from '../i18n';

interface SettingsState {
  language: Language;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  isAssistantOpen: boolean;
  isLoading: boolean;
  isRecording: boolean;
  
  // Actions
  setLanguage: (lang: Language) => void;
  translate: (key: TranslationKey) => string;
  setTheme: (theme: 'light' | 'dark') => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setIsAssistantOpen: (open: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setIsRecording: (recording: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: 'fr',
      theme: 'dark',
      sidebarOpen: false,
      isAssistantOpen: false,
      isLoading: false,
      isRecording: false,
      
      setLanguage: (language) => set({ language }),
      
      translate: (key) => t(key, get().language),
      
      setTheme: (theme) => set({ theme }),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setIsAssistantOpen: (open) => set({ isAssistantOpen: open }),
      
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      setIsRecording: (recording) => set({ isRecording: recording }),
    }),
    {
      name: 'mindlife-settings-v1',
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// Sélecteurs optimisés
export const useLanguage = () => useSettingsStore((state) => state.language);
export const useTheme = () => useSettingsStore((state) => state.theme);
export const useTranslate = () => useSettingsStore((state) => state.translate);
export const useSidebarOpen = () => useSettingsStore((state) => state.sidebarOpen);
export const useIsAssistantOpen = () => useSettingsStore((state) => state.isAssistantOpen);
export const useIsLoading = () => useSettingsStore((state) => state.isLoading);
export const useIsRecording = () => useSettingsStore((state) => state.isRecording);
