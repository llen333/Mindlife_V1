'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, X, Timer as TimerIcon } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import type { Goal, GoalMilestone } from '@/lib/store';

interface Milestone extends GoalMilestone {
  description?: string;
  actualTime?: number;
  actions?: string[];
}

// Format timer display
export function formatTimerDisplay(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Timer UI Component
interface TimerDisplayProps {
  isActive: boolean;
  isPaused: boolean;
  seconds: number;
  target: number;
  goal: Goal | null;
  milestone: Milestone | null;
  onTogglePause: () => void;
  onStop: () => void;
}

export function TimerDisplay({
  isActive,
  isPaused,
  seconds,
  target,
  goal,
  milestone,
  onTogglePause,
  onStop,
}: TimerDisplayProps) {
  return (
    <GlassCard glowColor={isActive ? 'emerald' : 'violet'} className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <TimerIcon className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-semibold text-white">Focus Timer</h3>
      </div>

      {isActive ? (
        <div className="text-center">
          {goal && (
            <div className="mb-3 text-xs text-slate-400">
              <div className="text-violet-400 font-medium truncate">{goal.title}</div>
              {milestone && (
                <div className="truncate mt-1">{milestone.title}</div>
              )}
            </div>
          )}

          <div className="text-4xl font-bold font-mono text-white mb-4">
            {formatTimerDisplay(seconds)}
          </div>

          {/* Progress bar */}
          {target > 0 && (
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                style={{ width: `${(seconds / target) * 100}%` }}
              />
            </div>
          )}

          <div className="flex justify-center gap-2">
            <button
              onClick={onTogglePause}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4 text-white" /> : <Pause className="w-4 h-4 text-white" />}
            </button>
            <button
              onClick={onStop}
              className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center hover:bg-rose-500/30 transition-colors"
            >
              <X className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-slate-500 text-xs mb-2">
            Sélectionnez un objectif et lancez le focus
          </div>
          <div className="text-3xl font-bold font-mono text-slate-600">
            00:00
          </div>
        </div>
      )}
    </GlassCard>
  );
}

// Custom hook for timer logic
interface UseTimerReturn {
  timerActive: boolean;
  timerPaused: boolean;
  timerSeconds: number;
  timerTarget: number;
  timerGoal: Goal | null;
  timerMilestone: Milestone | null;
  startTimer: (goal: Goal, milestone: Milestone) => void;
  togglePauseTimer: () => void;
  stopTimer: () => void;
}

export function useTimer(): UseTimerReturn {
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTarget, setTimerTarget] = useState(0);
  const [timerGoal, setTimerGoal] = useState<Goal | null>(null);
  const [timerMilestone, setTimerMilestone] = useState<Milestone | null>(null);

  // Timer interval effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerActive && !timerPaused) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (timerTarget > 0) {
            // Countdown
            if (prev <= 1) {
              setTimerActive(false);
              return 0;
            }
            return prev - 1;
          } else {
            // Chrono
            return prev + 1;
          }
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerActive, timerPaused, timerTarget]);

  const startTimer = useCallback((goal: Goal, milestone: Milestone) => {
    setTimerGoal(goal);
    setTimerMilestone(milestone);
    setTimerSeconds(milestone.estimatedTime ? milestone.estimatedTime * 60 : 0);
    setTimerTarget(milestone.estimatedTime ? milestone.estimatedTime * 60 : 0);
    setTimerActive(true);
    setTimerPaused(false);
  }, []);

  const togglePauseTimer = useCallback(() => {
    setTimerPaused(prev => !prev);
  }, []);

  const stopTimer = useCallback(() => {
    setTimerActive(false);
    setTimerPaused(false);
    setTimerSeconds(0);
    setTimerGoal(null);
    setTimerMilestone(null);
  }, []);

  return {
    timerActive,
    timerPaused,
    timerSeconds,
    timerTarget,
    timerGoal,
    timerMilestone,
    startTimer,
    togglePauseTimer,
    stopTimer,
  };
}
