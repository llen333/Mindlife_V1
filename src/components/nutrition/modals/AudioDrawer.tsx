/**
 * AudioDrawer Component
 * Drawer audio pour la lecture des recettes
 */

import { X, Headphones, Check, Volume2, Play, Pause, RefreshCw, SkipBack, SkipForward, Radio, Mic2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Meal, Ingredient, VoiceId, ReadingModeId } from '../types';
import { voiceOptions, readingModes } from '../constants';

interface AudioDrawerProps {
  isOpen: boolean;
  meal: Meal | null;
  ingredients: Ingredient[];
  currentStep: number;
  isPlaying: boolean;
  isLoading: boolean;
  selectedVoice: VoiceId;
  readingMode: ReadingModeId;
  onClose: () => void;
  onToggleIngredient: (id: string) => void;
  onSpeakRecipe: () => void;
  onChangeVoice: (voiceId: VoiceId) => void;
  onChangeReadingMode: (mode: ReadingModeId) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  audioDrawerRef: React.RefObject<HTMLDivElement | null>;
  soundwaveRef: React.RefObject<HTMLDivElement | null>;
}

export function AudioDrawer({
  isOpen,
  meal,
  ingredients,
  currentStep,
  isPlaying,
  isLoading,
  selectedVoice,
  readingMode,
  onClose,
  onToggleIngredient,
  onSpeakRecipe,
  onChangeVoice,
  onChangeReadingMode,
  onNextStep,
  onPrevStep,
  audioDrawerRef,
  soundwaveRef,
}: AudioDrawerProps) {
  if (!isOpen || !meal) return null;

  return (
    <div
      ref={audioDrawerRef}
      className="fixed top-24 right-6 bottom-6 w-[400px] z-[100] glass-panel rounded-[2.5rem] flex flex-col shadow-2xl border-emerald-500/20"
      style={{
        background: 'rgba(15, 25, 20, 0.95)',
        backdropFilter: 'blur(60px)',
      }}
    >
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Headphones className="w-4 h-4 text-[#050706]" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
            Cuisine Audio Active
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Recipe Image */}
        <div className="rounded-[1.5rem] overflow-hidden aspect-[4/3] relative border border-white/10 shadow-2xl">
          <img 
            src={meal.image}
            alt={meal.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <h2 className="text-xl font-black text-white italic tracking-tighter">
              {meal.title.split(' & ')[0]}
            </h2>
            <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mt-1">
              Étape {currentStep + 1}/{meal.steps.length}
            </p>
          </div>
        </div>

        {/* Current Step Display */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-slate-200 leading-relaxed">
            {meal.steps[currentStep]?.instruction}
          </p>
        </div>

        {/* Reading Mode Selector */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-violet-400" />
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Mode de Lecture
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {readingModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onChangeReadingMode(mode.id as ReadingModeId)}
                className={cn(
                  "relative p-4 rounded-2xl border text-left transition-all overflow-hidden group",
                  readingMode === mode.id
                    ? "border-transparent"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                )}
              >
                {readingMode === mode.id && (
                  <div
                    className={cn("absolute inset-0 bg-gradient-to-br", mode.color)}
                    style={{ opacity: 0.15 }}
                  />
                )}
                <div className="relative z-10">
                  <span className="text-2xl block mb-2">{mode.icon}</span>
                  <span className={cn(
                    "text-sm font-bold block",
                    readingMode === mode.id ? "text-white" : "text-slate-300"
                  )}>
                    {mode.label}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{mode.desc}</span>
                  {readingMode === mode.id && (
                    <div className="mode-check-icon absolute top-2 right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selector */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mic2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
              Voix de Narration
            </h3>
            <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
              FR
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {voiceOptions.map((voice) => (
              <button
                key={voice.id}
                onClick={() => onChangeVoice(voice.id as VoiceId)}
                className={cn(
                  "relative p-4 rounded-2xl border text-left transition-all overflow-hidden group",
                  selectedVoice === voice.id
                    ? cn(voice.borderColor, voice.bgColor)
                    : "bg-white/5 border-white/10 hover:border-white/20"
                )}
              >
                {selectedVoice === voice.id && (
                  <div
                    className={cn("absolute inset-0 bg-gradient-to-br", voice.color)}
                    style={{ opacity: 0.2 }}
                  />
                )}
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{voice.icon}</span>
                    {selectedVoice === voice.id && (
                      <div className={cn(
                        "voice-check-icon w-6 h-6 rounded-full flex items-center justify-center",
                        voice.bgColor
                      )}>
                        <Volume2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-bold block",
                    selectedVoice === voice.id ? voice.textColor : "text-slate-300"
                  )}>
                    {voice.label}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{voice.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients Checklist */}
        <div className="space-y-3">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
            Ingrédients Interactifs
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
            {ingredients.map((ing) => (
              <label
                key={ing.id || ing.name}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-emerald-500/40 transition-all"
              >
                <input
                  type="checkbox"
                  checked={ing.checked}
                  onChange={() => onToggleIngredient(ing.id)}
                  className="w-4 h-4 rounded border-white/20 bg-transparent text-emerald-500"
                />
                <span className={cn(
                  "text-sm flex-grow transition-all",
                  ing.checked ? "text-slate-500 line-through" : "text-slate-200"
                )}>
                  {ing.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  {ing.quantity}{ing.unit}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="p-6 bg-[#050706]/50 border-t border-white/10 backdrop-blur-md rounded-b-[2.5rem]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">
              Smart Chef AI
            </span>
            <span className="text-xs font-bold text-white italic max-w-[200px] truncate">
              "{meal.steps[currentStep]?.instruction.substring(0, 35)}..."
            </span>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={onPrevStep}
              disabled={currentStep === 0}
              className="text-slate-500 hover:text-white transition-colors disabled:opacity-30"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={onSpeakRecipe}
              disabled={isLoading}
              className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-[#050706] shadow-[0_0_20px_rgba(17,212,115,0.4)] disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <button
              onClick={onNextStep}
              disabled={currentStep === meal.steps.length - 1}
              className="text-slate-500 hover:text-white transition-colors disabled:opacity-30"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Soundwave Animation */}
        <div ref={soundwaveRef} className="flex items-end justify-center gap-1.5 h-10">
          {[40, 70, 100, 60, 85, 45, 90, 55].map((height, i) => (
            <div
              key={i}
              className="soundwave-bar w-1.5 bg-emerald-500 rounded-full"
              style={{ height: '30%', boxShadow: '0 0 10px #11d473' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
