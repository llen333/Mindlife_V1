import type { Module, ModuleResponse, MessageContext } from '../../src/lib/bus/types';
import { rateLimiter } from './ratelimit';
import { deadLetterQueue } from './queue';

export interface SandboxOptions {
  timeout?: number;
  rateLimit?: { maxRequests: number; windowMs: number };
  allowedIntents?: string[];
}

export class ModuleSandbox {
  private options: Map<string, SandboxOptions> = new Map();

  configure(moduleId: string, opts: SandboxOptions): void {
    this.options.set(moduleId, opts);
    if (opts.rateLimit) {
      rateLimiter.setLimit(
        `sandbox:${moduleId}`,
        opts.rateLimit.maxRequests,
        opts.rateLimit.windowMs,
      );
    }
  }

  getOptions(moduleId: string): SandboxOptions {
    return this.options.get(moduleId) || {};
  }

  async execute(
    module: Module,
    context: MessageContext,
    executor: () => Promise<ModuleResponse>,
  ): Promise<ModuleResponse> {
    const opts = this.options.get(module.id);

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

    try {
      if (opts?.timeout) {
        const result = await Promise.race([
          executor(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Module '${module.id}' timed out after ${opts.timeout}ms`)), opts.timeout)
          ),
        ]);
        return result;
      }
      return await executor();
    } catch (e: any) {
      await deadLetterQueue.enqueue({
        fromModule: module.id,
        toModule: null,
        messageType: 'execution_error',
        payload: JSON.stringify({ context }),
        error: e.message || String(e),
        maxRetries: 3,
      });

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
