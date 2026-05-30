/**
 * RecipeModal Component
 * Modal détaillée d'une recette
 */

import { X, Utensils, ChefHat, Clock, Volume2, Play, Pause, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Meal, Ingredient, VoiceId } from '../types';
import { voiceOptions } from '../constants';

interface RecipeModalProps {
  isOpen: boolean;
  meal: Meal | null;
  ingredients: Ingredient[];
  currentStep: number;
  isPlaying: boolean;
  isPaused: boolean;
  isTTSLoding: boolean;
  selectedVoice: VoiceId;
  onClose: () => void;
  onToggleIngredient: (id: string) => void;
  onStartSpeaking: (meal: Meal, stepIndex: number) => void;
  onChangeVoice: (voiceId: VoiceId) => void;
  onSpeakRecipe: () => void;
  recipeModalRef: React.RefObject<HTMLDivElement>;
  recipeModalContentRef: React.RefObject<HTMLDivElement>;
}

export function RecipeModal({
  isOpen,
  meal,
  ingredients,
  currentStep,
  isPlaying,
  isPaused,
  isTTSLoding,
  selectedVoice,
  onClose,
  onToggleIngredient,
  onStartSpeaking,
  onChangeVoice,
  onSpeakRecipe,
  recipeModalRef,
  recipeModalContentRef,
}: RecipeModalProps) {
  if (!isOpen || !meal) return null;

  return (
    <div
      ref={recipeModalRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={recipeModalContentRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden glass-panel rounded-[2rem] flex flex-col"
      >
        {/* Header Image */}
        <div className="relative h-64 overflow-hidden">
          <img 
            src={meal.image}
            alt={meal.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050706] via-[#050706]/50 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-3xl font-black text-white italic tracking-tighter mb-2">
              {meal.title}
            </h2>
            <p className="text-slate-300 text-sm">{meal.description}</p>
            <div className="flex gap-3 mt-4">
              <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold">
                {meal.protein}g Protéines
              </span>
              <span className="bg-violet-500/20 text-violet-400 px-3 py-1 rounded-lg text-xs font-bold">
                {meal.calories} kcal
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-400" />
                Ingrédients
              </h3>
              <div className="space-y-2">
                {ingredients.map((ing) => (
                  <label
                    key={ing.id || ing.name}
                    className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-emerald-500/40 transition-all group"
                  >
                    <input
                      type="checkbox"
                      checked={ing.checked}
                      onChange={() => onToggleIngredient(ing.id)}
                      className="w-5 h-5 rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <span className={cn(
                      "text-sm font-medium flex-grow transition-all",
                      ing.checked ? "text-slate-500 line-through" : "text-slate-200"
                    )}>
                      {ing.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {ing.quantity}{ing.unit}
                    </span>
                    {ing.price && (
                      <span className="text-[10px] font-bold text-emerald-400">
                        {ing.price.toFixed(2)}€
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div>
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-emerald-400" />
                Préparation
                <span className="text-[10px] text-slate-500 font-normal ml-2">Cliquez sur une étape pour l'écouter</span>
              </h3>
              <div className="space-y-4">
                {meal.steps.map((step, index) => (
                  <div
                    key={step.id}
                    onClick={() => {
                      onStartSpeaking(meal, index);
                    }}
                    className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer",
                      currentStep === index && isPlaying
                        ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        : currentStep === index
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : "bg-white/5 border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.07]"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-black transition-all",
                        currentStep === index && isPlaying
                          ? "bg-emerald-500 text-[#050706] animate-pulse"
                          : currentStep === index
                            ? "bg-emerald-500/50 text-white"
                            : "bg-white/10 text-slate-400"
                      )}>
                        {currentStep === index && isPlaying ? (
                          <Volume2 className="w-4 h-4" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm text-slate-200">{step.instruction}</p>
                        {step.duration && (
                          <span className="text-[10px] text-slate-500 mt-2 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {step.duration} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-400">
              Temps total estimé : <span className="text-white font-bold">
                {meal.steps.reduce((sum, s) => sum + (s.duration || 0), 0)} min
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Voice Selector */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                {voiceOptions.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => onChangeVoice(voice.id as VoiceId)}
                    className={cn(
                      "px-3 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
                      selectedVoice === voice.id
                        ? "bg-emerald-500 text-[#050706]"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span>{voice.icon}</span>
                    {voice.label}
                  </button>
                ))}
              </div>
              
              {/* Play/Pause Button */}
              <button
                onClick={() => {
                  if (isPlaying || isPaused) {
                    onSpeakRecipe();
                    return;
                  }
                  onStartSpeaking(meal, 0);
                }}
                disabled={isTTSLoding}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
                  isPlaying && !isPaused
                    ? "bg-orange-500 text-white hover:bg-orange-600"
                    : "bg-emerald-500 text-[#050706] hover:brightness-110"
                )}
              >
                {isTTSLoding ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Chargement...
                  </>
                ) : isPlaying && !isPaused ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : isPaused ? (
                  <>
                    <Play className="w-4 h-4" />
                    Reprendre
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Écouter tout
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/10 transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
