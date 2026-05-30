// ============================================================
// MINDLIFE MAPPERS - Transformations DB vers Store
// ============================================================

import { Task, TaskChapter, Goal, GoalMilestone, Note, Event, Habit, JournalEntry, Category, SleepEntry } from './types';

// Convert DB task to store Task
export const mapDBTaskToStore = (dbTask: any): Task => {
  // Parse chapters - can be string, object, or undefined
  let parsedChapters: TaskChapter[] | undefined = undefined;
  if (dbTask.chapters) {
    if (typeof dbTask.chapters === 'string') {
      try {
        parsedChapters = JSON.parse(dbTask.chapters);
      } catch {
        parsedChapters = undefined;
      }
    } else if (Array.isArray(dbTask.chapters)) {
      parsedChapters = dbTask.chapters;
    }
  }
  
  // Parse dates - handle both Date objects and ISO strings
  const parseDate = (date: any): string | undefined => {
    if (!date) return undefined;
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString();
    return undefined;
  };
  
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || undefined,
    status: dbTask.status,
    priority: dbTask.priority,
    dueDate: parseDate(dbTask.dueDate),
    startDate: parseDate(dbTask.startDate),
    time: dbTask.time || undefined,
    recurrence: dbTask.recurrence || undefined,
    progress: dbTask.progress || 0,
    chapters: parsedChapters,
    observations: dbTask.observations || undefined,
    createdBy: dbTask.createdBy || 'user',
    addToCalendar: dbTask.addToCalendar || false,
    eventId: dbTask.eventId || undefined,
    categoryId: dbTask.categoryId || 'cat-professional',
    tags: dbTask.tags || undefined,
    createdAt: dbTask.createdAt,
  };
};

// Convert DB event to store Event
export const mapDBEventToStore = (dbEvent: any): Event => {
  // Handle startAt - can be Date object or ISO string
  let startAtISO: string;
  if (dbEvent.startAt) {
    if (typeof dbEvent.startAt === 'string') {
      startAtISO = dbEvent.startAt;
    } else if (dbEvent.startAt instanceof Date) {
      startAtISO = dbEvent.startAt.toISOString();
    } else {
      startAtISO = new Date().toISOString();
    }
  } else {
    startAtISO = new Date().toISOString();
  }

  // Handle endAt
  let endAtISO: string | undefined;
  if (dbEvent.endAt) {
    if (typeof dbEvent.endAt === 'string') {
      endAtISO = dbEvent.endAt;
    } else if (dbEvent.endAt instanceof Date) {
      endAtISO = dbEvent.endAt.toISOString();
    }
  }

  return {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description || undefined,
    location: dbEvent.location || undefined,
    // Champs Prisma (source de vérité)
    startAt: startAtISO,
    endAt: endAtISO,
    // Champs dérivés pour affichage
    date: startAtISO.split('T')[0],
    startTime: startAtISO.split('T')[1]?.substring(0, 5) || '09:00',
    endTime: endAtISO ? endAtISO.split('T')[1]?.substring(0, 5) : undefined,
    isAllDay: dbEvent.isAllDay || false,
    categoryId: dbEvent.categoryId || 'cat-professional',
    color: dbEvent.color || 'emerald',
    priority: 'medium',
    status: 'scheduled',
    // Lien vers objectif/étape
    goalId: dbEvent.goalId || undefined,
    milestoneId: dbEvent.milestoneId || undefined,
    createdAt: dbEvent.createdAt,
    updatedAt: dbEvent.updatedAt,
  };
};

// Convert DB goal to store Goal
export const mapDBGoalToStore = (dbGoal: any): Goal => {
  // Parse milestones - can be string, object, or undefined
  let parsedMilestones: GoalMilestone[] = [];
  if (dbGoal.milestones) {
    if (typeof dbGoal.milestones === 'string') {
      try {
        parsedMilestones = JSON.parse(dbGoal.milestones);
      } catch {
        parsedMilestones = [];
      }
    } else if (Array.isArray(dbGoal.milestones)) {
      parsedMilestones = dbGoal.milestones;
    }
  }
  
  // Parse dates - handle both Date objects and ISO strings
  const parseDate = (date: any): string | undefined => {
    if (!date) return undefined;
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString();
    return undefined;
  };
  
  return {
    id: dbGoal.id,
    title: dbGoal.title,
    description: dbGoal.description || undefined,
    targetValue: dbGoal.targetValue || undefined,
    currentValue: dbGoal.currentValue || 0,
    progress: Math.round((dbGoal.currentValue / (dbGoal.targetValue || 100)) * 100) || 0,
    unit: dbGoal.unit || undefined,
    startDate: parseDate(dbGoal.startDate) || new Date().toISOString(),
    endDate: parseDate(dbGoal.endDate),
    status: dbGoal.status,
    priority: dbGoal.priority || 'a_planifier',
    milestones: parsedMilestones,
    categoryId: dbGoal.categoryId || 'cat-professional',
  };
};

// Convert DB note to store Note
export const mapDBNoteToStore = (dbNote: any): Note => ({
  id: dbNote.id,
  title: dbNote.title,
  content: dbNote.content,
  type: dbNote.type || 'text',
  tags: dbNote.tags || undefined,
  isPinned: dbNote.isPinned || false,
  isArchived: dbNote.isArchived || false,
  categoryId: dbNote.categoryId || 'cat-professional',
  createdAt: dbNote.createdAt,
});

// Convert DB habit to store Habit
export const mapDBHabitToStore = (dbHabit: any, logs: any[] = []): Habit => ({
  id: dbHabit.id,
  title: dbHabit.name,
  icon: dbHabit.icon || '📋',
  description: dbHabit.description || undefined,
  frequency: dbHabit.frequency || 'daily',
  color: dbHabit.color || 'emerald',
  streak: logs.filter(l => l.completed).length || 0,
  isActive: dbHabit.isActive,
  categoryId: dbHabit.categoryId || 'cat-professional',
  completedDates: logs.filter(l => l.completed).map(l => l.date.split('T')[0]),
});

// Convert DB journal entry to store JournalEntry
export const mapDBJournalToStore = (dbEntry: any): JournalEntry => ({
  id: dbEntry.id,
  date: dbEntry.createdAt.split('T')[0],
  title: dbEntry.title || undefined,
  content: dbEntry.content,
  mood: dbEntry.mood || undefined,
  gratitude: dbEntry.gratitude || undefined,
  wins: dbEntry.wins || undefined,
  challenges: dbEntry.challenges || undefined,
});

// Map Lucide icon names to emojis for display
const iconToEmoji = (icon: string): string => {
  const mapping: Record<string, string> = {
    'Dumbbell': '🏃',
    'BookOpen': '📚',
    'Brain': '🧠',
    'Sparkles': '🧘',
    'Briefcase': '💼',
    'Folder': '📋',
  };
  return mapping[icon] || icon || '📋';
};

// Convert DB category to store Category
export const mapDBCategoryToStore = (dbCategory: any): Category => ({
  id: dbCategory.id,
  name: dbCategory.name,
  icon: iconToEmoji(dbCategory.icon),
  color: dbCategory.color,
});

// Convert DB sleep to store SleepEntry
export const mapDBSleepToStore = (dbSleep: any): SleepEntry => {
  const parseDate = (d: any): string => {
    if (!d) return new Date().toISOString();
    if (typeof d === 'string') return d;
    if (d instanceof Date) return d.toISOString();
    return new Date().toISOString();
  };

  return {
    id: dbSleep.id,
    userId: dbSleep.userId,
    date: parseDate(dbSleep.date).split('T')[0],
    bedtime: parseDate(dbSleep.bedtime),
    wakeup: parseDate(dbSleep.wakeup),
    duration: dbSleep.duration || 0,
    quality: dbSleep.quality || 3,
    notes: dbSleep.notes || null,
    createdAt: parseDate(dbSleep.createdAt),
    updatedAt: dbSleep.updatedAt ? parseDate(dbSleep.updatedAt) : undefined,
  };
};

// Convert DB meal to store Meal
export const mapDBMealToStore = (dbMeal: any): any => {
  const parseDate = (d: any): string => {
    if (!d) return new Date().toISOString();
    if (typeof d === 'string') return d;
    if (d instanceof Date) return d.toISOString();
    return new Date().toISOString();
  };

  let parsedIngredients = [];
  if (dbMeal.ingredients) {
    if (typeof dbMeal.ingredients === 'string') {
      try {
        parsedIngredients = JSON.parse(dbMeal.ingredients);
      } catch {
        parsedIngredients = [];
      }
    } else if (Array.isArray(dbMeal.ingredients)) {
      parsedIngredients = dbMeal.ingredients;
    }
  }

  let parsedSteps = [];
  if (dbMeal.instructions) {
    parsedSteps = dbMeal.instructions.split('\n').map((s: string, i: number) => ({
      id: i,
      instruction: s,
      duration: 5,
    }));
  } else if (dbMeal.steps) {
    if (typeof dbMeal.steps === 'string') {
      try {
        parsedSteps = JSON.parse(dbMeal.steps);
      } catch {
        parsedSteps = [];
      }
    } else if (Array.isArray(dbMeal.steps)) {
      parsedSteps = dbMeal.steps;
    }
  }

  return {
    id: dbMeal.id,
    userId: dbMeal.userId,
    name: dbMeal.name,
    description: dbMeal.description || null,
    type: dbMeal.type || 'lunch',
    date: parseDate(dbMeal.date),
    calories: dbMeal.calories || 0,
    protein: dbMeal.protein || 0,
    carbs: dbMeal.carbs || 0,
    fat: dbMeal.fat || 0,
    ingredients: parsedIngredients,
    steps: parsedSteps,
    imageUrl: dbMeal.imageUrl || null,
    isGenerated: dbMeal.isGenerated || false,
    isFavorite: dbMeal.isFavorite || false,
    createdAt: parseDate(dbMeal.createdAt),
  };
};

// Convert DB nutrition profile to store NutritionProfile
export const mapDBNutritionProfileToStore = (dbProfile: any): any => {
  const parseArray = (field: any): string[] => {
    if (!field) return [];
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    }
    if (Array.isArray(field)) return field;
    return [];
  };

  return {
    id: dbProfile.id,
    userId: dbProfile.userId,
    weight: dbProfile.weight || 75,
    height: dbProfile.height || 175,
    age: dbProfile.age || 30,
    gender: dbProfile.gender || 'male',
    activityLevel: dbProfile.activityLevel || 'moderate',
    goal: dbProfile.goal || 'maintain',
    dietaryPreferences: parseArray(dbProfile.dietaryPreferences),
    allergies: parseArray(dbProfile.allergies),
    favoriteCuisines: parseArray(dbProfile.favoriteCuisines),
    bmr: dbProfile.bmr || 0,
    tdee: dbProfile.tdee || 0,
    imc: dbProfile.imc || 0,
    targetCalories: dbProfile.targetCalories || 2000,
    protein: dbProfile.protein || 150,
    carbs: dbProfile.carbs || 200,
    fat: dbProfile.fat || 65,
  };
};
