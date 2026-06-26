'use client';

import { useCallback, useState } from 'react';
import { useCanvasStore } from '@/lib/canvas/store';
import { executeWorkflow } from '@/lib/canvas/execution-engine';
import { CanvasBlock } from './CanvasBlock';
import { ConnectionLine } from './ConnectionLine';
import { Play, RotateCcw, Trash2, ZoomIn, ZoomOut, X } from 'lucide-react';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  setZoom: (fn: (prev: number) => number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onBlockPointerDown: (blockId: string, e: React.PointerEvent) => void;
}

export default function Canvas({
  canvasRef, zoom, setZoom,
  onDragOver, onDrop, onPointerMove, onPointerUp, onBlockPointerDown,
}: CanvasProps) {
  const {
    blocks, connections, clearAll,
    resetExecution, setConnectingFrom, connectingFrom, addExecutionLog,
    executionLogs,
  } = useCanvasStore();
  const [isRunning, setIsRunning] = useState(false);

  const handleCanvasClick = useCallback(() => {
    useCanvasStore.getState().setSelectedBlock(null);
    if (connectingFrom) setConnectingFrom(null);
  }, [connectingFrom, setConnectingFrom]);

  const handleRun = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    const store = useCanvasStore.getState();
    store.resetExecution();
    const ctxBlocks = store.blocks;
    const ctxConnections = store.connections;
    const context = {
      userId: 'mindlife-user',
      variables: {},
      onLog: (blockId: string, message: string, type: 'info' | 'error' | 'success') => {
        useCanvasStore.getState().addExecutionLog(blockId, message, type);
      },
    };
    await executeWorkflow(ctxBlocks, ctxConnections, context, (blockId, state) => {
      useCanvasStore.getState().setExecutionState(blockId, state);
    });
    setIsRunning(false);
  }, [isRunning]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0f1a]/50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isRunning
                ? 'bg-cyan-500/20 text-cyan-400 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button
            onClick={resetExecution}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[10px] text-slate-600">{blocks.length} blocs · {connections.length} connexions</div>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="text-slate-500 hover:text-white p-1">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-slate-600 w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="text-slate-500 hover:text-white p-1">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={canvasRef}
        className="flex-1 relative overflow-auto touch-none"
        onClick={handleCanvasClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ cursor: connectingFrom ? 'crosshair' : 'default' }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            transform: `scale(${zoom})`,
            transformOrigin: '0 0',
            minWidth: '200%',
            minHeight: '200%',
          }}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#475569" />
              </marker>
            </defs>
          </svg>

          {connections.map(conn => (
            <ConnectionLine key={conn.id} {...conn} />
          ))}

          {blocks.map(block => (
            <CanvasBlock
              key={block.id}
              {...block}
              zoom={zoom}
              onPointerDown={(e) => onBlockPointerDown(block.id, e)}
            />
          ))}
        </div>

        {blocks.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Play className="w-7 h-7 text-slate-600" />
              </div>
              <p className="text-sm text-slate-500">Glisse des outils depuis la palette pour commencer</p>
              <p className="text-xs text-slate-600 mt-1">Ajoute "Démarrer" puis connecte des actions</p>
            </div>
          </div>
        )}

        {connectingFrom && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded-full text-xs">
            Clique sur un port d'entrée (vert) pour connecter · ou re-clique sur le port pour annuler
            <button onClick={() => setConnectingFrom(null)} className="ml-3 text-cyan-300 hover:text-white">
              <X className="w-3 h-3 inline" />
            </button>
          </div>
        )}
      </div>

      {executionLogs.length > 0 && (
        <div className="h-40 border-t border-white/5 bg-black/40 overflow-y-auto">
          <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Logs</h3>
            <span className="text-[10px] text-slate-600">{executionLogs.length} entrées</span>
          </div>
          <div className="p-2 space-y-0.5">
            {executionLogs.slice().reverse().map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px] font-mono">
                <span className={`flex-shrink-0 w-1.5 h-1.5 mt-1 rounded-full ${
                  log.type === 'success' ? 'bg-emerald-500' :
                  log.type === 'error' ? 'bg-red-500' : 'bg-slate-500'
                }`} />
                <span className="text-slate-500 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`${
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'error' ? 'text-red-400' : 'text-slate-300'
                }`}>
                  {log.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
