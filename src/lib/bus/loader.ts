import { Module, ModuleManifest } from './types';
import { bus } from './orchestrator';
import { registry } from './registry';
import { eventBus, SystemEvents } from './events';

export class ModuleLoader {
  private loaded = new Set<string>();

  get isSupported(): boolean {
    return typeof __non_webpack_module__ === 'undefined';
  }

  async register(module: Module, manifest: ModuleManifest): Promise<void> {
    if (this.loaded.has(module.id)) return;
    await module.onLoad?.();
    bus.register(module);
    registry.register(manifest);
    this.loaded.add(module.id);
  }

  async unload(moduleId: string): Promise<boolean> {
    if (!this.loaded.has(moduleId)) return false;
    const module = bus.getModule(moduleId);
    if (module) {
      await module.onUnload?.();
    }
    bus.unregister(moduleId);
    registry.unregister(moduleId);
    this.loaded.delete(moduleId);
    return true;
  }

  isLoaded(moduleId: string): boolean {
    return this.loaded.has(moduleId);
  }
}

export const moduleLoader = new ModuleLoader();
