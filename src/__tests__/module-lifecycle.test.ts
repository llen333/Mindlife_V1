import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Module, ModuleManifest, MessageContext, ModuleResponse, ToolDefinition, SkillDefinition } from '@/lib/bus/types';
import { bus } from '@/lib/bus/orchestrator';
import { registry } from '@/lib/bus/registry';
import { moduleLoader } from '@/lib/bus/loader';
import { eventBus, SystemEvents } from '@/lib/bus/events';

class TestModule implements Module {
  id: string;
  name: string;
  loaded = false;
  unloaded = false;
  upgraded = false;
  newVersion = '';

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  canHandle(_intent: string): boolean {
    return false;
  }

  async execute(_context: MessageContext): Promise<ModuleResponse> {
    return { success: true, content: `${this.id} executed`, moduleId: this.id };
  }

  getTools(): ToolDefinition[] {
    return [{ name: `${this.id}_tool`, description: `${this.id} tool`, parameters: {}, execute: async () => `${this.id} tool ok` }];
  }

  getSkills(): SkillDefinition[] {
    return [{ id: `${this.id}_skill`, name: `${this.id} Skill`, description: `${this.id} skill` }];
  }

  async onLoad() { this.loaded = true; }
  async onUnload() { this.unloaded = true; }
  async onUpgrade(newVersion: string) { this.upgraded = true; this.newVersion = newVersion; }
}

function makeManifest(id: string, deps?: Record<string, string>): ModuleManifest {
  return { id, name: `Module ${id}`, version: '1.0.0', entry: './index.ts', dependencies: deps, permissions: [`${id}:read`] };
}

describe('Module Lifecycle', () => {
  beforeEach(() => {
    bus.clearAll();
    registry.unregister;
    (registry as any).manifests.clear();
    moduleLoader.unload;
  });

  afterEach(() => {
    bus.clearAll();
  });

  it('installs a module via loader', async () => {
    const mod = new TestModule('test-a', 'Module A');
    const manifest = makeManifest('test-a');

    await moduleLoader.register(mod, manifest);

    expect(moduleLoader.isLoaded('test-a')).toBe(true);
    expect(bus.getModule('test-a')).toBe(mod);
    expect(registry.getManifest('test-a')).toEqual(manifest);
    expect(mod.loaded).toBe(true);
  });

  it('unloads a module via loader', async () => {
    const mod = new TestModule('test-b', 'Module B');
    await moduleLoader.register(mod, makeManifest('test-b'));

    const result = await moduleLoader.unload('test-b');

    expect(result).toBe(true);
    expect(moduleLoader.isLoaded('test-b')).toBe(false);
    expect(bus.getModule('test-b')).toBeUndefined();
    expect(mod.unloaded).toBe(true);
  });

  it('prevents duplicate installation', async () => {
    const mod1 = new TestModule('test-c', 'Module C');
    const mod2 = new TestModule('test-c', 'Module C v2');

    await moduleLoader.register(mod1, makeManifest('test-c'));
    await moduleLoader.register(mod2, makeManifest('test-c'));

    expect(bus.getModule('test-c')).toBe(mod1);
    expect(mod2.loaded).toBe(false);
  });

  it('upgrades a module', async () => {
    const mod = new TestModule('test-d', 'Module D');
    await moduleLoader.register(mod, makeManifest('test-d'));

    await mod.onUpgrade('2.0.0');

    expect(mod.upgraded).toBe(true);
    expect(mod.newVersion).toBe('2.0.0');
  });

  it('reports missing dependencies', () => {
    registry.register(makeManifest('parent', {
      'child-a': '^1.0.0',
      'child-b': '^1.0.0',
    }));

    registry.register(makeManifest('child-a'));

    const missing = registry.getMissingDependencies('parent');
    expect(missing).toEqual(['child-b']);
  });

  it('discovers modules from filesystem', async () => {
    const discovered = await registry.discover();
    expect(discovered.length).toBeGreaterThanOrEqual(5);
    expect(discovered.some(m => m.id === 'nutrition')).toBe(true);
    expect(discovered.some(m => m.id === 'sport')).toBe(true);
    expect(discovered.some(m => m.id === 'organisation')).toBe(true);
    expect(discovered.some(m => m.id === 'recherche')).toBe(true);
    expect(discovered.some(m => m.id === 'donnees')).toBe(true);
  });

  it('routes intent to correct module', async () => {
    const mod = new TestModule('router-test', 'Router Test');
    mod.canHandle = (intent: string) => intent === 'test_intent';
    await moduleLoader.register(mod, makeManifest('router-test'));

    const result = await bus.route({
      message: 'test',
      history: [],
      intent: 'test_intent',
    });

    expect(result.success).toBe(true);
    expect(result.content).toBe('router-test executed');
  });

  it('emits events on module lifecycle', async () => {
    const events: string[] = [];
    const unsub = eventBus.on(SystemEvents.MODULE_LOADED, () => events.push('loaded'));
    eventBus.on(SystemEvents.MODULE_UNLOADED, () => events.push('unloaded'));

    const mod = new TestModule('event-test', 'Event Test');
    await moduleLoader.register(mod, makeManifest('event-test'));
    await moduleLoader.unload('event-test');

    expect(events).toContain('loaded');
    expect(events).toContain('unloaded');
    unsub();
  });
});
