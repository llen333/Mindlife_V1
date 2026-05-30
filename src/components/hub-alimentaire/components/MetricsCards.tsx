'use client';

import { Calculator, Scale, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ComputedMetrics, IMCCategory } from '../types';

interface MetricsCardsProps {
  metrics: ComputedMetrics;
  imcCategory: IMCCategory;
  bmrCardRef: React.RefObject<HTMLDivElement | null>;
  imcCardRef: React.RefObject<HTMLDivElement | null>;
  tdeeCardRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Cartes de métriques physiques (BMR, IMC, TDEE)
 */
export function MetricsCards({ 
  metrics, 
  imcCategory,
  bmrCardRef,
  imcCardRef,
  tdeeCardRef
}: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* BMR Card */}
      <div
        ref={bmrCardRef}
        className="glass-card p-6 rounded-xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Calculator className="w-10 h-10 text-emerald-400" />
        </div>
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
          Métabolisme de Base (BMR)
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{metrics.bmr.toLocaleString()}</span>
          <span className="text-emerald-400 font-medium text-sm">kcal/jour</span>
        </div>
        <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-2/3" />
        </div>
        <p className="text-[10px] text-slate-500 mt-2">Énergie au repos complet</p>
      </div>

      {/* IMC Card */}
      <div
        ref={imcCardRef}
        className="glass-card p-6 rounded-xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Scale className="w-10 h-10 text-violet-400" />
        </div>
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
          Indice de Masse Corporelle
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{metrics.imc}</span>
          <span className={cn("font-medium text-sm", imcCategory.color)}>{imcCategory.label}</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-4 leading-relaxed italic">
          &quot;{imcCategory.advice}&quot;
        </p>
      </div>

      {/* TDEE Card */}
      <div
        ref={tdeeCardRef}
        className="glass-card p-6 rounded-xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Flame className="w-10 h-10 text-emerald-400" />
        </div>
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
          Besoin Journalier (TDEE)
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{metrics.tdee.toLocaleString()}</span>
          <span className="text-emerald-400 font-medium text-sm">kcal</span>
        </div>
        <div className="flex gap-1 mt-4">
          <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
          <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
          <div className="h-1 flex-1 bg-emerald-500/20 rounded-full" />
          <div className="h-1 flex-1 bg-emerald-500/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}
