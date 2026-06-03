import { describe, it, expect, beforeAll } from 'vitest';

const HAS_DB = (() => {
  try {
    return !!process.env.VECTOR_DATABASE_URL;
  } catch {
    return false;
  }
})();

describe
  .skipIf(!HAS_DB)
  ('RAG Vector Store', () => {
    let store: typeof import('@/lib/rag/store');

    beforeAll(async () => {
      const embeddings = await import('@/lib/rag/embeddings');
      embeddings.useMockEmbeddings();
      store = await import('@/lib/rag/store');
      // Clean up any leftover data from previous test runs
      try { await store.deleteMemories('test-agent'); } catch {}
      try { await store.deleteMemories('test-agent-batch'); } catch {}
    });

    it('stores and retrieves a memory', async () => {
      const id = await store.storeMemory('test-agent', 'Ceci est un test mémoire', { source: 'test' }, 5);
      expect(id).toBeTruthy();
      expect(id).toContain('vec-');

      const results = await store.searchMemories('test-agent', 'test mémoire', 5, 0.0);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].agentId).toBe('test-agent');
    });

    it('stores batch memories', async () => {
      const chunks = [
        { content: 'Premier chunk de test', index: 0, tokens: 5 },
        { content: 'Deuxième chunk de test', index: 1, tokens: 5 },
      ];
      const ids = await store.storeMemories('test-agent-batch', chunks, { batch: true });
      expect(ids).toHaveLength(2);
    });

    it('remembers nothing for unknown queries', async () => {
      const results = await store.searchMemories('unknown-agent', 'rien', 5, 0.0);
      expect(results).toEqual([]);
    });

    it('counts memories', async () => {
      const count = await store.getMemoryCount('test-agent');
      expect(count).toBeGreaterThanOrEqual(1);
    });

    it('deletes agent memories', async () => {
      await store.storeMemory('test-agent', 'À supprimer', {}, 1);
      const deleted = await store.deleteMemories('test-agent');
      expect(deleted).toBeGreaterThanOrEqual(1);

      const remaining = await store.getMemoryCount('test-agent');
      expect(remaining).toBe(0);
    });
  });

describe('RAG Store (no DB fallback)', () => {
  it('can import all RAG modules without error', async () => {
    const rag = await import('@/lib/rag');
    expect(rag.chunkText).toBeDefined();
    expect(rag.chunkConversation).toBeDefined();
    expect(rag.getEmbedding).toBeDefined();
    expect(rag.storeMemory).toBeDefined();
    expect(rag.searchMemories).toBeDefined();
  });

  it('chunks text correctly', async () => {
    const rag = await import('@/lib/rag');
    const text = 'Phrase une. Phrase deux. Phrase trois.';
    const chunks = rag.chunkText(text, { size: 1000, overlap: 0 });
    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe(text);
  });
});
