import { db } from '../src/lib/db';

export interface KernelState {
  id: string;
  loadedModuleIds: string[];
  startTime: string;
}

export class KernelStore {
  async recordLoadedModule(moduleId: string): Promise<void> {
    await db.agentState.upsert({
      where: { agentId: `kernel:module:${moduleId}` },
      create: {
        id: `kernel-module-${moduleId}`,
        agentId: `kernel:module:${moduleId}`,
        agentType: 'kernel_module',
        status: 'active',
        lastActivity: new Date(),
        metadata: JSON.stringify({ moduleId }),
      },
      update: {
        status: 'active',
        lastActivity: new Date(),
      },
    });
  }

  async recordUnloadedModule(moduleId: string): Promise<void> {
    await db.agentState.update({
      where: { agentId: `kernel:module:${moduleId}` },
      data: { status: 'inactive', lastActivity: new Date() },
    });
  }

  async getLoadedModules(): Promise<string[]> {
    const states = await db.agentState.findMany({
      where: { agentType: 'kernel_module', status: 'active' },
    });
    return states.map((s) => {
      try {
        const meta = JSON.parse(s.metadata || '{}');
        return meta.moduleId as string;
      } catch { return ''; }
    }).filter(Boolean);
  }

  async clearAllModuleStates(): Promise<void> {
    await db.agentState.deleteMany({
      where: { agentType: 'kernel_module' },
    });
  }

  async recordAgentMessage(from: string, to: string | null, type: string, payload: string): Promise<void> {
    await db.agentMessage.create({
      data: {
        id: `kmsg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        fromAgent: from,
        toAgent: to,
        messageType: type,
        payload,
      },
    });
  }
}

export const kernelStore = new KernelStore();
