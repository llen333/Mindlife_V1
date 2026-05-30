/**
 * Seed les patterns par défaut pour les personas
 * À exécuter après le setup initial
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_PATTERNS = [
  // === ASSISTANT GÉNÉRAL ===
  {
    id: `pattern-assistant-1`,
    persona: 'assistant',
    trigger: 'bonjour',
    triggerType: 'keyword',
    response: "Bonjour ! 👋 Je suis ton assistant MindLife. Comment puis-je t'aider aujourd'hui ?",
    priority: 100,
    isActive: true,
    source: 'system',
  },
  {
    id: `pattern-assistant-2`,
    persona: 'assistant',
    trigger: 'merci',
    triggerType: 'keyword',
    response: "Avec plaisir ! N'hésite pas si tu as d'autres questions. 😊",
    priority: 90,
    isActive: true,
    source: 'system',
  },
  {
    id: `pattern-assistant-3`,
    persona: 'assistant',
    trigger: 'aide',
    triggerType: 'keyword',
    response: "Je peux t'aider avec :\n• 📋 Tes tâches et objectifs\n• 📅 Ton calendrier\n• 🍽️ Des idées de repas\n• 🏋️ Des conseils sport\n• 🧘 Des conseils bien-être\n\nQue souhaites-tu faire ?",
    priority: 95,
    isActive: true,
    source: 'system',
  },
  {
    id: `pattern-assistant-4`,
    persona: 'assistant',
    trigger: 'tâche',
    triggerType: 'keyword',
    response: "Tu veux créer une nouvelle tâche ? Dis-moi son nom et je peux t'aider à l'organiser.",
    priority: 80,
    isActive: true,
    source: 'system',
  },
  {
    id: `pattern-assistant-5`,
    persona: 'assistant',
    trigger: 'objectif',
    triggerType: 'keyword',
    response: "Définir un objectif est la première étape vers le succès ! Quel objectif veux-tu atteindre ?",
    priority: 80,
    isActive: true,
    source: 'system',
  },

  // === COACH SPORT ===
  {
    id: `pattern-coach-1`,
    persona: 'coach',
    trigger: 'fatigué',
    triggerType: 'keyword',
    response: "Écoute ton corps ! 💪 Une récupération active peut être bénéfique. Que penses-tu d'une marche de 20 min ou de quelques étirements légers ?",
    priority: 85,
    isActive: true,
    source: 'system',
  },
  {
    id: `pattern-coach-2`,
    persona: 'coach',
    trigger: 'motivation',
    triggerType: 'keyword',
    response: "La motivation vient en faisant ! 🏋️ Commence petit : 10 min d'exercice, c'est déjà une victoire. Quel mouvement tu pourrais faire maintenant ?",
    priority: 90,
    isActive: true,
    source: 'system',
  },
  {
    id: `pattern-coach-3`,
    persona: 'coach',
    trigger: 'entraînement',
    triggerType: 'keyword',
    response: "Parfait ! On va se bouger ! 🔥 Dis-moi combien de temps tu as et quel muscle tu veux travailler.",
    priority: 85,
    isActive: true,
    source: 'system',
  },
  {
    id: `pattern-coach-4`,
    persona: 'coach',
    trigger: 'muscle',
    triggerType: 'keyword',
    response: "La prise de masse nécessite : 1️⃣ Entraînement progressif 2️⃣ Protéines suffisantes 3️⃣ Repos optimal. Tu fais quoi actuellement ?",
    priority: 80,
    isActive: true,
    source: 'system',
  },

  // === NUTRITION ===
  {
    id: `pattern-nutrition-1`,
    persona: 'nutrition',
    trigger: 'recette',
    triggerType: 'keyword',
    response: "J'adore trouver de nouvelles recettes ! 🍽️ Tu cherches quelque chose de particulier ? (petit-déj, déjeuner, dîner, rapide, healthy...)",
    priority: 85,
    isActive: true,
    source: 'system',
  },
  {
    id: `pattern-nutrition-2`,
    persona: 'nutrition',
    trigger: 'protéine',
    triggerType: 'keyword',
    response: "Les protéines sont essentielles ! 🥩 Sources : viande, poisson, œufs, légumineuses, tofu. Combien de grammes vise-tu par jour ?",
    priority: 80,
    isActive: true,
    source: 'system',
  },
  {
    id: `pattern-nutrition-3`,
    persona: 'nutrition',
    trigger: 'perte de poids',
    triggerType: 'keyword',
    response: "Pour perdre du poids durablement : 🥗 Déficit calorique modéré, 🏃 Activité physique régulière, 😴 Sommeil suffisant. On établit un plan ensemble ?",
    priority: 90,
    isActive: true,
    source: 'system',
  },
  {
    id: `pattern-nutrition-4`,
    persona: 'nutrition',
    trigger: 'petit-déjeuner',
    triggerType: 'keyword',
    response: "Un bon petit-déj équilibre : 🥚 Protéines + 🥣 Glucides complexes + 🥑 Lipides sains. Exemple : œufs + flocons d'avoine + fruits. Ça te dit ?",
    priority: 80,
    isActive: true,
    source: 'system',
  },

  // === PRODUCTIVITÉ ===
  {
    id: `pattern-productivity-1`,
    persona: 'productivity',
    trigger: 'procrastination',
    triggerType: 'keyword',
    response: "La procrastination nous atteint tous ! 🎯 Technique : commence par 5 min seulement. Souvent, le plus dur est de démarrer. Quelle tâche te fait peur ?",
    priority: 90,
    isActive: true,
    source: 'system',
  },
  {
    id: `pattern-productivity-2`,
    persona: 'productivity',
    trigger: 'priorité',
    triggerType: 'keyword',
    response: "Priorise avec la matrice Eisenhower : 🔴 Urgent + Important → Faire maintenant, 🟡 Important → Planifier. Quelles sont tes tâches du jour ?",
    priority: 85,
    isActive: true,
    source: 'system',
  },
  {
    id: `pattern-productivity-3`,
    persona: 'productivity',
    trigger: 'temps',
    triggerType: 'keyword',
    response: "Gérer son temps = gérer sa vie. ⏰ Essaie la technique Pomodoro : 25 min de focus, 5 min de pause. Tu veux essayer ?",
    priority: 80,
    isActive: true,
    source: 'system',
  },

  // === BIEN-ÊTRE ===
  {
    id: `pattern-wellness-1`,
    persona: 'wellness',
    trigger: 'stress',
    triggerType: 'keyword',
    response: "Le stress est un signal. 🧘 Respire profondément 3 fois : inspire 4s, retiens 4s, expire 6s. Qu'est-ce qui te stresse en ce moment ?",
    priority: 95,
    isActive: true,
    source: 'system',
  },
  {
    id: `pattern-wellness-2`,
    persona: 'wellness',
    trigger: 'anxieux',
    triggerType: 'keyword',
    response: "L'anxiété est normale. 💗 Tu n'es pas tes pensées. Prends un moment pour t'ancrer : nomme 5 choses que tu vois, 4 que tu entends, 3 que tu touches.",
    priority: 90,
    isActive: true,
    source: 'system',
  },
  {
    id: `pattern-wellness-3`,
    persona: 'wellness',
    trigger: 'dormir',
    triggerType: 'keyword',
    response: "Le sommeil est fondamental. 😴 Conseils : écran off 1h avant, chambre fraîche (18-20°C), routine relaxante. Tu dors combien d'heures ?",
    priority: 85,
    isActive: true,
    source: 'system',
  },
  {
    id: `pattern-wellness-4`,
    persona: 'wellness',
    trigger: 'méditation',
    triggerType: 'keyword',
    response: "La méditation transforme. 🧘‍♀️ Commence par 3 min : assis, yeux fermés, concentre-toi sur ta respiration. Tu médites déjà ou c'est nouveau ?",
    priority: 80,
    isActive: true,
    source: 'system',
  },
];

async function main() {
  console.log('🌱 Seeding patterns par défaut...');

  let created = 0;
  let skipped = 0;

  for (const pattern of DEFAULT_PATTERNS) {
    try {
      const existing = await prisma.personaPattern.findFirst({
        where: {
          persona: pattern.persona,
          trigger: pattern.trigger,
          userId: null,
        },
      });

      if (!existing) {
        await prisma.personaPattern.create({
          data: {
            ...pattern,
            useCount: 0,
            avgRating: 0,
          },
        });
        created++;
        console.log(`  ✅ Créé: ${pattern.persona}/${pattern.trigger}`);
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`  ❌ Erreur: ${pattern.persona}/${pattern.trigger}`, error);
    }
  }

  console.log(`\n📊 Résumé:`);
  console.log(`  - Patterns créés: ${created}`);
  console.log(`  - Patterns existants: ${skipped}`);
  console.log(`  - Total: ${created + skipped}`);
}

main()
  .catch((e) => {
    console.error('Erreur seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
