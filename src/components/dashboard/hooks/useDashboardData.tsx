'use client';

import { useMemo } from 'react';
import { 
  useTasks, useGoals, useHabits, useEvents, useJournalEntries,
  useUserProfile, useLoadingState, useGlobalActions, useStore,
  Task, Goal, Event
} from '@/lib/store/selectors';
import { CategoryCardAction } from '../components/CategoryCard';

// Types pour le journal
export interface JournalItem {
  time: string;
  title: string;
  done: boolean;
  urgent: boolean;
  type: 'task' | 'event' | 'goal' | 'milestone';
  data: Task | Event | Goal;
  isMilestone?: boolean;
}

// Types pour les cartes de catégorie
export interface CategoryCardData {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  progress: number;
  actions: CategoryCardAction[];
}

/**
 * Hook personnalisé pour gérer les données du dashboard
 */
export function useDashboardData() {
  const tasks = useTasks();
  const goals = useGoals();
  const habits = useHabits();
  const events = useEvents();
  const journalEntries = useJournalEntries();
  const userProfile = useUserProfile();
  const { dataLoaded, isLoading } = useLoadingState();
  const { loadAllData } = useGlobalActions();
  const currentUserId = useStore(state => state.currentUserId);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // ========== CALCULS DES DONNÉES ==========
  
  // Tâches du jour ET tâches en cours
  const todayTasks = useMemo(() => 
    tasks.filter(t => !['completed', 'cancelled'].includes(t.status)),
    [tasks]
  );

  const completedToday = useMemo(() => 
    tasks.filter(t => t.status === 'completed'),
    [tasks]
  );

  const taskCompletionRate = useMemo(() => {
    const total = todayTasks.length + completedToday.length;
    return total > 0 ? Math.round((completedToday.length / total) * 100) : 0;
  }, [todayTasks.length, completedToday.length]);

  // Événements du jour
  const todayEvents = useMemo(() => 
    events.filter(e => e.date === todayStr),
    [events, todayStr]
  );

  // Objectifs actifs
  const activeGoals = useMemo(() => 
    goals.filter(g => g.status !== 'completed'),
    [goals]
  );

  const goalsCompletionRate = useMemo(() => {
    return goals.length > 0 
      ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) 
      : 0;
  }, [goals]);

  // ========== DONNÉES POUR LE JOURNAL ==========

  const journalItems = useMemo((): JournalItem[] => {
    const items: JournalItem[] = [];

    // Ajouter les événements du jour
    todayEvents.forEach(e => {
      const linkedTask = tasks.find(t => t.eventId === e.id);
      const linkedGoal = e.goalId ? goals.find(g => g.id === e.goalId) : null;

      if (linkedTask) {
        items.push({
          time: e.startTime || (e.startAt ? e.startAt.split('T')[1]?.substring(0, 5) : '--:--'),
          title: `📋 ${linkedTask.title}`,
          done: linkedTask.status === 'completed',
          urgent: linkedTask.priority === 'high',
          type: 'task',
          data: linkedTask,
        });
      } else if (linkedGoal) {
        const milestoneTitle = e.milestoneId && linkedGoal.milestones
          ? linkedGoal.milestones.find(m => m.id === e.milestoneId)?.title
          : null;
        items.push({
          time: e.startTime || (e.startAt ? e.startAt.split('T')[1]?.substring(0, 5) : '--:--'),
          title: milestoneTitle ? `🎯 ${milestoneTitle}` : `🎯 ${linkedGoal.title}`,
          done: false,
          urgent: e.priority === 'urgent',
          type: 'goal',
          data: linkedGoal,
          isMilestone: !!e.milestoneId,
        });
      } else {
        items.push({
          time: e.startTime || (e.startAt ? e.startAt.split('T')[1]?.substring(0, 5) : '--:--'),
          title: e.title,
          done: false,
          urgent: e.priority === 'urgent',
          type: 'event',
          data: e,
        });
      }
    });

    // Ajouter les étapes d'objectifs du jour
    activeGoals.forEach(goal => {
      if (goal.milestones) {
        goal.milestones.forEach(milestone => {
          if (milestone.dueDate) {
            const milestoneDate = milestone.dueDate.split('T')[0];
            if (milestoneDate === todayStr) {
              items.push({
                time: milestone.dueDate ? new Date(milestone.dueDate).toTimeString().slice(0, 5) : 'Étape',
                title: `🎯 ${milestone.title} (${goal.title})`,
                done: milestone.completed,
                urgent: false,
                type: 'milestone',
                data: goal,
                isMilestone: true,
              });
            }
          }
        });
      }
    });

    // Ajouter toutes les tâches en cours
    todayTasks.forEach(t => {
      const alreadyAdded = items.some(i => i.type === 'task' && (i.data as Task).id === t.id);
      if (!alreadyAdded) {
        items.push({
          time: t.dueDate ? new Date(t.dueDate).toTimeString().slice(0, 5) : 'À faire',
          title: t.title,
          done: t.status === 'completed',
          urgent: t.priority === 'high',
          type: 'task',
          data: t,
        });
      }
    });

    // Si pas assez d'items, ajouter les objectifs actifs
    if (items.length < 4) {
      activeGoals.slice(0, 4 - items.length).forEach(g => {
        items.push({
          time: g.endDate ? new Date(g.endDate).toTimeString().slice(0, 5) : 'Objectif',
          title: g.title,
          done: false,
          urgent: g.priority === 'urgent',
          type: 'goal',
          data: g,
        });
      });
    }

    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [todayEvents, tasks, goals, activeGoals, todayTasks, todayStr]);

  // ========== DONNÉES POUR LES CARRES DE CATÉGORIE ==========

  const buildCategoryCardsActions = (
    Calendar: React.ElementType,
    CheckSquare: React.ElementType,
    Target: React.ElementType,
    Apple: React.ElementType,
    Brain: React.ElementType,
    Dumbbell: React.ElementType
  ): CategoryCardData[] => {
    const mindHabits = habits.filter(h => h.categoryId?.includes('mind') || h.icon === '🧘');
    const sportHabits = habits.filter(h => h.categoryId?.includes('sport') || h.icon === '💪');

    return [
      {
        id: 'calendar',
        label: 'Calendrier',
        icon: Calendar,
        color: 'cyan',
        progress: todayEvents.length > 0 ? Math.min(100, todayEvents.length * 25) : 0,
        actions: todayEvents.slice(0, 6).map(e => {
          const isGoalRelated = e.goalId || e.milestoneId;
          const linkedTask = tasks.find(t => t.eventId === e.id);
          
          let type: 'event' | 'goal' | 'task' = 'event';
          let data: Task | Event | Goal = e;
          
          if (isGoalRelated) {
            const parentGoal = goals.find(g => g.id === e.goalId);
            if (parentGoal) {
              type = 'goal';
              data = parentGoal;
            }
          } else if (linkedTask) {
            type = 'task';
            data = linkedTask;
          }
          
          return {
            text: e.title,
            badge: e.startTime,
            isUrgent: e.priority === 'urgent',
            type,
            data,
          };
        }),
      },
      {
        id: 'tasks',
        label: 'Tâches',
        icon: CheckSquare,
        color: 'violet',
        progress: taskCompletionRate,
        actions: todayTasks.slice(0, 6).map(t => ({
          text: t.title,
          badge: t.priority === 'high' ? 'Urgent' : undefined,
          badgeColor: t.priority === 'high' ? 'rose' : undefined,
          isUrgent: t.priority === 'high',
          isDone: t.status === 'completed',
          type: 'task' as const,
          data: t,
        })),
      },
      {
        id: 'goals',
        label: 'Objectifs',
        icon: Target,
        color: 'amber',
        progress: goalsCompletionRate,
        actions: activeGoals.slice(0, 6).map(g => ({
          text: g.title,
          badge: `${g.progress}%`,
          badgeColor: g.progress >= 50 ? 'emerald' : 'amber',
          type: 'goal' as const,
          data: g,
        })),
      },
      {
        id: 'management',
        label: 'Gestion',
        icon: ({ className }: { className?: string }) => (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        ),
        color: 'slate',
        progress: 35,
        actions: [{ text: 'Module en développement', badge: 'Bientôt' }],
      },
      {
        id: 'hub-alimentaire',
        label: 'Hub Alimentaire',
        icon: Apple,
        color: 'emerald',
        progress: 75,
        actions: [
          { text: 'Calories', badge: `${userProfile?.targetCalories || 2000} kcal` },
          { text: 'Protéines', badge: `${userProfile?.proteinTarget || 150}g` },
        ],
      },
      {
        id: 'nutrition',
        label: 'Alimentation',
        icon: ({ className }: { className?: string }) => (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
            <line x1="6" y1="17" x2="18" y2="17" />
          </svg>
        ),
        color: 'orange',
        progress: 60,
        actions: [{ text: 'Module en développement', badge: 'Bientôt' }],
      },
      {
        id: 'mind',
        label: 'Esprit',
        icon: Brain,
        color: 'purple',
        progress: mindHabits.length > 0 ? 50 : 0,
        actions: mindHabits.slice(0, 4).map(h => ({
          text: h.title,
          badge: `${h.streak}j`,
        })),
      },
      {
        id: 'culture',
        label: 'Culture',
        icon: ({ className }: { className?: string }) => (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        ),
        color: 'cyan',
        progress: 30,
        actions: [{ text: 'Module en développement', badge: 'Bientôt' }],
      },
      {
        id: 'growth',
        label: 'Croissance',
        icon: ({ className }: { className?: string }) => (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        ),
        color: 'emerald',
        progress: 40,
        actions: [{ text: 'Module en développement', badge: 'Bientôt' }],
      },
      {
        id: 'health',
        label: 'Santé',
        icon: ({ className }: { className?: string }) => (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        ),
        color: 'rose',
        progress: 50,
        actions: [{ text: 'Module en développement', badge: 'Bientôt' }],
      },
      {
        id: 'sport',
        label: 'Sport',
        icon: Dumbbell,
        color: 'orange',
        progress: sportHabits.length > 0 ? 60 : 0,
        actions: sportHabits.slice(0, 4).map(h => ({
          text: h.title,
          badge: `${h.streak}j`,
        })),
      },
      {
        id: 'ai-synthesis',
        label: 'Synthèse AI',
        icon: ({ className }: { className?: string }) => (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ),
        color: 'violet',
        progress: 20,
        actions: [{ text: 'Module en développement', badge: 'Bientôt' }],
      },
    ];
  };

  return {
    // Données brutes
    tasks,
    goals,
    habits,
    events,
    journalEntries,
    userProfile,
    
    // États de chargement
    dataLoaded,
    isLoading,
    
    // Actions
    loadAllData,
    
    // Données calculées
    today,
    todayStr,
    todayTasks,
    completedToday,
    todayEvents,
    activeGoals,
    taskCompletionRate,
    goalsCompletionRate,
    currentUserId,
    
    // Données structurées
    journalItems,
    buildCategoryCardsActions,
  };
}
