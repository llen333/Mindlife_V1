import { AgentConfig, AgentContext, AgentMessageEvent } from './types';
import { permissionManager } from '@/lib/bus/permissions';
import { registry } from '@/lib/bus/registry';
import { bus } from '@/lib/bus/orchestrator';
import { eventBus, SystemEvents } from '@/lib/bus/events';
import { memoryManager } from '@/lib/services/agent-memory';
import { sessionManager } from '@/lib/services/agent-session';
import { ToolDefinition } from '@/lib/bus/types';

export class AgentRuntime {
  readonly config: AgentConfig;
  readonly context: AgentContext;
  private _onMessage: ((from: string, content: string, sessionId?: string) => void | Promise<void>) | null = null;
  private _dispose: (() => void) | null = null;

  constructor(config: AgentConfig) {
    this.config = config;
    this.context = {
      config,
      stm: new Map(),
      messageCount: 0,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };

    this._dispose = eventBus.on(SystemEvents.AGENT_MESSAGE, async (payload) => {
      const event = payload as unknown as AgentMessageEvent;
      if (event.to === this.config.id || (!event.to && event.from !== this.config.id)) {
        this.touch();
        await this._onMessage?.(event.from, event.content, event.sessionId);
      }
    });
  }

  dispose(): void {
    this._dispose?.();
    this._dispose = null;
    this._onMessage = null;
  }

  get id(): string {
    return this.config.id;
  }

  get name(): string {
    return this.config.name;
  }

  get role(): string {
    return this.config.role;
  }

  touch(): void {
    this.context.lastActiveAt = new Date();
  }

  hasCapability(capability: string): boolean {
    return this.config.capabilities?.includes(capability) ?? false;
  }

  checkPermission(permission: string): boolean {
    return permissionManager.check(this.config.role, permission as any).granted;
  }

  set onMessage(handler: ((from: string, content: string, sessionId?: string) => void | Promise<void>) | null) {
    this._onMessage = handler;
  }

  stmSet(key: string, value: string): void {
    this.context.stm.set(key, value);
  }

  stmGet(key: string): string | undefined {
    return this.context.stm.get(key);
  }

  getAvailableTools(): ToolDefinition[] {
    const allTools: ToolDefinition[] = [];
    for (const module of bus.getAllModules()) {
      const manifest = registry.getManifest(module.id);
      const requiredPerms = manifest?.permissions ?? [];
      const hasAllPerms = requiredPerms.every((p) => this.checkPermission(p));
      if (hasAllPerms) {
        allTools.push(...module.getTools());
      }
    }
    return allTools;
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    if (!this.config.id) errors.push('Agent ID is required');
    if (!this.config.name) errors.push('Agent name is required');
    if (!this.config.role) errors.push('Agent role is required');
    if (!this.config.systemPrompt) errors.push('System prompt is required');
    return errors;
  }

  async sendMessage(to: string, content: string, sessionId?: string): Promise<void> {
    const event: AgentMessageEvent = {
      from: this.config.id,
      to,
      content,
      sessionId,
      timestamp: new Date(),
    };
    await eventBus.emit(SystemEvents.AGENT_MESSAGE, event as any);
  }

  async processMessage(
    userId: string,
    message: string,
    sessionId?: string
  ): Promise<string> {
    this.touch();
    this.context.messageCount++;
    this.context.currentSessionId = sessionId;

    const sqliteMemories = await memoryManager.listMemories(this.config.id);
    let vectorMemories: any[] = [];

    try {
      const { searchMemories } = await import('@/lib/rag/store');
      vectorMemories = await searchMemories(this.config.id, message, 3, 0.65);
    } catch {}

    const contextBlocks = [];
    if (sqliteMemories.length > 0) {
      contextBlocks.push('[Mémoire structurée]');
      contextBlocks.push(...sqliteMemories.slice(0, 3).map(m => `[${m.type}] ${m.key}: ${m.value}`));
    }
    if (vectorMemories.length > 0) {
      contextBlocks.push('\n[Mémoire sémantique]');
      contextBlocks.push(...vectorMemories.map(m => `- ${m.content} (score: ${m.score?.toFixed(2)})`));
    }

    const prompt = this.buildPrompt(contextBlocks.join('\n'), message);
    const response = await this.callLLM(prompt);

    await memoryManager.extractMemories(this.config.id, message, response);

    try {
      const { storeMemory, analyzeEmotion } = await import('@/lib/rag/store');
      const fullExchange = `[User] ${message}\n[${this.config.name}] ${response}`;
      const { emotion } = analyzeEmotion(message);
      await storeMemory(this.config.id, fullExchange, { sessionId }, 3, 'mtm', emotion || undefined);
    } catch {}

    return response;
  }

  private buildPrompt(context: string, message: string): string {
    return [
      `Tu es ${this.config.name}, rôle : ${this.config.role}.`,
      this.config.tone ? `Ton : ${this.config.tone}` : '',
      this.config.systemPrompt,
      '',
      'Contexte mémoire :',
      context || 'Nouvel utilisateur, aucun contexte.',
      '',
      `Message : ${message}`,
      '',
      'Réponds de manière naturelle et engageante :',
    ]
      .filter(Boolean)
      .join('\n');
  }

  private async callLLM(prompt: string): Promise<string> {
    const { aiChat } = await import('@/lib/ai-provider');
    const response = await aiChat([
      { role: 'system', content: prompt },
    ], { model: this.config.model, temperature: this.config.temperature ?? 0.7 });
    return response;
  }
}
