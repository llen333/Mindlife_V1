export interface SandboxOptions {
  timeout?: number;
  rateLimit?: { maxRequests: number; windowMs: number };
  allowedIntents?: string[];
  maxMemoryMb?: number;
  executionBudget?: number;
  executionWindowMs?: number;
  allowedPaths?: string[];
  allowNetwork?: boolean;
  allowWorker?: boolean;
}

export interface MemorySample {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  timestamp: number;
}

export interface ExecutionBudgetState {
  used: number;
  windowStart: number;
}

export interface SandboxStatus {
  moduleId: string;
  options: SandboxOptions;
  memory: MemorySample;
  executionBudget: { used: number; remaining: number; windowStart: number };
  workerActive: boolean;
}
