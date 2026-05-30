// OdyseeTimeline - Journey steps timeline
'use client';

import { cn } from '@/lib/utils';
import { odyseeSteps } from '../constants';

export function OdyseeTimeline() {
  return (
    <div id="odysee" className="extreme-glass rounded-[2.5rem] p-10 border-white/5">
      <div className="flex items-center justify-between mb-12">
        <h3 className="font-light text-xs uppercase tracking-[0.25em] text-purple-500/80">
          Odyssée du Soi
        </h3>
        <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
          Étapes de l'Ascension
        </span>
      </div>

      <div className="relative px-4 pb-4">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2" />
        <div className="relative flex justify-between items-center">
          {odyseeSteps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center gap-4 group",
                step.status === 'upcoming' && "opacity-40"
              )}
            >
              <div className={cn(
                "w-3 h-3 rounded-full relative z-10 ring-4 ring-black transition-all",
                step.status === 'completed' && "bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]",
                step.status === 'current' && "bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)] animate-pulse",
                step.status === 'upcoming' && "bg-white/20"
              )} />
              <div className="text-center space-y-1 translate-y-2">
                <p className="text-[10px] font-display uppercase tracking-widest text-slate-200">
                  {step.title}
                </p>
                <p className="text-[8px] uppercase tracking-widest text-slate-500">
                  {step.status === 'completed' ? 'Accompli' : step.status === 'current' ? 'En cours' : 'À venir'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
