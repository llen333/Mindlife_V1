import { EventBus, SystemEvents } from '@/lib/bus/events';
import { eventBus } from '@/lib/bus/events';
import { bus } from '@/lib/bus/orchestrator';
import { Module, MessageContext, ModuleResponse } from '@/lib/bus/types';

describe('EventBus', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  it('emits and receives events', async () => {
    const handler = vi.fn();
    eventBus.on('test:event', handler);
    await eventBus.emit('test:event', { data: 'hello' });
    expect(handler).toHaveBeenCalledWith({ data: 'hello' });
  });

  it('supports multiple handlers per event', async () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    eventBus.on('test:multi', h1);
    eventBus.on('test:multi', h2);
    await eventBus.emit('test:multi', { n: 42 });
    expect(h1).toHaveBeenCalledWith({ n: 42 });
    expect(h2).toHaveBeenCalledWith({ n: 42 });
  });

  it('supports unsubscribe via returned function', async () => {
    const handler = vi.fn();
    const off = eventBus.on('test:unsub', handler);
    off();
    await eventBus.emit('test:unsub', {});
    expect(handler).not.toHaveBeenCalled();
  });

  it('does nothing when emitting event with no listeners', async () => {
    await expect(eventBus.emit('nonexistent', {})).resolves.toBeUndefined();
  });

  it('handles async handlers', async () => {
    let resolved = false;
    eventBus.on('test:async', async () => {
      await new Promise((r) => setTimeout(r, 10));
      resolved = true;
    });
    await eventBus.emit('test:async', {});
    expect(resolved).toBe(true);
  });

  it('clears all listeners', async () => {
    const handler = vi.fn();
    eventBus.on('test:clear', handler);
    eventBus.clear();
    await eventBus.emit('test:clear', {});
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('EventBus - System integration', () => {
  beforeAll(async () => {
    await import('@/lib/modules');
  });

  it('emits MODULE_LOADED when a module registers', async () => {
    const handler = vi.fn();
    eventBus.on(SystemEvents.MODULE_LOADED, handler);

    const testModule: Module = {
      id: 'test-load',
      name: 'Test Load',
      canHandle: () => false,
      execute: async () => ({ success: true, content: '', moduleId: 'test-load' }),
      getTools: () => [],
      getSkills: () => [],
    };
    bus.register(testModule);

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ moduleId: 'test-load', name: 'Test Load' })
    );
  });

  it('emits MODULE_UNLOADED when a module unregisters', async () => {
    const handler = vi.fn();
    eventBus.on(SystemEvents.MODULE_UNLOADED, handler);

    bus.unregister('test-load');

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ moduleId: 'test-load' })
    );
  });

  it('emits MODULE_ERROR when a module throws', async () => {
    const handler = vi.fn();
    eventBus.on(SystemEvents.MODULE_ERROR, handler);

    const failingModule: Module = {
      id: 'test-fail',
      name: 'Test Fail',
      canHandle: (i: string) => i === 'fail',
      execute: async () => { throw new Error('oops'); },
      getTools: () => [],
      getSkills: () => [],
    };
    bus.register(failingModule);

    await bus.route({ message: '', history: [], intent: 'fail' });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ moduleId: 'test-fail', intent: 'fail', error: 'oops' })
    );

    bus.unregister('test-fail');
  });

  it('emits INTENT_DETECTED on route', async () => {
    const handler = vi.fn();
    eventBus.on(SystemEvents.INTENT_DETECTED, handler);

    await bus.route({ message: 'hello', history: [], intent: 'greeting' });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ intent: 'greeting' })
    );
  });
});
