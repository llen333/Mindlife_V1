// Composant pour les objectifs de croissance
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, ChevronRight, Calendar, Award, Zap } from 'lucide-react';
import type { GrowthGoal, Milestone } from '../types';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants';

interface GoalsPanelProps {
  goals: GrowthGoal[];
  onAddGoal: () => void;
  onEditGoal: (goal: GrowthGoal) => void;
}

const PHILOSOPHY_ICONS = {
  compound: '📈',
  atomic: '⚛️',
  'jim-rohn': '🎯',
  neville: '✨',
  none: '📋',
};

export function GoalsPanel({ goals, onAddGoal, onEditGoal }: GoalsPanelProps) {
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Objectifs de Croissance</h3>
        <button
          onClick={onAddGoal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouvel objectif
        </button>
      </div>

      {/* Active Goals */}
      <div className="space-y-4">
        {activeGoals.map((goal) => (
          <motion.button
            key={goal.id}
            onClick={() => onEditGoal(goal)}
            className="w-full relative overflow-hidden rounded-2xl bg-slate-800/30 border border-white/5 p-5 text-left hover:border-cyan-500/30 transition-all"
            whileHover={{ scale: 1.01 }}
          >
            {/* Progress Ring */}
            <div className="absolute top-4 right-4">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-slate-700"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={`${goal.progress * 1.5} 150`}
                    className="text-cyan-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                  {goal.progress}%
                </span>
              </div>
            </div>

            <div className="pr-20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{PHILOSOPHY_ICONS[goal.philosophy as keyof typeof PHILOSOPHY_ICONS]}</span>
                <h4 className="font-semibold text-white">{goal.title}</h4>
              </div>

              {goal.description && (
                <p className="text-sm text-slate-400 mb-3">{goal.description}</p>
              )}

              {/* Milestones */}
              {goal.milestones && goal.milestones.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {(goal.milestones as Milestone[]).slice(0, 4).map((milestone, i) => (
                    <div
                      key={milestone.id || i}
                      className={`
                        px-2 py-1 rounded-lg text-xs font-medium
                        ${milestone.isCompleted 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-700/50 text-slate-300'
                        }
                      `}
                    >
                      {milestone.completed ? '✓ ' : ''}{milestone.title}
                    </div>
                  ))}
                  {goal.milestones.length > 4 && (
                    <div className="px-2 py-1 rounded-lg text-xs text-slate-400">
                      +{goal.milestones.length - 4} autres
                    </div>
                  )}
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-slate-400">
                {goal.targetValue !== undefined && goal.targetValue !== null && (
                  <span>
                    {goal.currentValue} / {goal.targetValue} {goal.unit || ''}
                  </span>
                )}
                {goal.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(goal.deadline).toLocaleDateString('fr-FR')}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded-full ${
                  goal.type === 'identity' ? 'bg-purple-500/20 text-purple-400' :
                  goal.type === 'process' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-cyan-500/20 text-cyan-400'
                }`}>
                  {goal.type === 'identity' ? 'Identité' : goal.type === 'process' ? 'Processus' : 'Résultat'}
                </span>
              </div>

              {/* Identity Statement */}
              {goal.identityStatement && (
                <div className="mt-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-sm text-purple-300 italic">"{goal.identityStatement}"</p>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Empty State */}
      {activeGoals.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-slate-800/20 border border-white/5">
          <Target className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-slate-300 mb-2">Définis ton premier objectif</h4>
          <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
            Utilise la méthode SMART et les philosophies de croissance pour atteindre tes objectifs
          </p>
          <button
            onClick={onAddGoal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 transition-all"
          >
            <Plus className="w-5 h-5" />
            Créer un objectif
          </button>
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="mt-8">
          <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Objectifs atteints ({completedGoals.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {completedGoals.map(goal => (
              <div
                key={goal.id}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
              >
                ✓ {goal.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
