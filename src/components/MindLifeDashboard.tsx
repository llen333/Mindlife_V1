'use client';

import { useEffect, useRef, useState, useMemo, memo } from 'react';
import { gsap } from 'gsap';
// Framer Motion supprimé - migré vers GSAP
import { 
  TrendingUp, Target, Zap, Clock, Plus, Play, RotateCcw, CheckCircle2, 
  LayoutDashboard, Calendar, CheckSquare, Flag, AlertCircle, Sparkles, 
  Briefcase, Apple, ChefHat, Brain, BookOpen, Heart, Dumbbell,
  ChevronLeft, ChevronRight, Flame, Utensils, MessageCircle, X, Sunrise, Sunset
} from 'lucide-react';
import { useStore, getCategoryColorClass, Task, Goal, Event } from '@/lib/store';
import MindLifeHeader from './MindLifeHeader';

// Composant pour les orbs animés en background - DÉSACTIVÉ pour test performance
// ⚠️ Les animations CSS infinies + blur + will-change surchargent le GPU
const AnimatedOrbs = memo(() => null);
AnimatedOrbs.displayName = 'AnimatedOrbs';

// Composant GlassCard - MIGRÉ vers GSAP
const GlassCard = memo(({ 
  children, className = '', glowColor = 'emerald', hover = true 
}: { children: React.ReactNode; className?: string; glowColor?: string; hover?: boolean }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const glowColors: Record<string, string> = {
    emerald: 'hover:shadow-emerald-500/10 group-hover:shadow-emerald-500/20',
    amber: 'hover:shadow-amber-500/10 group-hover:shadow-amber-500/20',
    rose: 'hover:shadow-rose-500/10 group-hover:shadow-rose-500/20',
    cyan: 'hover:shadow-cyan-500/10 group-hover:shadow-cyan-500/20',
    violet: 'hover:shadow-violet-500/10 group-hover:shadow-violet-500/20',
    orange: 'hover:shadow-orange-500/10 group-hover:shadow-orange-500/20',
    purple: 'hover:shadow-purple-500/10 group-hover:shadow-purple-500/20',
  };

  useEffect(() => {
    if (!hover || !cardRef.current) return;
    
    const card = cardRef.current;
    
    const handleMouseEnter = () => {
      gsap.to(card, { scale: 1.01, y: -2, duration: 0.2, ease: 'power2.out' });
    };
    
    const handleMouseLeave = () => {
      gsap.to(card, { scale: 1, y: 0, duration: 0.2, ease: 'power2.out' });
    };
    
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hover]);

  return (
    <div
      ref={cardRef}
      className={`
        relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]
        rounded-2xl shadow-xl shadow-black/20
        ${hover ? `hover:shadow-2xl ${glowColors[glowColor]} hover:border-white/[0.15]` : ''}
        before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/[0.07] before:via-transparent before:to-transparent before:pointer-events-none
        ${className}
      `}
    >
      {children}
    </div>
  );
});
GlassCard.displayName = 'GlassCard';

// Mini Progress Badge - MIGRÉ vers GSAP
const ProgressBadge = memo(function ProgressBadge({ value, color = '#10b981' }: { value: number; color?: string }) {
  const circleRef = useRef<SVGCircleElement>(null);
  const prevValueRef = useRef(0);

  useEffect(() => {
    if (!circleRef.current) return;
    
    const circumference = 87.96; // 2 * PI * 14
    const targetOffset = circumference - (value / 100) * circumference;
    const prevOffset = circumference - (prevValueRef.current / 100) * circumference;
    
    gsap.fromTo(circleRef.current, 
      { strokeDashoffset: prevOffset },
      { strokeDashoffset: targetOffset, duration: 0.8, ease: 'power2.out' }
    );
    
    prevValueRef.current = value;
  }, [value]);

  return (
    <div className="relative w-9 h-9 flex-shrink-0">
      <svg width="36" height="36" className="transform -rotate-90">
        <circle cx="18" cy="18" r="14" stroke="rgba(51, 65, 85, 0.3)" strokeWidth="3" fill="none" />
        <circle
          ref={circleRef}
          cx="18" cy="18" r="14" stroke={color} strokeWidth="3" fill="none"
          strokeDasharray={87.96}
          strokeDashoffset={87.96}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">{value}</span>
      </div>
    </div>
  );
});

// Action Item Component
const ActionItem = ({ 
  text, badge, badgeColor = 'slate', isUrgent = false, isDone = false 
}: { text: string; badge?: string; badgeColor?: string; isUrgent?: boolean; isDone?: boolean }) => {
  const badgeClasses: Record<string, string> = {
    emerald: 'bg-emerald-500/20 text-emerald-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
    violet: 'bg-violet-500/20 text-violet-400',
    amber: 'bg-amber-500/20 text-amber-400',
    orange: 'bg-orange-500/20 text-orange-400',
    rose: 'bg-rose-500/20 text-rose-400',
    slate: 'bg-slate-500/20 text-slate-400',
  };

  return (
    <div className={`flex items-center gap-2 py-1.5 ${isDone ? 'opacity-50' : ''}`}>
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDone ? 'bg-emerald-400' : isUrgent ? 'bg-rose-400' : 'bg-slate-500'}`} />
      <span className={`text-xs flex-1 truncate ${isDone ? 'line-through text-slate-500' : 'text-slate-300'}`}>
        {text}
      </span>
      {badge && (
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${badgeClasses[badgeColor]}`}>
          {badge}
        </span>
      )}
      {isUrgent && !badge && <AlertCircle className="w-3 h-3 text-rose-400 flex-shrink-0" />}
    </div>
  );
};

// Category Card Component - MIGRÉ vers GSAP
interface CategoryCardProps {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  progress?: number;
  actions: Array<{ 
    text: string; 
    badge?: string; 
    badgeColor?: string; 
    isUrgent?: boolean; 
    isDone?: boolean;
    type?: 'task' | 'event' | 'goal';
    data?: Task | Event | Goal;
  }>;
  onActionClick?: (action: CategoryCardProps['actions'][0]) => void;
}

const CategoryCard = memo(({ id, label, icon: Icon, color, progress, actions, onActionClick }: CategoryCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const colorClasses: Record<string, { bg: string; text: string; border: string; glow: string; progress: string }> = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'emerald', progress: '#10b981' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'cyan', progress: '#06b6d4' },
    violet: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20', glow: 'violet', progress: '#8b5cf6' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'amber', progress: '#f59e0b' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', glow: 'orange', progress: '#f97316' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'purple', progress: '#a855f7' },
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'rose', progress: '#f43f5e' },
    slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', glow: 'slate', progress: '#64748b' },
  };
  
  const c = colorClasses[color] || colorClasses.slate;

  // Animation d'entrée GSAP
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(cardRef.current, 
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className="flex-shrink-0 w-[200px] h-[220px]"
    >
      <GlassCard glowColor={c.glow} className="p-4 group h-full flex flex-col">
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg ${c.bg} ${c.border} border flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${c.text}`} />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{label}</span>
            </div>
            <ProgressBadge value={progress || 0} color={c.progress} />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
            {actions.slice(0, 6).map((action, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  if (onActionClick && action.data) {
                    e.stopPropagation();
                    onActionClick(action);
                  }
                }}
                className={action.data ? 'cursor-pointer hover:bg-white/[0.05] rounded-lg -mx-1 px-1 transition-colors' : ''}
              >
                <ActionItem {...action} badgeColor={action.badgeColor || color} />
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
});
CategoryCard.displayName = 'CategoryCard';

export default function MindLifeDashboard() {
  const { tasks, goals, habits, events, categories, userProfile, dataLoaded, loadAllData, isLoading, setActivePanel, journalEntries, currentUserId } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // États pour les modales
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  // Refs pour les animations GSAP des modales
  const taskModalOverlayRef = useRef<HTMLDivElement>(null);
  const taskModalContentRef = useRef<HTMLDivElement>(null);
  const taskProgressBarRef = useRef<HTMLDivElement>(null);
  const goalModalOverlayRef = useRef<HTMLDivElement>(null);
  const goalModalContentRef = useRef<HTMLDivElement>(null);
  const goalProgressBarRef = useRef<HTMLDivElement>(null);
  const eventModalOverlayRef = useRef<HTMLDivElement>(null);
  const eventModalContentRef = useRef<HTMLDivElement>(null);

  const userId = currentUserId || 'mindlife-user';

  useEffect(() => {
    if (!dataLoaded) loadAllData();
  }, [dataLoaded, loadAllData]);

  // ========== ANIMATIONS GSAP POUR LES MODALES ==========
  
  // Animation Task Modal
  useEffect(() => {
    if (showTaskModal && taskModalOverlayRef.current && taskModalContentRef.current) {
      gsap.fromTo(taskModalOverlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(taskModalContentRef.current, 
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
      );
      // Progress bar animation
      if (taskProgressBarRef.current && selectedTask) {
        gsap.fromTo(taskProgressBarRef.current, 
          { width: '0%' },
          { width: `${selectedTask.progress || 0}%`, duration: 0.6, delay: 0.2, ease: 'power2.out' }
        );
      }
    }
  }, [showTaskModal, selectedTask]);

  // Animation Goal Modal
  useEffect(() => {
    if (showGoalModal && goalModalOverlayRef.current && goalModalContentRef.current) {
      gsap.fromTo(goalModalOverlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(goalModalContentRef.current, 
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
      );
      // Progress bar animation
      if (goalProgressBarRef.current && selectedGoal) {
        gsap.fromTo(goalProgressBarRef.current, 
          { width: '0%' },
          { width: `${selectedGoal.progress || 0}%`, duration: 0.6, delay: 0.2, ease: 'power2.out' }
        );
      }
    }
  }, [showGoalModal, selectedGoal]);

  // Animation Event Modal
  useEffect(() => {
    if (showEventModal && eventModalOverlayRef.current && eventModalContentRef.current) {
      gsap.fromTo(eventModalOverlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(eventModalContentRef.current, 
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [showEventModal]);

  // Fonction pour fermer avec animation
  const closeTaskModalWithAnimation = () => {
    if (taskModalOverlayRef.current && taskModalContentRef.current) {
      gsap.to(taskModalContentRef.current, { scale: 0.95, opacity: 0, y: 20, duration: 0.2 });
      gsap.to(taskModalOverlayRef.current, { opacity: 0, duration: 0.2, onComplete: () => setShowTaskModal(false) });
    } else {
      setShowTaskModal(false);
    }
  };

  const closeGoalModalWithAnimation = () => {
    if (goalModalOverlayRef.current && goalModalContentRef.current) {
      gsap.to(goalModalContentRef.current, { scale: 0.95, opacity: 0, y: 20, duration: 0.2 });
      gsap.to(goalModalOverlayRef.current, { opacity: 0, duration: 0.2, onComplete: () => setShowGoalModal(false) });
    } else {
      setShowGoalModal(false);
    }
  };

  const closeEventModalWithAnimation = () => {
    if (eventModalOverlayRef.current && eventModalContentRef.current) {
      gsap.to(eventModalContentRef.current, { scale: 0.95, opacity: 0, y: 20, duration: 0.2 });
      gsap.to(eventModalOverlayRef.current, { opacity: 0, duration: 0.2, onComplete: () => setShowEventModal(false) });
    } else {
      setShowEventModal(false);
    }
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // ========== CALCULS DES VRAIES DONNÉES (AVANT early return) ==========
  
  // Helper pour vérifier si une date est aujourd'hui
  const isToday = (dateStr: string | undefined): boolean => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  // Tâches du jour ET tâches en cours
  const todayTasks = tasks.filter(t => !['completed', 'cancelled'].includes(t.status));
  const completedToday = tasks.filter(t => t.status === 'completed');
  const totalTasksToday = todayTasks.length + completedToday.length;
  const taskCompletionRate = totalTasksToday > 0 ? Math.round((completedToday.length / totalTasksToday) * 100) : 0;

  // Événements du jour
  const todayEvents = events.filter(e => e.date === todayStr);

  // Objectifs actifs
  const activeGoals = goals.filter(g => g.status !== 'completed');
  const goalsCompletionRate = goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0;

  // Handler pour le smart switching des modales (avec logique intelligente pour les events)
  const handleCardActionClick = (action: { type?: 'task' | 'event' | 'goal'; data?: Task | Event | Goal }) => {
    if (!action.data) return;
    
    // Fermer toutes les modales d'abord
    setShowTaskModal(false);
    setShowGoalModal(false);
    setShowEventModal(false);

    // Si c'est un event, vérifier s'il est lié à un objectif ou une tâche
    if (action.type === 'event') {
      const event = action.data as Event;
      
      // 1. Si l'event est lié à un objectif (goalId ou milestoneId) → GoalModal
      if (event.goalId || event.milestoneId) {
        const relatedGoal = goals.find(g => g.id === event.goalId);
        if (relatedGoal) {
          setTimeout(() => {
            setSelectedGoal(relatedGoal);
            setShowGoalModal(true);
          }, 50);
          return;
        }
      }
      
      // 2. Si l'event est lié à une tâche (un task a eventId === event.id) → TaskModal
      const relatedTask = tasks.find(t => t.eventId === event.id);
      if (relatedTask) {
        setTimeout(() => {
          setSelectedTask(relatedTask);
          setShowTaskModal(true);
        }, 50);
        return;
      }
      
      // 3. Sinon, c'est un événement classique → EventModal
      setTimeout(() => {
        setSelectedEvent(event);
        setShowEventModal(true);
      }, 50);
      return;
    }
    
    // Pour les autres types (task, goal), comportement normal
    setTimeout(() => {
      if (action.type === 'task') {
        setSelectedTask(action.data as Task);
        setShowTaskModal(true);
      } else if (action.type === 'goal') {
        setSelectedGoal(action.data as Goal);
        setShowGoalModal(true);
      }
    }, 50);
  };

  // ========== CARDS DYNAMIQUES ==========
  const categoryCards: CategoryCardProps[] = [
    {
      id: 'calendar',
      label: 'Calendrier',
      icon: Calendar,
      color: 'cyan',
      progress: todayEvents.length > 0 ? Math.min(100, todayEvents.length * 25) : 0,
      actions: todayEvents.slice(0, 6).map(e => ({
        text: e.title,
        badge: e.startTime,
        isUrgent: e.priority === 'urgent',
        type: 'event' as const,
        data: e,
      })),
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
      icon: Briefcase,
      color: 'slate',
      progress: 35,
      actions: [
        { text: 'Module en développement', badge: 'Bientôt' },
      ],
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
      icon: ChefHat,
      color: 'orange',
      progress: 60,
      actions: [
        { text: 'Module en développement', badge: 'Bientôt' },
      ],
    },
    {
      id: 'mind',
      label: 'Esprit',
      icon: Brain,
      color: 'purple',
      progress: habits.filter(h => h.categoryId?.includes('mind') || h.icon === '🧘').length > 0 ? 50 : 0,
      actions: habits.filter(h => h.categoryId?.includes('mind') || h.icon === '🧘').slice(0, 4).map(h => ({
        text: h.title,
        badge: `${h.streak}j`,
      })),
    },
    {
      id: 'culture',
      label: 'Culture',
      icon: BookOpen,
      color: 'cyan',
      progress: 30,
      actions: [{ text: 'Module en développement', badge: 'Bientôt' }],
    },
    {
      id: 'growth',
      label: 'Croissance',
      icon: TrendingUp,
      color: 'emerald',
      progress: 40,
      actions: [{ text: 'Module en développement', badge: 'Bientôt' }],
    },
    {
      id: 'health',
      label: 'Santé',
      icon: Heart,
      color: 'rose',
      progress: 50,
      actions: [{ text: 'Module en développement', badge: 'Bientôt' }],
    },
    {
      id: 'sport',
      label: 'Sport',
      icon: Dumbbell,
      color: 'orange',
      progress: habits.filter(h => h.categoryId?.includes('sport') || h.icon === '💪').length > 0 ? 60 : 0,
      actions: habits.filter(h => h.categoryId?.includes('sport') || h.icon === '💪').slice(0, 4).map(h => ({
        text: h.title,
        badge: `${h.streak}j`,
      })),
    },
    {
      id: 'ai-synthesis',
      label: 'Synthèse AI',
      icon: Sparkles,
      color: 'violet',
      progress: 20,
      actions: [{ text: 'Module en développement', badge: 'Bientôt' }],
    },
  ];

  // Journal du jour avec vraies données - garde les références aux objets
  const journalItems: Array<{ 
    time: string; 
    title: string; 
    done: boolean; 
    urgent: boolean;
    type: 'task' | 'event' | 'goal';
    data: Task | Event | Goal;
  }> = (() => {
    const items: Array<{ 
      time: string; 
      title: string; 
      done: boolean; 
      urgent: boolean;
      type: 'task' | 'event' | 'goal';
      data: Task | Event | Goal;
    }> = [];
    
    // Ajouter les événements du jour
    todayEvents.forEach(e => {
      items.push({ 
        time: e.startTime || (e.startAt ? new Date(e.startAt).toTimeString().slice(0, 5) : '--:--'), 
        title: e.title, 
        done: false, 
        urgent: e.priority === 'urgent',
        type: 'event',
        data: e,
      });
    });
    
    // Ajouter toutes les tâches en cours (pas seulement celles d'aujourd'hui)
    todayTasks.forEach(t => {
      items.push({ 
        time: t.dueDate ? new Date(t.dueDate).toTimeString().slice(0, 5) : 'À faire', 
        title: t.title, 
        done: t.status === 'completed',
        urgent: t.priority === 'high',
        type: 'task',
        data: t,
      });
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
  })();

  // Handler pour ouvrir les modales (smart switching intelligent)
  const handleJournalItemClick = (item: typeof journalItems[0]) => {
    // Fermer toutes les modales d'abord
    setShowTaskModal(false);
    setShowGoalModal(false);
    setShowEventModal(false);

    // Si c'est un event, vérifier s'il est lié à un objectif ou une tâche
    if (item.type === 'event') {
      const event = item.data as Event;
      
      // 1. Si l'event est lié à un objectif (goalId ou milestoneId) → GoalModal
      if (event.goalId || event.milestoneId) {
        const relatedGoal = goals.find(g => g.id === event.goalId);
        if (relatedGoal) {
          setTimeout(() => {
            setSelectedGoal(relatedGoal);
            setShowGoalModal(true);
          }, 50);
          return;
        }
      }
      
      // 2. Si l'event est lié à une tâche (un task a eventId === event.id) → TaskModal
      const relatedTask = tasks.find(t => t.eventId === event.id);
      if (relatedTask) {
        setTimeout(() => {
          setSelectedTask(relatedTask);
          setShowTaskModal(true);
        }, 50);
        return;
      }
      
      // 3. Sinon, c'est un événement classique → EventModal
      setTimeout(() => {
        setSelectedEvent(event);
        setShowEventModal(true);
      }, 50);
      return;
    }
    
    // Pour les autres types (task, goal), comportement normal
    setTimeout(() => {
      if (item.type === 'task') {
        setSelectedTask(item.data as Task);
        setShowTaskModal(true);
      } else if (item.type === 'goal') {
        setSelectedGoal(item.data as Goal);
        setShowGoalModal(true);
      }
    }, 50);
  };

  // Scroll handlers
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -440 : 440, behavior: 'smooth' });
    }
  };

  // Early return pour le loading (APRÈS les hooks)
  if (isLoading || !dataLoaded) {
    return (
      <div className="min-h-screen bg-[#030712] pl-[70px] flex items-center justify-center relative overflow-hidden">
        <AnimatedOrbs />
        <div className="text-center relative z-10">
          <div 
            className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin"
            style={{ animationDuration: '1s' }}
          />
          <p className="text-slate-400">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] pl-[70px] relative overflow-hidden pt-20">
      <AnimatedOrbs />
      
      <MindLifeHeader
        title="Tableau de Bord"
        subtitle={userProfile?.name ? `Bienvenue, ${userProfile.name}` : 'Bienvenue'}
        icon={LayoutDashboard}
        theme="emerald"
        showBackButton={false}
      />

      <div className="relative z-10 p-6">
        {/* Section Catégories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/20">
                <LayoutDashboard className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Vue d'ensemble</h2>
                <p className="text-xs text-slate-500">{categoryCards.length} modules • {tasks.length} tâches • {goals.length} objectifs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')} disabled={!canScrollLeft}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 ${
                  canScrollLeft ? 'bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-white hover:scale-105' : 'bg-white/[0.02] border border-white/[0.04] text-slate-600 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')} disabled={!canScrollRight}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-95 ${
                  canScrollRight ? 'bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-white hover:scale-105' : 'bg-white/[0.02] border border-white/[0.04] text-slate-600 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div ref={scrollContainerRef} onScroll={checkScroll} className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar-horizontal scroll-smooth">
            <div className={`pointer-events-none fixed left-[70px] top-[140px] w-16 h-[260px] bg-gradient-to-r from-[#030712] to-transparent z-20 transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`} />
            
            {categoryCards.map((card, index) => (
              <div
                key={card.id}
                className="flex-shrink-0" style={{ scrollSnapAlign: 'start' }}
                onClick={() => setActivePanel(card.id)}
              >
                <CategoryCard {...card} onActionClick={handleCardActionClick} />
              </div>
            ))}
            
            <div className={`pointer-events-none fixed right-0 top-[140px] w-16 h-[260px] bg-gradient-to-l from-[#030712] to-transparent z-20 transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        </div>

        {/* Journal + Objectifs - Same Height Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Journal du Jour */}
          <div className="h-[400px] animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <GlassCard hover={false} className="p-6 h-full flex flex-col">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/20">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Journal du Jour</h2>
                      <p className="text-xs text-slate-500">
                        {today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                  <div className="space-y-2">
                    {journalItems.length > 0 ? journalItems.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleJournalItemClick(item)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] transition-all cursor-pointer group border border-transparent hover:border-white/[0.08] animate-slide-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className={`w-12 text-xs font-mono shrink-0 px-2 py-1 rounded-lg text-center ${
                          item.type === 'task' ? 'bg-emerald-500/10 text-emerald-400' :
                          item.type === 'event' ? 'bg-cyan-500/10 text-cyan-400' :
                          'bg-violet-500/10 text-violet-400'
                        }`}>
                          {item.time}
                        </div>
                        <div className={`w-2 h-2 rounded-full shrink-0 ${item.done ? 'bg-emerald-400' : item.urgent ? 'bg-rose-400' : 'bg-cyan-400'}`} />
                        <span className={`flex-1 text-sm truncate ${item.done ? 'line-through text-slate-500' : 'text-white group-hover:text-emerald-100'}`}>
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.type === 'task' ? 'Tâche' : item.type === 'event' ? 'Event' : 'Objectif'}
                        </span>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p className="text-slate-400 text-sm">Rien de prévu aujourd'hui</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Objectifs Actifs */}
          <div className="h-[400px] animate-fade-in" style={{ animationDelay: '0.35s' }}>
            <GlassCard hover={false} className="p-6 h-full flex flex-col">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center border border-violet-500/20">
                      <Target className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Objectifs Actifs</h3>
                      <p className="text-xs text-slate-500">Votre progression</p>
                    </div>
                  </div>
                  <span className="text-xs text-violet-400 px-2 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    {activeGoals.length} en cours
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                  <div className="space-y-4">
                    {activeGoals.length > 0 ? activeGoals.slice(0, 8).map((goal, index) => {
                      const progress = goal.progress || 0;
                      const progressColors: Record<string, string> = {
                        emerald: 'from-emerald-500 to-cyan-500',
                        cyan: 'from-cyan-500 to-blue-500',
                        amber: 'from-amber-500 to-orange-500',
                        violet: 'from-violet-500 to-purple-500',
                        orange: 'from-orange-500 to-red-500',
                      };
                      const color = progress >= 70 ? 'emerald' : progress >= 40 ? 'amber' : 'violet';
                      
                      return (
                        <div 
                          key={goal.id} 
                          onClick={() => handleJournalItemClick({ type: 'goal', data: goal } as typeof journalItems[0])}
                          className="group cursor-pointer p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-violet-500/20 transition-all animate-slide-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-white group-hover:text-emerald-100 transition-colors truncate flex-1">{goal.title}</span>
                            <span className={`font-bold ml-2 ${progress >= 70 ? 'text-emerald-400' : progress >= 40 ? 'text-amber-400' : 'text-violet-400'}`}>
                              {progress}%
                            </span>
                          </div>
                          <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${progressColors[color]} animate-progress`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="text-center py-8">
                        <Target className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p className="text-slate-400 text-sm">Aucun objectif actif</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Minuteur + Habitudes + Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <GlassCard glowColor="emerald" className="p-5">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Minuteur Focus</h3>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-bold text-white font-mono mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">25:00</div>
                  <div className="flex gap-3">
                    <button className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center hover:shadow-lg hover:shadow-emerald-500/25 transition-all active:scale-95 hover:scale-105">
                      <Play className="w-4 h-4 text-slate-900 ml-0.5" />
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition-all active:scale-95 hover:scale-105">
                      <RotateCcw className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.45s' }}>
            <GlassCard glowColor="violet" className="p-5">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Habitudes</h3>
                </div>
                <div className="space-y-2">
                  {habits.slice(0, 3).map((habit, index) => (
                    <div
                      key={habit.id}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group animate-slide-in"
                      style={{ animationDelay: `${500 + index * 50}ms` }}
                    >
                      <span className="text-base">{habit.icon}</span>
                      <span className="flex-1 text-xs truncate text-slate-300 group-hover:text-white">{habit.title}</span>
                      <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">{habit.streak}j</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <GlassCard glowColor="amber" className="p-5">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">Notes Rapides</h3>
                </div>
                <div className="space-y-2">
                  {journalEntries.slice(0, 2).map((entry, index) => (
                    <div key={entry.id} className={`${index === 0 ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/[0.02] border border-white/[0.05]'} rounded-xl p-2.5`}>
                      <p className={`text-xs leading-relaxed ${index === 0 ? 'text-amber-400/90' : 'text-slate-400'}`}>
                        {entry.title || entry.content.slice(0, 50)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* ========== MODALES ========== */}
      
      {/* Modal Tâche */}
      {showTaskModal && selectedTask && (
        <div
          ref={taskModalOverlayRef}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
          onClick={closeTaskModalWithAnimation}
        >
          <div
            ref={taskModalContentRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto"
          >
              <GlassCard glowColor="emerald" className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <CheckSquare className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedTask.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          selectedTask.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                          selectedTask.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {selectedTask.priority === 'high' ? '🔥 Haute' : selectedTask.priority === 'medium' ? '⚡ Moyenne' : '○ Basse'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          selectedTask.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          selectedTask.status === 'in_progress' ? 'bg-cyan-500/20 text-cyan-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {selectedTask.status === 'completed' ? '✓ Terminée' : selectedTask.status === 'in_progress' ? '▶ En cours' : '○ En attente'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={closeTaskModalWithAnimation} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Dates */}
                <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Dates de la Tâche
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Sunrise className="w-5 h-5 text-cyan-400" />
                        <span className="text-xs text-cyan-300 font-medium uppercase tracking-wider">Début</span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {selectedTask.startDate ? new Date(selectedTask.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non définie'}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Sunset className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs text-emerald-300 font-medium uppercase tracking-wider">Échéance</span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non définie'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedTask.description && (
                  <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-sm text-slate-300">{selectedTask.description}</p>
                  </div>
                )}

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Progression</span>
                    <span className="text-lg font-bold text-emerald-400">{selectedTask.progress || 0}%</span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      ref={taskProgressBarRef}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      style={{ width: `${selectedTask.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      try {
                        await fetch('/api/tasks', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            id: selectedTask.id,
                            status: selectedTask.status === 'completed' ? 'pending' : 'completed',
                            userId,
                          })
                        });
                        setShowTaskModal(false);
                        loadAllData();
                      } catch (e) {
                        console.error('Error updating task:', e);
                      }
                    }}
                    className={`flex-1 px-4 py-3 rounded-xl text-white text-sm font-medium ${
                      selectedTask.status === 'completed' 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}
                  >
                    {selectedTask.status === 'completed' ? '↩️ Rouvrir' : '✓ Terminer'}
                  </button>
                  <button onClick={closeTaskModalWithAnimation} className="px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm">
                    Fermer
                  </button>
                </div>
              </GlassCard>
          </div>
        </div>
      )}

      {/* Modal Objectif */}
      {showGoalModal && selectedGoal && (
        <div
          ref={goalModalOverlayRef}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
          onClick={closeGoalModalWithAnimation}
        >
          <div
            ref={goalModalContentRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
              <GlassCard glowColor="violet" className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center">
                      <Target className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedGoal.title}</h3>
                      <span className="text-xs text-violet-400">{selectedGoal.priority || 'Objectif'}</span>
                    </div>
                  </div>
                  <button onClick={closeGoalModalWithAnimation} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Dates */}
                <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-cyan-500/10 border border-violet-500/20">
                  <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Dates de l'Objectif
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Sunrise className="w-5 h-5 text-cyan-400" />
                        <span className="text-xs text-cyan-300 font-medium uppercase tracking-wider">Début</span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {selectedGoal.startDate ? new Date(selectedGoal.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non définie'}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Sunset className="w-5 h-5 text-violet-400" />
                        <span className="text-xs text-violet-300 font-medium uppercase tracking-wider">Deadline</span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {selectedGoal.endDate ? new Date(selectedGoal.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non définie'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Progression</span>
                    <span className="text-lg font-bold text-white">{selectedGoal.progress || 0}%</span>
                  </div>
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      ref={goalProgressBarRef}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                      style={{ width: `${selectedGoal.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Description */}
                {selectedGoal.description && (
                  <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-sm text-slate-300">{selectedGoal.description}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={closeGoalModalWithAnimation} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium">
                    Fermer
                  </button>
                </div>
              </GlassCard>
          </div>
        </div>
      )}

      {/* Modal Événement */}
      {showEventModal && selectedEvent && (
        <div
          ref={eventModalOverlayRef}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
          onClick={closeEventModalWithAnimation}
        >
          <div
            ref={eventModalContentRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
              <GlassCard glowColor="cyan" className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedEvent.title}</h3>
                      <span className="text-xs text-cyan-400">
                        {selectedEvent.startAt ? new Date(selectedEvent.startAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Date non définie'}
                      </span>
                    </div>
                  </div>
                  <button onClick={closeEventModalWithAnimation} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Date et Heure */}
                <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-teal-500/10 border border-cyan-500/20">
                  <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date et Heure
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Sunrise className="w-5 h-5 text-cyan-400" />
                        <span className="text-xs text-cyan-300 font-medium uppercase tracking-wider">Date</span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {selectedEvent.startAt ? new Date(selectedEvent.startAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non définie'}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Sunset className="w-5 h-5 text-emerald-400" />
                        <span className="text-xs text-emerald-300 font-medium uppercase tracking-wider">Heure</span>
                      </div>
                      <div className="text-xl font-bold text-white font-mono">
                        {selectedEvent.startAt ? new Date(selectedEvent.startAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : (selectedEvent.startTime || '--:--')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedEvent.description && (
                  <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-sm text-slate-300">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Lieu */}
                {selectedEvent.location && (
                  <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lieu</span>
                    </div>
                    <p className="text-sm text-white">{selectedEvent.location}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={closeEventModalWithAnimation} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium">
                    Fermer
                  </button>
                </div>
              </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
