/**
 * Système de Patterns pour Personas - SANS LLM
 * L'application apprend et évolue avec l'utilisateur
 */

import { db } from '@/lib/db';

// ============================================
// TYPES
// ============================================

export type PersonaType = 'assistant' | 'coach' | 'nutrition' | 'productivity' | 'wellness';
export type TriggerType = 'keyword' | 'intent' | 'regex';
export type PatternSource = 'system' | 'user' | 'scraper' | 'learned';

export interface Pattern {
  id: string;
  persona: PersonaType;
  trigger: string;
  triggerType: TriggerType;
  response: string;
  context?: Record<string, any>;
  priority: number;
  useCount: number;
  avgRating: number;
  isActive: boolean;
  source: PatternSource;
  userId?: string;
}

export interface Interaction {
  userId: string;
  persona: PersonaType;
  userMessage: string;
  botResponse: string;
  triggerMatch?: string;
  rating?: number;
  source: 'pattern' | 'fallback' | 'llm' | 'scraper';
  context?: Record<string, any>;
}

// ============================================
// PATTERNS DE BASE (SEED)
// ============================================

const DEFAULT_PATTERNS: Omit<Pattern, 'id'>[] = [
  // === ASSISTANT GÉNÉRAL ===
  {
    persona: 'assistant',
    trigger: 'bonjour',
    triggerType: 'keyword',
    response: 'Bonjour ! 👋 Je suis ton assistant MindLife. Comment puis-je t\'aider aujourd\'hui ?',
    priority: 100,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
  {
    persona: 'assistant',
    trigger: 'merci',
    triggerType: 'keyword',
    response: 'Avec plaisir ! N\'hésite pas si tu as d\'autres questions. 😊',
    priority: 90,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
  {
    persona: 'assistant',
    trigger: 'aide',
    triggerType: 'keyword',
    response: 'Je peux t\'aider avec :\n• 📋 Tes tâches et objectifs\n• 📅 Ton calendrier\n• 🍽️ Des idées de repas\n• 🏋️ Des conseils sport\n• 🧘 Des conseils bien-être\n\nQue souhaites-tu faire ?',
    priority: 95,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
  {
    persona: 'assistant',
    trigger: 'tâche',
    triggerType: 'keyword',
    response: 'Tu veux créer une nouvelle tâche ? Dis-moi son nom et je peux t\'aider à l\'organiser.',
    priority: 80,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
  {
    persona: 'assistant',
    trigger: 'objectif',
    triggerType: 'keyword',
    response: 'Définir un objectif est la première étape vers le succès ! Quel objectif veux-tu atteindre ?',
    priority: 80,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },

  // === COACH SPORT ===
  {
    persona: 'coach',
    trigger: 'fatigué',
    triggerType: 'keyword',
    response: 'Écoute ton corps ! 💪 Une récupération active peut être bénéfique. Que penses-tu d\'une marche de 20 min ou de quelques étirements légers ?',
    priority: 85,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
  {
    persona: 'coach',
    trigger: 'motivation',
    triggerType: 'keyword',
    response: 'La motivation vient en faisant ! 🏋️ Commence petit : 10 min d\'exercice, c\'est déjà une victoire. Quel mouvement tu pourrais faire maintenant ?',
    priority: 90,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
  {
    persona: 'coach',
    trigger: 'entraînement',
    triggerType: 'keyword',
    response: 'Parfait ! On va se bouger ! 🔥 Dis-moi combien de temps tu as et quel muscle tu veux travailler.',
    priority: 85,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
  {
    persona: 'coach',
    trigger: 'muscle',
    triggerType: 'keyword',
    response: 'La prise de masse nécessite : 1️⃣ Entraînement progressif 2️⃣ Protéines suffisantes 3️⃣ Repos optimal. Tu fais quoi actuellement ?',
    priority: 80,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },

  // === NUTRITION ===
  {
    persona: 'nutrition',
    trigger: 'recette',
    triggerType: 'keyword',
    response: 'J\'adore trouver de nouvelles recettes ! 🍽️ Tu cherches quelque chose de particulier ? (petit-déj, déjeuner, dîner, rapide, healthy...)',
    priority: 85,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
  {
    persona: 'nutrition',
    trigger: 'protéine',
    triggerType: 'keyword',
    response: 'Les protéines sont essentielles ! 🥩 Sources : viande, poisson, œufs, légumineuses, tofu. Combien de grammes vise-tu par jour ?',
    priority: 80,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
  {
    persona: 'nutrition',
    trigger: 'perte de poids',
    triggerType: 'keyword',
    response: 'Pour perdre du poids durablement : 🥗 Déficit calorique modéré, 🏃 Activité physique régulière, 😴 Sommeil suffisant. On établit un plan ensemble ?',
    priority: 90,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
  {
    persona: 'nutrition',
    trigger: 'petit-déjeuner',
    triggerType: 'keyword',
    response: 'Un bon petit-déj équilibre : 🥚 Protéines + 🥣 Glucides complexes + 🥑 Lipides sains. Exemple : œufs + flocons d\'avoine + fruits. Ça te dit ?',
    priority: 80,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },

  // === PRODUCTIVITÉ ===
  {
    persona: 'productivity',
    trigger: 'procrastination',
    triggerType: 'keyword',
    response: 'La procrastination nous atteint tous ! 🎯 Technique : commence par 5 min seulement. Souvent, le plus dur est de démarrer. Quelle tâche te fait peur ?',
    priority: 90,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
  {
    persona: 'productivity',
    trigger: 'priorité',
    triggerType: 'keyword',
    response: 'Priorise avec la matrice Eisenhower : 🔴 Urgent + Important → Faire maintenant, 🟡 Important → Planifier. Quelles sont tes tâches du jour ?',
    priority: 85,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
  {
    persona: 'productivity',
    trigger: 'temps',
    triggerType: 'keyword',
    response: 'Gérer son temps = gérer sa vie. ⏰ Essaie la technique Pomodoro : 25 min de focus, 5 min de pause. Tu veux essayer ?',
    priority: 80,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },

  // === BIEN-ÊTRE ===
  {
    persona: 'wellness',
    trigger: 'stress',
    triggerType: 'keyword',
    response: 'Le stress est un signal. 🧘 Respire profondément 3 fois : inspire 4s, retiens 4s, expire 6s. Qu\'est-ce qui te stresse en ce moment ?',
    priority: 95,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
  {
    persona: 'wellness',
    trigger: 'anxieux',
    triggerType: 'keyword',
    response: 'L\'anxiété est normale. 💗 Tu n\'es pas tes pensées. Prends un moment pour t\'ancrer : nomme 5 choses que tu vois, 4 que tu entends, 3 que tu touches.',
    priority: 90,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
  {
    persona: 'wellness',
    trigger: 'dormir',
    triggerType: 'keyword',
    response: 'Le sommeil est fondamental. 😴 Conseils : écran off 1h avant, chambre fraîche (18-20°C), routine relaxante. Tu dors combien d\'heures ?',
    priority: 85,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
  {
    persona: 'wellness',
    trigger: 'méditation',
    triggerType: 'keyword',
    response: 'La méditation transforme. 🧘‍♀️ Commence par 3 min : assis, yeux fermés, concentre-toi sur ta respiration. Tu médites déjà ou c\'est nouveau ?',
    priority: 80,
    useCount: 0,
    avgRating: 0,
    isActive: true,
    source: 'system',
  },
];

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Initialiser les patterns par défaut
 */
export async function seedDefaultPatterns(): Promise<number> {
  let count = 0;

  for (const pattern of DEFAULT_PATTERNS) {
    try {
      const existing = await db.personaPattern.findFirst({
        where: {
          persona: pattern.persona,
          trigger: pattern.trigger,
          userId: null,
        },
      });

      if (!existing) {
        await db.personaPattern.create({
          data: {
            id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...pattern,
          },
        });
        count++;
      }
    } catch (error) {
      console.error(`Error seeding pattern ${pattern.trigger}:`, error);
    }
  }

  return count;
}

/**
 * Trouver le meilleur pattern pour un message
 */
export async function findBestPattern(
  message: string,
  persona: PersonaType,
  userId?: string
): Promise<Pattern | null> {
  const normalizedMessage = message.toLowerCase().trim();

  const patterns = await db.personaPattern.findMany({
    where: {
      persona,
      isActive: true,
      OR: [
        { userId },
        { userId: null },
      ],
    },
    orderBy: [
      { priority: 'desc' },
      { avgRating: 'desc' },
      { useCount: 'desc' },
    ],
  });

  // Recherche par mot-clé
  for (const pattern of patterns) {
    if (pattern.triggerType === 'keyword') {
      if (normalizedMessage.includes(pattern.trigger.toLowerCase())) {
        return pattern as unknown as Pattern;
      }
    }
  }

  // Recherche par similarité (approximative)
  for (const pattern of patterns) {
    const triggerWords = pattern.trigger.toLowerCase().split(/\s+/);
    const messageWords = normalizedMessage.split(/\s+/);

    const matchCount = triggerWords.filter(word =>
      messageWords.some(mWord => mWord.includes(word) || word.includes(mWord))
    ).length;

    if (matchCount >= Math.ceil(triggerWords.length / 2)) {
      return pattern as unknown as Pattern;
    }
  }

  return null;
}

/**
 * Enregistrer une interaction pour l'apprentissage
 */
export async function recordInteraction(interaction: Interaction): Promise<void> {
  try {
    await db.interactionHistory.create({
      data: {
        id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: interaction.userId,
        persona: interaction.persona,
        userMessage: interaction.userMessage,
        botResponse: interaction.botResponse,
        triggerMatch: interaction.triggerMatch,
        rating: interaction.rating,
        source: interaction.source,
        context: interaction.context ? JSON.stringify(interaction.context) : null,
      },
    });

    if (interaction.triggerMatch) {
      await db.personaPattern.updateMany({
        where: { id: interaction.triggerMatch },
        data: { useCount: { increment: 1 } },
      });
    }
  } catch (error) {
    console.error('Error recording interaction:', error);
  }
}

/**
 * Noter une interaction (pour l'apprentissage)
 */
export async function rateInteraction(
  interactionId: string,
  rating: number
): Promise<void> {
  try {
    const interaction = await db.interactionHistory.findUnique({
      where: { id: interactionId },
    });

    if (!interaction) return;

    await db.interactionHistory.update({
      where: { id: interactionId },
      data: { rating },
    });

    if (interaction.triggerMatch) {
      const ratings = await db.interactionHistory.findMany({
        where: {
          triggerMatch: interaction.triggerMatch,
          rating: { not: null },
        },
        select: { rating: true },
      });

      if (ratings.length > 0) {
        const avgRating = ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length;

        await db.personaPattern.update({
          where: { id: interaction.triggerMatch },
          data: { avgRating },
        });
      }
    }
  } catch (error) {
    console.error('Error rating interaction:', error);
  }
}

/**
 * Apprendre un nouveau pattern depuis une interaction bien notée
 */
export async function learnFromInteraction(
  interactionId: string,
  userId: string
): Promise<Pattern | null> {
  try {
    const interaction = await db.interactionHistory.findUnique({
      where: { id: interactionId },
    });

    if (!interaction || interaction.rating === null || interaction.rating < 4) {
      return null;
    }

    const existing = await db.personaPattern.findFirst({
      where: {
        persona: interaction.persona as PersonaType,
        trigger: interaction.userMessage.toLowerCase().slice(0, 50),
        userId,
      },
    });

    if (existing) {
      await db.personaPattern.update({
        where: { id: existing.id },
        data: {
          priority: { increment: 5 },
          avgRating: interaction.rating,
        },
      });
      return existing as unknown as Pattern;
    }

    const newPattern = await db.personaPattern.create({
      data: {
        id: `pattern-learned-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        persona: interaction.persona as PersonaType,
        trigger: interaction.userMessage.toLowerCase().slice(0, 50),
        triggerType: 'keyword',
        response: interaction.botResponse,
        priority: 50,
        useCount: 1,
        avgRating: interaction.rating,
        isActive: true,
        source: 'learned',
        userId,
      },
    });

    return newPattern as unknown as Pattern;
  } catch (error) {
    console.error('Error learning from interaction:', error);
    return null;
  }
}

/**
 * Générer une réponse SANS LLM
 */
export async function generateResponse(
  message: string,
  persona: PersonaType,
  userId: string,
  context?: Record<string, any>
): Promise<{
  response: string;
  pattern: Pattern | null;
  source: 'pattern' | 'fallback';
}> {
  const pattern = await findBestPattern(message, persona, userId);

  if (pattern) {
    await recordInteraction({
      userId,
      persona,
      userMessage: message,
      botResponse: pattern.response,
      triggerMatch: pattern.id,
      source: 'pattern',
      context,
    });

    return {
      response: pattern.response,
      pattern,
      source: 'pattern',
    };
  }

  const fallbackResponses: Record<PersonaType, string[]> = {
    assistant: [
      "Je suis là pour t'aider. Peux-tu me donner plus de détails ?",
      "Intéressant ! Dis-m'en plus pour que je puisse t'aider au mieux.",
      "Je note ta demande. N'hésite pas à préciser ce que tu recherches.",
    ],
    coach: [
      "Chaque effort compte ! 💪 Dis-moi plus sur ton objectif.",
      "On va trouver une solution ensemble. Quel est ton principal défi ?",
      "Le mouvement, c'est la vie ! Qu'est-ce qui te motive ?",
    ],
    nutrition: [
      "Bien manger, c'est un voyage ! 🍽️ Tu cherches quoi exactement ?",
      "La nutrition est personnelle. Dis-moi tes préférences alimentaires.",
      "Une question nutrition ? Je suis là pour t'aider à trouver l'équilibre.",
    ],
    productivity: [
      "Optimisons ensemble ! 🎯 Quel est ton blocage actuel ?",
      "L'organisation est la clé. Comment puis-je t'aider à avancer ?",
      "Une tâche à prioriser ? Je peux t'aider à voir clair.",
    ],
    wellness: [
      "Prends soin de toi. 💗 Qu'est-ce qui te préoccupe ?",
      "Ton bien-être compte. Dis-moi ce dont tu as besoin.",
      "Écoute ton corps et ton esprit. Comment te sens-tu vraiment ?",
    ],
  };

  const responses = fallbackResponses[persona];
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  await recordInteraction({
    userId,
    persona,
    userMessage: message,
    botResponse: randomResponse,
    source: 'fallback',
    context,
  });

  return {
    response: randomResponse,
    pattern: null,
    source: 'fallback',
  };
}

/**
 * Obtenir les statistiques d'apprentissage
 */
export async function getLearningStats(userId: string): Promise<{
  totalInteractions: number;
  patternsLearned: number;
  avgRating: number;
  topTriggers: { trigger: string; count: number }[];
}> {
  const interactions = await db.interactionHistory.count({
    where: { userId },
  });

  const patternsLearned = await db.personaPattern.count({
    where: { userId, source: 'learned' },
  });

  const ratedInteractions = await db.interactionHistory.findMany({
    where: { userId, rating: { not: null } },
    select: { rating: true },
  });

  const avgRating = ratedInteractions.length > 0
    ? ratedInteractions.reduce((sum, i) => sum + (i.rating || 0), 0) / ratedInteractions.length
    : 0;

  const recentInteractions = await db.interactionHistory.findMany({
    where: { userId, triggerMatch: { not: null } },
    select: { triggerMatch: true },
    take: 100,
  });

  const triggerCounts: Record<string, number> = {};
  for (const i of recentInteractions) {
    if (i.triggerMatch) {
      triggerCounts[i.triggerMatch] = (triggerCounts[i.triggerMatch] || 0) + 1;
    }
  }

  const topTriggers = Object.entries(triggerCounts)
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalInteractions: interactions,
    patternsLearned,
    avgRating,
    topTriggers,
  };
}
