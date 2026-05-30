// QuotesPanel - Stellar connections quotes
'use client';

import { cn } from '@/lib/utils';
import type { Quote } from '../types';
import { quotes } from '../constants';

export function QuotesPanel() {
  return (
    <div className="extreme-glass rounded-[2rem] p-8 border-white/5">
      <h3 className="font-light text-xs uppercase tracking-[0.25em] text-blue-500/80 mb-8">
        Connexions Stellaires
      </h3>
      <div className="space-y-8">
        {quotes.map((quote, index) => (
          <div
            key={quote.id}
            className={cn(
              "relative pl-6",
              index === 0 ? "border-l border-blue-500/20" : "border-l border-white/10"
            )}
          >
            <div className={cn(
              "absolute -left-1.5 top-0 w-3 h-3 rounded-full",
              index === 0
                ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                : "border border-white/20 bg-black"
            )} />
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
              {index === 0 ? 'Résonance Universelle' : 'Philosophie Active'}
            </p>
            <p className="text-xs font-light italic leading-relaxed text-slate-300">
              {quote.content} — {quote.author}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
