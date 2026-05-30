/**
 * NutritionStats Component
 * Section des statistiques nutrition
 */

import { Timer, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { periodOptions } from '../constants';

interface NutritionStatsProps {
  statsCardsRef: React.RefObject<HTMLDivElement>;
  progressBarRef: React.RefObject<HTMLDivElement>;
  budget: { total: number; remaining: number };
  prepTime: { total: number; saved: number };
  macros: { calories: number; protein: number; carbs: number; fat: number };
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
  getPeriodMultiplier: () => number;
  getPeriodLabel: () => string;
}

export function NutritionStats({
  statsCardsRef,
  progressBarRef,
  budget,
  prepTime,
  macros,
  selectedPeriod,
  onSelectPeriod,
  getPeriodMultiplier,
  getPeriodLabel,
}: NutritionStatsProps) {
  return (
    <section ref={statsCardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {/* Budget Card */}
      <div className="stat-card glass-panel p-6 rounded-[2rem] flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
              Budget Logistique
            </h3>
            <p className="text-lg font-bold text-white">Allocation Gourmet</p>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {periodOptions.map((period) => (
              <button
                key={period.id}
                onClick={() => onSelectPeriod(period.id)}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all",
                  selectedPeriod === period.id
                    ? "bg-emerald-500 text-[#050706]"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-3xl font-black text-white italic">
              {(budget.total * getPeriodMultiplier() / 7).toFixed(0)}<span className="text-lg ml-1 text-emerald-400 not-italic">€</span>
            </span>
            <div className="text-right">
              <span className="block text-[10px] text-slate-500 uppercase">{getPeriodLabel()}</span>
              <span className="text-emerald-400 font-mono font-bold">{(budget.remaining * getPeriodMultiplier() / 7).toFixed(2)}€</span>
            </div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              ref={progressBarRef}
              className="h-full bg-emerald-500"
              style={{ width: '0%', boxShadow: '0 0 15px rgba(17,212,115,0.5)' }}
            />
          </div>
        </div>
      </div>

      {/* Calories Ring Gauge */}
      <div className="stat-card glass-panel p-6 rounded-[2rem] flex items-center justify-between">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle className="text-white/5" cx="18" cy="18" fill="none" r="16" stroke="currentColor" strokeWidth="2.5" />
            <circle className="text-emerald-500/20" cx="18" cy="18" fill="none" r="16" stroke="currentColor" strokeDasharray="75 100" strokeLinecap="round" strokeWidth="2.5" />
            <circle className="text-white/5" cx="18" cy="18" fill="none" r="12.5" stroke="currentColor" strokeWidth="2.5" />
            <circle className="text-emerald-500/50" cx="18" cy="18" fill="none" r="12.5" stroke="currentColor" strokeDasharray="60 100" strokeLinecap="round" strokeWidth="2.5" />
            <circle className="text-emerald-500" cx="18" cy="18" fill="none" r="9" stroke="currentColor" strokeDasharray="85 100" strokeLinecap="round" strokeWidth="2.5" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-black text-white uppercase">KCAL</span>
            <span className="text-lg font-black text-emerald-400">{(macros.calories / 1000).toFixed(1)}k</span>
          </div>
        </div>
        
        <div className="flex-1 ml-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white uppercase">P: {macros.protein}g</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white uppercase">G: {macros.carbs}g</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white uppercase">L: {macros.fat}g</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
          </div>
        </div>
      </div>

      {/* Prep Time Card */}
      <div className="stat-card glass-panel p-6 rounded-[2rem] flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
              Activité Culinaire
            </h3>
            <p className="text-lg font-bold text-white">Temps de Préparation</p>
          </div>
          <Timer className="w-5 h-5 text-emerald-400" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white italic">
              {prepTime.total}<span className="text-lg not-italic text-emerald-400 ml-1">h</span>
            </span>
            <span className="text-[10px] text-slate-500 uppercase">Total / {getPeriodLabel()}</span>
          </div>
          <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/5 px-3 py-1 rounded-lg border border-emerald-500/20 inline-block">
            Gain : -{prepTime.saved}h vs Moy.
          </p>
        </div>
      </div>

      {/* AI Profile Card */}
      <div className="stat-card glass-panel p-6 rounded-[2rem] flex flex-col justify-between border-l-4 border-l-emerald-500/60">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Profil IA</h3>
          <Brain className="w-5 h-5 text-emerald-400" />
        </div>
        
        <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl mb-4">
          <p className="text-[9px] text-emerald-400 uppercase font-black mb-1">Régime Keto</p>
          <p className="text-xs font-medium text-slate-200">Sans Gluten & Noix</p>
        </div>
        
        <button className="w-full py-3 bg-emerald-500 text-[#050706] text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all">
          Optimiser
        </button>
      </div>
    </section>
  );
}
