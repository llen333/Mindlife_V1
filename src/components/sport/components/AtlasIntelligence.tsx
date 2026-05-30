// AtlasIntelligence - AI assistant for sport recommendations
'use client';

import { Brain, Moon, Sparkles } from 'lucide-react';

interface AtlasIntelligenceProps {
  message: string;
  onFetchRecommendation: (type: string) => void;
}

export function AtlasIntelligence({ message, onFetchRecommendation }: AtlasIntelligenceProps) {
  return (
    <section className="rounded-3xl p-6 lg:p-8 border border-[#00f2ff]/15 bg-gradient-to-br from-white/[0.04] to-transparent">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#00f2ff]/20 flex items-center justify-center border border-[#00f2ff]/30">
          <Brain className="w-5 h-5 lg:w-6 lg:h-6 text-[#00f2ff]" />
        </div>
        <div>
          <h2 className="text-lg lg:text-xl font-black uppercase tracking-tight">Atlas Intelligence</h2>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Assistant Bio-Tactique</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-sm lg:text-base text-white/80">{message || "Analyse en cours..."}</p>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onFetchRecommendation('recovery')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#00f2ff]/30 transition-all text-sm"
        >
          <Moon className="w-3 h-3" />
          Récupération
        </button>
        <button
          onClick={() => onFetchRecommendation('performance')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#00f2ff]/30 transition-all text-sm"
        >
          <Sparkles className="w-3 h-3" />
          Performance
        </button>
      </div>
    </section>
  );
}
