'use client';

import { memo, useCallback } from 'react';
import { getBlockDef } from '@/lib/canvas/block-registry';
import { useCanvasStore } from '@/lib/canvas/store';
import {
  CheckSquare, UtensilsCrossed, Weight, Brain, GitBranch, Play, FileText, ListTodo, Trash2, GripVertical,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  CheckSquare, UtensilsCrossed, Weight, Brain, GitBranch, Play, FileText, ListTodo,
};

interface CanvasBlockProps {
  id: string;
  type: string;
  x: number;
  y: number;
  zoom?: number;
  onPointerDown?: (e: React.PointerEvent) => void;
}

function CanvasBlockInner({ id, type, x, y, zoom = 1, onPointerDown }: CanvasBlockProps) {
  const def = getBlockDef(type);
  const { selectedBlockId, setSelectedBlock, removeBlock, executionState, connectingFrom, setConnectingFrom } = useCanvasStore();
  const isSelected = selectedBlockId === id;
  const execState = executionState[id] || 'idle';

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBlock(id);
  }, [id, setSelectedBlock]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    removeBlock(id);
  }, [id, removeBlock]);

  const handlePortClick = useCallback((e: React.MouseEvent, portId: string, portType: 'input' | 'output') => {
    e.stopPropagation();
    if (connectingFrom) {
      if (connectingFrom.blockId !== id && portType === 'input') {
        useCanvasStore.getState().addConnection(connectingFrom.blockId, connectingFrom.portId, id, portId);
        setConnectingFrom(null);
      } else if (connectingFrom.blockId === id && connectingFrom.portId === portId) {
        setConnectingFrom(null);
      }
    } else if (portType === 'output') {
      setConnectingFrom({ blockId: id, portId });
    }
  }, [id, connectingFrom, setConnectingFrom]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    width: 220,
    zIndex: isSelected ? 10 : 1,
  };

  const Icon = def ? ICON_MAP[def.icon] : undefined;
  const stateColor = execState === 'running' ? 'border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.3)]' :
    execState === 'success' ? 'border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
    execState === 'error' ? 'border-red-500/70 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
    isSelected ? 'border-white/30' : 'border-white/10';

  return (
    <div
      ref={undefined}
      style={style}
      className={`absolute bg-[#111827] rounded-xl border ${stateColor} transition-shadow duration-300`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            onPointerDown={onPointerDown}
            className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-white transition-colors touch-none"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </div>
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: `${def?.color}20` }}>
            {Icon && <Icon className="w-3 h-3" style={{ color: def?.color }} />}
          </div>
          <span className="text-xs font-medium text-white truncate">{def?.label || type}</span>
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            execState === 'running' ? 'bg-cyan-400 animate-pulse' :
            execState === 'success' ? 'bg-emerald-400' :
            execState === 'error' ? 'bg-red-400' : 'bg-slate-600'
          }`} />
        </div>
        <button onClick={handleDelete} className="text-slate-600 hover:text-red-400 transition-colors ml-1">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {def && def.configFields.length > 0 && (
        <div className="px-3 py-2 space-y-1.5">
          {def.configFields.slice(0, 2).map(field => (
            <div key={field.name} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-16 flex-shrink-0">{field.label}</span>
              {field.type === 'select' ? (
                <select
                  className="flex-1 bg-white/5 border border-white/10 rounded px-1.5 py-1 text-[10px] text-slate-300"
                  defaultValue={field.defaultValue as string}
                  onChange={e => useCanvasStore.getState().updateBlockConfig(id, { [field.name]: e.target.value })}
                >
                  {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input
                  className="flex-1 bg-white/5 border border-white/10 rounded px-1.5 py-1 text-[10px] text-slate-300 placeholder:text-slate-600"
                  placeholder={field.placeholder}
                  onChange={e => useCanvasStore.getState().updateBlockConfig(id, { [field.name]: e.target.value })}
                />
              )}
            </div>
          ))}
          {def.configFields.length > 2 && (
            <div className="text-[9px] text-slate-600 text-center">+{def.configFields.length - 2} options</div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/5">
        <div className="flex gap-1">
          {def?.inputs.map(port => (
            <button
              key={port.id}
              onClick={e => handlePortClick(e, port.id, 'input')}
              className={`w-3 h-3 rounded-full border-2 transition-all ${
                connectingFrom && connectingFrom.blockId !== id
                  ? 'border-emerald-400 bg-emerald-400/30 animate-pulse'
                  : 'border-slate-500 bg-slate-800 hover:border-emerald-400'
              }`}
              title={port.label}
            />
          ))}
        </div>
        <span className="text-[8px] text-slate-600">
          {execState === 'running' ? 'RUNNING' : execState === 'success' ? 'DONE' : execState === 'error' ? 'ERROR' : 'IDLE'}
        </span>
        <div className="flex gap-1">
          {def?.outputs.map(port => (
            <button
              key={port.id}
              onClick={e => handlePortClick(e, port.id, 'output')}
              className={`w-3 h-3 rounded-full border-2 transition-all ${
                connectingFrom && connectingFrom.blockId === id && connectingFrom.portId === port.id
                  ? 'border-cyan-400 bg-cyan-400/50'
                  : 'border-slate-500 bg-slate-800 hover:border-cyan-400'
              }`}
              title={port.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const CanvasBlock = memo(CanvasBlockInner);
