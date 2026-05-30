// FrequenciesPanel - Frequency selection and playback
'use client';

import { Play, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Frequency } from '../types';
import { waveHeights } from '../constants';

interface FrequenciesPanelProps {
  frequencies: Frequency[];
  onToggleFrequency: (freq: Frequency) => void;
}

export function FrequenciesPanel({ frequencies, onToggleFrequency }: FrequenciesPanelProps) {
  return (
    <div className="extreme-glass rounded-[2rem] p-8 border-white/5">
      <h3 className="font-light text-xs uppercase tracking-[0.25em] text-purple-500/80 mb-8">
        Fréquences de l'Univers
      </h3>
      <div className="space-y-6">
        {frequencies.map((freq) => (
          <div
            key={freq.id}
            className={cn("group cursor-pointer", !freq.isPlaying && "opacity-50 hover:opacity-100")}
            onClick={() => onToggleFrequency(freq)}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[13px] tracking-widest text-slate-200">{freq.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                  {freq.hz} • {freq.description}
                </p>
              </div>
              {freq.isPlaying ? (
                <Volume2 className="w-5 h-5 text-purple-500" />
              ) : (
                <Play className="w-5 h-5 text-slate-400" />
              )}
            </div>
            {freq.isPlaying && (
              <div className="flex items-center gap-[3px] h-5">
                {waveHeights.map((height, i) => (
                  <div
                    key={i}
                    className="w-[2px] bg-purple-500 rounded-full animate-wave-bar"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      ['--wave-height' as string]: `${height}%`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
