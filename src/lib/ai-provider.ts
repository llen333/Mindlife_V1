/**
 * AI Provider Module
 * Gestion des appels API vers différents providers IA
 */

import {
  AIProvider,
  AIFunction,
  getAIConfig,
  getFunctionProvider,
  getApiKey,
  PROVIDERS,
  SYSTEM_PROMPTS,
} from './ai-config';
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

// ============================================
// TYPES
// ============================================

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

// ============================================
// PROVIDER CALLS (OpenAI-compatible APIs)
// ============================================

/**
 * Appel générique aux APIs compatibles OpenAI
 * Supporte tool calling (deux-pass : LLM choisit tool → on exécute → second appel LLM)
 */
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

  const response = await fetch(`${baseUrl}/chat/completions`, {
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
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Appel Groq (OpenAI-compatible)
 */
async function callGroq(messages: ChatMessage[], model: string, apiKey: string): Promise<string> {
  return callOpenAICompatible('https://api.groq.com/openai/v1', apiKey, messages, model);
}

async function callOpenRouter(messages: ChatMessage[], model: string, apiKey: string): Promise<string> {
  return callOpenAICompatible('https://openrouter.ai/api/v1/chat/completions', apiKey, messages, model);
}

async function callOpenAI(messages: ChatMessage[], model: string, apiKey: string): Promise<string> {
  return callOpenAICompatible('https://api.openai.com/v1', apiKey, messages, model);
}

async function callZai(messages: ChatMessage[], model: string, apiKey: string): Promise<string> {
  return callOpenAICompatible('https://api.z.ai/api/coding/paas/v4', apiKey, messages, model);
}

/**
 * Appel Hugging Face
 */
async function callHuggingFace(messages: ChatMessage[], model: string, apiKey: string): Promise<string> {
  // HF utilise un format différent
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

/**
 * Appel Gemini
 */
async function callGemini(messages: ChatMessage[], model: string, apiKey: string): Promise<string> {
  // Convertir les messages au format Gemini
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

// ============================================
// LOCAL FALLBACK
// ============================================

async function localFallback(
  message: string,
  func: AIFunction,
  archetype?: 'psychologue' | 'ami' | 'stoicien'
): Promise<string> {
  const analysis = analyzeMessage(message);

  // Pour Spirit, utiliser les générateurs d'archétypes
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

  // Pour les autres fonctions, utiliser les modules de fallback spécialisés
  switch (func) {
    case 'meals': {
      // Utiliser le module nutrition-fallback
      const topic = analysis.topics[0] || 'general';
      
      // Si l'utilisateur demande un type de repas spécifique
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
      
      // Conseil nutritionnel basé sur le sujet détecté
      const advice = getNutritionAdvice(topic);
      return `💡 **Conseil nutrition**\n\n${advice}\n\nDis-moi si tu veux une suggestion de repas (petit-déjeuner, déjeuner ou dîner) !`;
    }
    
    case 'sport': {
      // Utiliser le module sport-fallback
      const topic = analysis.topics[0] || 'motivation';
      
      // Si l'utilisateur demande un programme
      if (/programme|planning|semaine|planning/i.test(message)) {
        const program = getWorkoutProgram('intermédiaire');
        return `🏋️ **${program.name}**\n\n🎯 Objectif: ${program.goal}\n📊 Niveau: ${program.level}\n⏱️ Durée: ${program.duration}\n📅 Fréquence: ${program.frequency}\n\nCommence par un échauffement de 5 min et termine par des étirements !`;
      }
      
      // Si l'utilisateur veut un workout rapide
      if (/rapide|express|court/i.test(message)) {
        const workout = generateQuickWorkout(30);
        const exerciseList = workout.exercises.map(e => `• ${e.name} (${e.reps})`).join('\n');
        return `⚡ **${workout.name}**\n\n${exerciseList}\n\n💡 N'oublie pas de t'échauffer 3 min avant !`;
      }
      
      // Conseil sportif basé sur le sujet
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

// ============================================
// MAIN CHAT FUNCTION
// ============================================

/**
 * Fonction principale pour chatter avec l'IA
 * Gère automatiquement le provider configuré et le fallback
 */
export async function aiChat(
  userMessage: string,
  options: {
    func: AIFunction;
    systemPrompt?: string;
    archetype?: 'psychologue' | 'ami' | 'stoicien';
    history?: ChatMessage[];
    userId?: string;
  }
): Promise<AIResponse> {
  const { func, systemPrompt: customSystem, archetype, history = [], userId } = options;
  const config = getAIConfig();

  // Récupérer le provider pour cette fonction
  const provider = getFunctionProvider(func);

  // Si provider local, utiliser le fallback directement
  if (provider === 'local') {
    return {
      success: true,
      content: await localFallback(userMessage, func, archetype),
      provider: 'local',
    };
  }

  // Vérifier la clé API
  const apiKey = getApiKey(provider);
  if (!apiKey) {
    console.log(`No API key for ${provider}, using local fallback`);
    return {
      success: true,
      content: await localFallback(userMessage, func, archetype),
      provider: 'local',
    };
  }

  // Construire le prompt système
  let systemPrompt = customSystem;
  if (!systemPrompt) {
    if (func === 'spirit' && archetype) {
      systemPrompt = SYSTEM_PROMPTS.spirit[archetype];
    } else {
      systemPrompt = SYSTEM_PROMPTS[func]?.default || "Tu es un assistant utile et bienveillant.";
    }
  }

  // Construire les messages
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10),
    { role: 'user', content: userMessage },
  ];

  // Appeler le provider
  try {
    const providerConfig = PROVIDERS[provider];
    const model = providerConfig.models.default;
    let content = '';

    switch (provider) {
      case 'groq':
        content = await callGroq(messages, model, apiKey);
        break;
      case 'openrouter':
        content = await callOpenRouter(messages, model, apiKey);
        break;
      case 'openai':
        content = await callOpenAI(messages, model, apiKey);
        break;
      case 'huggingface':
        content = await callHuggingFace(messages, model, apiKey);
        break;
      case 'gemini':
        content = await callGemini(messages, model, apiKey);
        break;
      case 'zai':
        content = await callZai(messages, model, apiKey);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    if (!content) {
      throw new Error('Empty response from API');
    }

    return { success: true, content, provider };
  } catch (error) {
    console.error(`AI provider error (${provider}):`, error);

    // Utiliser le fallback si activé
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

// ============================================
// TEST CONNECTION
// ============================================

/**
 * Tester la connexion à un provider
 */
export async function testProviderConnection(provider: AIProvider, apiKey: string): Promise<{
  success: boolean;
  message: string;
}> {
  if (provider === 'local') {
    return { success: true, message: '✅ Mode local activé' };
  }

  const testMessages: ChatMessage[] = [
    { role: 'system', content: 'Tu es un assistant. Réponds brièvement.' },
    { role: 'user', content: 'Dis juste "OK" en français.' },
  ];

  try {
    let response = '';
    const providerConfig = PROVIDERS[provider];
    const model = providerConfig.models.fast || providerConfig.models.default;

    switch (provider) {
      case 'groq':
        response = await callGroq(testMessages, model, apiKey);
        break;
      case 'openrouter':
        response = await callOpenRouter(testMessages, model, apiKey);
        break;
      case 'openai':
        response = await callOpenAI(testMessages, model, apiKey);
        break;
      case 'huggingface':
        response = await callHuggingFace(testMessages, model, apiKey);
        break;
      case 'gemini':
        response = await callGemini(testMessages, model, apiKey);
        break;
      case 'zai':
        response = await callZai(testMessages, model, apiKey);
        break;
    }

    if (response) {
      return { success: true, message: `✅ Connexion réussie ! Réponse: ${response.substring(0, 50)}...` };
    }

    return { success: false, message: '❌ Réponse vide' };
  } catch (error) {
    return {
      success: false,
      message: `❌ ${error instanceof Error ? error.message : 'Erreur de connexion'}`,
    };
  }
}
