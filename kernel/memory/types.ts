export type MemoryLevel = 'stm' | 'mtm' | 'ltm';

export interface ConsolidationConfig {
  cycleIntervalMs: number;
  stmPromotionThreshold: number;
  mtmPromotionThreshold: number;
  mtmDemotionThreshold: number;
  ltmDemotionThreshold: number;
  vectorDecayDays: number;
  structuredDecayDays: number;
}

export interface ConsolidationCycle {
  ranAt: number;
  durationMs: number;
  vector: ConsolidationResult;
  structured: ConsolidationResult;
}

export interface ConsolidationResult {
  promotedStmToMtm: number;
  promotedMtmToLtm: number;
  demotedMtmToStm: number;
  demotedLtmToMtm: number;
  archived: number;
  errors: number;
}

export interface ConsolidationStatus {
  running: boolean;
  lastCycle: ConsolidationCycle | null;
  config: ConsolidationConfig;
  totalMemory: number;
  nextScheduledMs: number;
}
