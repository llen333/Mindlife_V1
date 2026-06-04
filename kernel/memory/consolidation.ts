import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import {
  decayMemories,
  getMemoryCount,
  promoteMemory,
  type MemoryLevel,
} from '../../src/lib/rag';
import type {
  ConsolidationConfig,
  ConsolidationCycle,
  ConsolidationResult,
  ConsolidationStatus,
} from './types';

const DEFAULT_CONFIG: ConsolidationConfig = {
  cycleIntervalMs: 30 * 60 * 1000,
  stmPromotionThreshold: 2,
  mtmPromotionThreshold: 4,
  mtmDemotionThreshold: 1,
  ltmDemotionThreshold: 0,
  vectorDecayDays: 7,
  structuredDecayDays: 7,
};

const pool = new Pool({
  connectionString: process.env.VECTOR_DATABASE_URL || 'postgresql://llen@localhost:5432/mindlife',
});

const prisma = new PrismaClient();

export class MemoryConsolidator {
  private config: ConsolidationConfig;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private lastCycle: ConsolidationCycle | null = null;

  constructor(config?: Partial<ConsolidationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  updateConfig(partial: Partial<ConsolidationConfig>): void {
    this.config = { ...this.config, ...partial };
    if (this.intervalId) {
      this.stop();
      this.start();
    }
  }

  getConfig(): ConsolidationConfig {
    return { ...this.config };
  }

  getStatus(): ConsolidationStatus {
    return {
      running: this.running,
      lastCycle: this.lastCycle,
      config: this.config,
      totalMemory: 0,
      nextScheduledMs: this.intervalId
        ? Date.now() + this.config.cycleIntervalMs
        : 0,
    };
  }

  start(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.consolidate().catch((e) =>
        console.error('[CONSOLIDATOR] Cycle error:', e)
      );
    }, this.config.cycleIntervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async consolidate(): Promise<ConsolidationCycle> {
    if (this.running) {
      throw new Error('Consolidation cycle already in progress');
    }
    this.running = true;
    const startTime = Date.now();
    const vector = await this.consolidateVectorMemories();
    const structured = await this.consolidateStructuredMemories();
    const cycle: ConsolidationCycle = {
      ranAt: startTime,
      durationMs: Date.now() - startTime,
      vector,
      structured,
    };
    this.lastCycle = cycle;
    this.running = false;
    return cycle;
  }

  private async consolidateVectorMemories(): Promise<ConsolidationResult> {
    const result: ConsolidationResult = {
      promotedStmToMtm: 0,
      promotedMtmToLtm: 0,
      demotedMtmToStm: 0,
      demotedLtmToMtm: 0,
      archived: 0,
      errors: 0,
    };
    try {
      const stmPromoted = await pool.query(
        `UPDATE vector_memories
         SET memory_level = 'mtm', importance = LEAST(importance + 1, 5)
         WHERE memory_level = 'stm'
           AND importance >= $1
           AND created_at < NOW() - INTERVAL '1 hour'`,
        [this.config.stmPromotionThreshold]
      );
      result.promotedStmToMtm = stmPromoted.rowCount ?? 0;

      const mtmPromoted = await pool.query(
        `UPDATE vector_memories
         SET memory_level = 'ltm', importance = LEAST(importance + 1, 5)
         WHERE memory_level = 'mtm'
           AND importance >= $1`,
        [this.config.mtmPromotionThreshold]
      );
      result.promotedMtmToLtm = mtmPromoted.rowCount ?? 0;

      const mtmDemoted = await pool.query(
        `UPDATE vector_memories
         SET memory_level = 'stm', importance = GREATEST(importance - 1, 0)
         WHERE memory_level = 'mtm'
           AND importance <= $1
           AND created_at < NOW() - INTERVAL '3 days'`,
        [this.config.mtmDemotionThreshold]
      );
      result.demotedMtmToStm = mtmDemoted.rowCount ?? 0;

      const ltmDemoted = await pool.query(
        `UPDATE vector_memories
         SET memory_level = 'mtm', importance = GREATEST(importance - 1, 0)
         WHERE memory_level = 'ltm'
           AND importance <= $1
           AND created_at < NOW() - INTERVAL '14 days'`,
        [this.config.ltmDemotionThreshold]
      );
      result.demotedLtmToMtm = ltmDemoted.rowCount ?? 0;

      const decayed = await decayMemories(undefined, this.config.vectorDecayDays);
      result.archived = decayed;
    } catch (e) {
      console.error('[CONSOLIDATOR] Vector consolidation error:', e);
      result.errors = 1;
    }
    return result;
  }

  private async consolidateStructuredMemories(): Promise<ConsolidationResult> {
    const result: ConsolidationResult = {
      promotedStmToMtm: 0,
      promotedMtmToLtm: 0,
      demotedMtmToStm: 0,
      demotedLtmToMtm: 0,
      archived: 0,
      errors: 0,
    };
    try {
      const stmPromoted = await prisma.agentMemory.updateMany({
        where: {
          memoryLevel: 'stm',
          importance: { gte: this.config.stmPromotionThreshold },
          createdAt: { lt: new Date(Date.now() - 3600000) },
        },
        data: {
          memoryLevel: 'mtm',
          importance: { increment: 1 },
        },
      });
      result.promotedStmToMtm = stmPromoted.count;

      const mtmPromoted = await prisma.agentMemory.updateMany({
        where: {
          memoryLevel: 'mtm',
          importance: { gte: this.config.mtmPromotionThreshold },
        },
        data: {
          memoryLevel: 'ltm',
          importance: { increment: 1 },
        },
      });
      result.promotedMtmToLtm = mtmPromoted.count;

      const mtmDemoted = await prisma.agentMemory.updateMany({
        where: {
          memoryLevel: 'mtm',
          importance: { lte: this.config.mtmDemotionThreshold },
          createdAt: { lt: new Date(Date.now() - 259200000) },
        },
        data: {
          memoryLevel: 'stm',
          importance: { decrement: 1 },
        },
      });
      result.demotedMtmToStm = mtmDemoted.count;

      const ltmDemoted = await prisma.agentMemory.updateMany({
        where: {
          memoryLevel: 'ltm',
          importance: { lte: this.config.ltmDemotionThreshold },
          createdAt: { lt: new Date(Date.now() - 1209600000) },
        },
        data: {
          memoryLevel: 'mtm',
          importance: { decrement: 1 },
        },
      });
      result.demotedLtmToMtm = ltmDemoted.count;

      const archived = await prisma.agentMemory.updateMany({
        where: {
          memoryLevel: 'stm',
          importance: { lte: 0 },
          updatedAt: { lt: new Date(Date.now() - this.config.structuredDecayDays * 86400000) },
        },
        data: { isArchived: true },
      });
      result.archived = archived.count;
    } catch (e) {
      console.error('[CONSOLIDATOR] Structured consolidation error:', e);
      result.errors = 1;
    }
    return result;
  }
}

export const memoryConsolidator = new MemoryConsolidator();
