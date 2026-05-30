/**
 * Dashboard Constants
 * Données statiques et configurations pour le tableau de bord
 */

// Couleurs pour les glow effects des cartes
export const GLOW_COLORS: Record<string, string> = {
  emerald: 'hover:shadow-emerald-500/10 group-hover:shadow-emerald-500/20',
  amber: 'hover:shadow-amber-500/10 group-hover:shadow-amber-500/20',
  rose: 'hover:shadow-rose-500/10 group-hover:shadow-rose-500/20',
  cyan: 'hover:shadow-cyan-500/10 group-hover:shadow-cyan-500/20',
  violet: 'hover:shadow-violet-500/10 group-hover:shadow-violet-500/20',
  orange: 'hover:shadow-orange-500/10 group-hover:shadow-orange-500/20',
  purple: 'hover:shadow-purple-500/10 group-hover:shadow-purple-500/20',
};

// Classes CSS pour les badges
export const BADGE_CLASSES: Record<string, string> = {
  emerald: 'bg-emerald-500/20 text-emerald-400',
  cyan: 'bg-cyan-500/20 text-cyan-400',
  violet: 'bg-violet-500/20 text-violet-400',
  amber: 'bg-amber-500/20 text-amber-400',
  orange: 'bg-orange-500/20 text-orange-400',
  rose: 'bg-rose-500/20 text-rose-400',
  slate: 'bg-slate-500/20 text-slate-400',
};

// Classes CSS pour les cartes de catégorie
export const COLOR_CLASSES: Record<string, { bg: string; text: string; border: string; glow: string; progress: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'emerald', progress: '#10b981' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'cyan', progress: '#06b6d4' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', glow: 'violet', progress: '#8b5cf6' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'amber', progress: '#f59e0b' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', glow: 'orange', progress: '#f97316' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'purple', progress: '#a855f7' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'rose', progress: '#f43f5e' },
  slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', glow: 'slate', progress: '#64748b' },
};

// Couleurs pour les barres de progression des objectifs
export const PROGRESS_COLORS: Record<string, string> = {
  emerald: 'from-emerald-500 to-cyan-500',
  cyan: 'from-cyan-500 to-blue-500',
  amber: 'from-amber-500 to-orange-500',
  violet: 'from-violet-500 to-purple-500',
  orange: 'from-orange-500 to-red-500',
};

// Configuration des modules par défaut
export const DEFAULT_MODULE_CONFIGS = [
  { id: 'management', label: 'Gestion', color: 'slate', progress: 35, isDevelopment: true },
  { id: 'nutrition', label: 'Alimentation', color: 'orange', progress: 60, isDevelopment: true },
  { id: 'culture', label: 'Culture', color: 'cyan', progress: 30, isDevelopment: true },
  { id: 'growth', label: 'Croissance', color: 'emerald', progress: 40, isDevelopment: true },
  { id: 'health', label: 'Santé', color: 'rose', progress: 50, isDevelopment: true },
  { id: 'ai-synthesis', label: 'Synthèse AI', color: 'violet', progress: 20, isDevelopment: true },
];

// Circumference pour le ProgressBadge (2 * PI * 14)
export const CIRCLE_CIRCUMFERENCE = 87.96;
