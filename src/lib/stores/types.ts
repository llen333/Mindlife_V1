// ============================================================
// MINDLIFE STORE TYPES - Types partagés pour tous les stores
// ============================================================

// Chapter interface for task steps
export interface TaskChapter {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

// Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  startDate?: string;
  time?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  progress: number;
  chapters?: TaskChapter[];
  observations?: string;
  createdBy: string;
  addToCalendar: boolean;
  eventId?: string;
  categoryId: string;
  tags?: string;
  createdAt: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;      // Date ISO de l'étape
  estimatedTime?: number; // Temps estimé en minutes
  order?: number;        // Ordre de l'étape
  eventId?: string;      // ID de l'événement calendrier lié
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetValue?: number;
  currentValue: number;
  progress: number;
  unit?: string;
  startDate: string;
  endDate?: string;
  status: string;
  priority?: string;
  milestones?: GoalMilestone[];
  categoryId: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'voice' | 'image';
  tags?: string;
  isPinned: boolean;
  isArchived: boolean;
  categoryId: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  // Champs depuis Prisma (source de vérité)
  startAt: string;  // ISO datetime
  endAt?: string;   // ISO datetime
  // Champs dérivés pour affichage (calculés depuis startAt)
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;  // HH:mm
  isAllDay: boolean;
  categoryId: string;
  color?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  reminder?: number;
  reminderEnabled?: boolean;
  participants?: string[];
  notes?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  imageUrl?: string;
  tags?: string[];
  createdBy?: 'user' | 'ai';
  // Lien vers objectif/étape
  goalId?: string;      // ID de l'objectif parent
  milestoneId?: string; // ID de l'étape spécifique
  createdAt: string;
  updatedAt?: string;
}

export interface Habit {
  id: string;
  title: string;
  icon: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  color?: string;
  streak: number;
  isActive: boolean;
  categoryId: string;
  completedDates: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface JournalEntry {
  id: string;
  date: string;
  title?: string;
  content: string;
  mood?: string;
  gratitude?: string;
  wins?: string;
  challenges?: string;
}

export interface VoiceMemo {
  id: string;
  title: string;
  audioData: string;
  duration: number;
  transcription?: string;
  category: 'note' | 'idea' | 'reminder' | 'task';
  tags?: string[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  birthDate: string | null;
  timezone: string;
  country: string | null;
  city: string | null;
  weight: number | null;
  height: number | null;
  gender: string | null;
  mainGoal: string | null;
  activityLevel: string | null;
  dietaryPreferences: string | null;
  allergies: string | null;
  favoriteCuisines: string | null;
  targetCalories: number | null;
  proteinTarget: number | null;
  carbsTarget: number | null;
  fatTarget: number | null;
  sportLevel: string | null;
  preferredSports: string | null;
  sportGoals: string | null;
  bmr: number | null;
  tdee: number | null;
  imc: number | null;
  theme: string | null;
  language: string | null;
  role: string | null;
}

export interface SleepEntry {
  id: string;
  userId: string;
  date: string;
  bedtime: string;
  wakeup: string;
  duration: number;
  quality: number;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

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
  userId: string;
  name: string;
  description?: string | null;
  type: string;  // breakfast, lunch, dinner, snack
  date: string;  // ISO string
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients?: Ingredient[] | string;
  steps?: RecipeStep[] | string;
  imageUrl?: string | null;
  isGenerated: boolean;
  isFavorite: boolean;
  createdAt: string;
}

export interface NutritionProfile {
  id: string;
  userId: string;
  weight: number;
  height: number;
  age: number;
  gender: string;
  activityLevel: string;
  goal: string;
  dietaryPreferences: string[];
  allergies: string[];
  favoriteCuisines: string[];
  bmr: number;
  tdee: number;
  imc: number;
  targetCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Helper function for category colors
export const getCategoryColorClass = (color: string) => {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    violet: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  };
  return colors[color] || colors.slate;
};
