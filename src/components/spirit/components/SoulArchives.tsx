// SoulArchives - Grid of spiritual notes
'use client';

import { TrendingUp, Filter, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SpiritNote } from '../types';

interface SoulArchivesProps {
  notes: SpiritNote[];
}

export function SoulArchives({ notes }: SoulArchivesProps) {
  return (
    <section className="space-y-10">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-sm tracking-[0.3em] uppercase text-purple-500/60">
          Archives de l'Âme
        </h2>
        <div className="flex gap-4">
          <button className="text-slate-500 hover:text-slate-200 transition-colors">
            <TrendingUp className="w-5 h-5" />
          </button>
          <button className="text-slate-500 hover:text-slate-200 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {notes.map((note) => (
          <div
            key={note.id}
            className="note-card extreme-glass p-8 rounded-[2rem] space-y-4 border-white/5 group cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase tracking-widest text-purple-500/40">
                {note.type === 'vision' ? 'Vision Onirique' : 'Éclat de Conscience'}
              </span>
              <Star className="w-4 h-4 text-slate-600 group-hover:text-purple-500 transition-colors" />
            </div>
            {note.type === 'vision' && note.imageUrl && (
              <div className="h-20 w-full rounded-xl overflow-hidden">
                <img
                  alt="Vision"
                  className="w-full h-full object-cover grayscale opacity-30"
                  src={note.imageUrl}
                />
              </div>
            )}
            <p className={cn(
              "text-sm font-light leading-relaxed text-slate-300",
              note.type === 'text' && "italic"
            )}>
              {note.content}
            </p>
            <div className="flex gap-2 pt-2">
              <span className="text-[9px] font-medium uppercase tracking-widest text-slate-600">
                #{note.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
