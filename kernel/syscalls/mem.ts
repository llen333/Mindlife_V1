import {
  storeMemory,
  searchMemories,
  deleteMemories,
  getMemoryCount,
  promoteMemory,
  type VectorMemory,
  type MemoryLevel,
} from '../../src/lib/rag';

export const sysMem = {
  async store(params: {
    agentId: string;
    content: string;
    metadata?: Record<string, unknown>;
    importance?: number;
    memoryLevel?: MemoryLevel;
    emotion?: string;
  }): Promise<string> {
    return storeMemory(
      params.agentId,
      params.content,
      params.metadata || {},
      params.importance ?? 3,
      params.memoryLevel || 'mtm',
      params.emotion,
    );
  },

  async search(params: {
    agentId: string;
    query: string;
    limit?: number;
    minScore?: number;
    level?: MemoryLevel;
  }): Promise<VectorMemory[]> {
    return searchMemories(
      params.agentId,
      params.query,
      params.limit ?? 5,
      params.minScore ?? 0.0,
      params.level,
    );
  },

  async delete(params: { agentId: string }): Promise<number> {
    return deleteMemories(params.agentId);
  },

  async count(params: { agentId?: string }): Promise<number> {
    return getMemoryCount(params.agentId);
  },

  async promote(params: { memoryId: string; newLevel: MemoryLevel }): Promise<boolean> {
    return promoteMemory(params.memoryId, params.newLevel);
  },
};
