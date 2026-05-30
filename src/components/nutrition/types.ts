/**
 * NutritionPage Types
 * Types pour la gestion des repas et de la nutrition
 */

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  checked: boolean;
  price?: number;
}

export interface RecipeStep {
  id: number;
  instruction: string;
  duration?: number;
}

export interface Meal {
  id: string;
  day: string;
  dayShort: string;
  title: string;
  description: string;
  image: string;
  protein: number;
  calories: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  tags: string[];
  isFavorite?: boolean;
  isToday?: boolean;
  type?: 'lunch' | 'dinner';
  date?: string;
}

export interface CartItem {
  category: string;
  count: number;
  price: number;
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  calories: number;
  protein: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}

export interface VoiceOption {
  id: string;
  label: string;
  desc: string;
  preview: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
}

export interface ReadingMode {
  id: string;
  label: string;
  icon: string;
  desc: string;
  color: string;
}

export interface PeriodOption {
  id: string;
  label: string;
  multiplier: number;
}

export interface InspirationRecipe {
  id: string;
  title: string;
  image: string;
  tag: string;
  time: number;
  calories: number;
}

export interface WeekInfo {
  offset: number;
  label: string;
}

export type MealTypeFilter = 'all' | 'lunch' | 'dinner';
export type GenerateType = 'lunch' | 'dinner' | 'both';
export type VoiceId = 'female-fr' | 'male-fr';
export type ReadingModeId = 'step' | 'full';
