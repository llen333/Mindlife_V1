/**
 * MealGrid Component
 * Grille des repas avec générateur
 */

import { Wand2, Utensils, Sun, Moon, Star, Sparkles, Save, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Meal, GenerateType, MealTypeFilter, WeekInfo } from '../types';
import { MealCard } from './MealCard';

interface MealGridProps {
  meals: Meal[];
  isPreviewMode: boolean;
  previewMeals: Meal[];
  isGenerating: boolean;
  isSaving: boolean;
  mealTypeFilter: MealTypeFilter;
  weekOffset: number;
  availableWeeks: WeekInfo[];
  onOpenRecipe: (meal: Meal) => void;
  onOpenAudio: (meal: Meal) => void;
  onGenerateMeals: (type: GenerateType) => void;
  onSaveMeals: () => void;
  onCancelPreview: () => void;
  onSetWeekOffset: (offset: number) => void;
  onSetMealTypeFilter: (filter: MealTypeFilter) => void;
  previewBannerRef: React.RefObject<HTMLDivElement>;
  onDeleteMeal?: (id: string) => void;
}

export function MealGrid({
  meals,
  isPreviewMode,
  previewMeals,
  isGenerating,
  isSaving,
  mealTypeFilter,
  weekOffset,
  availableWeeks,
  onOpenRecipe,
  onOpenAudio,
  onGenerateMeals,
  onSaveMeals,
  onCancelPreview,
  onSetWeekOffset,
  onSetMealTypeFilter,
  previewBannerRef,
  onDeleteMeal,
}: MealGridProps) {
  return (
    <section className="mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter">Planning Hebdomadaire</h2>
          <p className="text-slate-500 mt-2 font-medium">
            {isPreviewMode 
              ? '⚡ Aperçu - Nouveaux repas générés (non sauvegardés)' 
              : 'Répartition IA sur 7 jours. Visualisez tous vos repas.'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Dropdown Semaine */}
          {!isPreviewMode && (
            <select
              value={weekOffset}
              onChange={(e) => onSetWeekOffset(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white appearance-none cursor-pointer hover:bg-white/10 transition-all min-w-[200px]"
            >
              {availableWeeks.map(week => (
                <option key={week.offset} value={week.offset} className="bg-[#050706]">
                  {week.label}
                </option>
              ))}
            </select>
          )}
          
          {/* Toggle Déjeuner / Dîner */}
          <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => onSetMealTypeFilter('all')}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all",
                mealTypeFilter === 'all' 
                  ? "bg-emerald-500 text-[#050706]" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              Tous
            </button>
            <button
              onClick={() => onSetMealTypeFilter('lunch')}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5",
                mealTypeFilter === 'lunch' 
                  ? "bg-amber-500 text-[#050706]" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Sun className="w-3.5 h-3.5" /> Déj.
            </button>
            <button
              onClick={() => onSetMealTypeFilter('dinner')}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5",
                mealTypeFilter === 'dinner' 
                  ? "bg-violet-500 text-white" 
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Moon className="w-3.5 h-3.5" /> Dîners
            </button>
          </div>
        </div>
      </div>
      
      {/* Actions Preview - Valider / Annuler */}
      {isPreviewMode && (
        <div
          ref={previewBannerRef}
          className="flex items-center justify-between mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white">
              {previewMeals.length} repas générés - En attente de validation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancelPreview}
              className="px-4 py-2 bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 text-xs font-bold rounded-xl transition-all border border-white/10"
            >
              Annuler
            </button>
            <button
              onClick={onSaveMeals}
              disabled={isSaving}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#050706] text-xs font-black rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Sauvegarde...' : 'Valider & Sauvegarder'}
            </button>
          </div>
        </div>
      )}

      {/* Meals Grid */}
      <div id="meals-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onOpenRecipe={onOpenRecipe}
            onOpenAudio={onOpenAudio}
            onDeleteMeal={onDeleteMeal}
          />
        ))}

        {/* Meal Generator */}
        <div className="meal-card glass-panel rounded-[2rem] overflow-hidden flex flex-col group h-[380px]">
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-3">
              <Wand2 className={cn("w-7 h-7 text-emerald-400", isGenerating && "animate-spin")} />
            </div>
            <p className="text-base font-bold text-white mb-1">Générer des Repas</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-5">IA PERSONNALISÉ</p>
            
            <div className="flex flex-col gap-2 w-full max-w-[220px]">
              <button
                onClick={() => onGenerateMeals('lunch')}
                disabled={isGenerating}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sun className="w-4 h-4" /> Déjeuners (7 jours)
              </button>
              <button
                onClick={() => onGenerateMeals('dinner')}
                disabled={isGenerating}
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Moon className="w-4 h-4" /> Dîners (7 jours)
              </button>
              <button
                onClick={() => onGenerateMeals('both')}
                disabled={isGenerating}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#050706] text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Utensils className="w-4 h-4" /> Complet (14 repas)
              </button>
            </div>
            
            {/* Decorative Star */}
            <div className="mt-5 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
