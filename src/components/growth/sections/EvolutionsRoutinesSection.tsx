// Section 1: Evolutions & Routines - Mise à jour complète
'use client';

import { useState } from 'react';
import { Sun, Moon, Calendar, Target, TrendingUp, ChevronRight, Play, Check, Flame, Zap, Clock, Plus, Edit2 } from 'lucide-react';
import type { GrowthRoutine, GrowthGoal, RoutineStep } from '../types';
import { RoutineModal, GoalModal } from '../modals';

interface EvolutionsRoutinesSectionProps {
  routines: GrowthRoutine[];
  goals: GrowthGoal[];
  onCompleteRoutine?: (id: string) => void;
  onUpdateRoutine?: (id: string, data: Partial<GrowthRoutine>) => void;
  onUpdateGoal?: (id: string, value: number) => void;
}

export function EvolutionsRoutinesSection({ 
  routines, 
  goals, 
  onCompleteRoutine,
  onUpdateRoutine,
  onUpdateGoal 
}: EvolutionsRoutinesSectionProps) {
  const [selectedRoutine, setSelectedRoutine] = useState<GrowthRoutine | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GrowthGoal | null>(null);
  const [localRoutines, setLocalRoutines] = useState<GrowthRoutine[]>(routines);

  // Sync local routines with props
  useState(() => {
    setLocalRoutines(routines);
  });

  const morningRoutines = localRoutines.filter(r => r.category === 'morning' && r.isActive);
  const eveningRoutines = localRoutines.filter(r => r.category === 'evening' && r.isActive);
  const activeGoals = goals.filter(g => g.status === 'active');

  // Handle routine update
  const handleUpdateRoutine = (id: string, data: Partial<GrowthRoutine>) => {
    setLocalRoutines(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    if (onUpdateRoutine) {
      onUpdateRoutine(id, data);
    }
  };

  // Handle step completion
  const handleCompleteStep = (routineId: string, stepId: string) => {
    setLocalRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      return {
        ...r,
        steps: r.steps.map(s => s.id === stepId ? { ...s, isCompleted: true } : s)
      };
    }));
  };

  // Calculate total duration from steps
  const getTotalDuration = (routine: GrowthRoutine): number => {
    return routine.steps?.reduce((acc, s) => acc + (s.duration || 0), 0) || routine.duration || 0;
  };

  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-light text-white tracking-wide">Évolutions & Routines</h2>
            <p className="text-white/40 text-sm">Vos habitudes de croissance quotidienne</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm hover:bg-amber-500/20 transition-colors">
          <Plus className="w-4 h-4" />
          Nouvelle routine
        </button>
      </div>

      {/* Routines Grid */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Morning Routines */}
        <div className="col-span-12 lg:col-span-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sun className="w-5 h-5 text-amber-400" />
                <h3 className="text-white/80 text-sm uppercase tracking-wider">Routines Matinales</h3>
              </div>
              <span className="text-white/30 text-sm">{morningRoutines.length}</span>
            </div>
            <div className="space-y-3">
              {morningRoutines.map((routine) => (
                <RoutineCard 
                  key={routine.id} 
                  routine={routine}
                  totalDuration={getTotalDuration(routine)}
                  onClick={() => setSelectedRoutine(routine)}
                />
              ))}
              {morningRoutines.length === 0 && (
                <div className="text-center py-8 text-white/30">
                  <Sun className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Aucune routine matinale
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Evening Routines */}
        <div className="col-span-12 lg:col-span-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-indigo-400" />
                <h3 className="text-white/80 text-sm uppercase tracking-wider">Routines du Soir</h3>
              </div>
              <span className="text-white/30 text-sm">{eveningRoutines.length}</span>
            </div>
            <div className="space-y-3">
              {eveningRoutines.map((routine) => (
                <RoutineCard 
                  key={routine.id} 
                  routine={routine}
                  totalDuration={getTotalDuration(routine)}
                  onClick={() => setSelectedRoutine(routine)}
                />
              ))}
              {eveningRoutines.length === 0 && (
                <div className="text-center py-8 text-white/30">
                  <Moon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Aucune routine du soir
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-emerald-400" />
            <h3 className="text-white/80 text-sm uppercase tracking-wider">Objectifs de Croissance</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-sm">{activeGoals.length} actifs</span>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-colors">
              <Plus className="w-3 h-3" />
              Nouvel objectif
            </button>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-4">
          {activeGoals.map((goal) => (
            <GoalCard 
              key={goal.id} 
              goal={goal}
              onClick={() => setSelectedGoal(goal)}
            />
          ))}
          {activeGoals.length === 0 && (
            <div className="col-span-12 text-center py-8 text-white/30">
              <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Aucun objectif actif
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <RoutineModal
        isVisible={!!selectedRoutine}
        onClose={() => setSelectedRoutine(null)}
        routine={selectedRoutine}
        onUpdate={handleUpdateRoutine}
        onComplete={onCompleteRoutine}
        onCompleteStep={handleCompleteStep}
      />
      <GoalModal
        isVisible={!!selectedGoal}
        onClose={() => setSelectedGoal(null)}
        goal={selectedGoal}
        onUpdate={onUpdateGoal}
      />
    </section>
  );
}

// ============================================
// ROUTINE CARD
// ============================================

interface RoutineCardProps {
  routine: GrowthRoutine;
  totalDuration: number;
  onClick: () => void;
}

function RoutineCard({ routine, totalDuration, onClick }: RoutineCardProps) {
  const completedSteps = routine.steps?.filter(s => s.isCompleted).length || 0;
  const progressPercent = routine.steps?.length ? (completedSteps / routine.steps.length) * 100 : 0;
  
  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer transition-all hover:bg-white/10"
    >
      {/* Icon */}
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: `${routine.color}20` }}
      >
        {routine.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-light truncate">{routine.title}</span>
          {routine.currentStreak > 0 && (
            <div className="flex items-center gap-1 text-amber-400">
              <Flame className="w-4 h-4" />
              <span className="text-xs">{routine.currentStreak}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-white/40 text-xs">
          {routine.timeOfDay && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {routine.timeOfDay}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {totalDuration} min
          </span>
          {routine.steps?.length > 0 && (
            <span>{completedSteps}/{routine.steps.length} étapes</span>
          )}
        </div>
      </div>

      {/* Progress Ring */}
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg className="w-10 h-10 transform -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-white/10"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${progressPercent} 100`}
            className="text-emerald-400"
          />
        </svg>
      </div>

      <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors" />
    </div>
  );
}

// ============================================
// GOAL CARD
// ============================================

interface GoalCardProps {
  goal: GrowthGoal;
  onClick: () => void;
}

function GoalCard({ goal, onClick }: GoalCardProps) {
  const completedMilestones = goal.milestones.filter(m => m.completed).length;
  
  return (
    <div
      onClick={onClick}
      className="col-span-12 md:col-span-6 lg:col-span-4 group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer transition-all hover:bg-white/10"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-light truncate">{goal.title}</h4>
          <p className="text-white/40 text-sm mt-1 line-clamp-2">{goal.description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-colors flex-shrink-0" />
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/40 text-xs">{goal.category}</span>
          <span className="text-white text-sm">{goal.progress}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      {/* Milestones */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {goal.milestones.slice(0, 4).map((milestone, i) => (
              <div
                key={milestone.id}
                className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center ${
                  milestone.completed 
                    ? 'bg-emerald-500 text-black' 
                    : 'bg-white/10'
                }`}
                style={{ zIndex: 4 - i }}
              >
                {milestone.completed && <Check className="w-3 h-3" />}
              </div>
            ))}
          </div>
          <span className="text-white/40">{completedMilestones}/{goal.milestones.length}</span>
        </div>
        {goal.targetValue && (
          <span className="text-white/60">
            {goal.currentValue}/{goal.targetValue} {goal.unit}
          </span>
        )}
      </div>
    </div>
  );
}
