/**
 * OPTIMISED ZUSTAND SELECTORS
 * ===========================
 * Ces hooks utilisent des sélecteurs mémorisés pour éviter les re-renders en cascade.
 * 
 * PROBLÈME : useStore(state => state.tasks) déclenche un re-render à CHAQUE 
 * changement du store, même si tasks n'a pas changé.
 * 
 * SOLUTION : Utiliser ces hooks optimisés qui ne re-render que si la valeur 
 * spécifique a changé.
 * 
 * USAGE:
 * - Au lieu de: const tasks = useStore(state => state.tasks)
 * - Utiliser: const tasks = useTasks()
 */

import { useStore } from './store';
import { shallow } from 'zustand/shallow';

// ============================================================
// SELECTORS DE BASE - Données simples
// ============================================================

/** Tâches - évite les re-renders quand d'autres données changent */
export const useTasks = () => useStore(state => state.tasks);

/** Objectifs actifs (filtrés et mémorisés) */
export const useActiveGoals = () => {
  const goals = useStore(state => state.goals);
  return goals.filter(g => g.status !== 'completed');
};

/** Objectifs complétés */
export const useCompletedGoals = () => {
  const goals = useStore(state => state.goals);
  return goals.filter(g => g.status === 'completed');
};

/** Événements du jour */
export const useTodayEvents = () => {
  const events = useStore(state => state.events);
  const today = new Date().toISOString().split('T')[0];
  return events.filter(e => e.date === today);
};

/** Tâches du jour (non complétées) */
export const useTodayTasks = () => {
  const tasks = useStore(state => state.tasks);
  return tasks.filter(t => !['completed', 'cancelled'].includes(t.status));
};

/** Tâches complétées aujourd'hui */
export const useCompletedToday = () => {
  const tasks = useStore(state => state.tasks);
  return tasks.filter(t => t.status === 'completed');
};

/** Habitudes actives */
export const useActiveHabits = () => {
  const habits = useStore(state => state.habits);
  return habits.filter(h => h.isActive);
};

// ============================================================
// SELECTORS AVEC SHALLOW COMPARISON - Objets et tableaux
// ============================================================

/** Profil utilisateur - shallow comparison */
export const useUserProfile = () => useStore(
  state => state.userProfile,
  shallow
);

/** Utilisateur courant */
export const useCurrentUser = () => useStore(
  state => ({ 
    id: state.currentUserId, 
    profile: state.userProfile 
  }),
  shallow
);

/** État de chargement */
export const useLoadingState = () => useStore(
  state => ({
    isLoading: state.isLoading,
    dataLoaded: state.dataLoaded,
    isRecording: state.isRecording,
  }),
  shallow
);

/** État de navigation */
export const useNavigation = () => useStore(
  state => ({
    activePanel: state.activePanel,
    sidebarOpen: state.sidebarOpen,
    isAssistantOpen: state.isAssistantOpen,
  }),
  shallow
);

// ============================================================
// SELECTORS CALCULÉS - Stats et métriques
// ============================================================

/** Stats du dashboard - calculé une seule fois par changement de données */
export const useDashboardStats = () => {
  const tasks = useStore(state => state.tasks);
  const goals = useStore(state => state.goals);
  const habits = useStore(state => state.habits);
  
  const todayTasks = tasks.filter(t => !['completed', 'cancelled'].includes(t.status));
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const activeGoals = goals.filter(g => g.status !== 'completed');
  const activeHabits = habits.filter(h => h.isActive);
  
  const totalTasksToday = todayTasks.length + completedTasks.length;
  const taskCompletionRate = totalTasksToday > 0 
    ? Math.round((completedTasks.length / totalTasksToday) * 100) 
    : 0;
  
  const goalsCompletionRate = goals.length > 0 
    ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) 
    : 0;
  
  return {
    totalTasks: tasks.length,
    todayTasks: todayTasks.length,
    completedTasks: completedTasks.length,
    taskCompletionRate,
    totalGoals: goals.length,
    activeGoals: activeGoals.length,
    goalsCompletionRate,
    totalHabits: habits.length,
    activeHabits: activeHabits.length,
  };
};

/** Progress des objectifs avec milestones */
export const useGoalsProgress = () => {
  const goals = useStore(state => state.goals);
  
  return goals.map(goal => {
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
  });
};

/** Catégories avec compteurs */
export const useCategoriesWithCount = () => {
  const categories = useStore(state => state.categories);
  const tasks = useStore(state => state.tasks);
  const goals = useStore(state => state.goals);
  
  return categories.map(cat => ({
    ...cat,
    taskCount: tasks.filter(t => t.categoryId === cat.id).length,
    goalCount: goals.filter(g => g.categoryId === cat.id).length,
  }));
};

// ============================================================
// ACTIONS GROUPÉES - Éviter multiples appels useStore
// ============================================================

/** Actions de tâches groupées */
export const useTaskActions = () => useStore(
  state => ({
    addTask: state.addTask,
    updateTask: state.updateTask,
    deleteTask: state.deleteTask,
    setTasks: state.setTasks,
  }),
  shallow
);

/** Actions d'objectifs groupées */
export const useGoalActions = () => useStore(
  state => ({
    addGoal: state.addGoal,
    updateGoal: state.updateGoal,
    deleteGoal: state.deleteGoal,
    setGoals: state.setGoals,
  }),
  shallow
);

/** Actions d'événements groupées */
export const useEventActions = () => useStore(
  state => ({
    addEvent: state.addEvent,
    updateEvent: state.updateEvent,
    deleteEvent: state.deleteEvent,
    setEvents: state.setEvents,
  }),
  shallow
);

/** Actions d'habitudes groupées */
export const useHabitActions = () => useStore(
  state => ({
    addHabit: state.addHabit,
    updateHabit: state.updateHabit,
    deleteHabit: state.deleteHabit,
    toggleHabitComplete: state.toggleHabitComplete,
  }),
  shallow
);

// ============================================================
// NOTES D'UTILISATION
// ============================================================
/**
 * EXEMPLE DE MIGRATION:
 * 
 * // AVANT (problématique):
 * const { tasks, goals, habits } = useStore(state => ({
 *   tasks: state.tasks,
 *   goals: state.goals,
 *   habits: state.habits,
 * }));
 * 
 * // APRÈS (optimisé):
 * const tasks = useTasks();
 * const goals = useActiveGoals();
 * const habits = useActiveHabits();
 * 
 * // Ou pour les actions:
 * const { addTask, updateTask } = useTaskActions();
 */
