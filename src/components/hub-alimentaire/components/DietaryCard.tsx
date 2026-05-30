'use client';

import { Utensils, Lock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dietaryOptions, allergyOptions } from '../constants';
import type { DietaryOption, AllergyOption } from '../types';

interface DietaryCardProps {
  dietaryPreferences: string[];
  allergies: string[];
  dietaryCardRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Carte des régimes et restrictions alimentaires
 */
export function DietaryCard({ dietaryPreferences, allergies, dietaryCardRef }: DietaryCardProps) {
  return (
    <div ref={dietaryCardRef} className="glass-card p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">Régimes & Restrictions</h2>
            <p className="text-xs text-slate-400">Synchronisés depuis Paramètres</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-violet-400 bg-violet-500/10 px-2 py-1 rounded-full">
            <Lock className="w-3 h-3" />
            <span>Lecture seule</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Dietary Types */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400/60 mb-4">
            Régimes Alimentaires
          </h4>
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((option: DietaryOption) => (
              <div
                key={option.id}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2",
                  dietaryPreferences.includes(option.id)
                    ? "bg-emerald-500 text-[#080c0a] shadow-[0_0_15px_rgba(19,236,164,0.2)]"
                    : "bg-white/5 border border-white/10 text-slate-300 opacity-50"
                )}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400 mb-4">
            Allergies & Intolérances
          </h4>
          <div className="flex flex-wrap gap-2">
            {allergyOptions.map((option: AllergyOption) => (
              <div
                key={option.id}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2",
                  allergies.includes(option.id)
                    ? cn(
                        "border",
                        option.severe 
                          ? "bg-red-500/20 border-red-500/50 text-red-400" 
                          : "bg-violet-500/20 border-violet-500/50 text-violet-400"
                      )
                    : "bg-white/5 border border-white/10 text-slate-500 opacity-50"
                )}
              >
                <span>{option.icon}</span>
                <span>Sans {option.label}</span>
                {allergies.includes(option.id) && option.severe && (
                  <AlertCircle className="w-3 h-3" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
