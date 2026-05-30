'use client';

import Image from 'next/image';
import { Flame, Utensils, Apple, Salad, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dietaryOptions, allergyOptions, cuisineOptions } from '@/lib/constants/settings-options';
import { ProfileFormData, CalculatedMetrics } from '../types';

interface NutritionSectionProps {
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  calculatedMetrics: CalculatedMetrics;
  toggleArrayItem: (field: keyof ProfileFormData, item: string) => void;
  expanded: boolean;
}

export function NutritionSection({
  formData,
  setFormData,
  calculatedMetrics,
  toggleArrayItem,
  expanded,
}: NutritionSectionProps) {
  if (!expanded) return null;

  return (
    <div className="overflow-hidden animate-expand">
      <div className="px-6 pb-8 space-y-8">
        {/* Objectifs Macros */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold uppercase tracking-wide text-white/80">Objectifs Macros</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-transparent" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Calories cibles</label>
              <input
                type="number"
                value={formData.targetCalories}
                onChange={(e) => setFormData({ ...formData, targetCalories: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-500/5 transition-all text-white text-2xl font-black placeholder:text-white/20"
                placeholder={calculatedMetrics.tdee?.toString() || "2000"}
              />
              <p className="text-[10px] text-emerald-400/60">TDEE: {calculatedMetrics.tdee || '—'} kcal</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Protéines (g)</label>
              <input
                type="number"
                value={formData.proteinTarget}
                onChange={(e) => setFormData({ ...formData, proteinTarget: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-500/5 transition-all text-white text-2xl font-black placeholder:text-white/20"
                placeholder="150"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Glucides (g)</label>
              <input
                type="number"
                value={formData.carbsTarget}
                onChange={(e) => setFormData({ ...formData, carbsTarget: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-500/5 transition-all text-white text-2xl font-black placeholder:text-white/20"
                placeholder="200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Lipides (g)</label>
              <input
                type="number"
                value={formData.fatTarget}
                onChange={(e) => setFormData({ ...formData, fatTarget: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-emerald-500/40 focus:bg-emerald-500/5 transition-all text-white text-2xl font-black placeholder:text-white/20"
                placeholder="65"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Dietary Preferences - Cards avec gradient */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Utensils className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold uppercase tracking-wide text-white/80">Préférences Alimentaires</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-transparent" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dietaryOptions.map((opt) => {
              const isSelected = formData.dietaryPreferences.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleArrayItem('dietaryPreferences', opt.value)}
                  className={cn(
                    "relative overflow-hidden rounded-xl border transition-all group h-20",
                    isSelected
                      ? "border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                      : "border-white/10 hover:border-emerald-500/30"
                  )}
                >
                  {/* Background Gradient */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-60",
                    opt.color || "from-emerald-500/20 to-green-500/20",
                    isSelected && "opacity-100"
                  )} />
                  
                  {/* Selection overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-emerald-500/20" />
                  )}
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full gap-1">
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-xs font-medium text-white/90">{opt.label}</span>
                  </div>
                  
                  {/* Check icon */}
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Allergies - Cards avec style alerte */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Apple className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-bold uppercase tracking-wide text-white/80">Allergies & Intolérances</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-red-500/30 to-transparent" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {allergyOptions.map((opt) => {
              const isSelected = formData.allergies.includes(opt.value);
              const isHighSeverity = opt.severity === 'high';
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleArrayItem('allergies', opt.value)}
                  className={cn(
                    "relative overflow-hidden rounded-xl border transition-all group h-20",
                    isSelected
                      ? isHighSeverity 
                        ? "border-red-500/50 shadow-lg shadow-red-500/10"
                        : "border-orange-500/50 shadow-lg shadow-orange-500/10"
                      : "border-white/10 hover:border-red-500/30"
                  )}
                >
                  {/* Background Gradient */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-40",
                    isHighSeverity ? "from-red-500/30 to-rose-500/30" : "from-orange-500/30 to-amber-500/30",
                    isSelected && "opacity-70"
                  )} />
                  
                  {/* Selection overlay */}
                  {isSelected && (
                    <div className={cn(
                      "absolute inset-0",
                      isHighSeverity ? "bg-red-500/20" : "bg-orange-500/20"
                    )} />
                  )}
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full gap-1">
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-xs font-medium text-white/90">{opt.label}</span>
                  </div>
                  
                  {/* Check icon */}
                  {isSelected && (
                    <div className={cn(
                      "absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center",
                      isHighSeverity ? "bg-red-500" : "bg-orange-500"
                    )}>
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Favorite Cuisines - Cards avec images */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Salad className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold uppercase tracking-wide text-white/80">Cuisines Favorites</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-transparent" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {cuisineOptions.map((opt) => {
              const isSelected = formData.favoriteCuisines.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleArrayItem('favoriteCuisines', opt.value)}
                  className={cn(
                    "relative overflow-hidden rounded-xl border transition-all group h-24",
                    isSelected
                      ? "border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                      : "border-white/10 hover:border-emerald-500/30"
                  )}
                >
                  {/* Background Image */}
                  {opt.image && (
                    <Image
                      src={opt.image}
                      alt={opt.label || opt.value || "Nutrition option"}
                      fill
                      className={cn(
                        "object-cover transition-all",
                        isSelected ? "opacity-60" : "opacity-40 group-hover:opacity-50"
                      )}
                    />
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent",
                    isSelected && "bg-gradient-to-t from-emerald-900/60 via-black/40 to-transparent"
                  )} />
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center justify-end h-full pb-2 gap-0.5">
                    <span className="text-xl">{opt.icon}</span>
                    <span className="text-xs font-bold text-white">{opt.label}</span>
                    {opt.flag && (
                      <span className="text-[10px] opacity-70">{opt.flag}</span>
                    )}
                  </div>
                  
                  {/* Check icon */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
