// Types pour le profil settings
export interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
  phone: string;
  birthDate: string;
  timezone: string;
  country: string;
  city: string;
  weight: string;
  height: string;
  gender: string;
  mainGoal: string;
  activityLevel: string;
  dietaryPreferences: string[];
  allergies: string[];
  favoriteCuisines: string[];
  targetCalories: string;
  proteinTarget: string;
  carbsTarget: string;
  fatTarget: string;
  sportLevel: string;
  preferredSports: string[];
  theme: string;
  language: string;
}

export interface CalculatedMetrics {
  imc: number | null;
  bmr: number | null;
  tdee: number | null;
}

export interface ImcCategory {
  label: string;
  color: string;
}

export const initialFormData: ProfileFormData = {
  name: '',
  email: '',
  bio: '',
  phone: '',
  birthDate: '',
  timezone: 'Europe/Paris',
  country: '',
  city: '',
  weight: '',
  height: '',
  gender: '',
  mainGoal: '',
  activityLevel: 'moderate',
  dietaryPreferences: [],
  allergies: [],
  favoriteCuisines: [],
  targetCalories: '',
  proteinTarget: '',
  carbsTarget: '',
  fatTarget: '',
  sportLevel: 'intermediate',
  preferredSports: [],
  theme: 'dark',
  language: 'fr',
};
