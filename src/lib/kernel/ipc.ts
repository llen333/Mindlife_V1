import { KernelRequest, KernelResponse, KernelStats, KernelEvent } from './types';
import { eventBus, SystemEvents } from '@/lib/bus/events';
import { permissionManager } from '@/lib/bus/permissions';
import type { PermissionString } from '@/lib/bus/permissions';

const MAX_EVENTS = 1000;

function generateId(): string {
  return `krn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class KernelIPC {
  private handlers = new Map<string, (req: KernelRequest) => Promise<KernelResponse>>();
  private events: KernelEvent[] = [];
  private startTime = Date.now();
  private stats: KernelStats = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageDurationMs: 0,
    uptime: 0,
    eventsEmitted: 0,
  };

  register(resource: string, action: string, handler: (req: KernelRequest) => Promise<KernelResponse>): void {
    const key = `${resource}:${action}`;
    this.handlers.set(key, handler);
  }

  async send(request: Omit<KernelRequest, 'id' | 'timestamp'>): Promise<KernelResponse> {
    const start = performance.now();
    const id = generateId();
    const { resource, action } = request;
    const fullRequest: KernelRequest = { ...request, id, timestamp: Date.now() };

    this.stats.totalRequests++;

    try {
      const handlerKey = `${resource}:${action}`;
      const genericKey = `${resource}:*`;
      const wildcardKey = `*:${action}`;

      const handler = this.handlers.get(handlerKey)
        || this.handlers.get(genericKey)
        || this.handlers.get(wildcardKey);

      if (request.params.__permission as string) {
        const allowed = permissionManager.check(
          request.params.__role as string | undefined,
          request.params.__permission as PermissionString
        );
        if (!allowed.granted) {
          return {
            success: false,
            error: allowed.reason || 'Permission denied',
            metrics: { durationMs: performance.now() - start, resource, action },
          };
        }
      }

      const result = handler
        ? await handler(fullRequest)
        : { success: false, error: `No handler for ${resource}:${action}` };

      if (result.success) {
        this.stats.successfulRequests++;
      } else {
        this.stats.failedRequests++;
      }

      const durationMs = performance.now() - start;
      this.stats.averageDurationMs = (
        (this.stats.averageDurationMs * (this.stats.totalRequests - 1)) + durationMs
      ) / this.stats.totalRequests;

      const kernelEvent: KernelEvent = {
        type: 'kernel:request',
        resource,
        action,
        userId: request.userId,
        durationMs,
        success: result.success,
        error: result.error,
        timestamp: Date.now(),
      };
      this.recordEvent(kernelEvent);
      eventBus.emit('kernel:request' as any, kernelEvent as any);

      return { ...result, metrics: { durationMs, resource, action } };
    } catch (error: any) {
      this.stats.failedRequests++;
      return {
        success: false,
        error: error.message || 'Internal kernel error',
        metrics: { durationMs: performance.now() - start, resource, action },
      };
    }
  }

  private recordEvent(event: KernelEvent): void {
    this.events.push(event);
    if (this.events.length > MAX_EVENTS) this.events.shift();
    this.stats.eventsEmitted++;
  }

  getEvents(limit = 50): KernelEvent[] {
    return this.events.slice(-limit);
  }

  getStats(): KernelStats {
    return { ...this.stats, uptime: Date.now() - this.startTime };
  }

  get registeredHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export const kernel = new KernelIPC();
