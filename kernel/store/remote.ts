import { moduleStore } from './manager';
import { moduleSandbox } from '../runtime/sandbox';
import { extractPackage, verifyChecksum } from './packager';
import type { ModuleManifest } from '../../src/lib/bus/types';

export interface RemotePackageInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: string[];
  intents: string[];
  dependencies: Record<string, string>;
  downloadUrl: string;
  checksum: string;
  size: number;
  updatedAt: string;
}

interface RegistryIndex {
  packages: RemotePackageInfo[];
}

const DEFAULT_REGISTRY = 'https://registry.mindlife.ai';

export class RemoteStore {
  private registryUrl: string;
  private cache: Map<string, RemotePackageInfo> = new Map();
  private indexCache: RemotePackageInfo[] | null = null;
  private indexCachedAt = 0;
  private readonly CACHE_TTL = 300000;

  constructor(registryUrl = DEFAULT_REGISTRY) {
    this.registryUrl = registryUrl;
  }

  setRegistry(url: string): void {
    this.registryUrl = url;
    this.cache.clear();
    this.indexCache = null;
  }

  getRegistry(): string {
    return this.registryUrl;
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
      throw new Error(`Registry request failed: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  private async fetchBuffer(url: string): Promise<Uint8Array> {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }

  async fetchIndex(): Promise<RemotePackageInfo[]> {
    const now = Date.now();
    if (this.indexCache && now - this.indexCachedAt < this.CACHE_TTL) {
      return this.indexCache;
    }
    const index = await this.fetchJson<RegistryIndex>(`${this.registryUrl}/api/v1/packages`);
    this.indexCache = index.packages;
    this.indexCachedAt = now;
    for (const pkg of index.packages) {
      this.cache.set(pkg.name, pkg);
    }
    return index.packages;
  }

  async search(query: string): Promise<RemotePackageInfo[]> {
    const all = await this.fetchIndex();
    const q = query.toLowerCase();
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q),
    );
  }

  async getInfo(name: string): Promise<RemotePackageInfo | null> {
    const cached = this.cache.get(name);
    if (cached) return cached;

    try {
      const info = await this.fetchJson<RemotePackageInfo>(
        `${this.registryUrl}/api/v1/package/${encodeURIComponent(name)}`,
      );
      this.cache.set(name, info);
      return info;
    } catch {
      return null;
    }
  }

  async download(name: string, version?: string): Promise<Uint8Array> {
    const info = await this.getInfo(name);
    if (!info) throw new Error(`Package '${name}' not found in registry`);
    const data = await this.fetchBuffer(info.downloadUrl);

    if (info.checksum && !verifyChecksum(data, info.checksum)) {
      throw new Error(`Checksum verification failed for '${name}'`);
    }

    return data;
  }

  async install(name: string, version?: string): Promise<{ id: string; name: string }> {
    const info = await this.getInfo(name);
    if (!info) throw new Error(`Package '${name}' not found in registry`);

    const data = await this.download(name, version);
    const extracted = extractPackage(data);

    if (!extracted.manifest || !extracted.manifest.id) {
      throw new Error(`Package '${name}' has invalid manifest`);
    }

    const manifest = extracted.manifest as unknown as ModuleManifest;

    const existing = await moduleStore.get(manifest.id);
    if (existing?.isInstalled) {
      return { id: existing.id, name: manifest.id };
    }

    const id = await moduleStore.register(manifest, info.downloadUrl, info.checksum);
    await moduleStore.markInstalled(manifest.id);

    moduleSandbox.configure(manifest.id, {
      timeout: manifest.timeout || 10000,
      rateLimit: {
        maxRequests: manifest.rateLimit?.maxRequests ?? 60,
        windowMs: manifest.rateLimit?.windowMs ?? 60000,
      },
      allowedIntents: manifest.intents || [],
      allowedPaths: manifest.allowedPaths,
      allowNetwork: manifest.allowNetwork,
      maxMemoryMb: manifest.maxMemoryMb,
    });

    return { id, name: manifest.id };
  }

  async uninstall(name: string): Promise<void> {
    await moduleStore.markUninstalled(name);
  }

  async listInstalled() {
    return moduleStore.list({ installed: true });
  }
}

export const remoteStore = new RemoteStore();
