/**
 * MindLife - Settings Options Constants
 * Centralise toutes les options pour éviter la duplication
 */

import {
  User, Heart, Circle, Target, Dumbbell, Trophy, HeartPulse, Scale,
  Activity, Zap, Flame, Sunrise, Sprout, TrendingUp, Medal, Crown,
  Leaf, Wheat, Droplet, Apple, Fish, Nut, Egg, UtensilsCrossed, Salad, Soup,
  Utensils, Mountain, Snowflake, Flag, Users, Timer, CircleDot, Music,
  PersonStanding, Drama, Bike, Waves
} from 'lucide-react';

// Gender options
export const genderOptions = [
  { value: 'male', label: 'Homme', icon: '👨', iconA: User },
  { value: 'female', label: 'Femme', icon: '👩', iconA: Heart },
  { value: 'other', label: 'Autre', icon: '🧑', iconA: Circle },
];

// Main goal options
export const mainGoalOptions = [
  { value: 'lose_weight', label: 'Perte de poids', icon: '🎯', color: 'from-red-500 to-orange-500', iconA: Target },
  { value: 'gain_muscle', label: 'Prise de masse', icon: '💪', color: 'from-orange-500 to-amber-500', iconA: Dumbbell },
  { value: 'performance', label: 'Performance sportive', icon: '🏆', color: 'from-amber-500 to-yellow-500', iconA: Trophy },
  { value: 'health', label: 'Santé & Bien-être', icon: '❤️', color: 'from-green-500 to-emerald-500', iconA: HeartPulse },
  { value: 'maintain', label: 'Maintenir la forme', icon: '⚖️', color: 'from-blue-500 to-cyan-500', iconA: Scale },
];

// Activity level options
export const activityLevelOptions = [
  { value: 'sedentary', label: 'Sédentaire', desc: 'Peu ou pas d\'exercice', multiplier: 1.2, iconA: Circle, color: 'from-slate-400 to-slate-500' },
  { value: 'light', label: 'Légèrement actif', desc: '1-3 jours/semaine', multiplier: 1.375, iconA: Sunrise, color: 'from-sky-400 to-blue-500' },
  { value: 'moderate', label: 'Modérément actif', desc: '3-5 jours/semaine', multiplier: 1.55, iconA: Activity, color: 'from-green-400 to-emerald-500' },
  { value: 'active', label: 'Très actif', desc: '6-7 jours/semaine', multiplier: 1.725, iconA: Zap, color: 'from-orange-400 to-amber-500' },
  { value: 'very_active', label: 'Extrêmement actif', desc: 'Athlète + travail physique', multiplier: 1.9, iconA: Flame, color: 'from-red-400 to-rose-500' },
];

// Sport level options
export const sportLevelOptions = [
  { value: 'beginner', label: 'Débutant', icon: '🌱', color: 'bg-green-500/20 text-green-400 border-green-500/30', iconA: Sprout },
  { value: 'intermediate', label: 'Intermédiaire', icon: '🌿', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', iconA: TrendingUp },
  { value: 'advanced', label: 'Avancé', icon: '🌳', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', iconA: Medal },
  { value: 'elite', label: 'Élite', icon: '🏔️', color: 'bg-red-500/20 text-red-400 border-red-500/30', iconA: Crown },
];

// Dietary options
export const dietaryOptions = [
  { value: 'Végétarien', icon: '🥬', color: 'from-green-400 to-emerald-500', iconA: Leaf },
  { value: 'Végan', icon: '🌱', color: 'from-green-500 to-teal-500', iconA: Sprout },
  { value: 'Sans gluten', icon: '🌾', color: 'from-amber-400 to-orange-500', iconA: Wheat },
  { value: 'Sans lactose', icon: '🥛', color: 'from-blue-400 to-cyan-500', iconA: Droplet },
  { value: 'Keto', icon: '🥑', color: 'from-purple-400 to-pink-500', iconA: Flame },
  { value: 'Paleo', icon: '🍖', color: 'from-orange-400 to-red-500', iconA: Apple },
  { value: 'Méditerranéen', icon: '🫒', color: 'from-green-500 to-yellow-500', iconA: Salad },
  { value: 'Flexitarien', icon: '🥗', color: 'from-teal-400 to-green-500', iconA: UtensilsCrossed },
];

// Allergy options
export const allergyOptions = [
  { value: 'Gluten', icon: '🌾', severity: 'moderate', iconA: Wheat },
  { value: 'Lactose', icon: '🥛', severity: 'moderate', iconA: Droplet },
  { value: 'Arachides', icon: '🥜', severity: 'high', iconA: Nut },
  { value: 'Fruits de mer', icon: '🦐', severity: 'high', iconA: Fish },
  { value: 'Œufs', icon: '🥚', severity: 'moderate', iconA: Egg },
  { value: 'Soja', icon: '🫘', severity: 'moderate', iconA: Sprout },
  { value: 'Noix', icon: '🌰', severity: 'high', iconA: Nut },
  { value: 'Poisson', icon: '🐟', severity: 'high', iconA: Fish },
];

// Cuisine options
export const cuisineOptions = [
  { value: 'Française', icon: '🥐', flag: '🇫🇷', iconA: UtensilsCrossed, image: '/images/settings/cuisines/french.png', color: 'from-blue-400 to-indigo-500' },
  { value: 'Italienne', icon: '🍝', flag: '🇮🇹', iconA: Salad, image: '/images/settings/cuisines/italian.png', color: 'from-green-400 to-emerald-500' },
  { value: 'Japonaise', icon: '🍣', flag: '🇯🇵', iconA: Fish, image: '/images/settings/cuisines/japanese.png', color: 'from-rose-400 to-pink-500' },
  { value: 'Thaïlandaise', icon: '🍜', flag: '🇹🇭', iconA: Soup, image: '/images/settings/cuisines/thai.png', color: 'from-orange-400 to-red-500' },
  { value: 'Indienne', icon: '🍛', flag: '🇮🇳', iconA: Flame, image: '/images/settings/cuisines/indian.png', color: 'from-amber-400 to-orange-500' },
  { value: 'Mexicaine', icon: '🌮', flag: '🇲🇽', iconA: Utensils, image: '/images/settings/cuisines/mexican.png', color: 'from-lime-400 to-green-500' },
  { value: 'Chinoise', icon: '🥡', flag: '🇨🇳', iconA: Utensils, image: '/images/settings/cuisines/chinese.png', color: 'from-red-400 to-rose-500' },
  { value: 'Libanaise', icon: '🧆', flag: '🇱🇧', iconA: Salad, image: '/images/settings/cuisines/lebanese.png', color: 'from-teal-400 to-cyan-500' },
];

// Sport options
export const sportOptions = [
  { value: 'Musculation', icon: '🏋️', iconA: Dumbbell, color: 'from-orange-500 to-red-500', image: '/images/settings/sport_musculation.png' },
  { value: 'Running', icon: '🏃', iconA: Activity, color: 'from-blue-500 to-cyan-500', image: '/images/settings/sport_running.png' },
  { value: 'Natation', icon: '🏊', iconA: Waves, color: 'from-cyan-500 to-teal-500', image: '/images/settings/sport_natation.png' },
  { value: 'Cyclisme', icon: '🚴', iconA: Bike, color: 'from-yellow-500 to-orange-500', image: '/images/settings/sport_cyclisme.png' },
  { value: 'Yoga', icon: '🧘', iconA: PersonStanding, color: 'from-purple-500 to-pink-500', image: '/images/settings/sport_yoga.png' },
  { value: 'Crossfit', icon: '💪', iconA: Dumbbell, color: 'from-red-500 to-orange-500', image: '/images/settings/sport_crossfit.png' },
  { value: 'Boxe', icon: '🥊', iconA: Drama, color: 'from-red-600 to-rose-500', image: '/images/settings/sport_boxe.png' },
  { value: 'Tennis', icon: '🎾', iconA: CircleDot, color: 'from-green-500 to-lime-500', image: '/images/settings/sport_tennis.png' },
  { value: 'Football', icon: '⚽', iconA: Circle, color: 'from-green-600 to-emerald-500', image: '/images/settings/sport_football.png' },
  { value: 'Basketball', icon: '🏀', iconA: Circle, color: 'from-orange-500 to-amber-500', image: '/images/settings/sport_basketball.png' },
  { value: 'Danse', icon: '💃', iconA: Music, color: 'from-pink-500 to-purple-500', image: '/images/settings/sport_danse.png' },
  { value: 'Escalade', icon: '🧗', iconA: Mountain, color: 'from-stone-500 to-amber-500', image: '/images/settings/sport_escalade.png' },
  { value: 'Ski', icon: '⛷️', iconA: Snowflake, color: 'from-sky-400 to-blue-500', image: '/images/settings/sport_ski.png' },
  { value: 'Surf', icon: '🏄', iconA: Waves, color: 'from-teal-400 to-cyan-500', image: '/images/settings/sport_surf.png' },
  { value: 'Golf', icon: '⛳', iconA: Flag, color: 'from-green-400 to-emerald-500', image: '/images/settings/sport_golf.png' },
  { value: 'Rugby', icon: '🏉', iconA: Users, color: 'from-amber-500 to-orange-500', image: '/images/settings/sport_rugby.png' },
  { value: 'Volleyball', icon: '🏐', iconA: CircleDot, color: 'from-yellow-400 to-orange-500', image: '/images/settings/sport_volleyball.png' },
  { value: 'Judo', icon: '🥋', iconA: PersonStanding, color: 'from-slate-500 to-zinc-600', image: '/images/settings/sport_judo.png' },
  { value: 'Pilates', icon: '🧘‍♀️', iconA: PersonStanding, color: 'from-violet-400 to-purple-500', image: '/images/settings/sport_pilates.png' },
  { value: 'HIIT', icon: '🔥', iconA: Timer, color: 'from-red-500 to-orange-500', image: '/images/settings/sport_hiit.png' },
];

// Activity multipliers for TDEE calculation
export const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};
