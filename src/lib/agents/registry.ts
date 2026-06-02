import { AgentConfig } from './types';
import { AgentRuntime } from './runtime';
import { eventBus, SystemEvents } from '@/lib/bus/events';
import { chunkText } from '@/lib/rag/chunker';
import { promises as fs } from 'fs';

export interface SpawnResult {
  agent: AgentRuntime;
  status: 'created' | 'recovered';
}

export interface TrainResult {
  chunksCreated: number;
  totalTokens: number;
  errors: string[];
}

export interface UpgradeResult {
  previous: AgentRuntime;
  current: AgentRuntime;
  stmPreserved: number;
}

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

  spawn(config: AgentConfig): SpawnResult {
    const runtime = this.register(config);
    const errors = runtime.validateConfig();
    if (errors.length > 0) {
      this.unregister(config.id);
      throw new Error(`Agent config invalid: ${errors.join('; ')}`);
    }

    if (!runtime.context.stm.size) {
      runtime.stmSet('status', 'initialized');
      runtime.stmSet('spawnedAt', new Date().toISOString());
    }

    eventBus.emit(SystemEvents.MODULE_LOADED, {
      moduleId: `agent:${config.id}`,
      name: config.name,
    });

    return { agent: runtime, status: 'created' };
  }

  async train(agentId: string, content: string, options?: { metadata?: Record<string, unknown> }): Promise<TrainResult> {
    const result: TrainResult = { chunksCreated: 0, totalTokens: 0, errors: [] };
    const runtime = this.agents.get(agentId);
    if (!runtime) {
      result.errors.push(`Agent '${agentId}' not found`);
      return result;
    }

    try {
      const chunks = chunkText(content);
      if (chunks.length === 0) return result;

      result.chunksCreated = chunks.length;
      result.totalTokens = chunks.reduce((sum, c) => sum + c.tokens, 0);

      const { storeMemories } = await import('@/lib/rag/store');
      await storeMemories(agentId, chunks, {
        ...options?.metadata,
        trainedAt: new Date().toISOString(),
        trainSource: 'lifecycle',
      });

      runtime.stmSet('trainedAt', new Date().toISOString());
      runtime.stmSet('trainingChunks', String(result.chunksCreated));
    } catch (e: any) {
      result.errors.push(e.message);
    }

    return result;
  }

  async trainFromMemories(agentId: string): Promise<TrainResult> {
    const runtime = this.agents.get(agentId);
    if (!runtime) return { chunksCreated: 0, totalTokens: 0, errors: ['Agent not found'] };

    try {
      const { memoryManager } = await import('@/lib/services/agent-memory');
      const memories = await memoryManager.listMemories(agentId, 'ltm');
      if (memories.length === 0) return { chunksCreated: 0, totalTokens: 0, errors: [] };

      const content = memories
        .map(m => `[${m.type}] ${m.key}: ${m.value}`)
        .join('\n');

      return this.train(agentId, content, { metadata: { source: 'ltm-memories' } });
    } catch (e: any) {
      return { chunksCreated: 0, totalTokens: 0, errors: [e.message] };
    }
  }

  async trainFromMarkdown(agentId: string, filePath: string): Promise<TrainResult> {
    const result: TrainResult = { chunksCreated: 0, totalTokens: 0, errors: [] };
    const runtime = this.agents.get(agentId);
    if (!runtime) {
      result.errors.push(`Agent '${agentId}' not found`);
      return result;
    }

    try {
      // Read the markdown file
      const markdownContent = await fs.readFile(filePath, 'utf-8');
      
      // Extract meaningful content (skip metadata headers, code blocks, etc.)
      const lines = markdownContent.split('\n');
      const meaningfulLines = lines.filter(line => 
        !line.startsWith('##') && 
        !line.startsWith('###') && 
        !line.startsWith('---') && 
        !line.trim().startsWith('```') &&
        line.trim() !== ''
      );
      
      const content = meaningfulLines.join('\n');
      
      if (content.trim() === '') {
        result.errors.push('No meaningful content found in markdown file');
        return result;
      }

      // Use existing train method to process content
      const trainResult = await this.train(agentId, content, {
        metadata: {
          source: 'markdown-file',
          filePath,
          importedAt: new Date().toISOString(),
        }
      });

      // Merge results
      result.chunksCreated = trainResult.chunksCreated;
      result.totalTokens = trainResult.totalTokens;
      result.errors = [...trainResult.errors];

      // Update agent STM with import information
      runtime.stmSet('lastMarkdownImport', filePath);
      runtime.stmSet('markdownImportedAt', new Date().toISOString());
      runtime.stmSet('markdownChunks', String(result.chunksCreated));

    } catch (e: any) {
      result.errors.push(`Failed to import markdown: ${e.message}`);
    }

    return result;
  }

  upgrade(agentId: string, newConfig: Partial<AgentConfig>): UpgradeResult | null {
    const old = this.agents.get(agentId);
    if (!old) return null;

    const stmSnapshot = new Map(old.context.stm);

    old.dispose();
    this.agents.delete(agentId);

    const merged: AgentConfig = {
      ...old.config,
      ...newConfig,
      id: old.config.id,
    };

    const fresh = new AgentRuntime(merged);
    this.agents.set(agentId, fresh);

    for (const [key, value] of stmSnapshot) {
      fresh.stmSet(key, value);
    }

    eventBus.emit(SystemEvents.MODULE_LOADED, {
      moduleId: `agent:${agentId}`,
      name: merged.name,
    });

    return {
      previous: old,
      current: fresh,
      stmPreserved: stmSnapshot.size,
    };
  }

  async retire(agentId: string): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    try {
      // Promote STM memories to MTM before retirement
      const { memoryManager } = await import('@/lib/services/agent-memory');
      const stmMemories = Array.from(agent.context.stm.entries()).map(([key, value]) => ({
        key,
        value,
        type: 'stm-retirement',
        importance: 5, // High importance for preserved memories
        memoryLevel: 'mtm' as const,
        emotion: 'neutral',
        metadata: {
          retiredAt: new Date().toISOString(),
          preservedFrom: 'stm',
        },
      }));

      if (stmMemories.length > 0) {
        await memoryManager.storeMemories(agentId, stmMemories);
      }

      // Emit retirement event
      eventBus.emit(SystemEvents.MODULE_UNLOADED, {
        moduleId: `agent:${agentId}`,
        name: agent.name,
        reason: 'retirement',
      });

      // Dispose and unregister
      agent.dispose();
      return this.agents.delete(agentId);
    } catch (e: any) {
      console.error(`Failed to retire agent '${agentId}':`, e);
      return false;
    }
  }

  unregister(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    agent.dispose();
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

  getStatus(agentId: string): Record<string, unknown> | null {
    const agent = this.agents.get(agentId);
    if (!agent) return null;
    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      messageCount: agent.context.messageCount,
      stmKeys: agent.context.stm.size,
      createdAt: agent.context.createdAt,
      lastActiveAt: agent.context.lastActiveAt,
      capabilities: agent.config.capabilities,
    };
  }
}

export const agentRegistry = new AgentRegistry();

