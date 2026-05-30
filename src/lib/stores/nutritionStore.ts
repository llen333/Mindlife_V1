// ============================================================
// NUTRITION STORE - Gestion des repas et profils nutritionnels
// ============================================================

import { create } from 'zustand';
import { Meal, NutritionProfile } from './types';
import { mapDBMealToStore, mapDBNutritionProfileToStore } from './mappers';

interface NutritionState {
  meals: Meal[];
  nutritionProfile: NutritionProfile | null;
  
  // Actions
  setMeals: (meals: Meal[]) => void;
  setNutritionProfile: (profile: NutritionProfile | null) => void;
  loadNutritionData: (userId: string) => Promise<void>;
  addMeal: (
    meal: Omit<Meal, 'id' | 'userId' | 'createdAt' | 'isGenerated' | 'isFavorite'>,
    userId: string
  ) => Promise<void>;
  deleteMeal: (id: string, userId: string) => Promise<void>;
  updateNutritionProfile: (
    profile: Partial<NutritionProfile>,
    userId: string
  ) => Promise<void>;
}

export const useNutritionStore = create<NutritionState>()((set) => ({
  meals: [],
  nutritionProfile: null,
  
  setMeals: (meals) => set({ meals }),
  setNutritionProfile: (nutritionProfile) => set({ nutritionProfile }),
  
  loadNutritionData: async (userId) => {
    try {
      const profileRes = await fetch(`/api/nutrition-profile?userId=${userId}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.profile) {
          set({ nutritionProfile: mapDBNutritionProfileToStore(profileData.profile) });
        }
      }
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    }
  },
  
  addMeal: async (meal, userId) => {
    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...meal, userId }),
      });
      const data = await res.json();
      if (data.meal) {
        set((state) => ({
          meals: [...state.meals, mapDBMealToStore(data.meal)],
        }));
      }
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  },
  
  deleteMeal: async (id, userId) => {
    try {
      await fetch(`/api/meals?id=${id}&userId=${userId}`, { method: 'DELETE' });
      set((state) => ({
        meals: state.meals.filter((m) => m.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  },
  
  updateNutritionProfile: async (profile, userId) => {
    try {
      const res = await fetch('/api/nutrition-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, userId }),
      });
      const data = await res.json();
      if (data.profile) {
        set({ nutritionProfile: mapDBNutritionProfileToStore(data.profile) });
      }
    } catch (error) {
      console.error('Error updating nutrition profile:', error);
    }
  },
}));

// Sélecteurs optimisés
export const useMeals = () => useNutritionStore((state) => state.meals);
export const useNutritionProfile = () => useNutritionStore((state) => state.nutritionProfile);
