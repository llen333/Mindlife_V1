// ============================================================
// CATEGORIES STORE - Gestion des catégories
// ============================================================

import { create } from 'zustand';
import { Category } from './types';
import { mapDBCategoryToStore } from './mappers';
import { useCurrentUserId } from './userStore';

interface CategoriesState {
  categories: Category[];
  
  // Actions
  setCategories: (categories: Category[]) => void;
  loadCategories: (userId?: string) => Promise<void>;
}

// Catégories par défaut
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-sport', name: 'Sport', icon: '🏃', color: 'emerald' },
  { id: 'cat-education', name: 'Éducation', icon: '📚', color: 'blue' },
  { id: 'cat-personal', name: 'Développement Personnel', icon: '🧠', color: 'purple' },
  { id: 'cat-spirituality', name: 'Esprit & Spiritualité', icon: '🧘', color: 'orange' },
  { id: 'cat-professional', name: 'Vie Professionnelle', icon: '💼', color: 'slate' },
];

export const useCategoriesStore = create<CategoriesState>()((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  
  setCategories: (categories) => set({ categories }),
  
  loadCategories: async (userId) => {
    try {
      const res = await fetch(`/api/categories?userId=${userId || 'mindlife-user'}`);
      const data = await res.json();
      if (data.categories && data.categories.length > 0) {
        set({ categories: data.categories.map(mapDBCategoryToStore) });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  },
}));

// Sélecteurs optimisés
export const useCategories = () => useCategoriesStore((state) => state.categories);

// Hook pour obtenir les infos d'une catégorie
export const useCategoryInfo = (categoryId: string) => {
  return useCategoriesStore((state) => 
    state.categories.find(c => c.id === categoryId) || { name: 'Autre', icon: '📌', color: 'slate' }
  );
};
