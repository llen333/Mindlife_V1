import { storeMemory, searchMemories, deleteMemories, getMemoryCount } from './rag/store';
import type { MemoryLevel, VectorMemory } from './rag/store';

function collectionId(moduleId: string): string {
  return `module:${moduleId}`;
}

export class ModuleMemory {
  private moduleId: string;

  constructor(moduleId: string) {
    this.moduleId = moduleId;
  }

  get id(): string {
    return this.moduleId;
  }

  async remember(content: string, metadata?: Record<string, unknown>, importance = 3, memoryLevel: MemoryLevel = 'mtm', emotion?: string): Promise<string> {
    return storeMemory(
      collectionId(this.moduleId),
      content,
      { ...metadata, moduleId: this.moduleId },
      importance,
      memoryLevel,
      emotion,
    );
  }

  async recall(query: string, limit = 5, minScore = 0.0, level?: MemoryLevel): Promise<VectorMemory[]> {
    return searchMemories(collectionId(this.moduleId), query, limit, minScore, level);
  }

  async getContext(limit = 10): Promise<VectorMemory[]> {
    return searchMemories(collectionId(this.moduleId), '', limit, 0.0);
  }

  async getRecentContext(maxAgeHours = 24, limit = 20): Promise<VectorMemory[]> {
    const all = await searchMemories(collectionId(this.moduleId), '', limit, 0.0);
    const cutoff = Date.now() - maxAgeHours * 60 * 60 * 1000;
    return all.filter((m) => new Date(m.createdAt).getTime() > cutoff);
  }

  async getImportantMemories(threshold = 4, limit = 10): Promise<VectorMemory[]> {
    const all = await this.getContext(limit * 3);
    return all.filter((m) => m.importance >= threshold).slice(0, limit);
  }

  async forget(): Promise<number> {
    return deleteMemories(collectionId(this.moduleId));
  }

  async count(): Promise<number> {
    return getMemoryCount(collectionId(this.moduleId));
  }
}

const memories = new Map<string, ModuleMemory>();

export function getModuleMemory(moduleId: string): ModuleMemory {
  if (!memories.has(moduleId)) {
    memories.set(moduleId, new ModuleMemory(moduleId));
  }
  return memories.get(moduleId)!;
}

export function formatContextForPrompt(memories: VectorMemory[], maxTokens = 2000): string {
  let context = '';
  for (const m of memories) {
    const entry = `[${m.memoryLevel.toUpperCase()}][${new Date(m.createdAt).toLocaleString('fr-FR')}] ${m.content}`;
    if ((context.length + entry.length) > maxTokens) break;
    context += entry + '\n';
  }
  return context.trim();
}
