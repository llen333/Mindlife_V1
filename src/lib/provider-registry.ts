export interface ProviderDef {
  id: string;
  name: string;
  baseUrl: string;
  models: string[];
  defaultModel?: string;
  isBuiltin: boolean;
  keyEnv?: string;
}

export interface StoredProvider extends ProviderDef {
  apiKey?: string;
}

import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const PROVIDERS_FILE = path.join(DATA_DIR, 'providers.json');

const BUILTIN_PROVIDERS: ProviderDef[] = [
  { id: 'local', name: 'Local (Fallback)', baseUrl: '', models: [''], defaultModel: '', isBuiltin: true },
  { id: 'zai', name: 'Z.ai', baseUrl: 'https://api.z.ai/api/coding/paas/v4', models: ['glm-4.5-air'], defaultModel: 'glm-4.5-air', isBuiltin: true, keyEnv: 'PROVIDER_ZAI_KEY' },
  { id: 'groq', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant'], defaultModel: 'llama-3.1-70b-versatile', isBuiltin: true, keyEnv: 'PROVIDER_GROQ_KEY' },
  { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', models: ['meta-llama/llama-3.1-70b-instruct'], defaultModel: 'meta-llama/llama-3.1-70b-instruct', isBuiltin: true, keyEnv: 'PROVIDER_OPENROUTER_KEY' },
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o-mini', 'gpt-4o'], defaultModel: 'gpt-4o-mini', isBuiltin: true, keyEnv: 'PROVIDER_OPENAI_KEY' },
  { id: 'huggingface', name: 'Hugging Face', baseUrl: 'https://api-inference.huggingface.co/models', models: ['meta-llama/Llama-3.1-70B-Instruct'], defaultModel: 'meta-llama/Llama-3.1-70B-Instruct', isBuiltin: true, keyEnv: 'PROVIDER_HF_KEY' },
  { id: 'gemini', name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', models: ['gemini-1.5-flash', 'gemini-1.5-pro'], defaultModel: 'gemini-1.5-flash', isBuiltin: true, keyEnv: 'PROVIDER_GEMINI_KEY' },
];

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

function getEnvKey(providerId: string): string {
  const envName = `PROVIDER_${providerId.toUpperCase().replace(/-/g, '_')}_KEY`;
  return process.env[envName] || process.env[providerId === 'openai' ? 'OPENAI_API_KEY' : ''] || '';
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
    sp.apiKey = getEnvKey(p.id);
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

export async function testProviderConnection(baseUrl: string, apiKey: string, model?: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey) return { success: false, message: 'Clé API manquante' };
  try {
    const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Réponds uniquement "OK" en français.' }],
        max_tokens: 10,
      }),
    });
    if (response.ok) return { success: true, message: 'Connexion réussie' };
    const err = await response.text().catch(() => '');
    return { success: false, message: `Erreur ${response.status}: ${err.slice(0, 200)}` };
  } catch (e: any) {
    return { success: false, message: `Impossible de joindre l'API: ${e?.message || e}` };
  }
}

export async function fetchProviderModels(baseUrl: string, apiKey: string): Promise<{ success: boolean; models: string[]; message?: string }> {
  if (!apiKey) return { success: false, models: [], message: 'Clé API manquante' };
  try {
    const url = `${baseUrl.replace(/\/+$/, '')}/models`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!response.ok) {
      const err = await response.text().catch(() => '');
      return { success: false, models: [], message: `Erreur ${response.status}: ${err.slice(0, 200)}` };
    }
    const data = await response.json();
    const models = (data.data || []).map((m: any) => m.id || m.name).filter(Boolean) as string[];
    return { success: true, models };
  } catch (e: any) {
    return { success: false, models: [], message: `Impossible de charger les modèles: ${e?.message || e}` };
  }
}
