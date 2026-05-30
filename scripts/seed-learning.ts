/**
 * Script d'initialisation et de test MindLife
 * Seed les patterns et recettes exemples
 */

import { db } from '../src/lib/db';

const DEFAULT_USER_ID = 'mindlife-user';

// Patterns de base pour chaque persona
const PATTERNS = [
  // === ASSISTANT GÉNÉRAL ===
  { persona: 'assistant', trigger: 'bonjour', response: 'Bonjour ! 👋 Je suis ton assistant MindLife. Comment puis-je t\'aider aujourd\'hui ?', priority: 100 },
  { persona: 'assistant', trigger: 'merci', response: 'Avec plaisir ! N\'hésite pas si tu as d\'autres questions. 😊', priority: 90 },
  { persona: 'assistant', trigger: 'aide', response: 'Je peux t\'aider avec :\n• 📋 Tes tâches et objectifs\n• 📅 Ton calendrier\n• 🍽️ Des idées de repas\n• 🏋️ Des conseils sport\n• 🧘 Des conseils bien-être\n\nQue souhaites-tu faire ?', priority: 95 },
  { persona: 'assistant', trigger: 'tâche', response: 'Tu veux créer une nouvelle tâche ? Dis-moi son nom et je peux t\'aider à l\'organiser.', priority: 80 },
  { persona: 'assistant', trigger: 'objectif', response: 'Définir un objectif est la première étape vers le succès ! Quel objectif veux-tu atteindre ?', priority: 80 },

  // === COACH SPORT ===
  { persona: 'coach', trigger: 'fatigué', response: 'Écoute ton corps ! 💪 Une récupération active peut être bénéfique. Que penses-tu d\'une marche de 20 min ou de quelques étirements légers ?', priority: 85 },
  { persona: 'coach', trigger: 'motivation', response: 'La motivation vient en faisant ! 🏋️ Commence petit : 10 min d\'exercice, c\'est déjà une victoire. Quel mouvement tu pourrais faire maintenant ?', priority: 90 },
  { persona: 'coach', trigger: 'entraînement', response: 'Parfait ! On va se bouger ! 🔥 Dis-moi combien de temps tu as et quel muscle tu veux travailler.', priority: 85 },
  { persona: 'coach', trigger: 'muscle', response: 'La prise de masse nécessite : 1️⃣ Entraînement progressif 2️⃣ Protéines suffisantes 3️⃣ Repos optimal. Tu fais quoi actuellement ?', priority: 80 },

  // === NUTRITION ===
  { persona: 'nutrition', trigger: 'recette', response: 'J\'adore trouver de nouvelles recettes ! 🍽️ Tu cherches quelque chose de particulier ? (petit-déj, déjeuner, dîner, rapide, healthy...)', priority: 85 },
  { persona: 'nutrition', trigger: 'protéine', response: 'Les protéines sont essentielles ! 🥩 Sources : viande, poisson, œufs, légumineuses, tofu. Combien de grammes vise-tu par jour ?', priority: 80 },
  { persona: 'nutrition', trigger: 'perte de poids', response: 'Pour perdre du poids durablement : 🥗 Déficit calorique modéré, 🏃 Activité physique régulière, 😴 Sommeil suffisant. On établit un plan ensemble ?', priority: 90 },
  { persona: 'nutrition', trigger: 'petit-déjeuner', response: 'Un bon petit-déj équilibre : 🥚 Protéines + 🥣 Glucides complexes + 🥑 Lipides sains. Exemple : œufs + flocons d\'avoine + fruits. Ça te dit ?', priority: 80 },

  // === PRODUCTIVITÉ ===
  { persona: 'productivity', trigger: 'procrastination', response: 'La procrastination nous atteint tous ! 🎯 Technique : commence par 5 min seulement. Souvent, le plus dur est de démarrer. Quelle tâche te fait peur ?', priority: 90 },
  { persona: 'productivity', trigger: 'priorité', response: 'Priorise avec la matrice Eisenhower : 🔴 Urgent + Important → Faire maintenant, 🟡 Important → Planifier. Quelles sont tes tâches du jour ?', priority: 85 },
  { persona: 'productivity', trigger: 'temps', response: 'Gérer son temps = gérer sa vie. ⏰ Essaie la technique Pomodoro : 25 min de focus, 5 min de pause. Tu veux essayer ?', priority: 80 },

  // === BIEN-ÊTRE ===
  { persona: 'wellness', trigger: 'stress', response: 'Le stress est un signal. 🧘 Respire profondément 3 fois : inspire 4s, retiens 4s, expire 6s. Qu\'est-ce qui te stresse en ce moment ?', priority: 95 },
  { persona: 'wellness', trigger: 'anxieux', response: 'L\'anxiété est normale. 💗 Tu n\'es pas tes pensées. Prends un moment pour t\'ancrer : nomme 5 choses que tu vois, 4 que tu entends, 3 que tu touches.', priority: 90 },
  { persona: 'wellness', trigger: 'dormir', response: 'Le sommeil est fondamental. 😴 Conseils : écran off 1h avant, chambre fraîche (18-20°C), routine relaxante. Tu dors combien d\'heures ?', priority: 85 },
  { persona: 'wellness', trigger: 'méditation', response: 'La méditation transforme. 🧘‍♀️ Commence par 3 min : assis, yeux fermés, concentre-toi sur ta respiration. Tu médites déjà ou c\'est nouveau ?', priority: 80 },
];

// Recettes exemples
const RECIPES = [
  { name: 'Salade César', ingredients: ['Laitue romaine', 'Croûtons', 'Parmesan', 'Sauce césar', 'Poulet'], prepTime: 15, category: 'salade', calories: 350, protein: 25 },
  { name: 'Poulet grillé aux herbes', ingredients: ['Blancs de poulet', 'Herbes de Provence', 'Huile d\'olive', 'Ail'], prepTime: 40, cookTime: 12, category: 'plat', calories: 280, protein: 35 },
  { name: 'Smoothie énergisant', ingredients: ['Banane', 'Épinards', 'Lait d\'amande', 'Beurre de cacahuète'], prepTime: 5, category: 'petit-dejeuner', calories: 320, protein: 12 },
  { name: 'Bowl quinoa légumes', ingredients: ['Quinoa', 'Avocat', 'Pois chiches', 'Tomates', 'Concombre'], prepTime: 20, category: 'plat', calories: 420, protein: 15 },
  { name: 'Omelette légumes', ingredients: ['Œufs', 'Poivrons', 'Courgettes', 'Oignons', 'Fromage'], prepTime: 5, cookTime: 10, category: 'petit-dejeuner', calories: 280, protein: 18 },
];

async function seedPatterns() {
  console.log('📋 Seeding patterns...');
  let count = 0;

  for (const pattern of PATTERNS) {
    try {
      const existing = await db.personaPattern.findFirst({
        where: { persona: pattern.persona, trigger: pattern.trigger, userId: null },
      });

      if (!existing) {
        await db.personaPattern.create({
          data: {
            id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            persona: pattern.persona,
            trigger: pattern.trigger,
            triggerType: 'keyword',
            response: pattern.response,
            priority: pattern.priority,
            useCount: 0,
            avgRating: 0,
            isActive: true,
            source: 'system',
          },
        });
        count++;
      }
    } catch (error) {
      console.error(`Error seeding pattern ${pattern.trigger}:`, error);
    }
  }

  console.log(`✅ ${count} patterns ajoutés`);
  return count;
}

async function seedRecipes() {
  console.log('🍽️ Seeding recipes...');
  let count = 0;

  for (const recipe of RECIPES) {
    try {
      const existing = await db.scrapedRecipe.findFirst({
        where: { name: recipe.name },
      });

      if (!existing) {
        await db.scrapedRecipe.create({
          data: {
            id: `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: recipe.name,
            ingredients: JSON.stringify(recipe.ingredients),
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            sourceUrl: 'local://example',
            sourceName: 'mindlife',
            category: recipe.category,
            calories: recipe.calories,
            protein: recipe.protein,
            isActive: true,
          },
        });
        count++;
      }
    } catch (error) {
      console.error(`Error seeding recipe ${recipe.name}:`, error);
    }
  }

  console.log(`✅ ${count} recettes ajoutées`);
  return count;
}

async function main() {
  console.log('\n🚀 Initialisation MindLife...\n');

  try {
    const patternsCount = await seedPatterns();
    const recipesCount = await seedRecipes();

    console.log('\n📊 Résumé:');
    console.log(`   Patterns: ${patternsCount} nouveaux`);
    console.log(`   Recettes: ${recipesCount} nouvelles`);

    // Vérification
    const totalPatterns = await db.personaPattern.count();
    const totalRecipes = await db.scrapedRecipe.count();

    console.log(`\n✅ Total en BDD:`);
    console.log(`   Patterns: ${totalPatterns}`);
    console.log(`   Recettes: ${totalRecipes}`);

    console.log('\n🎉 Initialisation terminée !\n');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
