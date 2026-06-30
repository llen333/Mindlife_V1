import {
  type AIProvider,
  type AIFunction,
  getAIConfig,
  getFunctionProvider,
  getApiKey,
  PROVIDERS,
  SYSTEM_PROMPTS,
} from './ai-config';

import { testProviderConnection, providerDefToConfig } from './provider-defs';
import { getProvider } from './provider-registry';
export { testProviderConnection, providerDefToConfig };
import {
  generatePsychologistResponse,
  generateFriendResponse,
  generateStoicResponse,
  analyzeMessage,
  generateAssistantResponse,
} from './ai-fallback';
import {
  getRandomMeal,
  getNutritionAdvice,
  generateDayMenu,
} from './nutrition-fallback';
import {
  getWorkoutProgram,
  getSportAdvice,
  generateQuickWorkout,
} from './sport-fallback';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  success: boolean;
  content: string;
  provider: AIProvider;
  error?: string;
}

async function callOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  messages: ChatMessage[],
  model: string
): Promise<string> {
  const body: any = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: 800,
  };

  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const msg = data.choices?.[0]?.message;
  return msg?.content || msg?.reasoning_content || '';
}

async function callHuggingFace(messages: ChatMessage[], model: string, apiKey: string): Promise<string> {
  const prompt = messages.map(m => {
    if (m.role === 'system') return `<|system|>\n${m.content}<|end|>\n`;
    if (m.role === 'user') return `<|user|>\n${m.content}<|end|>\n`;
    return `<|assistant|)\n${m.content}<|end|>\n`;
  }).join('') + '<|assistant|)\n';

  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HuggingFace error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data[0]?.generated_text || '' : data.generated_text || '';
}

async function callGemini(messages: ChatMessage[], model: string, apiKey: string): Promise<string> {
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find(m => m.role === 'system')?.content || '';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function localFallback(
  message: string,
  func: AIFunction,
  archetype?: 'psychologue' | 'ami' | 'stoicien'
): Promise<string> {
  const analysis = analyzeMessage(message);

  if (func === 'spirit' && archetype) {
    switch (archetype) {
      case 'psychologue':
        return generatePsychologistResponse(message, analysis);
      case 'ami':
        return generateFriendResponse(message, analysis);
      case 'stoicien':
        return generateStoicResponse(message, analysis);
    }
  }

  switch (func) {
    case 'meals': {
      const topic = analysis.topics[0] || 'general';

      if (/petit-déjeuner|breakfast|matin/i.test(message)) {
        const meal = getRandomMeal('petit_dejeuner');
        return `🍳 **${meal.name}**\n\n${meal.description}\n\n⏱️ Préparation: ${meal.prepTime} | Cuisson: ${meal.cookTime}\n🔥 ${meal.calories} kcal | 💪 ${meal.protein}g protéines`;
      }
      if (/déjeuner|déjeuner|midi/i.test(message)) {
        const meal = getRandomMeal('dejeuner');
        return `🍽️ **${meal.name}**\n\n${meal.description}\n\n⏱️ Préparation: ${meal.prepTime} | Cuisson: ${meal.cookTime}\n🔥 ${meal.calories} kcal | 💪 ${meal.protein}g protéines`;
      }
      if (/dîner|diner|soir/i.test(message)) {
        const meal = getRandomMeal('diner');
        return `🌙 **${meal.name}**\n\n${meal.description}\n\n⏱️ Préparation: ${meal.prepTime} | Cuisson: ${meal.cookTime}\n🔥 ${meal.calories} kcal | 💪 ${meal.protein}g protéines`;
      }

      const advice = getNutritionAdvice(topic);
      return `💡 **Conseil nutrition**\n\n${advice}\n\nDis-moi si tu veux une suggestion de repas (petit-déjeuner, déjeuner ou dîner) !`;
    }

    case 'sport': {
      const topic = analysis.topics[0] || 'motivation';

      if (/programme|planning|semaine|planning/i.test(message)) {
        const program = getWorkoutProgram('intermédiaire');
        return `🏋️ **${program.name}**\n\n🎯 Objectif: ${program.goal}\n📊 Niveau: ${program.level}\n⏱️ Durée: ${program.duration}\n📅 Fréquence: ${program.frequency}\n\nCommence par un échauffement de 5 min et termine par des étirements !`;
      }

      if (/rapide|express|court/i.test(message)) {
        const workout = generateQuickWorkout(30);
        const exerciseList = workout.exercises.map(e => `• ${e.name} (${e.reps})`).join('\n');
        return `⚡ **${workout.name}**\n\n${exerciseList}\n\n💡 N'oublie pas de t'échauffer 3 min avant !`;
      }

      const advice = getSportAdvice(topic);
      return `💪 **Conseil sport**\n\n${advice}\n\nDis-moi si tu veux un programme personnalisé !`;
    }

    case 'chat':
    case 'assistant':
      return generateAssistantResponse(message);

    case 'calendar':
      return "📅 Je peux t'aider à planifier. Dis-moi la date, l'heure, le titre et le lieu de l'événement.";

    case 'goals':
      if (analysis.intent === 'goal') {
        return `🎯 **Objectif identifié**\n\nPour atteindre cet objectif :\n1. Définis des étapes concrètes\n2. Fixe une deadline\n3. Mesure tes progrès\n\nQuelle est la première action que tu peux faire maintenant ?`;
      }
      return "🎯 Dis-moi quel objectif tu veux atteindre, je t'aiderai à créer un plan d'action !";

    default:
      return "Je suis là pour t'aider. Dis-moi ce dont tu as besoin !";
  }
}

export async function aiChat(
  userMessage: string,
  options: {
    func: AIFunction;
    systemPrompt?: string;
    archetype?: 'psychologue' | 'ami' | 'stoicien';
    history?: ChatMessage[];
    userId?: string;
    model?: string;
    provider?: string;
  }
): Promise<AIResponse> {
  const { func, systemPrompt: customSystem, archetype, history = [], userId, model: modelOverride, provider: providerOverride } = options;
  const config = getAIConfig();

  const provider = providerOverride || getFunctionProvider(func);

  if (provider === 'local') {
    return {
      success: true,
      content: await localFallback(userMessage, func, archetype),
      provider: 'local',
    };
  }

  let apiKey = getApiKey(provider);
  if (!apiKey) {
    try {
      const { getProvider } = await import('./provider-registry');
      const customProvider = await getProvider(provider);
      if (customProvider?.apiKey) {
        apiKey = customProvider.apiKey;
      }
    } catch {}
  }
  if (!apiKey) {
    console.log(`No API key for ${provider}, using local fallback`);
    return {
      success: true,
      content: await localFallback(userMessage, func, archetype),
      provider: 'local',
    };
  }

  let systemPrompt = customSystem;
  if (!systemPrompt) {
    if (func === 'spirit' && archetype) {
      systemPrompt = SYSTEM_PROMPTS.spirit[archetype];
    } else {
      systemPrompt = SYSTEM_PROMPTS[func]?.default || "Tu es un assistant utile et bienveillant.";
    }
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10),
    { role: 'user', content: userMessage },
  ];

  try {
    let providerConfig = PROVIDERS[provider];
    if (!providerConfig) {
      const custom = await getProvider(provider);
      if (custom) {
        providerConfig = providerDefToConfig(custom);
      }
    }
    const model = modelOverride || providerConfig?.models?.default || 'default';
    let content = '';

    if (provider === 'huggingface') {
      content = await callHuggingFace(messages, model, apiKey);
    } else if (provider === 'gemini') {
      content = await callGemini(messages, model, apiKey);
    } else {
      content = await callOpenAICompatible(providerConfig.baseUrl, apiKey, messages, model);
    }

    if (!content) {
      throw new Error('Empty response from API');
    }

    return { success: true, content, provider };
  } catch (error) {
    console.error(`AI provider error (${provider}):`, error);

    if (config.useFallbackOnError) {
      console.log('Using local fallback due to error');
      return {
        success: true,
        content: await localFallback(userMessage, func, archetype),
        provider: 'local',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    return {
      success: false,
      content: '',
      provider,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
