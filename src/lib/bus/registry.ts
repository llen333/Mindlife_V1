import { ModuleManifest } from './types';
import { bus } from './orchestrator';

export class ModuleRegistry {
  private manifests = new Map<string, ModuleManifest>();

  register(manifest: ModuleManifest): void {
    this.manifests.set(manifest.id, manifest);
  }

  unregister(moduleId: string): boolean {
    return this.manifests.delete(moduleId);
  }

  getManifest(moduleId: string): ModuleManifest | undefined {
    return this.manifests.get(moduleId);
  }

  getAllManifests(): ModuleManifest[] {
    return Array.from(this.manifests.values());
  }

  getInstalledModules(): ModuleManifest[] {
    return this.getAllManifests().filter((m) => bus.getModule(m.id));
  }

  getMissingDependencies(moduleId: string): string[] {
    const manifest = this.manifests.get(moduleId);
    if (!manifest?.dependencies) return [];
    return Object.keys(manifest.dependencies).filter((depId) => !this.manifests.has(depId));
  }

  hasModule(moduleId: string): boolean {
    return this.manifests.has(moduleId);
  }

  async discover(): Promise<ModuleManifest[]> {
    const found: ModuleManifest[] = [];
    try {
      const { readdirSync, statSync } = await import('fs');
      const { join } = await import('path');
      const modulesDir = join(process.cwd(), 'src', 'lib', 'modules');
      const entries = readdirSync(modulesDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        try {
          const manifestPath = join(modulesDir, entry.name, 'module.json');
          const manifest: ModuleManifest = JSON.parse(
            (await import('fs')).readFileSync(manifestPath, 'utf-8')
          );
          if (manifest.id) {
            found.push(manifest);
          }
        } catch {}
      }
    } catch {}
    return found;
  }
}

export const registry = new ModuleRegistry();
