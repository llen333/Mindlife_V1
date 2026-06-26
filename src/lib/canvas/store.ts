import { create } from 'zustand';
import type { CanvasBlock, Connection, CanvasState } from './types';
import { getBlockDef } from './block-registry';

function generateId(): string {
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface CanvasActions {
  addBlock: (type: string, x: number, y: number) => void;
  updateBlockPosition: (id: string, x: number, y: number) => void;
  updateBlockConfig: (id: string, config: Record<string, unknown>) => void;
  removeBlock: (id: string) => void;
  addConnection: (sourceBlockId: string, sourcePortId: string, targetBlockId: string, targetPortId: string) => void;
  removeConnection: (id: string) => void;
  setSelectedBlock: (id: string | null) => void;
  setConnectingFrom: (from: { blockId: string; portId: string } | null) => void;
  setExecutionState: (blockId: string, state: 'idle' | 'running' | 'success' | 'error') => void;
  addExecutionLog: (blockId: string, message: string, type: 'info' | 'error' | 'success') => void;
  resetExecution: () => void;
  clearAll: () => void;
}

type CanvasStore = CanvasState & CanvasActions;

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  blocks: [],
  connections: [],
  selectedBlockId: null,
  connectingFrom: null,
  executionState: {},
  executionLogs: [],

  addBlock: (type, x, y) => {
    const id = generateId();
    const def = getBlockDef(type);
    const block: CanvasBlock = { id, type, x, y, config: {} };
    set(s => ({ blocks: [...s.blocks, block] }));
  },

  updateBlockPosition: (id, x, y) => {
    set(s => ({
      blocks: s.blocks.map(b => b.id === id ? { ...b, x, y } : b),
    }));
  },

  updateBlockConfig: (id, config) => {
    set(s => ({
      blocks: s.blocks.map(b => b.id === id ? { ...b, config: { ...b.config, ...config } } : b),
    }));
  },

  removeBlock: (id) => {
    set(s => ({
      blocks: s.blocks.filter(b => b.id !== id),
      connections: s.connections.filter(c => c.sourceBlockId !== id && c.targetBlockId !== id),
    }));
  },

  addConnection: (sourceBlockId, sourcePortId, targetBlockId, targetPortId) => {
    const id = `conn-${Date.now()}`;
    set(s => ({
      connections: [...s.connections, { id, sourceBlockId, sourcePortId, targetBlockId, targetPortId }],
    }));
  },

  removeConnection: (id) => {
    set(s => ({
      connections: s.connections.filter(c => c.id !== id),
    }));
  },

  setSelectedBlock: (id) => set({ selectedBlockId: id }),

  setConnectingFrom: (from) => set({ connectingFrom: from }),

  setExecutionState: (blockId, state) => {
    set(s => ({
      executionState: { ...s.executionState, [blockId]: state },
    }));
  },

  addExecutionLog: (blockId, message, type) => {
    const log = { blockId, message, type, timestamp: Date.now() };
    set(s => ({
      executionLogs: [...s.executionLogs.slice(-99), log],
    }));
  },

  resetExecution: () => set({ executionState: {}, executionLogs: [] }),

  clearAll: () => set({ blocks: [], connections: [], selectedBlockId: null, executionState: {}, executionLogs: [] }),
}));
