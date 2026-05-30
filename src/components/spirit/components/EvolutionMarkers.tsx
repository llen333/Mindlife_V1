// EvolutionMarkers - Cards showing spiritual evolution stages
'use client';

import { BookOpen, Target, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SpiritCard } from '../types';

interface EvolutionMarkersProps {
  cards: SpiritCard[];
  getCardsByStatus: (status: SpiritCard['status']) => SpiritCard[];
}

export function EvolutionMarkers({ cards, getCardsByStatus }: EvolutionMarkersProps) {
  return (
    <section id="marqueurs" className="space-y-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-xl tracking-[0.5em] uppercase font-light text-slate-100">
          Marqueurs d'Évolution
        </h2>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* En gestation */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-6">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-medium">
              En gestation
            </h3>
          </div>
          <div className="space-y-4">
            {getCardsByStatus('gestation').map(card => (
              <div
                key={card.id}
                className="extreme-glass p-6 rounded-[2rem] border-white/10 hover:bg-white/[0.02] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <BookOpen className="w-5 h-5 text-slate-500 group-hover:text-purple-500 transition-colors" />
                  <span className="text-[8px] uppercase tracking-widest text-slate-600">
                    Priorité : {card.category}
                  </span>
                </div>
                <h4 className="text-[13px] tracking-widest text-slate-200 mb-2">{card.title}</h4>
                <div className="mt-4">
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-0 h-full bg-purple-500/40" />
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2 uppercase tracking-widest italic">
                    Ancrage : {card.progress}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* En floraison */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-6">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-purple-500/80 font-medium">
              En floraison
            </h3>
          </div>
          <div className="space-y-4">
            {getCardsByStatus('floraison').map(card => (
              <div
                key={card.id}
                className="extreme-glass p-6 rounded-[2rem] border-purple-500/20 bg-purple-500/[0.02] hover:bg-purple-500/[0.04] transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <Target className="w-5 h-5 text-purple-500" />
                  <span className="text-[8px] uppercase tracking-widest text-purple-500/60">
                    {card.category}
                  </span>
                </div>
                <h4 className="text-[13px] tracking-widest text-slate-100 mb-2">{card.title}</h4>
                <div className="mt-4">
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all"
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2 uppercase tracking-widest italic">
                    Ancrage : {card.progress}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ancré */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-green-500/80 font-medium">
              Ancré
            </h3>
          </div>
          <div className="space-y-4">
            {getCardsByStatus('ancree').map(card => (
              <div
                key={card.id}
                className="extreme-glass p-6 rounded-[2rem] border-green-500/20 bg-green-500/[0.01] transition-all cursor-pointer opacity-80 hover:opacity-100 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <Sun className="w-5 h-5 text-green-500" />
                  <span className="text-[8px] uppercase tracking-widest text-green-500/60">
                    {card.category}
                  </span>
                </div>
                <h4 className="text-[13px] tracking-widest text-slate-200 mb-2">{card.title}</h4>
                <div className="mt-4">
                  <div className="w-full h-1 bg-green-500/20 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-green-500" />
                  </div>
                  <p className="text-[9px] text-green-500/60 mt-2 uppercase tracking-widest italic">
                    Ancrage : {card.progress}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
