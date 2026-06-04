import { normalize, resolve } from 'path';
import type { Module, ModuleResponse, MessageContext } from '../../src/lib/bus/types';
import { rateLimiter } from './ratelimit';
import { deadLetterQueue } from './queue';
import type { SandboxOptions, MemorySample, ExecutionBudgetState, SandboxStatus } from './types';

const MEMORY_SAMPLE_INTERVAL = 30000;

export class ModuleSandbox {
  private options: Map<string, SandboxOptions> = new Map();
  private memorySamples: Map<string, MemorySample> = new Map();
  private executionBudgets: Map<string, ExecutionBudgetState> = new Map();
  private memoryIntervalId: ReturnType<typeof setInterval> | null = null;
  private bannedModules: Set<string> = new Set();

  configure(moduleId: string, opts: SandboxOptions): void {
    this.options.set(moduleId, opts);
    if (opts.rateLimit) {
      rateLimiter.setLimit(
        `sandbox:${moduleId}`,
        opts.rateLimit.maxRequests,
        opts.rateLimit.windowMs,
      );
    }
    if (opts.executionBudget && !opts.executionWindowMs) {
      opts.executionWindowMs = 60000;
    }
  }

  getOptions(moduleId: string): SandboxOptions {
    return this.options.get(moduleId) || {};
  }

  getStatus(moduleId: string): SandboxStatus | null {
    const opts = this.options.get(moduleId);
    if (!opts) return null;
    const mem = this.memorySamples.get(moduleId);
    const budget = this.executionBudgets.get(moduleId);
    return {
      moduleId,
      options: opts,
      memory: mem || { rss: 0, heapTotal: 0, heapUsed: 0, timestamp: 0 },
      executionBudget: {
        used: budget?.used ?? 0,
        remaining: (opts.executionBudget ?? Infinity) - (budget?.used ?? 0),
        windowStart: budget?.windowStart ?? Date.now(),
      },
      workerActive: opts.allowWorker ?? false,
    };
  }

  getAllStatus(): SandboxStatus[] {
    const result: SandboxStatus[] = [];
    for (const moduleId of this.options.keys()) {
      const status = this.getStatus(moduleId);
      if (status) result.push(status);
    }
    return result;
  }

  ban(moduleId: string): void {
    this.bannedModules.add(moduleId);
  }

  unban(moduleId: string): void {
    this.bannedModules.delete(moduleId);
  }

  isBanned(moduleId: string): boolean {
    return this.bannedModules.has(moduleId);
  }

  checkPath(moduleId: string, targetPath: string): { allowed: boolean; reason?: string } {
    const opts = this.options.get(moduleId);
    if (!opts?.allowedPaths || opts.allowedPaths.length === 0) {
      return { allowed: true };
    }
    const resolved = resolve(normalize(targetPath));
    for (const allowed of opts.allowedPaths) {
      const allowedResolved = resolve(normalize(allowed));
      if (resolved.startsWith(allowedResolved)) {
        return { allowed: true };
      }
    }
    return { allowed: false, reason: `Path '${targetPath}' not in allowed paths for module '${moduleId}'` };
  }

  startMemorySampling(): void {
    if (this.memoryIntervalId) return;
    this.memoryIntervalId = setInterval(() => {
      const mem = process.memoryUsage();
      const sample: MemorySample = {
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
        timestamp: Date.now(),
      };
      for (const moduleId of this.options.keys()) {
        this.memorySamples.set(moduleId, sample);
        const opts = this.options.get(moduleId);
        if (opts?.maxMemoryMb && mem.rss > opts.maxMemoryMb * 1024 * 1024) {
          this.ban(moduleId);
        }
      }
    }, MEMORY_SAMPLE_INTERVAL);
  }

  stopMemorySampling(): void {
    if (this.memoryIntervalId) {
      clearInterval(this.memoryIntervalId);
      this.memoryIntervalId = null;
    }
  }

  private checkExecutionBudget(moduleId: string): boolean {
    const opts = this.options.get(moduleId);
    if (!opts?.executionBudget) return true;
    const now = Date.now();
    let budget = this.executionBudgets.get(moduleId);
    if (!budget || now - budget.windowStart > (opts.executionWindowMs ?? 60000)) {
      budget = { used: 0, windowStart: now };
      this.executionBudgets.set(moduleId, budget);
    }
    return budget.used < opts.executionBudget;
  }

  private recordExecutionTime(moduleId: string, durationMs: number): void {
    const opts = this.options.get(moduleId);
    if (!opts?.executionBudget) return;
    let budget = this.executionBudgets.get(moduleId);
    const now = Date.now();
    if (!budget || now - budget.windowStart > (opts.executionWindowMs ?? 60000)) {
      budget = { used: 0, windowStart: now };
    }
    budget.used += durationMs;
    this.executionBudgets.set(moduleId, budget);
  }

  async execute(
    module: Module,
    context: MessageContext,
    executor: () => Promise<ModuleResponse>,
  ): Promise<ModuleResponse> {
    if (this.bannedModules.has(module.id)) {
      return {
        success: false,
        content: `Module '${module.id}' is banned — memory limit exceeded`,
        moduleId: module.id,
        error: `Module '${module.id}' is banned`,
      };
    }

    const opts = this.options.get(module.id);
    const startTime = Date.now();

    if (opts?.allowedIntents && context.intent) {
      const allowed = opts.allowedIntents.some((i) => context.intent?.toLowerCase().includes(i));
      if (!allowed) {
        return {
          success: false,
          content: `Module '${module.id}' n'a pas le droit de traiter l'intention: ${context.intent}`,
          moduleId: module.id,
          error: `Intent '${context.intent}' not in allowed list for module '${module.id}'`,
        };
      }
    }

    if (opts?.rateLimit) {
      const check = rateLimiter.check(`sandbox:${module.id}`);
      if (!check.allowed) {
        const err = `Module '${module.id}' rate limit exceeded. Retry after ${Math.ceil((check.resetAt - Date.now()) / 1000)}s`;
        await deadLetterQueue.enqueue({
          fromModule: module.id,
          toModule: null,
          messageType: 'rate_limited',
          payload: JSON.stringify({ context }),
          error: err,
          maxRetries: 0,
        });
        return {
          success: false,
          content: err,
          moduleId: module.id,
          error: err,
        };
      }
    }

    if (!this.checkExecutionBudget(module.id)) {
      const err = `Module '${module.id}' execution budget exceeded for current window`;
      return {
        success: false,
        content: err,
        moduleId: module.id,
        error: err,
      };
    }

    if (opts?.allowNetwork === false && context.intent === 'network') {
      const err = `Module '${module.id}' has network access disabled`;
      return {
        success: false,
        content: err,
        moduleId: module.id,
        error: err,
      };
    }

    try {
      let result: ModuleResponse;
      if (opts?.timeout) {
        result = await Promise.race([
          executor(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Module '${module.id}' timed out after ${opts.timeout}ms`)), opts.timeout)
          ),
        ]);
      } else {
        result = await executor();
      }
      this.recordExecutionTime(module.id, Date.now() - startTime);
      return result;
    } catch (e: any) {
      const duration = Date.now() - startTime;
      this.recordExecutionTime(module.id, duration);
      await deadLetterQueue.enqueue({
        fromModule: module.id,
        toModule: null,
        messageType: 'execution_error',
        payload: JSON.stringify({ context }),
        error: e.message || String(e),
        maxRetries: 3,
      });
      const memSample = this.memorySamples.get(module.id);
      if (memSample && opts?.maxMemoryMb && memSample.rss > opts.maxMemoryMb * 1024 * 1024) {
        this.ban(module.id);
      }
      return {
        success: false,
        content: `Erreur dans le module '${module.id}': ${e.message}`,
        moduleId: module.id,
        error: e.message,
      };
    }
  }
}

export const moduleSandbox = new ModuleSandbox();
