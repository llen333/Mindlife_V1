import { AgentConfig } from './types';
import { AgentRuntime } from './runtime';
import { eventBus, SystemEvents } from '@/lib/bus/events';

export class AgentRegistry {
  private agents = new Map<string, AgentRuntime>();

  register(config: AgentConfig): AgentRuntime {
    if (this.agents.has(config.id)) {
      throw new Error(`Agent '${config.id}' is already registered`);
    }
    const runtime = new AgentRuntime(config);
    this.agents.set(config.id, runtime);
    return runtime;
  }

  unregister(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  get(agentId: string): AgentRuntime | undefined {
    return this.agents.get(agentId);
  }

  getAll(): AgentRuntime[] {
    return Array.from(this.agents.values());
  }

  findByRole(role: string): AgentRuntime[] {
    return this.getAll().filter((a) => a.role === role);
  }

  findByName(name: string): AgentRuntime | undefined {
    return this.getAll().find((a) => a.name.toLowerCase() === name.toLowerCase());
  }

  count(): number {
    return this.agents.size;
  }
}

export const agentRegistry = new AgentRegistry();
