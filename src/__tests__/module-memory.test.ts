import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { useMockEmbeddings } from '@/lib/rag';

const HAS_DB = (() => {
  try { return !!process.env.VECTOR_DATABASE_URL; } catch { return false; }
})();

describe
  .skipIf(!HAS_DB)
  ('ModuleMemory', () => {
    let ModuleMemory: typeof import('@/lib/module-memory');
    let moduleMemory: InstanceType<typeof import('@/lib/module-memory')['ModuleMemory']>;

    beforeAll(async () => {
      useMockEmbeddings();
      ModuleMemory = await import('@/lib/module-memory');
      moduleMemory = new ModuleMemory.ModuleMemory('test-nutrition');

      await moduleMemory.forget();
    });

    afterAll(async () => {
      await moduleMemory.forget();
    });

    it('stores a memory with collection namespace', async () => {
      const id = await moduleMemory.remember('L\'utilisateur préfère les repas protéinés', { source: 'conversation' }, 4);
      expect(id).toBeTruthy();
      expect(id).toContain('vec-');
    });

    it('recalls memories by query', async () => {
      await moduleMemory.remember('Les légumes verts sont recommandés', { source: 'conseil' }, 3);

      const results = await moduleMemory.recall('protéines', 5, 0.0);
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results.some(r => r.content.includes('protéin'))).toBe(true);
    });

    it('returns typed context memories', async () => {
      const context = await moduleMemory.getContext(5);
      expect(Array.isArray(context)).toBe(true);
      expect(context.length).toBeGreaterThanOrEqual(1);
      expect(context[0].agentId).toBe('module:test-nutrition');
    });

    it('getImportantMemories filters by importance', async () => {
      await moduleMemory.remember('Ceci est très important', {}, 5);
      await moduleMemory.remember('Ceci est moins important', {}, 1);

      const important = await moduleMemory.getImportantMemories(4, 10);
      expect(important.every(m => m.importance >= 4)).toBe(true);
    });

    it('forgets all memories for module', async () => {
      await moduleMemory.remember('À oublier', {}, 1);
      const before = await moduleMemory.count();
      expect(before).toBeGreaterThan(0);

      const deleted = await moduleMemory.forget();
      expect(deleted).toBeGreaterThanOrEqual(1);

      const after = await moduleMemory.count();
      expect(after).toBe(0);
    });

    it('getModuleMemory returns singleton per module', async () => {
      const mem1 = ModuleMemory.getModuleMemory('test-singleton');
      const mem2 = ModuleMemory.getModuleMemory('test-singleton');
      const mem3 = ModuleMemory.getModuleMemory('test-other');

      expect(mem1).toBe(mem2);
      expect(mem1).not.toBe(mem3);
    });

    it('formatContextForPrompt produces formatted string', async () => {
      const mems = await moduleMemory.recall('protéines', 2, 0.0);
      const formatted = ModuleMemory.formatContextForPrompt(mems);

      expect(typeof formatted).toBe('string');
      if (mems.length > 0) {
        expect(formatted).toContain('[MTM]');
      }
    });
  });

describe('ModuleMemory (no DB fallback)', () => {
  it('can import ModuleMemory without error', async () => {
    const mod = await import('@/lib/module-memory');
    expect(mod.ModuleMemory).toBeDefined();
    expect(mod.getModuleMemory).toBeDefined();
    expect(mod.formatContextForPrompt).toBeDefined();
  });

  it('ModuleMemory constructor sets id correctly', async () => {
    const mod = await import('@/lib/module-memory');
    const mem = new mod.ModuleMemory('test-id');
    expect(mem.id).toBe('test-id');
  });
});
