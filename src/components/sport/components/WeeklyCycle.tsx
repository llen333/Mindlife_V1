// WeeklyCycle - Weekly workout schedule
'use client';

import { Calendar, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProgramDay, WorkoutSession } from '../types';
import { dayNames, workoutImages } from '../constants';

interface WeeklyCycleProps {
  days: ProgramDay[];
  adjustedDayIndex: number;
  sessionsHistory: WorkoutSession[];
  onOpenDayDetail: (day: ProgramDay) => void;
  yHover: (el: HTMLElement | null) => void;
}

export function WeeklyCycle({
  days,
  adjustedDayIndex,
  sessionsHistory,
  onOpenDayDetail,
  yHover,
}: WeeklyCycleProps) {
  // Get session for a specific day index
  const getSessionForDay = (dayIndex: number): WorkoutSession | null => {
    const today = new Date();
    const currentDayIndex = today.getDay();
    const adjusted = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (adjusted - dayIndex));
    return sessionsHistory.find(s => {
      const sessionDate = new Date(s.date);
      return sessionDate.toDateString() === targetDate.toDateString();
    }) || null;
  };

  return (
    <section>
      <h2 className="text-xl lg:text-2xl font-black flex items-center gap-4 uppercase tracking-tighter mb-6 lg:mb-8">
        <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-[#00f2ff]" />
        Cycle de Performance Hebdo
      </h2>
      <div className="grid grid-cols-7 gap-2 lg:gap-4">
        {days.map((day, idx) => {
          const isToday = idx === adjustedDayIndex;
          const session = getSessionForDay(idx);
          const imageUrl = workoutImages[day.name] || workoutImages['REPOS'];

          return (
            <div
              key={day.id}
              ref={yHover}
              onClick={() => onOpenDayDetail(day)}
              className={cn(
                "rounded-2xl overflow-hidden border transition-all cursor-pointer",
                isToday
                  ? "border-[#00f2ff]/50 ring-2 ring-[#00f2ff]/20"
                  : "border-white/5 hover:border-[#00f2ff]/30"
              )}
            >
              <div
                className="h-16 lg:h-24 bg-cover bg-center relative"
                style={{ backgroundImage: `url('${imageUrl}')` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                {session?.status === 'completed' && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                )}
              </div>
              <div className="p-2 lg:p-3 bg-white/5">
                <p className="text-[10px] lg:text-xs font-bold truncate">{dayNames[idx]}</p>
                <p className="text-[8px] lg:text-[10px] text-white/40 truncate">{day.name}</p>
                {day.intensity !== null && day.intensity > 0 && (
                  <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00f2ff] rounded-full"
                      style={{ width: `${day.intensity}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
