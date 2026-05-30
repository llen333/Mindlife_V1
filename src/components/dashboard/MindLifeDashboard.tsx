'use client';

import { useEffect, useRef, useState, useMemo, memo } from 'react';
import { 
  Target, Zap, Clock, Play, RotateCcw,
  LayoutDashboard, Calendar, CheckSquare, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Task, Goal, Event, useStore } from '@/lib/store/selectors';
import { useNavigationActions } from '@/lib/store/selectors';
import MindLifeHeader from '../MindLifeHeader';
import GoalModal from '../goals/GoalModal';
import TaskModal from '../goals/TaskModal';
import CreateEventModal from '../calendar/CreateEventModal';
import { GlassCard, CategoryCard, CategoryCardAction } from './components';
import { useDashboardData, JournalItem } from './hooks';
import { PROGRESS_COLORS } from './constants';

// Composant pour les orbs animés en background - DÉSACTIVÉ pour test performance
const AnimatedOrbs = memo(() => null);
AnimatedOrbs.displayName = 'AnimatedOrbs';

export default function MindLifeDashboard() {
  const {
    tasks, goals, habits, journalEntries, userProfile,
    dataLoaded, isLoading, loadAllData,
    today, todayTasks, todayEvents, activeGoals,
    taskCompletionRate, goalsCompletionRate, currentUserId,
    journalItems, buildCategoryCardsActions
  } = useDashboardData();

  const { setActivePanel } = useNavigationActions();
  const { updateTask, addTask, updateGoal, updateEvent, addEvent } = useStore();
  
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

  const userId = currentUserId || 'mindlife-user';

  // Charger les données si nécessaire
  useEffect(() => {
    if (!dataLoaded) loadAllData();
  }, [dataLoaded, loadAllData]);

  // ========== HANDLERS POUR LES MODALES ==========

  const closeAllModals = () => {
    setShowTaskModal(false);
    setShowGoalModal(false);
    setShowEventModal(false);
  };

  const handleCardActionClick = (action: CategoryCardAction) => {
    if (!action.data) return;
    closeAllModals();
    
    setTimeout(() => {
      if (action.type === 'task') {
        setSelectedTask(action.data as Task);
        setShowTaskModal(true);
      } else if (action.type === 'event') {
        setSelectedEvent(action.data as Event);
        setShowEventModal(true);
      } else if (action.type === 'goal') {
        setSelectedGoal(action.data as Goal);
        setShowGoalModal(true);
      }
    }, 50);
  };

  const handleJournalItemClick = (item: JournalItem) => {
    closeAllModals();

    setTimeout(() => {
      if (item.type === 'task') {
        setSelectedTask(item.data as Task);
        setShowTaskModal(true);
      } else if (item.type === 'event') {
        setSelectedEvent(item.data as Event);
        setShowEventModal(true);
      } else if (item.type === 'goal' || item.type === 'milestone') {
        setSelectedGoal(item.data as Goal);
        setShowGoalModal(true);
      }
    }, 50);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (taskData.id) {
        await updateTask(taskData.id, taskData);
      } else {
        await addTask({
          ...taskData,
          id: `task-${Date.now()}`,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Task);
      }
      setShowTaskModal(false);
      loadAllData();
    } catch (e) {
      console.error('Error saving task:', e);
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      await updateGoal(goalId, updates);
      loadAllData();
    } catch (e) {
      console.error('Error updating goal:', e);
    }
  };

  const handleSaveEvent = async (eventData: Partial<Event> & { createTask?: boolean }) => {
    try {
      const { createTask, ...data } = eventData;
      
      if (selectedEvent?.id) {
        await updateEvent(selectedEvent.id, data);
      } else {
        await addEvent({
          ...data,
          id: `event-${Date.now()}`,
          userId,
          createdAt: new Date().toISOString(),
        } as Event);
      }
      
      if (createTask && data.title) {
        await addTask({
          id: `task-${Date.now()}`,
          title: data.title,
          description: data.description,
          startDate: data.date ? new Date(data.date).toISOString() : undefined,
          dueDate: data.date ? new Date(data.date).toISOString() : undefined,
          categoryId: data.categoryId,
          priority: data.priority === 'urgent' ? 'high' : data.priority || 'medium',
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'pending',
        } as unknown as Task);
      }
      
      setShowEventModal(false);
      loadAllData();
    } catch (e) {
      console.error('Error saving event:', e);
    }
  };

  // ========== CARDS DYNAMIQUES ==========
  const categoryCards = useMemo(() => 
    buildCategoryCardsActions(
      Calendar, CheckSquare, Target,
      ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>,
      ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><path d="M12 16v-4M12 8h.01"/></svg>,
      ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 6.5L17.5 17.5M6.5 17.5L17.5 6.5"/></svg>
    ),
    [buildCategoryCardsActions]
  );

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

  // Early return pour le loading
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
            
            {categoryCards.map((card) => (
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

        {/* Journal + Objectifs */}
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
                          item.type === 'milestone' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-violet-500/10 text-violet-400'
                        }`}>
                          {item.time}
                        </div>
                        <div className={`w-2 h-2 rounded-full shrink-0 ${item.done ? 'bg-emerald-400' : item.urgent ? 'bg-rose-400' : 'bg-cyan-400'}`} />
                        <span className={`flex-1 text-sm truncate ${item.done ? 'line-through text-slate-500' : 'text-white group-hover:text-emerald-100'}`}>
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.type === 'task' ? 'Tâche' : item.type === 'event' ? 'Event' : item.type === 'milestone' ? 'Étape' : 'Objectif'}
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
                      const color = progress >= 70 ? 'emerald' : progress >= 40 ? 'amber' : 'violet';
                      
                      return (
                        <div 
                          key={goal.id} 
                          onClick={() => handleJournalItemClick({ type: 'goal', data: goal } as any)}
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
                              className={`h-full rounded-full bg-gradient-to-r ${PROGRESS_COLORS[color]} animate-progress`}
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
          <FocusTimerCard />
          <HabitsCard habits={habits} />
          <NotesCard journalEntries={journalEntries} />
        </div>
      </div>

      {/* Modales */}
      {showTaskModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSave={handleSaveTask}
        />
      )}

      {showGoalModal && selectedGoal && (
        <GoalModal
          goal={selectedGoal}
          isOpen={showGoalModal}
          onClose={() => setShowGoalModal(false)}
          onUpdate={handleUpdateGoal}
        />
      )}

      {showEventModal && <CreateEventModal {...{isOpen: showEventModal, onClose: () => setShowEventModal(false), onSave: handleSaveEvent, eventData: selectedEvent} as any} />}
    </div>
  );
}

// Sous-composants pour plus de clarté
const FocusTimerCard = () => (
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
);

const HabitsCard = ({ habits }: { habits: Array<{ id: string; icon: string; title: string; streak: number }> }) => (
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
);

const NotesCard = ({ journalEntries }: { journalEntries: Array<{ id: string; title?: string; content: string }> }) => (
  <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
    <GlassCard glowColor="amber" className="p-5">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
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
);
