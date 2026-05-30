'use client';

import { useState } from 'react';
import { Clock, Filter, Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const BLUE = '#3b82f6';
const CYAN = '#06b6d4';

const LOGS = [
  { time: '14:32:18', date: '2026-05-28', level: 'info' as const, message: 'AgentService: message traité par Somnia (session-xxx)', agent: 'Somnia', duration: '230ms' },
  { time: '14:30:05', date: '2026-05-28', level: 'info' as const, message: 'AgentService: nouveau souvenir créé pour Psyché', agent: 'Psyché', duration: '1.2s' },
  { time: '14:28:44', date: '2026-05-28', level: 'info' as const, message: 'AgentService: seed des 8 agents par défaut', agent: 'system', duration: '4.7s' },
  { time: '14:25:12', date: '2026-05-28', level: 'warn' as const, message: 'AgentService: tentative d\'appel LLM sans clé API configurée', agent: 'system', duration: '—' },
  { time: '14:20:30', date: '2026-05-28', level: 'info' as const, message: 'AgentService: session créée pour Atlas', agent: 'Atlas', duration: '890ms' },
  { time: '14:15:02', date: '2026-05-28', level: 'error' as const, message: 'Connexion API externe échouée — timeout après 30s', agent: 'system', duration: '30.0s' },
  { time: '14:10:55', date: '2026-05-28', level: 'info' as const, message: 'AgentService: message traité par Ami (session-abc)', agent: 'Ami', duration: '410ms' },
  { time: '14:05:12', date: '2026-05-28', level: 'warn' as const, message: 'Mémoire MTM: decay appliqué à 3 souvenirs', agent: 'system', duration: '—' },
  { time: '13:58:30', date: '2026-05-28', level: 'info' as const, message: 'AgentService: réponse générée par Zéphyr', agent: 'Zéphyr', duration: '1.8s' },
  { time: '13:45:00', date: '2026-05-28', level: 'info' as const, message: 'Synchronisation base de connaissances terminée', agent: 'system', duration: '12.3s' },
  { time: '13:30:22', date: '2026-05-28', level: 'error' as const, message: 'Rate limit dépassé pour provider Z.ai', agent: 'system', duration: '—' },
  { time: '13:15:18', date: '2026-05-28', level: 'info' as const, message: 'AgentService: message traité par Stoïcien', agent: 'Stoïcien', duration: '560ms' },
];

const LEVEL_META = {
  info: { label: 'Info', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]', dot: 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.9)]' },
  warn: { label: 'Warning', class: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_12px_rgba(251,191,36,0.15)]', dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]' },
  error: { label: 'Error', class: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)]', dot: 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.9)]' },
};

type LogLevel = 'all' | 'info' | 'warn' | 'error';

const GLOW = `0 0 40px ${BLUE}11`;

export default function LogsPanel() {
  const [filter, setFilter] = useState<LogLevel>('all');
  const filtered = filter === 'all' ? LOGS : LOGS.filter(l => l.level === filter);
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase();

  return (
    <div className="space-y-8 relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30"
          style={{ background: `radial-gradient(circle, ${BLUE}22, transparent 70%)` }}
        />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] opacity-20"
          style={{ background: `radial-gradient(circle, rgba(148,163,184,0.1), transparent 70%)` }}
        />
      </div>

      <header className="flex items-start justify-between relative z-10">
        <div>
          <h1 className="font-serif text-5xl text-white mb-3 tracking-tight"
            style={{ textShadow: `0 0 40px ${BLUE}44` }}>
            Journaux
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.08em] font-mono font-medium">Activité système et historique des événements</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-xl">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] text-white uppercase tracking-[0.08em] font-mono font-medium">{date}</span>
        </div>
      </header>

      <div
        className="rounded-[24px] border border-white/[0.06] overflow-hidden relative z-10 transition-all duration-500 hover:border-blue-500/20"
        style={{
          background: 'rgba(18, 18, 23, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: `inset 0 1px 1px rgba(255,255,255,0.02), ${GLOW}`,
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            {(['all', 'info', 'warn', 'error'] as LogLevel[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border",
                  filter === f
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                    : 'text-slate-500 hover:text-slate-300 bg-white/[0.02] border-transparent'
                )}
              >
                {f === 'all' ? 'Tout' : LEVEL_META[f].label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-600 font-mono">{filtered.length} entrées</span>
            <button className="text-[10px] text-slate-500 font-mono hover:text-blue-400 transition-colors flex items-center gap-1.5">
              <Filter className="w-3 h-3" />
              Filtres
            </button>
          </div>
        </div>

        <div className="divide-y divide-white/[0.03]">
          {filtered.map((log, i) => {
            const level = LEVEL_META[log.level];
            return (
              <div
                key={i}
                className="flex items-center gap-4 p-4 text-[11px] hover:bg-blue-500/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-2 w-16 flex-shrink-0">
                  <div className={cn("w-1.5 h-1.5 rounded-full", level.dot)} />
                  <span className="text-slate-600 font-mono text-[10px]">{log.time}</span>
                </div>
                <span className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border flex-shrink-0", level.class)}>
                  {level.label}
                </span>
                <span className="text-slate-400 flex-1 leading-relaxed font-mono text-[10px] group-hover:text-slate-300 transition-colors">{log.message}</span>
                <span className="text-slate-600 text-[10px] font-mono flex-shrink-0 w-16 text-right">{log.duration}</span>
                <span className="text-slate-600 text-[10px] font-mono flex-shrink-0 w-16 text-right">{log.agent}</span>
              </div>
            );
          })}
        </div>

        {filtered.length > 10 && (
          <div className="flex justify-center p-4 border-t border-white/5">
            <button className="text-[10px] text-slate-500 font-mono hover:text-blue-400 transition-colors flex items-center gap-1">
              Voir plus
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
