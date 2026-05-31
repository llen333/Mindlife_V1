/**
 * AI Configuration Module
 * Gestion des providers IA et clés API
 */

// ============================================
// TYPES
// ============================================

export type AIProvider = 'local' | 'groq' | 'openrouter' | 'huggingface' | 'gemini' | 'openai' | 'zai' | string;

export type AIFunction = 
  | 'spirit'        // Page Spirit (psy/ami/stoïcien)
  | 'meals'         // Génération repas
  | 'sport'         // Programmes sport
  | 'chat'          // Chat principal
  | 'assistant'     // Assistant général
  | 'calendar'      // Assistant calendrier
  | 'goals'         // Conseils objectifs
  | 'tasks';        // Gestion des tâches

export interface ProviderConfig {
  name: string;
  apiKey: string;
  baseUrl: string;
  models: {
    default: string;
    fast: string;
    smart: string;
  };
}

export interface AIConfig {
  defaultProvider: AIProvider;
  apiKeys: Record<AIProvider, string>;
  functionProviders: Record<AIFunction, AIProvider>;
  useFallbackOnError: boolean;
  userMemory?: string;
}

// ============================================
// PROVIDER DEFINITIONS
// ============================================

export const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  local: {
    name: 'Local (Fallback)',
    apiKey: '',
    baseUrl: '',
    models: { default: '', fast: '', smart: '' },
  },
  groq: {
    name: 'Groq',
    apiKey: '',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: {
      default: 'llama-3.1-70b-versatile',
      fast: 'llama-3.1-8b-instant',
      smart: 'llama-3.1-70b-versatile',
    },
  },
  openrouter: {
    name: 'OpenRouter',
    apiKey: '',
    baseUrl: 'https://openrouter.ai/api/v1',
    models: {
      default: 'meta-llama/llama-3.1-70b-instruct',
      fast: 'meta-llama/llama-3.1-8b-instruct',
      smart: 'anthropic/claude-3-haiku',
    },
  },
  huggingface: {
    name: 'Hugging Face',
    apiKey: '',
    baseUrl: 'https://api-inference.huggingface.co/models',
    models: {
      default: 'meta-llama/Llama-3.1-70B-Instruct',
      fast: 'meta-llama/Llama-3.1-8B-Instruct',
      smart: 'meta-llama/Llama-3.1-70B-Instruct',
    },
  },
  gemini: {
    name: 'Google Gemini',
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: {
      default: 'gemini-1.5-flash',
      fast: 'gemini-1.5-flash',
      smart: 'gemini-1.5-pro',
    },
  },
  openai: {
    name: 'OpenAI',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    models: {
      default: 'gpt-4o-mini',
      fast: 'gpt-4o-mini',
      smart: 'gpt-4o',
    },
  },
  zai: {
    name: 'Z.ai',
    apiKey: '',
    baseUrl: 'https://api.z.ai/api/coding/paas/v4',
    models: {
      default: 'glm-4.5-air',
      fast: 'glm-4.5-air',
      smart: 'glm-4.5-air',
    },
  },
};

// ============================================
// DEFAULT CONFIG
// ============================================

const DEFAULT_CONFIG: AIConfig = {
  defaultProvider: 'zai',
  apiKeys: {
    local: '',
    groq: '',
    openrouter: '',
    huggingface: '',
    gemini: '',
    openai: '',
    zai: '',
  },
  functionProviders: {
    spirit: 'zai',
    meals: 'zai',
    sport: 'zai',
    chat: 'zai',
    assistant: 'zai',
    calendar: 'zai',
    goals: 'zai',
    tasks: 'zai',
  },
  useFallbackOnError: true,
  userMemory: 'Je m\'appelle Llen. J\'utilise MindLife pour m\'organiser, planifier mes objectifs sportifs, suivre mes repas et réfléchir à la philosophie de vie.',
};

// ============================================
// STORAGE (localStorage avec chiffrement simple)
// ============================================

const STORAGE_KEY = 'mindlife-ai-config-v3';

// Simple encryption/decryption (base64 + obfuscation)
const encrypt = (text: string): string => {
  return btoa(encodeURIComponent(text));
};

const decrypt = (encoded: string): string => {
  try {
    return decodeURIComponent(atob(encoded));
  } catch {
    return '';
  }
};

// ============================================
// CONFIG MANAGEMENT
// ============================================

// Check if running in browser
const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
};

export function getAIConfig(): AIConfig {
  // Côté serveur, retourner la config par défaut
  if (!isBrowser()) {
    return { ...DEFAULT_CONFIG };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Decrypt API keys
      for (const provider of Object.keys(parsed.apiKeys) as AIProvider[]) {
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
    // Encrypt API keys before saving
    const toSave = { ...config };
    for (const provider of Object.keys(toSave.apiKeys) as AIProvider[]) {
      if (toSave.apiKeys[provider]) {
        toSave.apiKeys[provider] = encrypt(toSave.apiKeys[provider]);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Error saving AI config:', error);
  }
}

export function setApiKey(provider: AIProvider, key: string): void {
  const config = getAIConfig();
  config.apiKeys[provider] = key;
  
  // Si c'est la première clé API définie, la mettre par défaut
  if (key && config.defaultProvider === 'local') {
    config.defaultProvider = provider;
  }
  
  saveAIConfig(config);
}

export function getApiKey(provider: AIProvider): string {
  const config = getAIConfig();
  const stored = config.apiKeys[provider] || '';

  // Server-side: check env vars first
  if (typeof window === 'undefined') {
    const envName = `PROVIDER_${provider.toUpperCase().replace(/-/g, '_')}_KEY`;
    return process.env[envName] || stored;
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
  const provider = config.functionProviders[func];

  if (provider !== 'local') {
    const configKey = config.apiKeys[provider];
    const envName = `PROVIDER_${provider.toUpperCase().replace(/-/g, '_')}_KEY`;
    const envKey = typeof window === 'undefined' ? process.env[envName] : undefined;
    if (!configKey && !envKey) {
      return 'local';
    }
  }

  return provider;
}

export function hasValidApiKey(provider: AIProvider): boolean {
  if (provider === 'local') return true;
  const config = getAIConfig();
  if (config.apiKeys[provider]) return true;
  const envName = `PROVIDER_${provider.toUpperCase().replace(/-/g, '_')}_KEY`;
  const envKey = typeof window === 'undefined' ? process.env[envName] : undefined;
  return !!envKey;
}

// ============================================
// SYSTEM PROMPTS PAR FONCTION
// ============================================

export const SYSTEM_PROMPTS: Record<AIFunction, Record<string, string>> = {
  spirit: {
    psychologue: `Tu es un psychologue bienveillant et empathique. Tu aides la personne à explorer ses émotions et comprendre ses patterns de pensée. Tu poses des questions ouvertes et offres des perspectives thérapeutiques. Réponds en 2-4 phrases, de manière chaleureuse mais professionnelle.`,
    ami: `Tu es un ami sincère et bienveillant. Tu écoutes avec le cœur, tu encourages avec authenticité. Tu parles comme un ami proche avec familiarité et chaleur. Réponds en 2-3 phrases, de manière naturelle.`,
    stoicien: `Tu es un sage stoïcien inspiré par Marc Aurèle, Épictète et Sénèque. Tu offres des perspectives sur le contrôle de ce qui dépend de nous. Tu parles avec sagesse, en utilisant parfois des citations. Réponds en 2-3 phrases max.`,
  },
  meals: {
    default: `Tu es un nutritionniste expert. Génère des suggestions de repas saines et équilibrées en français. Sois concis et pratique.`,
  },
  sport: {
    default: `Tu es un coach sportif personnel. Tu crées des programmes d'entraînement adaptés aux objectifs. Sois motivant et précis.`,
  },
  chat: {
    default: `Tu es l'assistant IA personnel de MindLife. Tu es chaleureux, professionnel et toujours utile. Tu parles en français et donnes des réponses pratiques et structurées.`,
  },
  assistant: {
    default: `Tu es un assistant personnel qui aide à organiser la vie quotidienne. Tu donnes des conseils pratiques pour les tâches, objectifs et organisation. Réponds de manière concise et actionnable.`,
  },
  calendar: {
    default: `Tu es un assistant calendrier. Tu aides à planifier des événements et gérer le temps. Tu extrais les informations des demandes pour créer des événements.`,
  },
  goals: {
    default: `Tu es un coach en développement personnel. Tu aides à définir et atteindre des objectifs SMART. Tu offres des conseils de motivation et des étapes concrètes.`,
  },
  tasks: {
    default: `Tu es un assistant de gestion de tâches. Tu aides à prioriser, organiser et planifier les tâches. Tu offres des conseils de productivité et proposes des sous-tâches si nécessaire.`,
  },
};
