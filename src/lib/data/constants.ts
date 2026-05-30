// Constantes partagées pour l'application MindLife
import type { VoiceOption, ReadingMode, PeriodOption } from '../types/nutrition';

// ============================================================================
// NUTRITION - Options TTS
// ============================================================================

export const voiceOptions: VoiceOption[] = [
  { 
    id: 'female-fr', 
    label: 'Amélie', 
    desc: 'Voix féminine douce',
    preview: '.voice-female',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    textColor: 'text-pink-400',
    icon: '👩‍🦰'
  },
  { 
    id: 'male-fr', 
    label: 'Thomas', 
    desc: 'Voix masculine grave',
    preview: '.voice-male',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    icon: '👨'
  },
];

export const readingModes: ReadingMode[] = [
  { id: 'step', label: 'Étape par Étape', icon: '📍', desc: 'Navigation guidée', color: 'from-violet-500 to-purple-500' },
  { id: 'full', label: 'Lecture Complète', icon: '📖', desc: 'Toute la recette', color: 'from-amber-500 to-orange-500' },
];

export const periodOptions: PeriodOption[] = [
  { id: 'day', label: 'Jour', multiplier: 1 },
  { id: 'week', label: 'Semaine', multiplier: 7 },
  { id: 'month', label: 'Mois', multiplier: 30 },
];

// ============================================================================
// GOALS - Catégories et Priorités
// ============================================================================

export const GOAL_CATEGORIES = [
  { id: 'cat-personal', name: 'Développement Personnel', icon: 'Heart', color: 'purple' },
  { id: 'cat-professional', name: 'Vie Professionnelle', icon: 'Zap', color: 'slate' },
  { id: 'cat-education', name: 'Éducation', icon: 'BookOpen', color: 'blue' },
  { id: 'cat-sport', name: 'Sport', icon: 'Dumbbell', color: 'emerald' },
  { id: 'cat-spirituality', name: 'Esprit & Spiritualité', icon: 'Sparkles', color: 'orange' },
  { id: 'cat-health', name: 'Santé', icon: 'Heart', color: 'rose' },
  { id: 'cat-finance', name: 'Finance', icon: 'Wallet', color: 'amber' },
  { id: 'cat-social', name: 'Social', icon: 'Users', color: 'cyan' },
];

export const GOAL_PRIORITIES = [
  { id: 'urgent', name: 'Urgent', color: 'rose', description: 'Cette semaine' },
  { id: 'important', name: 'Important', color: 'amber', description: 'Essentiel' },
  { id: 'a_planifier', name: 'À planifier', color: 'cyan', description: 'Moyen-terme' },
  { id: 'en_reflexion', name: 'En réflexion', color: 'violet', description: 'Long-terme' },
];

export const TIME_PERIODS = [
  { id: 'day', name: 'Jour', icon: 'Sunrise' },
  { id: 'week', name: 'Semaine', icon: 'CalendarDays' },
  { id: 'month', name: 'Mois', icon: 'Calendar' },
  { id: 'quarter', name: 'Trimestre', icon: 'TrendingUp' },
  { id: 'semester', name: 'Semestre', icon: 'BarChart3' },
  { id: 'year', name: 'Année', icon: 'Award' },
  { id: 'all', name: 'Tout', icon: 'Target' },
];

// ============================================================================
// COULEURS
// ============================================================================

// Hex color values
export const COLOR_MAP: Record<string, string> = {
  violet: '#8b5cf6',
  emerald: '#10b981',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  rose: '#f43f5e',
  slate: '#64748b',
  purple: '#a855f7',
  teal: '#14b8a6',
  blue: '#3b82f6',
  orange: '#f97316',
};

// Tailwind background classes for colors (solid)
export const COLOR_BG_CLASS: Record<string, string> = {
  emerald: 'bg-emerald-500',
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
  cyan: 'bg-cyan-500',
  blue: 'bg-blue-500',
  rose: 'bg-rose-500',
  orange: 'bg-orange-500',
  slate: 'bg-slate-500',
  purple: 'bg-purple-500',
  teal: 'bg-teal-500',
};

// Tailwind background classes for colors (translucent 20%)
export const COLOR_BG_TRANSPARENT_CLASS: Record<string, string> = {
  emerald: 'bg-emerald-500/20',
  violet: 'bg-violet-500/20',
  amber: 'bg-amber-500/20',
  cyan: 'bg-cyan-500/20',
  blue: 'bg-blue-500/20',
  rose: 'bg-rose-500/20',
  orange: 'bg-orange-500/20',
  slate: 'bg-slate-500/20',
  purple: 'bg-purple-500/20',
  teal: 'bg-teal-500/20',
};

// ============================================================================
// HELPERS
// ============================================================================

export const getCategoryColor = (categoryId?: string): string => {
  const cat = GOAL_CATEGORIES.find(c => c.id === categoryId);
  return cat?.color || 'violet';
};

export const getCategoryBadge = (categoryId?: string) => {
  return GOAL_CATEGORIES.find(c => c.id === categoryId) || { name: 'Général', color: 'slate' };
};

export const getPriorityBadge = (priority: string) => {
  return GOAL_PRIORITIES.find(p => p.id === priority) || GOAL_PRIORITIES[2];
};
