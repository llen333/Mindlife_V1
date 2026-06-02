import { db } from '@/lib/db';
import * as cheerio from 'cheerio';

export type MegaToolName = 'meal_plan_complex' | 'ai_shopping_assistant' | 'workout_generator';

export interface ToolDef {
  name: string;
  description: string;
  parameters: { type: 'object'; properties: Record<string, any>; required: string[] };
  execute: (args: Record<string, any>, ctx: { userId: string }) => Promise<string>;
}

function estimatePrice(ingredientName: string, quantity: string, unit: string): number {
  const priceMap: Record<string, number> = {
    'poulet': 12, 'bœuf': 15, 'poisson': 18, 'saumon': 20, 'thon': 22,
    'riz': 3, 'pâtes': 2, 'pommes de terre': 2, 'légumes': 4, 'tomates': 3,
    'fromage': 8, 'œufs': 4, 'lait': 2, 'beurre': 4, 'huile': 5,
    'farine': 2, 'sucre': 2, 'sel': 1, 'poivre': 3, 'ail': 1, 'oignon': 1
  };
  const lowerName = ingredientName.toLowerCase();
  for (const [key, price] of Object.entries(priceMap)) {
    if (lowerName.includes(key)) return price * (parseFloat(quantity) || 1) / 10;
  }
  return 2.0;
}

function estimateStepDuration(stepText: string): number {
  const lower = stepText.toLowerCase();
  if (lower.includes('cuire') || lower.includes('rôtir') || lower.includes('mijoter')) return 20;
  if (lower.includes('faire revenir') || lower.includes('saisir')) return 8;
  if (lower.includes('préparer') || lower.includes('laver') || lower.includes('éplucher')) return 10;
  if (lower.includes('servir') || lower.includes('dresser')) return 5;
  if (lower.includes('laisser reposer') || lower.includes('refroidir')) return 15;
  return 7;
}

function generateIngredientsFromTitle(title: string, count: number): any[] {
  const ingredients: any[] = [];
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('tarte') || lowerTitle.includes('pie')) {
    ingredients.push(
      { id: `gen-${Date.now()}-1`, name: 'Farine', quantity: '200', unit: 'g', checked: false, price: 1.50 },
      { id: `gen-${Date.now()}-2`, name: 'Beurre', quantity: '100', unit: 'g', checked: false, price: 2.00 },
      { id: `gen-${Date.now()}-3`, name: 'Œufs', quantity: '3', unit: 'pièces', checked: false, price: 2.00 },
      { id: `gen-${Date.now()}-4`, name: 'Sucre', quantity: '100', unit: 'g', checked: false, price: 1.00 }
    );
  } else if (lowerTitle.includes('poulet') || lowerTitle.includes('viande')) {
    ingredients.push(
      { id: `gen-${Date.now()}-1`, name: 'Viande principale', quantity: '400', unit: 'g', checked: false, price: 12.00 },
      { id: `gen-${Date.now()}-2`, name: "Huile d'olive", quantity: '30', unit: 'ml', checked: false, price: 1.50 },
      { id: `gen-${Date.now()}-3`, name: 'Ail', quantity: '3', unit: 'gousses', checked: false, price: 0.50 },
      { id: `gen-${Date.now()}-4`, name: 'Herbes aromatiques', quantity: '10', unit: 'g', checked: false, price: 1.00 }
    );
  } else if (lowerTitle.includes('paella') || lowerTitle.includes('riz')) {
    ingredients.push(
      { id: `gen-${Date.now()}-1`, name: 'Riz', quantity: '300', unit: 'g', checked: false, price: 3.00 },
      { id: `gen-${Date.now()}-2`, name: "Huile d'olive", quantity: '40', unit: 'ml', checked: false, price: 2.00 },
      { id: `gen-${Date.now()}-3`, name: 'Safran', quantity: '1', unit: 'pincée', checked: false, price: 3.00 },
      { id: `gen-${Date.now()}-4`, name: 'Légumes variés', quantity: '200', unit: 'g', checked: false, price: 4.00 }
    );
  } else {
    ingredients.push(
      { id: `gen-${Date.now()}-1`, name: 'Ingrédient principal', quantity: '300', unit: 'g', checked: false, price: 8.00 },
      { id: `gen-${Date.now()}-2`, name: "Huile d'olive", quantity: '30', unit: 'ml', checked: false, price: 1.50 },
      { id: `gen-${Date.now()}-3`, name: 'Sel et poivre', quantity: '1', unit: 'pincée', checked: false, price: 0.50 },
      { id: `gen-${Date.now()}-4`, name: 'Herbes fraîches', quantity: '10', unit: 'g', checked: false, price: 1.00 }
    );
  }
  return ingredients.slice(0, count);
}

function generateStepsFromTitle(title: string, count: number): any[] {
  const steps: any[] = [];
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('tarte') || lowerTitle.includes('pie')) {
    steps.push(
      { id: 1, instruction: 'Préparer la pâte en mélangeant la farine et le beurre.', duration: 10 },
      { id: 2, instruction: 'Étaler la pâte dans un moule à tarte et réfrigérer 30 minutes.', duration: 35 },
      { id: 3, instruction: 'Préparer la garniture selon la recette choisie.', duration: 15 },
      { id: 4, instruction: 'Verser la garniture sur la pâte et cuire au four à 180°C.', duration: 45 },
      { id: 5, instruction: 'Laisser refroidir avant de servir tiède ou froid.', duration: 30 }
    );
  } else if (lowerTitle.includes('poulet') || lowerTitle.includes('viande')) {
    steps.push(
      { id: 1, instruction: 'Préparer et assaisonner la viande avec sel, poivre et aromates.', duration: 10 },
      { id: 2, instruction: "Faire chauffer l'huile dans une poêle ou poêle à feu vif.", duration: 3 },
      { id: 3, instruction: 'Saisir la viande des deux côtés pour obtenir une belle couleur.', duration: 8 },
      { id: 4, instruction: 'Cuire à la température interne souhaitée (moyen à point).', duration: 15 },
      { id: 5, instruction: 'Laisser reposer la viande avant de la servir.', duration: 10 }
    );
  } else if (lowerTitle.includes('paella') || lowerTitle.includes('riz')) {
    steps.push(
      { id: 1, instruction: "Faire chauffer l'huile dans une poêle large et faire revenir l'ail.", duration: 5 },
      { id: 2, instruction: 'Ajouter le riz et le faire torréfier 2-3 minutes en remuant.', duration: 5 },
      { id: 3, instruction: 'Verser le bouillon chaud et le safran, couvrir et cuire à feu doux.', duration: 18 },
      { id: 4, instruction: "Laisser le riz absorber tout le liquide (ne pas remuer après les 5 premières min).", duration: 2 },
      { id: 5, instruction: 'Laisser reposer hors feu 5 minutes avant de servir.', duration: 7 }
    );
  } else {
    steps.push(
      { id: 1, instruction: 'Préparer tous les ingrédients et les disposer près de votre plan de travail.', duration: 8 },
      { id: 2, instruction: 'Chauffer votre matière grasse dans votre ustensile de cuisson.', duration: 3 },
      { id: 3, instruction: 'Cuire les ingrédients principaux selon les instructions de la recette.', duration: 20 },
      { id: 4, instruction: "Ajuster l'assaisonnement et terminer la cuisson.", duration: 10 },
      { id: 5, instruction: 'Présenter le plat et servir chaud avec les accompagnements.', duration: 7 }
    );
  }
  return steps.slice(0, count);
}

async function extractNutritionFromPage($: any) {
  const nutrition: any = {};
  const timeText = $('time, .time, [class*="time"], .prep-time, .cook-time').first().text();
  const timeMatch = timeText.match(/(\d+)\s*min/);
  if (timeMatch) {
    const prepMatch = timeText.match(/préparation.*?(\d+)\s*min/i);
    const cookMatch = timeText.match(/cuisson.*?(\d+)\s*min/i);
    nutrition.prepTime = prepMatch ? parseInt(prepMatch[1]) : Math.floor(parseInt(timeMatch[1]) / 2);
    nutrition.cookTime = cookMatch ? parseInt(cookMatch[1]) : Math.floor(parseInt(timeMatch[1]) / 2);
  }
  const imageUrl = $('img[class*="recipe"], img[class*="photo"], .recipe-image img, .main-image img').first().attr('src');
  nutrition.imageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `https://www.marmiton.org${imageUrl}`) : null;
  return nutrition;
}

function estimateCalories(ingredients: string[], servings: number): number {
  const calorieKeywords: Record<string, number> = {
    'riz': 130, 'pâtes': 220, 'pommes de terre': 77, 'pain': 265,
    'poulet': 165, 'boeuf': 250, 'poisson': 140, 'œufs': 70,
    'huile': 120, 'beurre': 100, 'lait': 60, 'fromage': 400,
    'tomate': 18, 'salade': 15, 'oignon': 40, 'ail': 4,
    'carotte': 41, 'brocoli': 34, 'avocat': 160
  };
  let totalCalories = 0;
  ingredients.forEach(ingredient => {
    const lower = ingredient.toLowerCase();
    for (const [key, calories] of Object.entries(calorieKeywords)) {
      if (lower.includes(key)) { totalCalories += calories; break; }
    }
  });
  return Math.round(totalCalories * servings / 4);
}

async function generateSmartShoppingList(ingredients: string[], budget?: number, servings: number = 4): Promise<string> {
  const uniqueIngredients = [...new Set(ingredients.map(i => i.toLowerCase()))];
  const categories: Record<string, string[]> = {
    'Légumes': [], 'Viandes & Poissons': [], 'Épices & Herbes': [],
    'Produits laitiers': [], 'Épicerie': [], 'Boissons': []
  };
  uniqueIngredients.forEach(ingredient => {
    if (ingredient.includes('oignon') || ingredient.includes('ail') || ingredient.includes('tomate') ||
        ingredient.includes('poivron') || ingredient.includes('carotte') || ingredient.includes('légume'))
      categories['Légumes'].push(ingredient);
    else if (ingredient.includes('poulet') || ingredient.includes('boeuf') || ingredient.includes('poisson') ||
             ingredient.includes('viande') || ingredient.includes('escalope'))
      categories['Viandes & Poissons'].push(ingredient);
    else if (ingredient.includes('sel') || ingredient.includes('poivre') || ingredient.includes('huile') ||
             ingredient.includes('beurre') || ingredient.includes('farine'))
      categories['Épicerie'].push(ingredient);
    else if (ingredient.includes('thym') || ingredient.includes('laurel') || ingredient.includes('herbe'))
      categories['Épices & Herbes'].push(ingredient);
    else if (ingredient.includes('lait') || ingredient.includes('fromage') || ingredient.includes('yaourt'))
      categories['Produits laitiers'].push(ingredient);
    else categories['Boissons'].push(ingredient);
  });
  let shoppingList = '';
  Object.entries(categories).forEach(([category, items]) => {
    if (items.length > 0) {
      shoppingList += `\n**${category} :**\n`;
      shoppingList += items.map(item => `• ${item}`).join('\n') + '\n';
    }
  });
  if (budget && budget < 30) {
    shoppingList += `\n💡 *Conseil budget : Privilégiez les légumes de saison et les protéines bon marché comme les œufs et les lentilles !*`;
  }
  return shoppingList;
}

function extractBaseItemsFromQuery(query: string): string[] {
  const items: string[] = [];
  const baseItems = ['sel', 'poivre', "huile d'olive", 'sucre', 'vinaigre', 'sel', 'poivre', 'huile', 'beurre', 'œufs'];
  if (query.includes('dîner') || query.includes('soir')) items.push('pain', 'vin', 'fromage');
  if (query.includes('déjeuner') || query.includes('midi')) items.push('pain', 'fromage', 'fruits');
  if (query.includes('petit-déjeuner') || query.includes('matin')) items.push('café', 'jus de fruits', 'céréales');
  return [...new Set([...items, ...baseItems.slice(0, 3)])];
}

async function generateOptimizedShoppingList(items: string[], budget?: number, preferences?: string): Promise<string> {
  let list = '';
  const categories = {
    '🥬 Légumes frais': items.filter(i => i.includes('tomate') || i.includes('oignon') || i.includes('légume')),
    '🥩 Viandes & Poissons': items.filter(i => i.includes('poulet') || i.includes('boeuf') || i.includes('poisson')),
    '🧀 Produits laitiers': items.filter(i => i.includes('lait') || i.includes('fromage')),
    '🍞 Épicerie': items.filter(i => i.includes('pain') || i.includes('huile') || i.includes('riz')),
    '🧂 Épices & Condiments': items.filter(i => i.includes('sel') || i.includes('poivre') || i.includes('herbe')),
  };
  Object.entries(categories).forEach(([category, items]) => {
    if (items.length > 0) {
      list += `${category}\n`;
      list += items.map(item => `• ${item}`).join('\n') + '\n';
    }
  });
  return list;
}

async function generatePersonalizedWorkout(params: any): Promise<string> {
  const { goal, level, duration, equipment, focusArea } = params;
  const exercisesByGoal: Record<string, string[]> = {
    force: ['Développé couché', 'Tractions', 'Squat', 'Soulevé de terre'],
    endurance: ['Course à pied', 'Vélo', 'Natation', 'Burpees'],
    musculation: ['Presse à cuisse', 'Curl biceps', 'Élévations latérales', 'Crunchs'],
    'perte de poids': ['Jumping jacks', 'Mountain climbers', 'Fentes marchées', 'Rameur'],
    santé: ['Marche rapide', 'Étirements', 'Yoga simple', 'Respiration contrôlée']
  };
  const exercises = exercisesByGoal[goal] || exercisesByGoal.musculation;
  return `
**Série d'échauffement (10 min) :**
- Marche rapide 5 min
- Étirements dynamiques 5 min

**Exercices principaux (${duration - 20} min) :**
${exercises.slice(0, 4).map((ex, i) => `${i + 1}. ${ex} - 3 séries de ${level === 'débutant' ? '10' : level === 'avancé' ? '15' : '12'} répétitions`).join('\n')}

**Série de récupération (10 min) :**
- Respiration profonde
- Étirements légers

*Intensité adaptée à votre niveau ${level}.*`;
}

export const MEGA_TOOLS: Record<string, ToolDef> = {
  meal_plan_complex: {
    name: 'meal_plan_complex',
    description: "Recherche une recette, l'extrait en détail, crée un meal plan et génère une liste de courses intelligente.",
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Type de repas ou ingrédients (ex: "paella végétarienne", "poulet curry")' },
        date: { type: 'string', description: 'Date ISO pour le plan (ex: 2026-06-01)', nullable: true },
        mealType: { type: 'string', description: 'Type de repas (breakfast, lunch, dinner, snack)', nullable: true },
        servings: { type: 'number', description: 'Nombre de portions', nullable: true },
        budget: { type: 'number', description: 'Budget estimé en €', nullable: true },
      },
      required: ['query'],
    },
    execute: async (args, { userId }) => {
      const { query, date, mealType = 'dinner', servings = 4, budget } = args;
      let targetDate = date;
      if (!date) {
        const today = new Date();
        targetDate = /demain/i.test(query.toLowerCase())
          ? new Date(today.getTime() + 86400000).toISOString().split('T')[0]
          : today.toISOString().split('T')[0];
      }
      try {
        const searchUrl = `https://www.marmiton.org/recettes/recherche.aspx?aqt=${encodeURIComponent(query)}`;
        const res = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } });
        const html = await res.text();
        const $ = cheerio.load(html);
        let recipeUrl = '';
        let recipeTitle = '';
        $('.recipe-card, .RCP__sc-1g9c9kz-0, article[class*="recipe"]').first().each((_, el) => {
          const link = $(el).find('a').first();
          const href = link.attr('href') || '';
          const title = link.attr('title') || link.text().trim();
          if (href && title) { recipeUrl = href.startsWith('http') ? href : `https://www.marmiton.org${href}`; recipeTitle = title; }
        });
        if (!recipeUrl) return `❌ Je n'ai pas trouvé de recette pour "${query}". Essayez un autre terme.`;
        const recipeRes = await fetch(recipeUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } });
        const recipeHtml = await recipeRes.text();
        const $$ = cheerio.load(recipeHtml);
        const ingredients: any[] = [];
        let ingredientIndex = 1;
        $$('.ingredient, [class*="ingredient"] li, .recipe-ingredients li, .preparation-ingredient, ul.ingredients li').each((_, el) => {
          const text = $$(el).text().trim();
          if (text && !text.includes('©') && text.length > 3 && text.length < 100) {
            const quantityMatch = text.match(/(\d+(?:,\d+)?)\s*(g|kg|ml|l|unité|pièce|cuillère|c.à.s|c.à.c|tasse|verre)/i);
            const quantity = quantityMatch ? quantityMatch[1] : '1';
            const unit = quantityMatch ? quantityMatch[2] : 'pièce';
            let name = text.replace(/^\d+[\s,]*(g|kg|ml|l|unité|pièce|cuillère|c\.à\.[sc]|tasse|verre)\s*/i, '').trim();
            ingredients.push({ id: `ing-${ingredientIndex++}`, name: name || text, quantity, unit, checked: false, price: estimatePrice(name, quantity, unit) });
          }
        });
        if (ingredients.length < 5) {
          const additionalIngredients = generateIngredientsFromTitle(recipeTitle, 5 - ingredients.length);
          ingredients.push(...additionalIngredients);
        }
        const steps: any[] = [];
        let stepIndex = 1;
        $$('.recipe-steps li, [class*="step"] li, .preparation li, .instruction, ol li').each((_, el) => {
          const text = $$(el).text().trim();
          if (text && !text.includes('©') && text.length > 5 && text.length < 300) {
            const duration = estimateStepDuration(text);
            steps.push({ id: stepIndex++, instruction: text, duration });
          }
        });
        if (steps.length < 5) {
          const additionalSteps = generateStepsFromTitle(recipeTitle, 5 - steps.length);
          steps.push(...additionalSteps);
        }
        const nutritionInfo = await extractNutritionFromPage($$);
        const estimatedCalories = estimateCalories(ingredients.map(i => i.name), servings);
        const mealData = { name: recipeTitle, type: mealType, servings, calories: estimatedCalories, ingredients, steps, nutrition: nutritionInfo, sourceUrl: recipeUrl, isGenerated: true };
        await db.meal.create({
          data: {
            id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            userId, name: recipeTitle,
            description: `Recette complète de ${query} - ${ingredients.length} ingrédients, ${steps.length} étapes`,
            type: mealType, date: new Date(targetDate), calories: estimatedCalories,
            ingredients: JSON.stringify(ingredients.map(ing => ({ id: ing.id, name: ing.name, quantity: ing.quantity, unit: ing.unit, checked: false, price: ing.price }))),
            instructions: JSON.stringify(steps.map(step => ({ id: step.id, instruction: step.instruction, duration: step.duration }))),
            prepTime: nutritionInfo.prepTime, cookTime: nutritionInfo.cookTime, servings, imageUrl: nutritionInfo.imageUrl, isGenerated: true, isFavorite: false,
          },
        });
        await db.mealPlan.create({
          data: {
            id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, userId, date: new Date(targetDate),
            meals: JSON.stringify([mealData]), totalCalories: estimatedCalories, notes: `Planifié par l'assistant IA - ${query}`,
          },
        });
        const shoppingList = await generateSmartShoppingList(ingredients.map(i => i.name), budget, servings);
        return `
🍳 **${recipeTitle}** programmée pour le ${new Date(targetDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} !

**Informations :**
- 🍽️ Type : ${mealType === 'breakfast' ? 'Petit-déjeuner' : mealType === 'lunch' ? 'Déjeuner' : mealType === 'dinner' ? 'Dîner' : 'Collation'}
- 👥 Portions : ${servings}
- 🔥 Calories : ~${estimatedCalories} kcal
- ⏱️ Temps : ${nutritionInfo.prepTime ? nutritionInfo.prepTime + ' min prép' : ''} ${nutritionInfo.cookTime ? '+' + nutritionInfo.cookTime + ' min cuisson' : ''}

**Ingrédients principaux :**
${ingredients.slice(0, 5).map(i => `• ${i}`).join('\n')}

**Étapes clés :**
${steps.slice(0, 3).join('\n')}

**Liste de courses générée :** 🛒
${shoppingList}

✅ Votre repas est planifié, enregistré et prêt à être cuisiné !`;
      } catch (error) {
        console.error('[MEAL_PLAN_COMPLEX] Error:', error);
        return `❌ Une erreur est survenue lors de la planification de votre repas. Veuillez réessayer.`;
      }
    },
  },

  ai_shopping_assistant: {
    name: 'ai_shopping_assistant',
    description: "Crée une liste de courses intelligente en tenant compte du budget, des besoins nutritionnels et des repas planifiés.",
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: "Type de courses ou liste d'articles" },
        budget: { type: 'number', description: 'Budget maximum en €', nullable: true },
        date: { type: 'string', description: 'Date pour les courses (ISO)', nullable: true },
        mealPlan: { type: 'string', description: 'JSON des repas prévus', nullable: true },
        preferences: { type: 'string', description: 'Préférences (ex: "bio", "local", "sans gluten")', nullable: true },
      },
      required: ['query'],
    },
    execute: async (args, { userId }) => {
      const { query, budget, date, mealPlan, preferences } = args;
      try {
        let allIngredients: string[] = [];
        if (mealPlan) {
          try {
            const meals = JSON.parse(mealPlan);
            allIngredients = meals.flatMap((meal: any) =>
              typeof meal.ingredients === 'string' ? JSON.parse(meal.ingredients) : meal.ingredients || []
            );
          } catch (e) { console.error('Error parsing meal plan:', e); }
        }
        const baseItems = extractBaseItemsFromQuery(query);
        const allItems = [...allIngredients, ...baseItems];
        const shoppingList = await generateOptimizedShoppingList(allItems, budget, preferences);
        return `🛒 **Liste de courses intelligente** ${date ? `pour ${new Date(date).toLocaleDateString('fr-FR')}` : ''}${budget ? ` - Budget : ${budget}€` : ''}

${shoppingList}

🎯 *Liste générée par IA, optimisée pour éviter les doublons et respecter votre budget !*`;
      } catch (error) {
        return `❌ Impossible de générer la liste de courses : ${error}`;
      }
    },
  },

  workout_generator: {
    name: 'workout_generator',
    description: "Génère un programme d'entraînement personnalisé basé sur les objectifs, le niveau et les équipements disponibles.",
    parameters: {
      type: 'object',
      properties: {
        goal: { type: 'string', description: 'Objectif (force, endurance, musculation, perte de poids, santé)' },
        level: { type: 'string', description: 'Niveau (débutant, intermédiaire, avancé)', nullable: true },
        duration: { type: 'number', description: 'Durée en minutes', nullable: true },
        equipment: { type: 'string', description: 'Équipement disponible (aucun, minimal, complet)', nullable: true },
        focusArea: { type: 'string', description: 'Zone ciblée (corps entier, haut, bas, core)', nullable: true },
      },
      required: ['goal'],
    },
    execute: async (args, { userId }) => {
      const { goal, level = 'intermédiaire', duration = 45, equipment = 'minimal', focusArea } = args;
      try {
        const workout = await generatePersonalizedWorkout({ goal, level, duration, equipment, focusArea, userId });
        return `
💪 **Programme d'entraînement ${goal} - ${level}**

⏱️ Durée : ${duration} minutes
🏋️ Équipement : ${equipment}
${focusArea ? `🎯 Zone : ${focusArea}` : ''}

${workout}

*Généré spécialement pour vous par votre coach personnel Atlas !*`;
      } catch (error) {
        return `❌ Impossible de générer votre programme : ${error}`;
      }
    },
  },
};

export function executeMegaTool(name: string, args: Record<string, any>, userId: string): Promise<string> {
  const tool = MEGA_TOOLS[name];
  if (!tool) throw new Error(`Mega tool "${name}" not found`);
  return tool.execute(args, { userId });
}
