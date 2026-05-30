// Composant pour les routines matinales et du soir
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Pause, Check, Clock, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { GrowthRoutine, RoutineStep } from '../types';

interface RoutineBuilderProps {
  routines: GrowthRoutine[];
  onCompleteStep: (routineId: string, stepId: string) => Promise<boolean>;
  onAddRoutine: () => void;
  onEditRoutine: (routine: GrowthRoutine) => void;
}

export function RoutineBuilder({ routines, onCompleteStep, onAddRoutine, onEditRoutine }: RoutineBuilderProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completingStep, setCompletingStep] = useState<string | null>(null);

  const handleCompleteStep = async (routineId: string, stepId: string) => {
    setCompletingStep(stepId);
    await onCompleteStep(routineId, stepId);
    setCompletingStep(null);
  };

  const morningRoutines = routines.filter(r => r.category === 'morning' && r.isActive);
  const eveningRoutines = routines.filter(r => r.category === 'evening' && r.isActive);

  const RoutineCard = ({ routine }: { routine: GrowthRoutine }) => {
    const isExpanded = expandedId === routine.id;
    const steps = routine.steps as RoutineStep[];
    const completedSteps = steps.filter(s => s.isCompleted).length;
    const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

    return (
      <motion.div
        layout
        className="relative overflow-hidden rounded-2xl bg-slate-800/30 border border-white/5"
      >
        <button
          onClick={() => setExpandedId(isExpanded ? null : routine.id)}
          className="w-full p-4 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                routine.category === 'morning' ? 'bg-amber-500/20 text-amber-400' : 'bg-violet-500/20 text-violet-400'
              }`}>
                <span className="text-2xl">{routine.category === 'morning' ? '🌅' : '🌙'}</span>
              </div>
              <div>
                <h4 className="font-medium text-white">{routine.title}</h4>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {routine.duration} min
                  </span>
                  <span>{completedSteps}/{steps.length} étapes</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {progress === 100 && (
                <div className="flex items-center gap-1 text-emerald-400">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">Terminé!</span>
                </div>
              )}
              {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${routine.category === 'morning' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-violet-500 to-purple-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </button>

        {/* Expanded Steps */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer
                      ${step.isCompleted 
                        ? 'bg-emerald-500/10 border border-emerald-500/20' 
                        : 'bg-slate-700/30 hover:bg-slate-700/50'
                      }
                    `}
                    onClick={() => handleCompleteStep(routine.id, step.id)}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${step.isCompleted 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-600/50 text-slate-300'
                      }
                    `}>
                      {step.isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`font-medium ${step.isCompleted ? 'text-emerald-400 line-through' : 'text-white'}`}>
                        {step.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span>{step.duration} min</span>
                    </div>
                  </div>
                ))}

                {/* Edit Button */}
                <button
                  onClick={() => onEditRoutine(routine)}
                  className="w-full mt-2 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Modifier la routine
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Morning Routines */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>🌅</span> Routine Matinale
          </h3>
          {morningRoutines.length === 0 && (
            <button
              onClick={() => onAddRoutine()}
              className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          )}
        </div>
        <div className="space-y-3">
          {morningRoutines.map(routine => (
            <RoutineCard key={routine.id} routine={routine} />
          ))}
          {morningRoutines.length === 0 && (
            <div className="text-center py-8 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <p className="text-sm text-slate-400">Pas encore de routine matinale</p>
            </div>
          )}
        </div>
      </div>

      {/* Evening Routines */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>🌙</span> Routine du Soir
          </h3>
          {eveningRoutines.length === 0 && (
            <button
              onClick={() => onAddRoutine()}
              className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          )}
        </div>
        <div className="space-y-3">
          {eveningRoutines.map(routine => (
            <RoutineCard key={routine.id} routine={routine} />
          ))}
          {eveningRoutines.length === 0 && (
            <div className="text-center py-8 rounded-2xl bg-violet-500/5 border border-violet-500/20">
              <p className="text-sm text-slate-400">Pas encore de routine du soir</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onAddRoutine()}
          className="flex-1 py-3 rounded-xl bg-slate-800/30 border border-white/5 text-slate-300 text-sm hover:bg-slate-700/30 transition-all"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Nouvelle routine
        </button>
      </div>
    </div>
  );
}
