export type AIProvider = 'local' | 'groq' | 'openrouter' | 'huggingface' | 'gemini' | 'openai' | 'zai' | string;

export type AIFunction =
  | 'spirit'
  | 'meals'
  | 'sport'
  | 'chat'
  | 'assistant'
  | 'calendar'
  | 'goals'
  | 'tasks';

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

export const BUILTIN_PROVIDERS: ProviderDef[] = [
  { id: 'local', name: 'Local (Fallback)', baseUrl: '', models: [''], defaultModel: '', isBuiltin: true },
  { id: 'zai', name: 'Z.ai', baseUrl: 'https://api.z.ai/api/coding/paas/v4', models: ['glm-4.5-air'], defaultModel: 'glm-4.5-air', isBuiltin: true, keyEnv: 'PROVIDER_ZAI_KEY' },
  { id: 'groq', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant'], defaultModel: 'llama-3.1-70b-versatile', isBuiltin: true, keyEnv: 'PROVIDER_GROQ_KEY' },
  { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', models: ['meta-llama/llama-3.1-70b-instruct'], defaultModel: 'meta-llama/llama-3.1-70b-instruct', isBuiltin: true, keyEnv: 'PROVIDER_OPENROUTER_KEY' },
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o-mini', 'gpt-4o'], defaultModel: 'gpt-4o-mini', isBuiltin: true, keyEnv: 'PROVIDER_OPENAI_KEY' },
  { id: 'huggingface', name: 'Hugging Face', baseUrl: 'https://api-inference.huggingface.co/models', models: ['meta-llama/Llama-3.1-70B-Instruct'], defaultModel: 'meta-llama/Llama-3.1-70B-Instruct', isBuiltin: true, keyEnv: 'PROVIDER_HF_KEY' },
  { id: 'gemini', name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', models: ['gemini-1.5-flash', 'gemini-1.5-pro'], defaultModel: 'gemini-1.5-flash', isBuiltin: true, keyEnv: 'PROVIDER_GEMINI_KEY' },
];

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

export function providerDefToConfig(p: ProviderDef): ProviderConfig {
  const models = p.models.length > 0 ? p.models : [''];
  return {
    name: p.name,
    apiKey: '',
    baseUrl: p.baseUrl,
    models: {
      default: p.defaultModel || models[0],
      fast: models[0] || '',
      smart: models[Math.min(1, models.length - 1)] || models[0] || '',
    },
  };
}

export function getEnvKey(providerId: string): string {
  const envName = `PROVIDER_${providerId.toUpperCase().replace(/-/g, '_')}_KEY`;
  return process.env[envName] || process.env[providerId === 'openai' ? 'OPENAI_API_KEY' : ''] || '';
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
