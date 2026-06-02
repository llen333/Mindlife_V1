export type {
  Ingredient,
  RecipeStep,
  Meal,
  CartItem,
  GeneratedRecipe,
  InspirationRecipe,
  VoiceOption,
  ReadingMode,
  PeriodOption,
} from '@/lib/types/nutrition';

export interface WeekInfo {
  offset: number;
  label: string;
}

export type MealTypeFilter = 'all' | 'lunch' | 'dinner';
export type GenerateType = 'lunch' | 'dinner' | 'both';
export type VoiceId = 'female-fr' | 'male-fr';
export type ReadingModeId = 'step' | 'full';
