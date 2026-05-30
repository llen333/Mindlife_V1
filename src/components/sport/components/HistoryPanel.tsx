// HistoryPanel - 30-day history sidebar
'use client';

import { Check, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WorkoutSession } from '../types';
import { workoutByDay } from '../constants';

interface HistoryPanelProps {
  sessionsHistory: WorkoutSession[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function HistoryPanel({ sessionsHistory, selectedDate, onSelectDate }: HistoryPanelProps) {
  // Get 30 days of history
  const getHistoryDays = () => {
    const days: { date: Date; session: WorkoutSession | undefined }[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const session = sessionsHistory.find(s =>
        new Date(s.date).toDateString() === date.toDateString()
      );
      days.push({ date, session });
    }
    return days;
  };

  // Get workout type for a date
  const getWorkoutTypeForDate = (date: Date): string => {
    const dayOfWeek = date.getDay();
    const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return workoutByDay[adjustedIndex] || 'REPOS';
  };

  return (
    <div className="rounded-3xl p-6 border border-[#00f2ff]/15 bg-gradient-to-br from-white/[0.04] to-white/[0.01]">
      <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Historique</h3>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#00f2ff]/30 scrollbar-track-white/5">
        {getHistoryDays().map(({ date, session }) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();

          return (
            <div
              key={date.toISOString()}
              onClick={() => onSelectDate(date)}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200",
                isSelected
                  ? "border-[#00f2ff] bg-[#00f2ff]/10"
                  : "border-white/5 hover:border-[#00f2ff]/30 hover:bg-white/5"
              )}
            >
              <div>
                <p className={cn(
                  "text-xs font-bold",
                  isSelected ? "text-[#00f2ff]" : isToday ? "text-white" : "text-white/70"
                )}>
                  {isToday ? "Aujourd'hui" : date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
                <p className="text-[10px] text-white/40">{getWorkoutTypeForDate(date)}</p>
              </div>
              <div className="flex items-center gap-2">
                {session?.status === 'completed' && !isToday && <Check className="w-4 h-4 text-green-400" />}
                {session?.status === 'in_progress' && <CircleDot className="w-4 h-4 text-[#00f2ff]" />}
                {(!session || isToday) && <div className="w-2 h-2 rounded-full bg-white/10" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
