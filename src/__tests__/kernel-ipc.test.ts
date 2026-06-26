import { describe, it, expect, beforeEach } from 'vitest';
import { KernelIPC } from '@/lib/kernel/ipc';
import type { KernelRequest } from '@/lib/kernel/types';

describe('KernelIPC', () => {
  let kernel: KernelIPC;

  beforeEach(() => {
    kernel = new KernelIPC();
  });

  it('registers and invokes a handler', async () => {
    kernel.register('test', 'echo', async (req: KernelRequest) => ({
      success: true,
      data: { message: req.params.msg },
    }));

    const result = await kernel.send({
      type: 'api',
      resource: 'test',
      action: 'echo',
      params: { msg: 'hello' },
    });

    expect(result.success).toBe(true);
    expect((result.data as any)?.message).toBe('hello');
    expect(result.metrics?.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('returns error for unknown handler', async () => {
    const result = await kernel.send({
      type: 'api',
      resource: 'nonexistent',
      action: 'unknown',
      params: {},
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('No handler');
  });

  it('tracks request statistics', async () => {
    kernel.register('stats', 'ping', async () => ({ success: true, data: 'pong' }));

    await kernel.send({ type: 'api', resource: 'stats', action: 'ping', params: {} });
    await kernel.send({ type: 'api', resource: 'stats', action: 'ping', params: {} });

    const stats = kernel.getStats();
    expect(stats.totalRequests).toBe(2);
    expect(stats.successfulRequests).toBe(2);
    expect(stats.averageDurationMs).toBeGreaterThan(0);
  });

  it('tracks failed requests in stats', async () => {
    await kernel.send({ type: 'api', resource: 'fail', action: 'nope', params: {} });

    const stats = kernel.getStats();
    expect(stats.totalRequests).toBe(1);
    expect(stats.failedRequests).toBe(1);
  });

  it('records events for each request', async () => {
    kernel.register('evt', 'go', async () => ({ success: true, data: 'done' }));

    await kernel.send({ type: 'api', resource: 'evt', action: 'go', userId: 'user-1', params: {} });

    const events = kernel.getEvents(10);
    expect(events.length).toBe(1);
    expect(events[0].resource).toBe('evt');
    expect(events[0].action).toBe('go');
    expect(events[0].userId).toBe('user-1');
    expect(events[0].success).toBe(true);
  });

  it('handles wildcard resource handler (*:action)', async () => {
    kernel.register('*', 'ping', async () => ({ success: true, data: 'wildcard-pong' }));

    const result = await kernel.send({
      type: 'api',
      resource: 'anything',
      action: 'ping',
      params: {},
    });

    expect(result.success).toBe(true);
    expect(result.data).toBe('wildcard-pong');
  });

  it('handles wildcard action handler (resource:*)', async () => {
    kernel.register('config', '*', async (req: KernelRequest) => ({
      success: true,
      data: { handled: req.action },
    }));

    const result = await kernel.send({
      type: 'api',
      resource: 'config',
      action: 'get',
      params: {},
    });

    expect(result.success).toBe(true);
    expect((result.data as any).handled).toBe('get');
  });

  it('handles generic actions via resource:*', async () => {
    kernel.register('generic', '*', async (req: KernelRequest) => ({
      success: true,
      data: `handled ${req.action}`,
    }));

    const r1 = await kernel.send({ type: 'api', resource: 'generic', action: 'create', params: {} });
    const r2 = await kernel.send({ type: 'api', resource: 'generic', action: 'delete', params: {} });

    expect(r1.data).toBe('handled create');
    expect(r2.data).toBe('handled delete');
  });

  it('captures handler errors gracefully', async () => {
    kernel.register('crash', 'boom', async () => {
      throw new Error('kaboom');
    });

    const result = await kernel.send({
      type: 'api',
      resource: 'crash',
      action: 'boom',
      params: {},
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('kaboom');
  });

  it('exposes registered handler keys', async () => {
    kernel.register('a', 'x', async () => ({ success: true, data: 'ok' }));
    kernel.register('b', 'y', async () => ({ success: true, data: 'ok' }));

    const handlers = kernel.registeredHandlers;
    expect(handlers).toContain('a:x');
    expect(handlers).toContain('b:y');
  });

  it('limits event storage to MAX_EVENTS', async () => {
    kernel.register('flood', 'fill', async () => ({ success: true, data: 'x' }));

    for (let i = 0; i < 1050; i++) {
      await kernel.send({ type: 'api', resource: 'flood', action: 'fill', params: {} });
    }

    const events = kernel.getEvents(2000);
    expect(events.length).toBeLessThanOrEqual(1000);
  });

  it('exposes uptime in stats', () => {
    const stats = kernel.getStats();
    expect(stats.uptime).toBeGreaterThanOrEqual(0);
  });

  it('passes request ID through the system', async () => {
    kernel.register('idtest', 'check', async (req: KernelRequest) => ({
      success: true,
      data: { incomingId: req.id },
    }));

    const result = await kernel.send({
      type: 'api',
      resource: 'idtest',
      action: 'check',
      params: {},
    });

    expect(result.success).toBe(true);
    expect((result.data as any)?.incomingId).toBeTruthy();
    expect(String((result.data as any)?.incomingId)).toMatch(/^krn-/);
  });

  it('emits kernel:request event on EventBus', async () => {
    const { eventBus } = await import('@/lib/bus/events');
    let captured: any = null;
    eventBus.on('kernel:request' as any, (p: any) => { captured = p; });

    kernel.register('evtbus', 'test', async () => ({ success: true, data: 'ok' }));
    await kernel.send({ type: 'api', resource: 'evtbus', action: 'test', params: {} });

    expect(captured).not.toBeNull();
    expect(captured.resource).toBe('evtbus');
    expect(captured.action).toBe('test');
  });
});
