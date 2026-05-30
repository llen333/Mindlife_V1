'use client';

import { Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IMCCategory } from '../types';

interface IMCScaleCardProps {
  imc: number;
  imcCategory: IMCCategory;
  imcScaleCardRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Carte de l'échelle IMC avec indicateur visuel
 */
export function IMCScaleCard({ imc, imcCategory, imcScaleCardRef }: IMCScaleCardProps) {
  const imcPosition = Math.min(Math.max((imc - 15) / 20 * 100, 0), 100);

  return (
    <div ref={imcScaleCardRef} className="glass-card p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Target className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Échelle IMC</h2>
          <p className="text-xs text-slate-400">Position actuelle</p>
        </div>
      </div>

      {/* IMC Scale */}
      <div className="relative mb-4">
        <div className="h-3 rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 via-amber-500 to-red-500" />
        <div 
          className="absolute top-0 w-3 h-3 rounded-full bg-white border-2 border-[#080c0a] shadow-lg transform -translate-x-1/2"
          style={{ left: `${imcPosition}%` }}
        />
      </div>

      {/* IMC Legend */}
      <div className="grid grid-cols-4 gap-1 text-[9px] mb-4">
        <div className="text-center">
          <div className="w-full h-2 rounded bg-blue-500 mb-1" />
          <span className="text-slate-500">&lt;18.5</span>
        </div>
        <div className="text-center">
          <div className="w-full h-2 rounded bg-emerald-500 mb-1" />
          <span className="text-slate-500">18.5-25</span>
        </div>
        <div className="text-center">
          <div className="w-full h-2 rounded bg-amber-500 mb-1" />
          <span className="text-slate-500">25-30</span>
        </div>
        <div className="text-center">
          <div className="w-full h-2 rounded bg-red-500 mb-1" />
          <span className="text-slate-500">&gt;30</span>
        </div>
      </div>

      <div className="text-center">
        <span className={cn("text-lg font-bold", imcCategory.color)}>{imc}</span>
        <span className="text-slate-400 text-sm ml-2">- {imcCategory.label}</span>
      </div>
    </div>
  );
}
