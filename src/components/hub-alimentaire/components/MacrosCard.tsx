'use client';

import { cn } from '@/lib/utils';
import type { ComputedMetrics } from '../types';

interface MacrosCardProps {
  metrics: ComputedMetrics;
  macrosCardRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Carte de répartition des macronutriments avec visualisation en anneau
 */
export function MacrosCard({ metrics, macrosCardRef }: MacrosCardProps) {
  const macroTotal = metrics.protein + metrics.carbs + metrics.fat;

  return (
    <div ref={macrosCardRef} className="glass-card p-6 rounded-xl flex flex-col items-center">
      <div className="text-center w-full mb-6">
        <h2 className="text-lg font-bold text-white mb-1">Répartition Macro</h2>
        <p className="text-xs text-slate-400 uppercase tracking-widest">Cible Optimale</p>
      </div>

      {/* Macro Ring */}
      <div className="relative w-44 h-44 mb-6">
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full opacity-60 blur-md"
          style={{
            background: `conic-gradient(#13eca4 0% ${30}%, #8b5cf6 ${30}% ${65}%, #334155 ${65}% 100%)`
          }}
        />
        {/* Main ring */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
          
          {/* Protein arc - outer */}
          <circle 
            cx="80" cy="80" r="70" 
            fill="none" 
            stroke="#13eca4" 
            strokeWidth="12"
            strokeDasharray={`${(metrics.protein / macroTotal) * 440} 440`}
            strokeLinecap="round"
          />
          
          {/* Carbs arc - middle */}
          <circle 
            cx="80" cy="80" r="55" 
            fill="none" 
            stroke="#8b5cf6" 
            strokeWidth="10"
            strokeDasharray={`${(metrics.carbs / macroTotal) * 346} 346`}
            strokeLinecap="round"
          />
          
          {/* Fat arc - inner */}
          <circle 
            cx="80" cy="80" r="40" 
            fill="none" 
            stroke="#64748b" 
            strokeWidth="8"
            strokeDasharray={`${(metrics.fat / macroTotal) * 251} 251`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{metrics.targetCalories}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-tighter">kcal/jour</span>
        </div>
      </div>

      {/* Macro Details */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-sm text-slate-300">Protéines</span>
          </div>
          <span className="text-sm font-bold text-white">30% ({metrics.protein}g)</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-500" />
            <span className="text-sm text-slate-300">Glucides</span>
          </div>
          <span className="text-sm font-bold text-white">35% ({metrics.carbs}g)</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-sm text-slate-300">Lipides</span>
          </div>
          <span className="text-sm font-bold text-white">35% ({metrics.fat}g)</span>
        </div>
      </div>
    </div>
  );
}
