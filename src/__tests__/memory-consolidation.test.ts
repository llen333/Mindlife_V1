import { describe, it, expect, vi } from 'vitest';
import { memoryConsolidator, MemoryConsolidator } from '../../kernel/memory/consolidation';

const HAS_DB = (() => {
  try { return !!process.env.VECTOR_DATABASE_URL; } catch { return false; }
})();

describe('MemoryConsolidator — config & lifecycle', () => {
  it('should have default config', () => {
    const cons = new MemoryConsolidator();
    const config = cons.getConfig();
    expect(config.cycleIntervalMs).toBe(1800000);
    expect(config.stmPromotionThreshold).toBe(2);
    expect(config.mtmPromotionThreshold).toBe(4);
    expect(config.mtmDemotionThreshold).toBe(1);
    expect(config.ltmDemotionThreshold).toBe(0);
  });

  it('should accept partial config overrides', () => {
    const cons = new MemoryConsolidator({ stmPromotionThreshold: 3, cycleIntervalMs: 60000 });
    expect(cons.getConfig().stmPromotionThreshold).toBe(3);
    expect(cons.getConfig().cycleIntervalMs).toBe(60000);
    expect(cons.getConfig().mtmPromotionThreshold).toBe(4);
  });

  it('should update config at runtime', () => {
    const cons = new MemoryConsolidator();
    cons.updateConfig({ mtmPromotionThreshold: 5, vectorDecayDays: 14 });
    expect(cons.getConfig().mtmPromotionThreshold).toBe(5);
    expect(cons.getConfig().vectorDecayDays).toBe(14);
  });

  it('should return correct status when idle', () => {
    const cons = new MemoryConsolidator({ cycleIntervalMs: 60000 });
    const status = cons.getStatus();
    expect(status.running).toBe(false);
    expect(status.lastCycle).toBeNull();
    expect(status.config.cycleIntervalMs).toBe(60000);
    expect(status.nextScheduledMs).toBe(0);
  });

  it('should return non-zero nextScheduledMs when started', () => {
    const cons = new MemoryConsolidator({ cycleIntervalMs: 60000 });
    cons.start();
    const status = cons.getStatus();
    expect(status.nextScheduledMs).toBeGreaterThan(Date.now() - 1000);
    cons.stop();
  });

  it('should start and stop interval', () => {
    const cons = new MemoryConsolidator({ cycleIntervalMs: 60000 });
    cons.start();
    const statusRunning = cons.getStatus();
    expect(statusRunning.nextScheduledMs).toBeGreaterThan(0);
    cons.stop();
    const statusStopped = cons.getStatus();
    expect(statusStopped.nextScheduledMs).toBe(0);
  });

  it('should not start twice', () => {
    const cons = new MemoryConsolidator({ cycleIntervalMs: 60000 });
    cons.start();
    const id1 = (cons as any).intervalId;
    cons.start();
    const id2 = (cons as any).intervalId;
    expect(id1).toBe(id2);
    cons.stop();
  });

  it('should reject concurrent consolidate() calls', async () => {
    const cons = new MemoryConsolidator();
    (cons as any).running = true;
    await expect(cons.consolidate()).rejects.toThrow('already in progress');
    (cons as any).running = false;
  });

  it('singleton memoryConsolidator is defined', () => {
    expect(memoryConsolidator).toBeDefined();
    expect(memoryConsolidator.getConfig).toBeDefined();
    expect(memoryConsolidator.consolidate).toBeDefined();
  });
});

describe
  .skipIf(!HAS_DB)
  ('MemoryConsolidator — DB integration', () => {
    it('should run a consolidation cycle without error', async () => {
      const cons = new MemoryConsolidator();
      const cycle = await cons.consolidate();
      expect(cycle).toHaveProperty('ranAt');
      expect(cycle).toHaveProperty('durationMs');
      expect(cycle.vector).toHaveProperty('promotedStmToMtm');
      expect(cycle.vector).toHaveProperty('promotedMtmToLtm');
      expect(cycle.vector).toHaveProperty('demotedMtmToStm');
      expect(cycle.vector).toHaveProperty('demotedLtmToMtm');
      expect(cycle.vector).toHaveProperty('errors');
      expect(cycle.structured).toHaveProperty('promotedStmToMtm');
      expect(cycle.structured).toHaveProperty('errors');
      expect(cycle.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should run consolidation twice without error', async () => {
      const cons = new MemoryConsolidator();
      const cycle1 = await cons.consolidate();
      const cycle2 = await cons.consolidate();
      expect(cycle2.ranAt).toBeGreaterThan(cycle1.ranAt);
    });
  });
