import { db } from '../../src/lib/db';
import type { ModuleManifest } from '../../src/lib/bus/types';

export interface PackageInfo {
  id: string;
  name: string;
  version: string;
  description: string | null;
  author: string | null;
  manifest: ModuleManifest;
  source: string | null;
  isInstalled: boolean;
  createdAt: Date;
}

export class ModuleStore {
  async register(manifest: ModuleManifest, source?: string, checksum?: string): Promise<string> {
    const existing = await db.modulePackage.findUnique({ where: { name: manifest.id } });
    if (existing) {
      const updated = await db.modulePackage.update({
        where: { id: existing.id },
        data: {
          version: manifest.version,
          description: manifest.description,
          author: manifest.author,
          manifest: JSON.stringify(manifest),
          source: source || existing.source,
          checksum: checksum || existing.checksum,
        },
      });
      return updated.id;
    }

    const pkg = await db.modulePackage.create({
      data: {
        id: `pkg-${manifest.id}-${Date.now()}`,
        name: manifest.id,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author,
        manifest: JSON.stringify(manifest),
        source,
        checksum,
      },
    });
    return pkg.id;
  }

  async markInstalled(name: string): Promise<void> {
    await db.modulePackage.updateMany({
      where: { name },
      data: { isInstalled: true },
    });
  }

  async markUninstalled(name: string): Promise<void> {
    await db.modulePackage.updateMany({
      where: { name },
      data: { isInstalled: false },
    });
  }

  async get(name: string): Promise<PackageInfo | null> {
    const pkg = await db.modulePackage.findUnique({ where: { name } });
    if (!pkg) return null;
    return this.toPackageInfo(pkg);
  }

  async list(filter?: { installed?: boolean }): Promise<PackageInfo[]> {
    const where: any = {};
    if (filter?.installed !== undefined) where.isInstalled = filter.installed;

    const packages = await db.modulePackage.findMany({ where, orderBy: { createdAt: 'desc' } });
    return packages.map((p) => this.toPackageInfo(p));
  }

  async search(query: string): Promise<PackageInfo[]> {
    const packages = await db.modulePackage.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return packages.map((p) => this.toPackageInfo(p));
  }

  async remove(name: string): Promise<boolean> {
    const result = await db.modulePackage.deleteMany({ where: { name } });
    return result.count > 0;
  }

  resolveDependencies(manifest: ModuleManifest): { name: string; version: string }[] {
    if (!manifest.dependencies) return [];
    return Object.entries(manifest.dependencies).map(([name, version]) => ({ name, version }));
  }

  async checkDependencies(manifest: ModuleManifest): Promise<{ missing: string[]; satisfied: string[] }> {
    const deps = this.resolveDependencies(manifest);
    const missing: string[] = [];
    const satisfied: string[] = [];

    for (const dep of deps) {
      const installed = await db.modulePackage.findFirst({
        where: { name: dep.name, isInstalled: true },
      });
      if (installed) {
        satisfied.push(dep.name);
      } else {
        missing.push(`${dep.name}@${dep.version}`);
      }
    }

    return { missing, satisfied };
  }

  private toPackageInfo(pkg: any): PackageInfo {
    return {
      id: pkg.id,
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      author: pkg.author,
      manifest: JSON.parse(pkg.manifest),
      source: pkg.source,
      isInstalled: pkg.isInstalled,
      createdAt: pkg.createdAt,
    };
  }
}

export const moduleStore = new ModuleStore();
