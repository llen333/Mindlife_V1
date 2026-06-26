import { getBlockDef } from './block-registry';
import type { CanvasBlock, Connection, ExecutionContext } from './types';

export async function executeWorkflow(
  blocks: CanvasBlock[],
  connections: Connection[],
  context: ExecutionContext,
  onStateChange: (blockId: string, state: 'idle' | 'running' | 'success' | 'error') => void,
): Promise<{ success: boolean; error?: string }> {
  if (blocks.length === 0) {
    context.onLog('', 'Aucun bloc sur le canvas', 'error');
    return { success: false, error: 'Canvas vide' };
  }

  const trigger = blocks.find(b => b.type === 'trigger-manual');
  if (!trigger) {
    context.onLog('', 'Ajoute un bloc "Démarrer" pour exécuter', 'error');
    return { success: false, error: 'Bloc Démarrer manquant' };
  }

  for (const b of blocks) onStateChange(b.id, 'idle');

  const blockMap = new Map(blocks.map(b => [b.id, b]));
  const executed = new Set<string>();
  const outputs = new Map<string, Record<string, unknown>>();
  const adjacency = new Map<string, string[]>();

  for (const conn of connections) {
    const list = adjacency.get(conn.sourceBlockId) || [];
    list.push(conn.targetBlockId);
    adjacency.set(conn.sourceBlockId, list);
  }

  async function executeBlock(blockId: string): Promise<boolean> {
    if (executed.has(blockId)) return true;
    executed.add(blockId);

    const block = blockMap.get(blockId);
    if (!block) return true;

    onStateChange(blockId, 'running');
    context.onLog(blockId, `Exécution de ${block.type}...`, 'info');

    const def = getBlockDef(block.type);
    if (!def) {
      onStateChange(blockId, 'error');
      context.onLog(blockId, `Bloc inconnu : ${block.type}`, 'error');
      return false;
    }

    try {
      const inputConns = connections.filter(c => c.targetBlockId === blockId);
      const inputs: Record<string, unknown> = {};
      for (const conn of inputConns) {
        const sourceOutput = outputs.get(conn.sourceBlockId);
        if (sourceOutput) {
          inputs[conn.targetPortId] = sourceOutput;
        }
      }

      const result = await def.execute(block.config, inputs);
      outputs.set(blockId, result);

      onStateChange(blockId, 'success');
      context.onLog(blockId, `${def.label} → OK`, 'success');

      const nextBlocks = adjacency.get(blockId) || [];
      for (const nextId of nextBlocks) {
        const ok = await executeBlock(nextId);
        if (!ok) return false;
      }

      return true;
    } catch (error: any) {
      onStateChange(blockId, 'error');
      context.onLog(blockId, `${def.label} → ${error.message}`, 'error');
      return false;
    }
  }

  try {
    const ok = await executeBlock(trigger.id);
    context.onLog('', ok ? 'Workflow terminé avec succès !' : 'Workflow terminé avec erreurs', ok ? 'success' : 'error');
    return { success: ok };
  } catch (error: any) {
    context.onLog('', `Erreur critique : ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}
