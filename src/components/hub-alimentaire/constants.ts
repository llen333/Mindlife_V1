import { Scale, TrendingUp, Zap } from 'lucide-react';
import type { 
  ActivityLevel, 
  AllergyOption, 
  DietaryOption, 
  Goal, 
  GoalMappingEntry, 
  CuisineStyle,
  UserProfile,
  ComputedMetrics
} from './types';

/**
 * Mapping des objectifs depuis le modèle User vers l'affichage local
 */
export const goalMapping: Record<string, GoalMappingEntry> = {
  lose_weight: { id: 'lose', label: 'Perte de poids', icon: TrendingUp, multiplier: -500, color: 'text-rose-400' },
  gain_muscle: { id: 'gain', label: 'Prise de masse', icon: Zap, multiplier: 300, color: 'text-cyan-400' },
  maintain: { id: 'maintain', label: 'Maintien', icon: Scale, multiplier: 0, color: 'text-emerald-400' },
  performance: { id: 'gain', label: 'Performance', icon: Zap, multiplier: 200, color: 'text-cyan-400' },
  health: { id: 'maintain', label: 'Santé', icon: Scale, multiplier: 0, color: 'text-emerald-400' },
};

/**
 * Options de régimes alimentaires
 */
export const dietaryOptions: DietaryOption[] = [
  { id: 'Végétarien', label: 'Végétarien', icon: '🥗', desc: 'Sans viande ni poisson' },
  { id: 'Végan', label: 'Végétalien', icon: '🌱', desc: '100% végétal' },
  { id: 'Keto', label: 'Keto', icon: '🥑', desc: 'Faible en glucides' },
  { id: 'Paleo', label: 'Paléo', icon: '🍖', desc: 'Aliments naturels' },
  { id: 'Flexitarien', label: 'Flexitarien', icon: '🍽️', desc: 'Viande occasionnelle' },
  { id: 'Sans gluten', label: 'Sans Gluten', icon: '🌾', desc: 'Sans blé' },
  { id: 'Méditerranéen', label: 'Méditerranéen', icon: '🫒', desc: 'Huile d\'olive, poissons' },
  { id: 'Sans lactose', label: 'Sans Lactose', icon: '🥛', desc: 'Sans produits laitiers' },
];

/**
 * Options d'allergies
 */
export const allergyOptions: AllergyOption[] = [
  { id: 'Gluten', label: 'Gluten', icon: '🌾', severe: true },
  { id: 'Lactose', label: 'Lactose', icon: '🥛', severe: false },
  { id: 'Arachites', label: 'Arachides', icon: '🥜', severe: true },
  { id: 'Fruits de mer', label: 'Fruits de mer', icon: '🦐', severe: true },
  { id: 'Œufs', label: 'Œufs', icon: '🥚', severe: false },
  { id: 'Soja', label: 'Soja', icon: '🫘', severe: false },
  { id: 'Poisson', label: 'Poisson', icon: '🐟', severe: true },
  { id: 'Noix', label: 'Noix', icon: '🌰', severe: true },
];

/**
 * Styles culinaires disponibles
 */
export const cuisineStyles: CuisineStyle[] = [
  { 
    id: 'japanese', 
    label: 'Japonaise', 
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop',
  },
  { 
    id: 'mediterranean', 
    label: 'Méditerranéenne', 
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
  },
  { 
    id: 'healthy', 
    label: 'Healthy & Fusion', 
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  },
  { 
    id: 'asian', 
    label: 'Asiatique Épicée', 
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
  },
  { 
    id: 'french', 
    label: 'Française', 
    image: 'https://images.unsplash.com/photo-1608855238293-a8853e7f7c98?w=400&h=300&fit=crop',
  },
  { 
    id: 'indian', 
    label: 'Indienne', 
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
  },
  { 
    id: 'mexican', 
    label: 'Mexicaine', 
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop',
  },
  { 
    id: 'italian', 
    label: 'Italienne', 
    image: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=400&h=300&fit=crop',
  },
];

/**
 * Niveaux d'activité physique
 */
export const activityLevels: ActivityLevel[] = [
  { id: 'sedentary', label: 'Sédentaire', desc: 'Bureau, peu d\'activité', multiplier: 1.2 },
  { id: 'light', label: 'Légèrement actif', desc: '1-2 séances/semaine', multiplier: 1.375 },
  { id: 'moderate', label: 'Modérément actif', desc: '3-5 séances/semaine', multiplier: 1.55 },
  { id: 'active', label: 'Très actif', desc: '6-7 séances/semaine', multiplier: 1.725 },
  { id: 'very_active', label: 'Athlète', desc: '2x par jour', multiplier: 1.9 },
];

/**
 * Objectifs principaux
 */
export const goals: Goal[] = [
  { id: 'lose', label: 'Perte de poids', icon: TrendingUp, multiplier: -500, color: 'text-rose-400' },
  { id: 'maintain', label: 'Maintien', icon: Scale, multiplier: 0, color: 'text-emerald-400' },
  { id: 'gain', label: 'Prise de masse', icon: Zap, multiplier: 300, color: 'text-cyan-400' },
];

/**
 * Valeurs par défaut pour le profil
 */
export const DEFAULT_PROFILE: UserProfile = {
  weight: 75,
  height: 175,
  age: 30,
  gender: 'male',
  activityLevel: 'moderate',
  mainGoal: 'maintain',
  dietaryPreferences: [],
  allergies: [],
  favoriteCuisines: [],
  targetCalories: 2000,
  proteinTarget: 150,
  carbsTarget: 200,
  fatTarget: 65,
};

/**
 * Valeurs par défaut pour les métriques calculées
 */
export const DEFAULT_COMPUTED: ComputedMetrics = {
  bmr: 1700,
  tdee: 2600,
  imc: 24.5,
  targetCalories: 2600,
  protein: 195,
  carbs: 227,
  fat: 101,
  age: 30,
};

/**
 * Helper pour obtenir la catégorie IMC
 */
export const getIMCCategory = (imc: number): { label: string; color: string; bgColor: string; advice: string } => {
  if (imc < 18.5) return { label: 'Insuffisance pondérale', color: 'text-blue-400', bgColor: 'bg-blue-500', advice: 'Consulter un nutritionniste' };
  if (imc < 25) return { label: 'Poids normal', color: 'text-emerald-400', bgColor: 'bg-emerald-500', advice: 'Excellent ! Continuez ainsi' };
  if (imc < 30) return { label: 'Surpoids', color: 'text-amber-400', bgColor: 'bg-amber-500', advice: 'Activité physique recommandée' };
  return { label: 'Obésité', color: 'text-red-400', bgColor: 'bg-red-500', advice: 'Consultation médicale recommandée' };
};
