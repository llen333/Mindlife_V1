// ============================================================
// NAVIGATION STORE - Gestion de la navigation et panels
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  activePanel: string;
  selectedCategory: string | null;
  
  // Actions
  setActivePanel: (panel: string) => void;
  setSelectedCategory: (id: string | null) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      activePanel: 'dashboard',
      selectedCategory: null,
      
      setActivePanel: (panel) => set({ activePanel: panel }),
      
      setSelectedCategory: (id) => set({ selectedCategory: id }),
    }),
    {
      name: 'mindlife-navigation-v1',
      partialize: (state) => ({
        activePanel: state.activePanel,
      }),
    }
  )
);

// Sélecteurs optimisés
export const useActivePanel = () => useNavigationStore((state) => state.activePanel);
export const useSelectedCategory = () => useNavigationStore((state) => state.selectedCategory);
