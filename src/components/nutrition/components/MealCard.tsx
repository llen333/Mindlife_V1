/**
 * MealCard Component
 * Carte individuelle d'un repas
 */

import { Star, BookOpen, Headphones, Sun, Moon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Meal } from '../types';

interface MealCardProps {
  meal: Meal;
  onOpenRecipe: (meal: Meal) => void;
  onOpenAudio: (meal: Meal) => void;
  onDeleteMeal?: (id: string) => void;
}

export function MealCard({ meal, onOpenRecipe, onOpenAudio, onDeleteMeal }: MealCardProps) {
  return (
    <div
      className={cn(
        "meal-card glass-panel rounded-[2rem] overflow-hidden flex flex-col group transition-all duration-300 h-[380px] relative",
        "border border-white/[0.06]",
        meal.isToday 
          ? "border-l-4 border-l-emerald-500 shadow-[0_0_30px_rgba(17,212,115,0.15)]" 
          : meal.type === 'lunch'
            ? "border-l-4 border-l-amber-500/60"
            : "border-l-4 border-l-violet-500/60"
      )}
    >
      {/* Image Container */}
      <div className="aspect-video relative overflow-hidden flex-shrink-0">
        <img 
          src={meal.image}
          alt={meal.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050706] via-transparent to-transparent z-10" />
        
        {/* Day Badge */}
        <div className={cn(
          "absolute top-3 left-3 z-20 px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-lg",
          meal.isToday 
            ? "bg-emerald-500 text-[#050706]" 
            : "bg-black/60 backdrop-blur-sm text-white"
        )}>
          {meal.dayShort}
        </div>
        
        {/* Delete Button (Hover) */}
        {onDeleteMeal && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteMeal(meal.id);
            }}
            className="absolute top-2.5 right-16 z-35 p-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:text-white hover:bg-red-500 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 shadow-md"
            title="Supprimer ce repas"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Meal Type Badge */}
        {meal.type && (
          <div className={cn(
            "absolute top-3 right-3 z-20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase flex items-center gap-1",
            meal.type === 'lunch' 
              ? "bg-amber-500/80 text-white" 
              : "bg-violet-500/80 text-white"
          )}>
            {meal.type === 'lunch' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            {meal.type === 'lunch' ? 'Déj.' : 'Dîner'}
          </div>
        )}
        
        {/* Favorite Star */}
        {meal.isFavorite && (
          <div className="absolute top-12 right-3 z-20">
            <Star className="w-4 h-4 text-emerald-400 fill-emerald-400 drop-shadow-[0_0_8px_rgba(17,212,115,0.8)]" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <h4 className="text-base font-bold text-white leading-tight mb-3 line-clamp-2 min-h-[48px]">
            {meal.title}
          </h4>
          <div className="flex gap-2 mb-4">
            <div className="bg-white/5 px-3 py-1.5 rounded-lg text-[10px] text-slate-300 font-bold border border-white/10 uppercase">
              P: {meal.protein}g • {meal.calories} kcal
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button
            onClick={() => onOpenRecipe(meal)}
            className={cn(
              "py-2.5 text-[10px] font-black rounded-xl transition-all flex items-center justify-center gap-1.5 h-10",
              meal.isToday
                ? "bg-emerald-500 text-[#050706] border border-emerald-500/20"
                : "bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white border border-white/10"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" /> RECETTE
          </button>
          <button
            onClick={() => onOpenAudio(meal)}
            className="py-2.5 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white text-[10px] font-black rounded-xl transition-all border border-white/10 flex items-center justify-center gap-1.5 h-10"
          >
            <Headphones className="w-3.5 h-3.5" /> ÉCOUTER
          </button>
        </div>
      </div>
    </div>
  );
}
