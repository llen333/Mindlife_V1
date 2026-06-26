'use client';

import { BLOCK_REGISTRY } from '@/lib/canvas/block-registry';
import {
  CheckSquare, UtensilsCrossed, Weight, Brain, GitBranch, Play, FileText, ListTodo,
  type LucideIcon,
} from 'lucide-react';
import { useCallback } from 'react';

const ICON_MAP: Record<string, LucideIcon> = {
  CheckSquare, UtensilsCrossed, Weight, Brain, GitBranch, Play, FileText, ListTodo,
};

const CATEGORIES = [
  { key: 'triggers', label: 'Déclencheurs', color: 'text-green-400' },
  { key: 'actions', label: 'Actions', color: 'text-emerald-400' },
  { key: 'ai', label: 'IA', color: 'text-cyan-400' },
  { key: 'logic', label: 'Logique', color: 'text-orange-400' },
  { key: 'tools', label: 'Outils', color: 'text-purple-400' },
];

function PaletteBlock({ type, label, icon, color }: { type: string; label: string; icon: string; color: string }) {
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.effectAllowed = 'copy';
  }, [type]);

  const Icon = ICON_MAP[icon];

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-grab active:cursor-grabbing transition-all border border-white/5 hover:border-white/10 group"
    >
      <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
        {Icon && <Icon className="w-3.5 h-3.5" style={{ color }} />}
      </div>
      <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{label}</span>
    </div>
  );
}

export default function BlockPalette() {
  return (
    <div className="w-56 bg-black/40 border-r border-white/5 flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outils</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {CATEGORIES.map(cat => {
          const blocks = BLOCK_REGISTRY.filter(b => b.category === cat.key);
          if (blocks.length === 0) return null;
          return (
            <div key={cat.key}>
              <h3 className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${cat.color}`}>{cat.label}</h3>
              <div className="space-y-1">
                {blocks.map(block => (
                  <PaletteBlock key={block.type} {...block} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
