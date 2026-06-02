import { EventBus, SystemEvents } from '@/lib/bus/events';
import { eventBus } from '@/lib/bus/events';
import { bus } from '@/lib/bus/orchestrator';
import { registry } from '@/lib/bus/registry';
import { moduleLoader } from '@/lib/bus/loader';
import { permissionManager, PermissionManager } from '@/lib/bus/permissions';
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

describe('ModuleRegistry', () => {
  it('registers and retrieves manifests', () => {
    registry.register({ id: 'test-reg', name: 'Test Reg', version: '1.0.0' });
    const manifest = registry.getManifest('test-reg');
    expect(manifest).toBeDefined();
    expect(manifest!.version).toBe('1.0.0');
    registry.unregister('test-reg');
  });

  it('returns undefined for unknown modules', () => {
    expect(registry.getManifest('nonexistent')).toBeUndefined();
  });

  it('unregisters manifests', () => {
    registry.register({ id: 'test-unreg', name: 'Test Unreg', version: '1.0.0' });
    expect(registry.getManifest('test-unreg')).toBeDefined();
    registry.unregister('test-unreg');
    expect(registry.getManifest('test-unreg')).toBeUndefined();
  });

  it('lists all manifests including nutrition', () => {
    const all = registry.getAllManifests();
    const nutrition = all.find((m) => m.id === 'nutrition');
    expect(nutrition).toBeDefined();
    expect(nutrition!.version).toBe('1.0.0');
  });

  it('detects missing dependencies', () => {
    registry.register({ id: 'dep-mod', name: 'Dep Mod', version: '1.0.0', dependencies: { missing: '^1.0.0' } });
    const missing = registry.getMissingDependencies('dep-mod');
    expect(missing).toEqual(['missing']);
    registry.unregister('dep-mod');
  });

  it('installed modules = intersection of bus + registry', () => {
    const installed = registry.getInstalledModules();
    expect(installed.length).toBeGreaterThanOrEqual(5);
    expect(installed.some((m) => m.id === 'nutrition')).toBe(true);
  });
});

describe('ModuleLoader', () => {
  it('registers and unloads a module with lifecycle hooks', async () => {
    const onLoad = vi.fn();
    const onUnload = vi.fn();
    const testModule: Module = {
      id: 'loader-test',
      name: 'Loader Test',
      canHandle: () => false,
      execute: async () => ({ success: true, content: '', moduleId: 'loader-test' }),
      getTools: () => [],
      getSkills: () => [],
      onLoad,
      onUnload,
    };

    await moduleLoader.register(testModule, { id: 'loader-test', name: 'Loader Test', version: '1.0.0' });
    expect(onLoad).toHaveBeenCalledOnce();
    expect(bus.getModule('loader-test')).toBeDefined();
    expect(registry.getManifest('loader-test')).toBeDefined();

    // Duplicate register is idempotent
    await moduleLoader.register(testModule, { id: 'loader-test', name: 'Loader Test', version: '1.0.0' });
    expect(onLoad).toHaveBeenCalledOnce();

    const unloaded = await moduleLoader.unload('loader-test');
    expect(unloaded).toBe(true);
    expect(onUnload).toHaveBeenCalledOnce();
    expect(bus.getModule('loader-test')).toBeUndefined();
    expect(registry.getManifest('loader-test')).toBeUndefined();
  });

  it('returns false unloading unknown module', async () => {
    expect(await moduleLoader.unload('nonexistent')).toBe(false);
  });

  it('tracks loaded state', async () => {
    const m: Module = {
      id: 'loaded-check',
      name: 'Loaded Check',
      canHandle: () => false,
      execute: async () => ({ success: true, content: '', moduleId: 'loaded-check' }),
      getTools: () => [],
      getSkills: () => [],
    };
    expect(moduleLoader.isLoaded('loaded-check')).toBe(false);
    await moduleLoader.register(m, { id: 'loaded-check', name: 'Loaded Check', version: '1.0.0' });
    expect(moduleLoader.isLoaded('loaded-check')).toBe(true);
    await moduleLoader.unload('loaded-check');
    expect(moduleLoader.isLoaded('loaded-check')).toBe(false);
  });
});

describe('PermissionManager', () => {
  it('grants permissions to assistant role', () => {
    const result = permissionManager.check('assistant', 'meals:read');
    expect(result.granted).toBe(true);
  });

  it('denies missing permissions', () => {
    const result = permissionManager.check('coach', 'meals:write');
    expect(result.granted).toBe(false);
  });

  it('grants all when no role provided', () => {
    const result = permissionManager.check(undefined, 'anything:whatever');
    expect(result.granted).toBe(true);
  });

  it('checks multiple permissions', () => {
    const result = permissionManager.checkModulePermissions('nutrition', ['meals:read', 'data:read']);
    expect(result.granted).toBe(true);

    const denied = permissionManager.checkModulePermissions('coach', ['meals:write', 'workouts:write']);
    expect(denied.granted).toBe(false);
  });

  it('dynamically grants and revokes permissions', () => {
    permissionManager.grant('coach', 'meals:admin');
    expect(permissionManager.check('coach', 'meals:admin').granted).toBe(true);
    permissionManager.revoke('coach', 'meals:admin');
    expect(permissionManager.check('coach', 'meals:admin').granted).toBe(false);
  });

  it('returns permissions for a role', () => {
    const perms = permissionManager.getPermissions('oracle');
    expect(perms).toContain('web:search');
    expect(perms).toContain('data:read');
  });

  it('returns empty array for unknown role', () => {
    expect(permissionManager.getPermissions('unknown')).toEqual([]);
  });

  it('supports custom constructor permissions', () => {
    const custom = new PermissionManager({ custom_role: ['custom:perm'] });
    expect(custom.check('custom_role', 'custom:perm').granted).toBe(true);
    expect(custom.check('custom_role', 'other:perm').granted).toBe(false);
  });
});
