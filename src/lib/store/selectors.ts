/**
 * OPTIMISED ZUSTAND SELECTORS
 * ===========================
 * Sélecteurs mémorisés pour éviter les re-renders en cascade.
 * 
 * RÈGLE D'OR: Un composant ne doit s'abonner qu'aux données qu'il utilise vraiment.
 * 
 * IMPORTANT: useShallow est utilisé pour les sélecteurs retournant des objets
 * afin d'éviter les boucles infinies (comparaison par valeur au lieu de référence).
 */

import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { useMemo } from 'react';
import type { Task, Goal, Event, Habit, Note, Category, JournalEntry, ChatMessage, VoiceMemo, UserProfile } from '../store';

// ============================================================
// SELECTORS DE BASE - Données simples (primitives ou arrays)
// ============================================================

/** Tâches */
export const useTasks = (): Task[] => useStore(state => state.tasks);

/** Objectifs */
export const useGoals = (): Goal[] => useStore(state => state.goals);

/** Événements */
export const useEvents = (): Event[] => useStore(state => state.events);

/** Habitudes */
export const useHabits = (): Habit[] => useStore(state => state.habits);

/** Notes */
export const useNotes = (): Note[] => useStore(state => state.notes);

/** Catégories */
export const useCategories = (): Category[] => useStore(state => state.categories);

/** Entrées journal */
export const useJournalEntries = (): JournalEntry[] => useStore(state => state.journalEntries);

/** Messages chat */
export const useChatMessages = (): ChatMessage[] => useStore(state => state.chatMessages);

/** Voice memos */
export const useVoiceMemos = (): VoiceMemo[] => useStore(state => state.voiceMemos);

/** Profil utilisateur */
export const useUserProfile = (): UserProfile | null => useStore(state => state.userProfile);

// ============================================================
// SELECTORS FILTRÉS - Données calculées
// ============================================================

/** Objectifs actifs (non complétés) */
export const useActiveGoals = () => {
  const goals = useGoals();
  return useMemo(() => goals.filter(g => g.status !== 'completed'), [goals]);
};

/** Objectifs complétés */
export const useCompletedGoals = () => {
  const goals = useGoals();
  return useMemo(() => goals.filter(g => g.status === 'completed'), [goals]);
};

/** Tâches actives (non complétées) */
export const useActiveTasks = () => {
  const tasks = useTasks();
  return useMemo(() => tasks.filter(t => !['completed', 'cancelled'].includes(t.status)), [tasks]);
};

/** Tâches du jour */
export const useTodayTasks = () => {
  const tasks = useTasks();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  return useMemo(() => tasks.filter(t => t.dueDate === today && t.status !== 'completed'), [tasks, today]);
};

/** Événements du jour */
export const useTodayEvents = () => {
  const events = useEvents();
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  return useMemo(() => events.filter(e => e.date === today), [events, today]);
};

/** Habitudes actives */
export const useActiveHabits = () => {
  const habits = useHabits();
  return useMemo(() => habits.filter(h => h.isActive), [habits]);
};

/** Notes épinglées */
export const usePinnedNotes = () => {
  const notes = useNotes();
  return useMemo(() => notes.filter(n => n.isPinned && !n.isArchived), [notes]);
};

/** Notes archivées */
export const useArchivedNotes = () => {
  const notes = useNotes();
  return useMemo(() => notes.filter(n => n.isArchived), [notes]);
};

// ============================================================
// SELECTORS AVEC GROUPAGE - Utilisent useShallow
// ============================================================

/** Utilisateur courant */
export const useCurrentUser = () => useStore(
  useShallow(state => ({ 
    id: state.currentUserId, 
    profile: state.userProfile,
    users: state.users,
  }))
);

/** État de chargement global */
export const useLoadingState = () => useStore(
  useShallow(state => ({
    isLoading: state.isLoading,
    dataLoaded: state.dataLoaded,
    isRecording: state.isRecording,
  }))
);

/** État de navigation */
export const useNavigation = () => useStore(
  useShallow(state => ({
    activePanel: state.activePanel,
    sidebarOpen: state.sidebarOpen,
    isAssistantOpen: state.isAssistantOpen,
    selectedCategory: state.selectedCategory,
  }))
);

/** Thème et langue */
export const usePreferences = () => useStore(
  useShallow(state => ({
    theme: state.theme,
    language: state.language,
  }))
);

// ============================================================
// ACTIONS GROUPÉES - Utilisent useShallow
// ============================================================

/** Actions de tâches */
export const useTaskActions = () => useStore(
  useShallow(state => ({
    addTask: state.addTask,
    updateTask: state.updateTask,
    deleteTask: state.deleteTask,
    setTasks: state.setTasks,
    loadTasks: state.loadTasks,
  }))
);

/** Actions d'objectifs */
export const useGoalActions = () => useStore(
  useShallow(state => ({
    addGoal: state.addGoal,
    updateGoal: state.updateGoal,
    deleteGoal: state.deleteGoal,
    setGoals: state.setGoals,
    loadGoals: state.loadGoals,
  }))
);

/** Actions d'événements */
export const useEventActions = () => useStore(
  useShallow(state => ({
    addEvent: state.addEvent,
    updateEvent: state.updateEvent,
    deleteEvent: state.deleteEvent,
    setEvents: state.setEvents,
    loadEvents: state.loadEvents,
  }))
);

/** Actions d'habitudes */
export const useHabitActions = () => useStore(
  useShallow(state => ({
    addHabit: state.addHabit,
    updateHabit: state.updateHabit,
    deleteHabit: state.deleteHabit,
    toggleHabitComplete: state.toggleHabitComplete,
    setHabits: state.setHabits,
    loadHabits: state.loadHabits,
  }))
);

/** Actions de notes */
export const useNoteActions = () => useStore(
  useShallow(state => ({
    addNote: state.addNote,
    updateNote: state.updateNote,
    deleteNote: state.deleteNote,
    setNotes: state.setNotes,
    loadNotes: state.loadNotes,
  }))
);

/** Actions de journal */
export const useJournalActions = () => useStore(
  useShallow(state => ({
    addJournalEntry: state.addJournalEntry,
    updateJournalEntry: state.updateJournalEntry,
    deleteJournalEntry: state.deleteJournalEntry,
    setJournalEntries: state.setJournalEntries,
    loadJournal: state.loadJournal,
  }))
);

/** Actions de chat */
export const useChatActions = () => useStore(
  useShallow(state => ({
    addChatMessage: state.addChatMessage,
    clearChat: state.clearChat,
  }))
);

/** Actions utilisateur */
export const useUserActions = () => useStore(
  useShallow(state => ({
    setCurrentUserId: state.setCurrentUserId,
    loadUserProfile: state.loadUserProfile,
    saveUserProfile: state.saveUserProfile,
    loadUsers: state.loadUsers,
    createNewUser: state.createNewUser,
    deleteUser: state.deleteUser,
  }))
);

/** Actions de navigation */
export const useNavigationActions = () => useStore(
  useShallow(state => ({
    setActivePanel: state.setActivePanel,
    setSidebarOpen: state.setSidebarOpen,
    toggleSidebar: state.toggleSidebar,
    setSelectedCategory: state.setSelectedCategory,
    setIsAssistantOpen: state.setIsAssistantOpen,
  }))
);

/** Actions globales */
export const useGlobalActions = () => useStore(
  useShallow(state => ({
    loadAllData: state.loadAllData,
    setLanguage: state.setLanguage,
    setTheme: state.setTheme,
    translate: state.translate,
  }))
);

// ============================================================
// STATS CALCULÉES - Dashboard
// ============================================================

/** Stats du dashboard */
export const useDashboardStats = () => {
  const tasks = useTasks();
  const goals = useGoals();
  const habits = useHabits();
  
  return useMemo(() => {
    const activeTasks = tasks.filter(t => !['completed', 'cancelled'].includes(t.status));
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const activeGoals = goals.filter(g => g.status !== 'completed');
    const activeHabits = habits.filter(h => h.isActive);
    
    const totalTasksToday = activeTasks.length + completedTasks.length;
    const taskCompletionRate = totalTasksToday > 0 
      ? Math.round((completedTasks.length / totalTasksToday) * 100) 
      : 0;
    
    const goalsCompletionRate = goals.length > 0 
      ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) 
      : 0;
    
    return {
      totalTasks: tasks.length,
      todayTasks: activeTasks.length,
      completedTasks: completedTasks.length,
      taskCompletionRate,
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      goalsCompletionRate,
      totalHabits: habits.length,
      activeHabits: activeHabits.length,
    };
  }, [tasks, goals, habits]);
};

/** Progress des objectifs avec milestones */
export const useGoalsProgress = () => {
  const goals = useGoals();
  
  return useMemo(() => goals.map(goal => {
    const progress = goal.progress || 0;
    const milestones = goal.milestones || [];
    const completedMilestones = milestones.filter(m => m.completed).length;
    
    return {
      id: goal.id,
      title: goal.title,
      progress,
      milestoneProgress: milestones.length > 0 
        ? Math.round((completedMilestones / milestones.length) * 100) 
        : 0,
      status: goal.status,
    };
  }), [goals]);
};

/** Catégories avec compteurs */
export const useCategoriesWithCount = () => {
  const categories = useCategories();
  const tasks = useTasks();
  const goals = useGoals();
  
  return useMemo(() => categories.map(cat => ({
    ...cat,
    taskCount: tasks.filter(t => t.categoryId === cat.id).length,
    goalCount: goals.filter(g => g.categoryId === cat.id).length,
  })), [categories, tasks, goals]);
};

// ============================================================
// SÉLECTEURS PAR DATE
// ============================================================

/** Événements par date */
export const useEventsByDate = (date: string) => {
  const events = useEvents();
  return useMemo(() => events.filter(e => e.date === date), [events, date]);
};

/** Tâches par date d'échéance */
export const useTasksByDueDate = (date: string) => {
  const tasks = useTasks();
  return useMemo(() => tasks.filter(t => t.dueDate === date), [tasks, date]);
};

/** Journal par date */
export const useJournalByDate = (date: string) => {
  const entries = useJournalEntries();
  return useMemo(() => entries.find(e => e.date === date), [entries, date]);
};

// ============================================================
// RE-EXPORTS pour compatibilité
// ============================================================

export { useStore, getCategoryColorClass } from '../store';
export type { Task, Goal, Event, Note, Habit, JournalEntry, Category, UserProfile } from '../store';
