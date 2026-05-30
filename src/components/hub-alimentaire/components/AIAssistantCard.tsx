'use client';

import { Bot, Sparkles } from 'lucide-react';

interface AIAssistantCardProps {
  aiCardRef: React.RefObject<HTMLDivElement | null>;
  onOpenChat: () => void;
}

/**
 * Carte de l'assistant IA nutritionnel
 */
export function AIAssistantCard({ aiCardRef, onOpenChat }: AIAssistantCardProps) {
  return (
    <div
      ref={aiCardRef}
      className="glass-card p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-violet-500/10 border border-emerald-500/20"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-violet-500 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Assistant IA</h2>
          <p className="text-xs text-emerald-400">Spécialiste Nutrition</p>
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-4">
        Obtenez des conseils personnalisés basés sur votre profil nutritionnel.
      </p>

      <button
        onClick={onOpenChat}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-violet-500 text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
      >
        <Sparkles className="w-4 h-4" />
        Consulter l&apos;Assistant
      </button>
    </div>
  );
}
