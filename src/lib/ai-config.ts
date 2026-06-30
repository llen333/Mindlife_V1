import {
  type AIProvider,
  type AIFunction,
  type ProviderConfig,
  type ProviderDef,
  BUILTIN_PROVIDERS,
  SYSTEM_PROMPTS,
  providerDefToConfig,
  getEnvKey,
} from './provider-defs';

export type { AIProvider, AIFunction, ProviderConfig };

export { SYSTEM_PROMPTS };

export const PROVIDERS: Record<string, ProviderConfig> = Object.fromEntries(
  BUILTIN_PROVIDERS.map(p => [p.id, providerDefToConfig(p)])
);

export interface AIConfig {
  defaultProvider: AIProvider;
  apiKeys: Record<string, string>;
  functionProviders: Record<AIFunction, AIProvider>;
  useFallbackOnError: boolean;
  userMemory?: string;
}

const DEFAULT_CONFIG: AIConfig = {
  defaultProvider: 'zai',
  apiKeys: Object.fromEntries(BUILTIN_PROVIDERS.map(p => [p.id, ''])),
  functionProviders: {
    spirit: 'zai', meals: 'zai', sport: 'zai', chat: 'zai',
    assistant: 'zai', calendar: 'zai', goals: 'zai', tasks: 'zai',
  },
  useFallbackOnError: true,
  userMemory: "Je m'appelle Llen. J'utilise MindLife pour m'organiser, planifier mes objectifs sportifs, suivre mes repas et réfléchir à la philosophie de vie.",
};

const STORAGE_KEY = 'mindlife-ai-config-v3';

const encrypt = (text: string): string => btoa(encodeURIComponent(text));
const decrypt = (encoded: string): string => {
  try { return decodeURIComponent(atob(encoded)); } catch { return ''; }
};

const isBrowser = (): boolean => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export function getAIConfig(): AIConfig {
  if (!isBrowser()) return { ...DEFAULT_CONFIG };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      for (const provider of Object.keys(parsed.apiKeys)) {
        if (parsed.apiKeys[provider]) {
          parsed.apiKeys[provider] = decrypt(parsed.apiKeys[provider]);
        }
      }
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (error) {
    console.error('Error loading AI config:', error);
  }
  return { ...DEFAULT_CONFIG };
}

export function saveAIConfig(config: AIConfig): void {
  try {
    const toSave = { ...config };
    for (const provider of Object.keys(toSave.apiKeys)) {
      if (toSave.apiKeys[provider]) {
        toSave.apiKeys[provider] = encrypt(toSave.apiKeys[provider]);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Error saving AI config:', error);
  }
}

export function setApiKey(provider: string, key: string): void {
  const config = getAIConfig();
  config.apiKeys[provider] = key;
  if (key && config.defaultProvider === 'local') {
    config.defaultProvider = provider as AIProvider;
  }
  saveAIConfig(config);
}

export function getApiKey(provider: string): string {
  const config = getAIConfig();
  const stored = config.apiKeys[provider] || '';

  if (typeof window === 'undefined') {
    return getEnvKey(provider) || stored;
  }
  return stored;
}

export function setFunctionProvider(func: AIFunction, provider: AIProvider): void {
  const config = getAIConfig();
  config.functionProviders[func] = provider;
  saveAIConfig(config);
}

export function getFunctionProvider(func: AIFunction): AIProvider {
  const config = getAIConfig();
  return config.functionProviders[func] || 'zai';
}

export function hasValidApiKey(provider: string): boolean {
  if (provider === 'local') return true;
  const config = getAIConfig();
  if (config.apiKeys[provider]) return true;
  if (typeof window === 'undefined') return !!getEnvKey(provider);
  return false;
}
