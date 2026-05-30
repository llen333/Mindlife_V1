// SessionPanel - Current day's workout session
'use client';

import { Target, Play, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkoutSession, Exercise } from '../types';
import { categoryLabels, exerciseImages, mobilityByWorkout } from '../constants';

interface SessionPanelProps {
  session: WorkoutSession | null;
  workoutType: string;
  exercises: { main: Exercise[]; warmup: Exercise[]; cooldown: Exercise[] };
  sessionDuration?: number;
  isSessionInProgress: boolean;
  isSessionCompleted: boolean;
  isSelectedDateToday: boolean;
  onStartSession: () => void;
  onCompleteSession: () => void;
  onToggleExercise: (exerciseId: string) => void;
  scaleHover: (el: HTMLElement | null) => void;
  yHover: (el: HTMLElement | null) => void;
}

export function SessionPanel({
  session,
  workoutType,
  exercises,
  sessionDuration,
  isSessionInProgress,
  isSessionCompleted,
  isSelectedDateToday,
  onStartSession,
  onCompleteSession,
  onToggleExercise,
  scaleHover,
  yHover,
}: SessionPanelProps) {
  const mainExercises = exercises.main;
  const warmup = exercises.warmup[0];
  const cooldown = exercises.cooldown[0];
  const mobility = mobilityByWorkout[workoutType] || { name: 'Mobilité', duration: '8 min' };

  return (
    <div className="lg:col-span-3 rounded-3xl p-6 lg:p-8 border border-[#00f2ff]/15 bg-gradient-to-br from-white/[0.04] to-white/[0.01]">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#00f2ff]/20 flex items-center justify-center border border-[#00f2ff]/30">
            <Target className="w-5 h-5 lg:w-6 lg:h-6 text-[#00f2ff]" />
          </div>
          <div>
            <h2 className="text-lg lg:text-xl font-black uppercase tracking-tight">
              {isSessionCompleted ? 'Session Terminée' : 'Session du Jour'}
            </h2>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
              {workoutType}
              {sessionDuration && ` • ${sessionDuration} min`}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        {isSelectedDateToday && !isSessionInProgress && !isSessionCompleted && (
          <button
            onClick={onStartSession}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00f2ff] text-[#050505] font-bold uppercase text-sm hover:bg-[#00f2ff]/80 transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)]"
          >
            <Play className="w-5 h-5" />
            Démarrer
          </button>
        )}

        {isSelectedDateToday && isSessionInProgress && (
          <button
            onClick={onCompleteSession}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-bold uppercase text-sm hover:bg-green-600 transition-all"
          >
            <Check className="w-5 h-5" />
            Terminer
          </button>
        )}

        {isSessionCompleted && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400">
            <Check className="w-5 h-5" />
            <span className="text-sm font-bold">Complété</span>
          </div>
        )}
      </div>

      {/* Main exercises grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {mainExercises.length === 0 ? (
          <div className="col-span-3 text-center py-8">
            <p className="text-white/40 font-bold uppercase">Jour de Repos</p>
            <p className="text-white/20 text-sm mt-2">Récupération active recommandée</p>
          </div>
        ) : (
          mainExercises.slice(0, 3).map((exercise, idx) => {
            const isCompleted = exercise.completed;
            const categoryImage = exerciseImages[exercise.name] || exerciseImages['Échauffement'];

            return (
              <div
                key={exercise.id || idx}
                ref={scaleHover}
                onClick={() => isSessionInProgress && onToggleExercise(exercise.id)}
                className={cn(
                  "rounded-2xl border transition-all cursor-pointer overflow-hidden",
                  isCompleted
                    ? "bg-green-500/10 border-green-500/30"
                    : "bg-white/5 border-white/5 hover:border-[#00f2ff]/30"
                )}
              >
                <div
                  className="h-24 bg-cover bg-center relative"
                  style={{ backgroundImage: `url('${categoryImage}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      isCompleted ? "text-green-400" : exercise.category === 'main' ? "text-[#00f2ff]" : "text-white/30"
                    )}>
                      {categoryLabels[exercise.category] || 'Exercice'}
                    </span>
                    {isCompleted && <Check className="w-5 h-5 text-green-400" />}
                  </div>
                  <h4 className="text-base lg:text-lg font-bold mt-2">{exercise.name}</h4>
                  <p className="text-xl lg:text-2xl font-black mt-2">
                    {exercise.sets} x {exercise.reps}
                  </p>
                  {exercise.weight && <p className="text-xs text-white/50 mt-1">{exercise.weight}kg</p>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Warmup/Mobility/Cooldown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mt-4 lg:mt-6">
        {[
          { name: warmup?.name || 'Échauffement', category: 'warmup', reps: warmup?.reps || '5 min', image: exerciseImages['Échauffement'] },
          { name: mobility.name, category: 'mobility', reps: mobility.duration, image: exerciseImages['Mobilité'] },
          { name: cooldown?.name || 'Récupération', category: 'cooldown', reps: cooldown?.reps || '5 min', image: exerciseImages['Récupération'] },
        ].map((exercise, idx) => (
          <div
            key={`extra-${idx}`}
            ref={yHover}
            className="rounded-2xl border border-white/5 bg-white/5 hover:border-[#00f2ff]/30 transition-all overflow-hidden"
          >
            <div
              className="h-20 bg-cover bg-center relative"
              style={{ backgroundImage: `url('${exercise.image}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="p-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                {exercise.category === 'warmup' ? 'Échauffement' : exercise.category === 'mobility' ? 'Mobilité' : 'Récupération'}
              </span>
              <h4 className="text-base font-bold mt-1">{exercise.name}</h4>
              <p className="text-lg font-black mt-1 text-white/70">{exercise.reps}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
