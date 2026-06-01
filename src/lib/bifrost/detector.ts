import { BifrostDecision, DetectionMode } from './types';

interface IntentPattern {
  moduleId: string;
  intent: string;
  patterns: RegExp[];
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    moduleId: 'nutrition',
    intent: 'recipe_search',
    patterns: [/recette|cuisiner|marmiton|750g|préparer.*plat|ingrédients? pour/i],
  },
  {
    moduleId: 'nutrition',
    intent: 'meal_log',
    patterns: [/ajoute.*repas|ajoute.*plat|mangé|mange|j'ai pris|aujourd'hui.*mang|enregistre.*repas|log.*meal|save.*meal/i],
  },
  {
    moduleId: 'nutrition',
    intent: 'meal_plan',
    patterns: [/plan.*repas|plan.*alimentaire|menu.*semaine|menu.*jour|planifie.*repas|programme.*repas|planning.*repas/i],
  },
  {
    moduleId: 'nutrition',
    intent: 'meal_suggestion',
    patterns: [/proposition.*repas|suggère.*manger|quoi.*manger|conseil.*manger|idée.*repas/i],
  },
  {
    moduleId: 'nutrition',
    intent: 'meal_plan_complex',
    patterns: [/recette.*programmer|programmer.*recette|programmer.*demain.*soir|courses.*intelligente|shopping.*assistant|liste.*course.*ia/i],
  },
  {
    moduleId: 'sport',
    intent: 'workout_log',
    patterns: [/log.*sport|enregistre.*sport|ajoute.*séance|sport.*min|sport.*heure|fait.*sport|séance.*sport/i],
  },
  {
    moduleId: 'sport',
    intent: 'workout_program',
    patterns: [/programme.*entraînement|générer.*workout|plan.*sport|créer.*séance|programme.*fitness|programme.*musculation/i],
  },
  {
    moduleId: 'sport',
    intent: 'workout_quick',
    patterns: [/séance.*rapide|workout.*rapide|express.*sport|entraînement.*express/i],
  },
  {
    moduleId: 'sport',
    intent: 'exercise_query',
    patterns: [/exercice.*pour|exercice.*muscle|muscle.*dos|muscle.*bras|muscle.*jambes|exercice.*dos|exercice.*bras/i],
  },
  {
    moduleId: 'sport',
    intent: 'sport_advice',
    patterns: [/conseil.*sport|astuce.*entraînement|motivation.*sport|récupération.*sport|progression.*sport/i],
  },
  {
    moduleId: 'organisation',
    intent: 'task_create',
    patterns: [/je dois|je vais.*(faire|aller|prendre)|il faut que|ajoute.*tâche|ajoute.*tache|crée.*tâche|cree.*tache|nouvelle.*tâche|nouvelle.*tache|todo|à faire|a faire/i],
  },
  {
    moduleId: 'organisation',
    intent: 'event_create',
    patterns: [/rendez-vous|rdv|réunion|reunion|meeting|crée.*événement|cree.*evenement|planifier.*rdv|calendrier|agenda|programme.*journée|programme.*journee/i],
  },
  {
    moduleId: 'organisation',
    intent: 'goal_create',
    patterns: [/nouvel objectif|nouveau but|je veux.*(atteindre|devenir|accomplir)|créer.*objectif|cree.*objectif/i],
  },
  {
    moduleId: 'organisation',
    intent: 'org_advice',
    patterns: [/conseil.*organisat|astuce.*productiv|prioris|méthode.*travail|methode.*travail|gestion.*temps|organisation/i],
  },
];

function lightningDetect(message: string): BifrostDecision | null {
  const lower = message.toLowerCase().trim();
  if (!lower || lower.length < 3) return null;

  for (const entry of INTENT_PATTERNS) {
    for (const pattern of entry.patterns) {
      if (pattern.test(lower)) {
        return {
          intent: entry.intent,
          moduleId: entry.moduleId,
          confidence: 'high',
          reasoning: `Pattern match: ${pattern.source}`,
        };
      }
    }
  }

  return null;
}

async function deepDetect(
  message: string,
  context?: { agentName?: string; role?: string }
): Promise<BifrostDecision | null> {
  try {
    const { aiChat } = await import('@/lib/ai-provider');

    const agentContext = context?.agentName
      ? `\nContexte agent: ${context.agentName} (${context.role || 'assistant'})`
      : '';

    const prompt = `Analyse le message utilisateur et classifie son intention.

Message: "${message}"${agentContext}

Modules disponibles:
- nutrition: repas, recettes, plan alimentaire, courses
- sport: entraînement, exercices, programmes sportifs, séances
- organisation: tâches, rendez-vous, événements, objectifs, productivité
- (aucun): conversation générale, questions, recherche web

Retourne UNIQUEMENT un objet JSON:
{ "moduleId": "nutrition"|"sport"|"organisation"|null, "intent": "description_courte", "confidence": "high"|"medium"|"low", "reasoning": "10 mots max" }`;

    const result = await aiChat(prompt, {
      func: 'chat',
      systemPrompt: 'Tu es un classifieur d\'intention. Réponds UNIQUEMENT avec le JSON demandé.',
    });

    if (!result.success || !result.content) return null;

    const cleaned = result.content
      .replace(/```json\s*/g, '')
      .replace(/\s*```/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);
    if (!parsed.moduleId || !['nutrition', 'sport', 'organisation'].includes(parsed.moduleId)) return null;

    return {
      intent: parsed.intent || 'unknown',
      moduleId: parsed.moduleId,
      confidence: parsed.confidence || 'medium',
      reasoning: parsed.reasoning,
    };
  } catch {
    return null;
  }
}

export async function detect(
  message: string,
  mode: DetectionMode = 'lightning',
  context?: { agentName?: string; role?: string }
): Promise<BifrostDecision | null> {
  if (mode === 'lightning') {
    const result = lightningDetect(message);
    if (result) return result;
  }

  if (mode === 'deep') {
    return deepDetect(message, context);
  }

  return null;
}

export { lightningDetect, deepDetect };
