import { describe, it, expect, beforeEach } from 'vitest';
import { useCanvasStore } from '@/lib/canvas/store';
import { getBlockDef, BLOCK_REGISTRY } from '@/lib/canvas/block-registry';
import { executeWorkflow } from '@/lib/canvas/execution-engine';
import type { CanvasBlock, Connection, ExecutionContext } from '@/lib/canvas/types';

describe('Canvas Store', () => {
  beforeEach(() => {
    useCanvasStore.setState({ blocks: [], connections: [], selectedBlockId: null, connectingFrom: null, executionState: {}, executionLogs: [] });
  });

  it('adds a block', () => {
    useCanvasStore.getState().addBlock('create-task', 100, 200);
    const { blocks } = useCanvasStore.getState();
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('create-task');
    expect(blocks[0].x).toBe(100);
    expect(blocks[0].y).toBe(200);
  });

  it('removes a block and its connections', () => {
    useCanvasStore.getState().addBlock('trigger-manual', 0, 0);
    useCanvasStore.getState().addBlock('create-task', 300, 0);
    const { blocks } = useCanvasStore.getState();
    useCanvasStore.getState().addConnection(blocks[0].id, 'out', blocks[1].id, 'in');
    expect(useCanvasStore.getState().connections).toHaveLength(1);
    useCanvasStore.getState().removeBlock(blocks[0].id);
    expect(useCanvasStore.getState().blocks).toHaveLength(1);
    expect(useCanvasStore.getState().connections).toHaveLength(0);
  });

  it('updates block position', () => {
    useCanvasStore.getState().addBlock('log-meal', 0, 0);
    const id = useCanvasStore.getState().blocks[0].id;
    useCanvasStore.getState().updateBlockPosition(id, 500, 300);
    expect(useCanvasStore.getState().blocks[0].x).toBe(500);
    expect(useCanvasStore.getState().blocks[0].y).toBe(300);
  });

  it('adds and removes connections', () => {
    useCanvasStore.getState().addBlock('trigger-manual', 0, 0);
    useCanvasStore.getState().addBlock('ai-coach', 300, 0);
    const { blocks } = useCanvasStore.getState();
    useCanvasStore.getState().addConnection(blocks[0].id, 'out', blocks[1].id, 'in');
    expect(useCanvasStore.getState().connections).toHaveLength(1);
    useCanvasStore.getState().removeConnection(useCanvasStore.getState().connections[0].id);
    expect(useCanvasStore.getState().connections).toHaveLength(0);
  });

  it('manages execution state', () => {
    useCanvasStore.getState().addBlock('create-task', 0, 0);
    const id = useCanvasStore.getState().blocks[0].id;
    useCanvasStore.getState().setExecutionState(id, 'running');
    expect(useCanvasStore.getState().executionState[id]).toBe('running');
    useCanvasStore.getState().setExecutionState(id, 'success');
    expect(useCanvasStore.getState().executionState[id]).toBe('success');
  });

  it('clears all', () => {
    useCanvasStore.getState().addBlock('create-task', 0, 0);
    useCanvasStore.getState().addBlock('log-meal', 300, 0);
    useCanvasStore.getState().clearAll();
    expect(useCanvasStore.getState().blocks).toHaveLength(0);
    expect(useCanvasStore.getState().connections).toHaveLength(0);
  });
});

describe('Block Registry', () => {
  it('has all required block types', () => {
    const types = ['trigger-manual', 'create-task', 'log-meal', 'log-weight', 'ai-coach', 'condition', 'create-note', 'list-tasks'];
    for (const type of types) {
      expect(getBlockDef(type)).toBeDefined();
    }
  });

  it('each block has inputs and outputs', () => {
    for (const block of BLOCK_REGISTRY) {
      expect(Array.isArray(block.inputs)).toBe(true);
      expect(Array.isArray(block.outputs)).toBe(true);
      expect(typeof block.execute).toBe('function');
      expect(block.category).toBeTruthy();
      expect(block.color).toBeTruthy();
    }
  });

  it('condition block has true/false outputs', () => {
    const cond = getBlockDef('condition')!;
    expect(cond.outputs.some(o => o.id === 'true')).toBe(true);
    expect(cond.outputs.some(o => o.id === 'false')).toBe(true);
  });
});

describe('Execution Engine', () => {
  it('returns error for empty canvas', async () => {
    const logs: any[] = [];
    const ctx: ExecutionContext = { userId: 'test', variables: {}, onLog: (bid, msg, type) => logs.push({ bid, msg, type }) };
    const result = await executeWorkflow([], [], ctx, () => {});
    expect(result.success).toBe(false);
    expect(result.error).toBe('Canvas vide');
  });

  it('returns error when no trigger block', async () => {
    const blocks: CanvasBlock[] = [{ id: 'b1', type: 'create-task', x: 0, y: 0, config: {} }];
    const logs: any[] = [];
    const ctx: ExecutionContext = { userId: 'test', variables: {}, onLog: (bid, msg, type) => logs.push({ bid, msg, type }) };
    const result = await executeWorkflow(blocks, [], ctx, () => {});
    expect(result.success).toBe(false);
    expect(result.error).toBe('Bloc Démarrer manquant');
  });

  it('executes trigger block successfully', async () => {
    const blocks: CanvasBlock[] = [
      { id: 't1', type: 'trigger-manual', x: 0, y: 0, config: {} },
    ];
    const logs: any[] = [];
    const ctx: ExecutionContext = { userId: 'test', variables: {}, onLog: (bid, msg, type) => logs.push({ bid, msg, type }) };
    const result = await executeWorkflow(blocks, [], ctx, () => {});
    expect(result.success).toBe(true);
  });
});
