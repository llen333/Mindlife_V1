'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userKeys, useUserProfile } from './use-user-queries';

// ============================================
// TYPES
// ============================================

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  checked?: boolean;
  price?: number;
}

export interface RecipeStep {
  id: number;
  instruction: string;
  duration?: number;
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  tags?: string[];
}

export interface GenerateRecipeParams {
  preferences?: string[];
  calories?: number;
  protein?: number;
  budget?: number;
  allergies?: string[];
  favoriteCuisines?: string[];
  goal?: string;
}

export interface NutritionStats {
  budget: {
    total: number;
    remaining: number;
    spent: number;
  };
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  prepTime: {
    total: number;
    saved: number;
  };
}

// ============================================
// QUERY KEYS
// ============================================

export const nutritionKeys = {
  all: ['nutrition'] as const,
  recipes: () => [...nutritionKeys.all, 'recipes'] as const,
  recipe: (id: string) => [...nutritionKeys.recipes(), id] as const,
  generatedRecipes: () => [...nutritionKeys.all, 'generated'] as const,
  stats: (userId: string) => [...nutritionKeys.all, 'stats', userId] as const,
  shoppingList: (userId: string, period: string) =>
    [...nutritionKeys.all, 'shopping', userId, period] as const,
};

// ============================================
// FETCHERS
// ============================================

const generateRecipe = async (
  params: GenerateRecipeParams
): Promise<GeneratedRecipe> => {
  const res = await fetch('/api/generate-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to generate recipe');
  const data = await res.json();
  return data.recipe;
};

const fetchNutritionStats = async (
  userId: string
): Promise<NutritionStats> => {
  const res = await fetch(`/api/nutrition/stats?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch nutrition stats');
  return res.json();
};

// ============================================
// HOOKS
// ============================================

/**
 * Hook pour générer une recette avec IA
 * Utilise useMutation car c'est une action qui crée de nouvelles données
 */
export function useGenerateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateRecipe,

    onSuccess: (newRecipe) => {
      // Invalider le cache des recettes générées
      queryClient.invalidateQueries({
        queryKey: nutritionKeys.generatedRecipes(),
      });
      
      // Optionnel: sauvegarder dans le cache
      queryClient.setQueryData(
        nutritionKeys.recipe(`generated-${Date.now()}`),
        newRecipe
      );
    },
  });
}

/**
 * Hook pour récupérer les statistiques nutritionnelles
 * Dépend du profil utilisateur
 */
export function useNutritionStats() {
  // Récupérer le userId depuis React Query
  const queryClient = useQueryClient();
  const userProfile = queryClient.getQueryData<{ id: string }>(
    userKeys.profile('user-admin') // valeur par défaut, sera surchargé
  );
  const userId = userProfile?.id || 'user-admin';

  return useQuery({
    queryKey: nutritionKeys.stats(userId),
    queryFn: () => fetchNutritionStats(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId,
  });
}

/**
 * Hook pour mettre à jour le budget alimentaire
 * Met à jour le profil utilisateur via l'API users
 */
export function useUpdateFoodBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      budget,
      period,
    }: {
      userId: string;
      budget: number;
      period: 'day' | 'week' | 'month';
    }) => {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          foodBudget: budget,
          foodBudgetPeriod: period,
        }),
      });
      if (!res.ok) throw new Error('Failed to update budget');
      return res.json();
    },

    onSuccess: (_, { userId }) => {
      // Invalider le profil utilisateur et les stats nutrition
      queryClient.invalidateQueries({
        queryKey: userKeys.profile(userId),
      });
      queryClient.invalidateQueries({
        queryKey: nutritionKeys.stats(userId),
      });
    },
  });
}

/**
 * Hook combiné pour les calculs nutritionnels
 * Utilise les données du profil utilisateur
 */
export function useNutritionCalculations() {
  const { data: profile } = useUserProfileForNutrition();

  // Calculs basés sur le profil
  const calculations = {
    bmr: 0,
    tdee: 0,
    targetCalories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    imc: 0,
  };

  if (profile) {
    const weight = profile.weight ?? 75;
    const height = profile.height ?? 175;
    const age = profile.birthDate
      ? Math.floor(
          (Date.now() - new Date(profile.birthDate).getTime()) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : 30;
    const gender = profile.gender ?? 'male';
    const activityLevel = profile.activityLevel ?? 'moderate';
    const mainGoal = profile.mainGoal ?? 'maintain';

    // BMR (Mifflin-St Jeor)
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === 'female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age;
    }

    // Activity multipliers
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const tdee = bmr * (activityMultipliers[activityLevel] ?? 1.55);

    // Goal adjustments
    const goalAdjustments: Record<string, number> = {
      lose_weight: -500,
      gain_muscle: 300,
      performance: 200,
      health: 0,
      maintain: 0,
    };
    const targetCalories = tdee + (goalAdjustments[mainGoal] ?? 0);

    // Macro ratios
    const macroRatios: Record<
      string,
      { protein: number; carbs: number; fat: number }
    > = {
      lose_weight: { protein: 0.35, carbs: 0.35, fat: 0.3 },
      gain_muscle: { protein: 0.3, carbs: 0.45, fat: 0.25 },
      performance: { protein: 0.3, carbs: 0.45, fat: 0.25 },
      health: { protein: 0.3, carbs: 0.4, fat: 0.3 },
      maintain: { protein: 0.3, carbs: 0.4, fat: 0.3 },
    };
    const ratios = macroRatios[mainGoal] ?? macroRatios.maintain;

    // IMC
    const imc = weight / (height / 100) ** 2;

    calculations.bmr = Math.round(bmr);
    calculations.tdee = Math.round(tdee);
    calculations.targetCalories = Math.round(targetCalories);
    calculations.protein = Math.round((targetCalories * ratios.protein) / 4);
    calculations.carbs = Math.round((targetCalories * ratios.carbs) / 4);
    calculations.fat = Math.round((targetCalories * ratios.fat) / 9);
    calculations.imc = Math.round(imc * 10) / 10;
  }

  return calculations;
}

/**
 * Helper: Récupérer le profil utilisateur pour les calculs nutritionnels
 * Utilise le hook importé
 */
function useUserProfileForNutrition() {
  return useUserProfile();
}

/**
 * Hook pour invalider tous les caches nutrition
 */
export function useInvalidateNutritionCache() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: nutritionKeys.all,
    });
  };
}
