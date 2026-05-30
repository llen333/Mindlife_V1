import type { LucideIcon } from 'lucide-react';

/**
 * Chat message type for AI assistant
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * User profile type
 */
export interface UserProfile {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: string;
  mainGoal: string;
  dietaryPreferences: string[];
  allergies: string[];
  favoriteCuisines: string[];
  targetCalories: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}

/**
 * Computed metrics type
 */
export interface ComputedMetrics {
  bmr: number;
  tdee: number;
  imc: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  age: number;
}

/**
 * IMC category result
 */
export interface IMCCategory {
  label: string;
  color: string;
  bgColor: string;
  advice: string;
}

/**
 * Dietary option type
 */
export interface DietaryOption {
  id: string;
  label: string;
  icon: string;
  desc: string;
}

/**
 * Allergy option type
 */
export interface AllergyOption {
  id: string;
  label: string;
  icon: string;
  severe: boolean;
}

/**
 * Cuisine style type
 */
export interface CuisineStyle {
  id: string;
  label: string;
  image: string;
  selected?: boolean;
}

/**
 * Activity level type
 */
export interface ActivityLevel {
  id: string;
  label: string;
  desc: string;
  multiplier: number;
}

/**
 * Goal type
 */
export interface Goal {
  id: string;
  label: string;
  icon: LucideIcon;
  multiplier: number;
  color: string;
}

/**
 * Goal mapping entry
 */
export interface GoalMappingEntry {
  id: string;
  label: string;
  icon: LucideIcon;
  multiplier: number;
  color: string;
}
