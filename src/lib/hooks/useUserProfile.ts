'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useStore, UserProfile } from '@/lib/store';

// Types pour les métriques calculées
interface ComputedMetrics {
  bmr: number;
  tdee: number;
  imc: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  age: number;
}

// Interface étendue pour le profil avec données parsées
interface ParsedProfile {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  mainGoal: 'lose_weight' | 'gain_muscle' | 'performance' | 'health' | 'maintain';
  dietaryPreferences: string[];
  allergies: string[];
  favoriteCuisines: string[];
  targetCalories: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}

// Multiplieurs d'activité
const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Ajustements caloriques selon l'objectif
const GOAL_ADJUSTMENTS: Record<string, number> = {
  lose_weight: -500,
  gain_muscle: 300,
  performance: 200,
  health: 0,
  maintain: 0,
};

// Ratios de macros selon l'objectif
const MACRO_RATIOS: Record<string, { protein: number; carbs: number; fat: number }> = {
  lose_weight: { protein: 0.35, carbs: 0.35, fat: 0.30 },
  gain_muscle: { protein: 0.30, carbs: 0.45, fat: 0.25 },
  performance: { protein: 0.30, carbs: 0.45, fat: 0.25 },
  health: { protein: 0.30, carbs: 0.40, fat: 0.30 },
  maintain: { protein: 0.30, carbs: 0.40, fat: 0.30 },
};

export function useUserProfile() {
  const { 
    currentUserId, 
    userProfile, 
    loadUserProfile, 
    isLoading,
    setIsLoading 
  } = useStore();

  // Charger le profil au montage et quand l'utilisateur change
  // NOTE: loadUserProfile est une fonction Zustand, on ne l'inclut pas dans les dépendances
  // car elle change à chaque render. On utilise currentUserId comme seul déclencheur.
  useEffect(() => {
    console.log('🔄 useUserProfile: Loading profile for user:', currentUserId);
    loadUserProfile();
  }, [currentUserId]);

  // Calculer l'âge à partir de la date de naissance
  const calculateAge = useCallback((birthDate: string | null): number => {
    if (!birthDate) return 30;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(age, 1);
  }, []);

  // Parser les données JSON du profil
  const parsedProfile = useMemo((): ParsedProfile => {
    const profile = userProfile;
    
    return {
      weight: profile?.weight ?? 75,
      height: profile?.height ?? 175,
      age: calculateAge(profile?.birthDate ?? null),
      gender: (profile?.gender as 'male' | 'female' | 'other') ?? 'male',
      activityLevel: (profile?.activityLevel as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active') ?? 'moderate',
      mainGoal: (profile?.mainGoal as 'lose_weight' | 'gain_muscle' | 'performance' | 'health' | 'maintain') ?? 'maintain',
      dietaryPreferences: profile?.dietaryPreferences ? JSON.parse(profile.dietaryPreferences) : [],
      allergies: profile?.allergies ? JSON.parse(profile.allergies) : [],
      favoriteCuisines: profile?.favoriteCuisines ? JSON.parse(profile.favoriteCuisines) : [],
      targetCalories: profile?.targetCalories ?? 2000,
      proteinTarget: profile?.proteinTarget ?? 150,
      carbsTarget: profile?.carbsTarget ?? 200,
      fatTarget: profile?.fatTarget ?? 65,
    };
  }, [userProfile, calculateAge]);

  // Calculer les métriques (BMR, TDEE, IMC, etc.)
  const computed = useMemo((): ComputedMetrics => {
    const { weight, height, age, gender, activityLevel, mainGoal } = parsedProfile;
    
    // BMR (Mifflin-St Jeor)
    let bmr: number;
    if (gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === 'female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age;
    }
    
    // TDEE
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
    const tdee = bmr * multiplier;
    
    // IMC
    const heightInMeters = height / 100;
    const imc = weight / (heightInMeters * heightInMeters);
    
    // Calories cibles selon l'objectif
    const adjustment = GOAL_ADJUSTMENTS[mainGoal] || 0;
    const targetCalories = tdee + adjustment;
    
    // Macros selon l'objectif
    const ratios = MACRO_RATIOS[mainGoal] || MACRO_RATIOS.maintain;
    const protein = Math.round((targetCalories * ratios.protein) / 4);
    const carbs = Math.round((targetCalories * ratios.carbs) / 4);
    const fat = Math.round((targetCalories * ratios.fat) / 9);
    
    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      imc: Math.round(imc * 10) / 10,
      targetCalories: Math.round(targetCalories),
      protein,
      carbs,
      fat,
      age,
    };
  }, [parsedProfile]);

  // Fonction pour rafraîchir les données
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await loadUserProfile();
    setIsLoading(false);
  }, [loadUserProfile, setIsLoading]);

  // Fonction utilitaire pour obtenir la catégorie IMC
  const getIMCCategory = useCallback((imc: number): { label: string; color: string; bgColor: string; advice: string } => {
    if (imc < 18.5) return { 
      label: 'Insuffisance pondérale', 
      color: 'text-blue-400', 
      bgColor: 'bg-blue-500',
      advice: 'Consulter un nutritionniste pour un plan adapté' 
    };
    if (imc < 25) return { 
      label: 'Poids normal', 
      color: 'text-emerald-400', 
      bgColor: 'bg-emerald-500',
      advice: 'Excellent ! Continuez ainsi' 
    };
    if (imc < 30) return { 
      label: 'Surpoids', 
      color: 'text-amber-400', 
      bgColor: 'bg-amber-500',
      advice: 'Activité physique régulière recommandée' 
    };
    return { 
      label: 'Obésité', 
      color: 'text-red-400', 
      bgColor: 'bg-red-500',
      advice: 'Consultation médicale recommandée' 
    };
  }, []);

  return {
    // Données du profil utilisateur
    profile: userProfile,
    
    // Données parsées prêtes à l'emploi
    parsedProfile,
    
    // Métriques calculées
    computed,
    
    // États
    isLoading,
    
    // Actions
    refresh,
    
    // Utilitaires
    getIMCCategory,
  };
}

export type { ComputedMetrics, ParsedProfile };
