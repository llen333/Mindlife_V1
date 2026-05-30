'use client';

import { motion } from 'framer-motion';

interface MiniTimelineProps {
  start?: string;
  end?: string;
  progress: number;
}

export function MiniTimeline({ start, end, progress }: MiniTimelineProps) {
  const startDate = start ? new Date(start) : new Date();
  const endDate = end ? new Date(end) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const timeProgress = totalDays > 0 ? Math.min(100, Math.max(0, (daysPassed / totalDays) * 100)) : 0;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
        <span>{startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
        <span>{endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
      </div>
      <div className="relative h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
        {/* Temps écoulé */}
        <div 
          className="absolute h-full bg-slate-500/50 rounded-full"
          style={{ width: `${timeProgress}%` }}
        />
        {/* Progression réelle */}
        <motion.div
          className="absolute h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {/* Indicateur aujourd'hui */}
        <div 
          className="absolute w-0.5 h-full bg-white/50"
          style={{ left: `${timeProgress}%` }}
        />
      </div>
    </div>
  );
}
