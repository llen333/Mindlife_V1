// Composant pour tracker les habitudes quotidiennes
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, Check, Target } from 'lucide-react';
import type { GrowthHabit, HabitCategory } from '../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants';

interface HabitTrackerProps {
  habits: GrowthHabit[];
  onToggle: (id: string) => Promise<boolean>;
  onAddHabit: () => void;
  onEditHabit: (habit: GrowthHabit) => void;
  isLoading?: boolean;
}

export function HabitTracker({ habits, onToggle, onAddHabit, onEditHabit, isLoading }: HabitTrackerProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);
  
  const handleToggle = async (id: string) => {
    setTogglingId(id);
    await onToggle(id);
    setTogglingId(null);
  };

  const groupByTimeOfDay = (habits: GrowthHabit[]) => {
    const groups: Record<string, GrowthHabit[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      any: [],
    };
    
    habits.forEach(h => {
      if (h.isActive) {
        groups[h.timeOfDay || 'any'].push(h);
      }
    });
    
    return groups;
  };

  const grouped = groupByTimeOfDay(habits);
  const timeLabels = {
    morning: '🌅 Matin',
    afternoon: '☀️ Après-midi',
    evening: '🌙 Soir',
    any: '⏰ Flexible',
  };

  const completedToday = habits.filter(h => h.isActive && (h as GrowthHabit & { completedToday?: boolean }).completedToday).length;
  const activeHabits = habits.filter(h => h.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Habitudes du jour</h3>
          <p className="text-sm text-slate-400">
            {completedToday} / {activeHabits} complétées
          </p>
        </div>
        <button
          onClick={onAddHabit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouvelle
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
          initial={{ width: 0 }}
          animate={{ width: activeHabits > 0 ? `${(completedToday / activeHabits) * 100}%` : '0%' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Habits by Time */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([time, timeHabits]) => (
          timeHabits.length > 0 && (
            <div key={time}>
              <h4 className="text-sm font-medium text-slate-400 mb-3">{timeLabels[time as keyof typeof timeLabels]}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {timeHabits.map((habit) => {
                  const colors = CATEGORY_COLORS[habit.category as HabitCategory] || CATEGORY_COLORS.health;
                  const completed = (habit as GrowthHabit & { completedToday?: boolean }).completedToday;
                  
                  return (
                    <motion.button
                      key={habit.id}
                      onClick={() => onEditHabit(habit)}
                      className={`
                        relative overflow-hidden rounded-xl border p-4 text-left transition-all
                        ${completed 
                          ? 'bg-emerald-500/10 border-emerald-500/40' 
                          : `${colors.bg} ${colors.border}`
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Complete button */}
                      <div 
                        className="absolute top-3 right-3 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(habit.id);
                        }}
                      >
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer
                          ${completed 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                          }
                        `}>
                          {togglingId === habit.id ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : completed ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-current" />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pr-10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{habit.icon}</span>
                          <span className={`font-medium ${completed ? 'text-emerald-400 line-through' : 'text-white'}`}>
                            {habit.title}
                          </span>
                        </div>
                        
                        {habit.description && (
                          <p className="text-xs text-slate-400 line-clamp-2 mb-2">{habit.description}</p>
                        )}

                        {/* Streak */}
                        <div className="flex items-center gap-3 text-xs">
                          {habit.currentStreak > 0 && (
                            <div className="flex items-center gap-1 text-orange-400">
                              <Flame className="w-3.5 h-3.5" />
                              <span>{habit.currentStreak} jours</span>
                            </div>
                          )}
                          {habit.bestStreak > 0 && habit.bestStreak === habit.currentStreak && (
                            <span className="text-amber-400">🏆 Record!</span>
                          )}
                          {habit.linkedGoalId && (
                            <div className="flex items-center gap-1 text-cyan-400">
                              <Target className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Empty State */}
      {activeHabits === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🌱</div>
          <h4 className="text-lg font-medium text-slate-300 mb-2">Commence ton voyage</h4>
          <p className="text-sm text-slate-400 mb-4">Ajoute ta première habitude pour commencer à tracker ta croissance</p>
          <button
            onClick={onAddHabit}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            Ajouter une habitude
          </button>
        </div>
      )}
    </div>
  );
}
