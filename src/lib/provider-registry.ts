import { promises as fs } from 'fs';
import path from 'path';
import {
  type ProviderDef,
  type StoredProvider,
  BUILTIN_PROVIDERS,
  getEnvKey,
  testProviderConnection,
  fetchProviderModels,
} from './provider-defs';

export type { ProviderDef, StoredProvider } from './provider-defs';
export { testProviderConnection, fetchProviderModels } from './provider-defs';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const PROVIDERS_FILE = path.join(DATA_DIR, 'providers.json');

let customProvidersCache: StoredProvider[] | null = null;

async function ensureDataDir(): Promise<void> {
  try { await fs.mkdir(DATA_DIR, { recursive: true }); } catch {}
}

async function loadCustomProviders(): Promise<StoredProvider[]> {
  if (customProvidersCache) return customProvidersCache;
  await ensureDataDir();
  try {
    const raw = await fs.readFile(PROVIDERS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    customProvidersCache = (data.custom || []) as StoredProvider[];
    return customProvidersCache;
  } catch {
    customProvidersCache = [];
    return [];
  }
}

async function saveCustomProviders(providers: StoredProvider[]): Promise<void> {
  await ensureDataDir();
  customProvidersCache = providers;
  const existing = await loadCustomProvidersFile();
  await fs.writeFile(PROVIDERS_FILE, JSON.stringify({ ...existing, custom: providers, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
}

async function loadCustomProvidersFile(): Promise<any> {
  try {
    return JSON.parse(await fs.readFile(PROVIDERS_FILE, 'utf-8'));
  } catch { return { builtin: BUILTIN_PROVIDERS, custom: [], modelOverrides: {} }; }
}

export async function updateProviderModel(id: string, model: string): Promise<void> {
  const existing = await loadCustomProvidersFile();
  const overrides = existing.modelOverrides || {};
  overrides[id] = model;
  existing.modelOverrides = overrides;
  existing.updatedAt = new Date().toISOString();
  await ensureDataDir();
  await fs.writeFile(PROVIDERS_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  customProvidersCache = null;
}

function getModelOverrides(existing: any): Record<string, string> {
  return existing.modelOverrides || {};
}

export async function getAllProviders(): Promise<ProviderDef[]> {
  const custom = await loadCustomProviders();
  const existing = await loadCustomProvidersFile();
  const overrides = getModelOverrides(existing);
  const applyOverride = (p: ProviderDef): ProviderDef => {
    if (overrides[p.id]) return { ...p, defaultModel: overrides[p.id] };
    return p;
  };
  return [...BUILTIN_PROVIDERS.map(applyOverride), ...custom.map(applyOverride)];
}

export async function getProvider(id: string): Promise<StoredProvider | undefined> {
  const all = await getAllProviders();
  const p = all.find(p => p.id === id);
  if (!p) return undefined;
  const sp = p as StoredProvider;
  if (p.isBuiltin) {
    sp.apiKey = getEnvKey(p.id) || (await getStoredApiKeys())[p.id] || '';
  }
  return sp;
}

export async function addCustomProvider(provider: StoredProvider): Promise<void> {
  const existing = await loadCustomProviders();
  const idx = existing.findIndex(p => p.id === provider.id);
  if (idx >= 0) existing[idx] = provider;
  else existing.push(provider);
  await saveCustomProviders(existing);
}

export async function removeCustomProvider(id: string): Promise<void> {
  const existing = await loadCustomProviders();
  await saveCustomProviders(existing.filter(p => p.id !== id));
}

// ── Stockage des clés API pour les providers built-in ──
const API_KEYS_FILE = path.join(DATA_DIR, 'api-keys.json');

export async function saveApiKeys(keys: Record<string, string>): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(API_KEYS_FILE, JSON.stringify({ apiKeys: keys, updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
}

export async function getStoredApiKeys(): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(API_KEYS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return data.apiKeys || {};
  } catch {
    return {};
  }
}


