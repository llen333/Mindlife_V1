/**
 * MINDLIFE STORE - Export principal
 * ================================
 * Ce fichier réexporte tout depuis les stores optimisés (src/lib/stores/).
 * 
 * ARCHITECTURE:
 * - stores/userStore.ts - Gestion utilisateur
 * - stores/settingsStore.ts - Préférences, thème, langue
 * - stores/navigationStore.ts - Navigation et panels
 * - stores/tasksStore.ts - Tâches
 * - stores/goalsStore.ts - Objectifs
 * - stores/eventsStore.ts - Événements calendrier
 * - stores/notesStore.ts - Notes
 * - stores/habitsStore.ts - Habitudes
 * - stores/journalStore.ts - Journal
 * - stores/chatStore.ts - Messages chat
 * - stores/voiceMemosStore.ts - Mémos vocaux
 * - stores/categoriesStore.ts - Catégories
 * 
 * SÉLECTEURS OPTIMISÉS:
 * - store/selectors.ts - Sélecteurs mémorisés pour éviter les re-renders
 * 
 * RÈGLE D'OR: Utilisez les sélecteurs optimisés au lieu de useStore direct!
 */

// ============================================================
// RÉEXPORTS DEPUIS LES STORES OPTIMISÉS
// ============================================================

// Types
export type {
  Task, Goal, Note, Event, Habit, Category,
  ChatMessage, JournalEntry, VoiceMemo, UserProfile,
  TaskChapter, GoalMilestone
} from './stores/types';

// Store principal (compatibilité ascendante)
export { useStore } from './stores/index';

// Sélecteurs optimisés
export * from './store/selectors';

// Helper pour les couleurs de catégories
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
