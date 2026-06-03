import { bus } from '../../src/lib/bus/orchestrator';
import { eventBus, SystemEvents } from '../../src/lib/bus/events';
import { kernelStore } from '../store';

export const sysAgent = {
  async send(params: { from: string; to: string; message: string; sessionId?: string }): Promise<void> {
    await kernelStore.recordAgentMessage(params.from, params.to, 'direct', JSON.stringify({
      message: params.message,
      sessionId: params.sessionId,
    }));
    eventBus.emit(SystemEvents.AGENT_MESSAGE, {
      sessionId: params.sessionId,
      message: params.message,
      role: params.from,
    });
  },

  async broadcast(params: { from: string; message: string }): Promise<void> {
    await kernelStore.recordAgentMessage(params.from, null, 'broadcast', JSON.stringify({
      message: params.message,
    }));
    const modules = bus.getAllModules();
    for (const mod of modules) {
      eventBus.emit(SystemEvents.AGENT_MESSAGE, {
        message: params.message,
        role: params.from,
      });
    }
  },

  async status(params: { agentId: string }): Promise<{ loaded: boolean; module?: string }> {
    const mod = bus.getModule(params.agentId);
    return {
      loaded: !!mod,
      module: mod?.name,
    };
  },

  async list(): Promise<{ id: string; name: string }[]> {
    return bus.getAllModules().map((m) => ({ id: m.id, name: m.name }));
  },
};
