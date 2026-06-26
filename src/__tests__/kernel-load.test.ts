import { describe, it, expect } from 'vitest';
import { KernelIPC } from '@/lib/kernel/ipc';
import type { KernelRequest } from '@/lib/kernel/types';

describe('KernelIPC — Load', () => {
  it('handles 100 concurrent requests with 0 failures', async () => {
    const kernel = new KernelIPC();
    kernel.register('load', 'echo', async (req: KernelRequest) => ({
      success: true,
      data: { seq: req.params.seq },
    }));

    const count = 100;
    const promises = Array.from({ length: count }, (_, i) =>
      kernel.send({ type: 'api', resource: 'load', action: 'echo', params: { seq: i } })
    );

    const results = await Promise.all(promises);
    const successes = results.filter(r => r.success);
    expect(successes.length).toBe(count);

    const stats = kernel.getStats();
    expect(stats.totalRequests).toBe(count);
    expect(stats.successfulRequests).toBe(count);
    expect(stats.averageDurationMs).toBeGreaterThan(0);
  });

  it('handles 1000 concurrent requests without crashing', async () => {
    const kernel = new KernelIPC();
    kernel.register('big', 'ping', async () => ({
      success: true,
      data: 'pong',
    }));

    const count = 1000;
    const promises = Array.from({ length: count }, () =>
      kernel.send({ type: 'api', resource: 'big', action: 'ping', params: {} })
    );

    const results = await Promise.all(promises);
    expect(results.filter(r => r.success).length).toBe(count);

    const stats = kernel.getStats();
    expect(stats.totalRequests).toBe(count);
    expect(stats.successfulRequests).toBe(count);
    expect(stats.failedRequests).toBe(0);
    expect(stats.eventsEmitted).toBe(count);
  });

  it('maintains event bus under 1000 concurrent emissions', async () => {
    const kernel = new KernelIPC();
    kernel.register('flood', 'emit', async () => ({ success: true, data: 'ok' }));

    const count = 1000;
    await Promise.all(
      Array.from({ length: count }, () =>
        kernel.send({ type: 'api', resource: 'flood', action: 'emit', params: {} })
      )
    );

    const events = kernel.getEvents(2000);
    expect(events.length).toBeLessThanOrEqual(1000);
    expect(events.length).toBe(count);
  });

  it('handles mixed success and failure under load', async () => {
    const kernel = new KernelIPC();
    kernel.register('mixed', 'maybe', async (req: KernelRequest) => {
      const seq = req.params.seq as number;
      if (seq % 3 === 0) throw new Error(`simulated-failure-${seq}`);
      return { success: true, data: `ok-${seq}` };
    });

    const count = 300;
    const promises = Array.from({ length: count }, (_, i) =>
      kernel.send({ type: 'api', resource: 'mixed', action: 'maybe', params: { seq: i } })
    );

    const results = await Promise.all(promises);
    const successes = results.filter(r => r.success);
    const failures = results.filter(r => !r.success);

    expect(successes.length).toBe(200);  // 2/3 succeed
    expect(failures.length).toBe(100);   // 1/3 fail

    const stats = kernel.getStats();
    expect(stats.totalRequests).toBe(count);
    expect(stats.successfulRequests).toBe(200);
    expect(stats.failedRequests).toBe(100);
  });
});
