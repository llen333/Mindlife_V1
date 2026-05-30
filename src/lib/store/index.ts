/**
 * STORE EXPORTS
 * Point d'entrée unique pour tous les exports du store
 */

// Store principal
export { useStore, getCategoryColorClass } from '../store';
export type { 
  Task, Goal, Note, Event, Habit, Category, 
  ChatMessage, JournalEntry, VoiceMemo, UserProfile,
  TaskChapter, GoalMilestone, AppState
} from '../store';

// Sélecteurs optimisés
export * from './selectors';
