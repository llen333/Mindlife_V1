/**
 * API Scraper - Scraping SANS LLM
 * Récupère des données du web et les stocke en BDD
 */

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { db } from '@/lib/db';

const DEFAULT_USER_ID = 'mindlife-user';

// ============================================
// TYPES
// ============================================

interface ScrapedRecipe {
  name: string;
  description?: string;
  ingredients: string[];
  instructions?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  sourceUrl: string;
  sourceName: string;
  category?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

// ============================================
// FONCTIONS DE SCRAPING
// ============================================

async function scrapeFromUrl(
  url: string,
  selectors: {
    recipeCard: string;
    name: string;
    ingredients: string;
    instructions?: string;
    time?: string;
    image?: string;
  },
  sourceName: string
): Promise<ScrapedRecipe[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MindLifeBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const recipes: ScrapedRecipe[] = [];

    $(selectors.recipeCard).each((_, card) => {
      const $card = $(card);

      const name = $card.find(selectors.name).text().trim();
      if (!name || name.length < 3) return;

      const ingredients: string[] = [];
      $card.find(selectors.ingredients).each((_, ing) => {
        const ingredient = $(ing).text().trim();
        if (ingredient && ingredient.length > 1) {
          ingredients.push(ingredient);
        }
      });

      const instructions = selectors.instructions
        ? $card.find(selectors.instructions).map((_, i) => $(i).text().trim()).get().join('\n')
        : undefined;

      const timeText = selectors.time ? $card.find(selectors.time).text().trim() : '';
      const prepTime = parseTime(timeText);

      const imageUrl = selectors.image
        ? $card.find(selectors.image).attr('src') || $card.find(selectors.image).attr('data-src')
        : undefined;

      recipes.push({
        name,
        ingredients,
        instructions,
        prepTime,
        imageUrl: imageUrl ? (imageUrl.startsWith('http') ? imageUrl : undefined) : undefined,
        sourceUrl: url,
        sourceName,
      });
    });

    return recipes;
  } catch (error) {
    console.error(`Scraping error for ${url}:`, error);
    return [];
  }
}

function parseTime(timeStr: string): number | undefined {
  const match = timeStr.match(/(\d+)\s*(min|mn|h|heure)/i);
  if (!match) return undefined;

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === 'h' || unit === 'heure') {
    return value * 60;
  }
  return value;
}

// ============================================
// STOCKAGE EN BDD
// ============================================

async function saveRecipesToDb(recipes: ScrapedRecipe[], userId?: string): Promise<number> {
  let saved = 0;

  for (const recipe of recipes) {
    try {
      const existing = await db.scrapedRecipe.findFirst({
        where: {
          name: recipe.name,
          sourceUrl: recipe.sourceUrl,
        },
      });

      if (existing) continue;

      await db.scrapedRecipe.create({
        data: {
          id: `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: recipe.name,
          description: recipe.description,
          ingredients: JSON.stringify(recipe.ingredients),
          instructions: recipe.instructions,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          imageUrl: recipe.imageUrl,
          sourceUrl: recipe.sourceUrl,
          sourceName: recipe.sourceName,
          category: recipe.category,
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          userId,
        },
      });

      saved++;
    } catch (error) {
      console.error(`Error saving recipe ${recipe.name}:`, error);
    }
  }

  return saved;
}

async function updateAgentStatus(agentId: string, status: string, task?: string) {
  try {
    await db.agentState.upsert({
      where: { agentId },
      update: {
        status,
        lastActivity: new Date(),
        currentTask: task,
        updatedAt: new Date(),
      },
      create: {
        id: `agent-state-${agentId}`,
        agentId,
        agentType: 'scraper',
        status,
        currentTask: task,
      },
    });
  } catch (error) {
    console.error('Error updating agent status:', error);
  }
}

async function broadcastAgentMessage(fromAgent: string, messageType: string, payload: any) {
  try {
    await db.agentMessage.create({
      data: {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fromAgent,
        toAgent: null,
        messageType,
        payload: JSON.stringify(payload),
      },
    });
  } catch (error) {
    console.error('Error broadcasting message:', error);
  }
}

// ============================================
// API HANDLERS
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const category = searchParams.get('category');

  if (action === 'recipes') {
    const recipes = await db.scrapedRecipe.findMany({
      where: category ? { category } : { isActive: true },
      take: 50,
      orderBy: { scrapedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      count: recipes.length,
      recipes: recipes.map(r => ({
        ...r,
        ingredients: JSON.parse(r.ingredients || '[]'),
      })),
    });
  }

  if (action === 'status') {
    const state = await db.agentState.findUnique({
      where: { agentId: 'scraper-agent' },
    });

    const stats = await db.scrapedRecipe.count();

    return NextResponse.json({
      success: true,
      agent: state || { status: 'idle', lastActivity: null },
      totalRecipes: stats,
    });
  }

  return NextResponse.json({
    message: 'Scraper API',
    endpoints: {
      'GET ?action=recipes': 'Liste des recettes',
      'GET ?action=status': 'Statut agent',
      'POST { action: "scrape", query: "..." }': 'Scraper',
      'POST { action: "seed-examples" }': 'Exemples',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, query, userId = DEFAULT_USER_ID } = body;

    if (action === 'scrape' && query) {
      await updateAgentStatus('scraper-agent', 'working', `Scraping: ${query}`);

      const scrapeUrl = `https://www.marmiton.org/recettes/recherche.aspx?aqt=${encodeURIComponent(query)}`;

      const recipes = await scrapeFromUrl(
        scrapeUrl,
        {
          recipeCard: '.recipe-card, .MRTN_recipe-card',
          name: '.recipe-card__title, .MRTN_recipe-card__title',
          ingredients: '.recipe-card__ingredient, .MRTN_recipe-card__ingredient',
          time: '.recipe-card__time',
          image: '.recipe-card__img img',
        },
        'marmiton'
      );

      const saved = await saveRecipesToDb(recipes, userId);

      await updateAgentStatus('scraper-agent', 'idle');
      await broadcastAgentMessage('scraper-agent', 'recipes_scraped', {
        query,
        found: recipes.length,
        saved,
      });

      return NextResponse.json({
        success: true,
        message: `Scrapé ${recipes.length} recettes, ${saved} sauvegardées`,
        recipes: recipes.slice(0, 10),
        saved,
      });
    }

    if (action === 'seed-examples') {
      const exampleRecipes: ScrapedRecipe[] = [
        {
          name: 'Salade César',
          description: 'Salade fraîche avec sauce césar',
          ingredients: ['Laitue romaine', 'Croûtons', 'Parmesan', 'Sauce césar', 'Poulet'],
          instructions: 'Laver la laitue, couper le poulet, assembler.',
          prepTime: 15,
          servings: 2,
          sourceUrl: 'local://example',
          sourceName: 'mindlife',
          category: 'salade',
          calories: 350,
          protein: 25,
        },
        {
          name: 'Poulet grillé aux herbes',
          description: 'Poulet juteux aux herbes',
          ingredients: ['Blancs de poulet', 'Herbes de Provence', 'Huile d\'olive', 'Ail'],
          instructions: 'Mariner 30 min, griller 6 min chaque côté.',
          prepTime: 40,
          cookTime: 12,
          servings: 4,
          sourceUrl: 'local://example',
          sourceName: 'mindlife',
          category: 'plat',
          calories: 280,
          protein: 35,
        },
        {
          name: 'Smoothie énergisant',
          description: 'Smoothie aux fruits',
          ingredients: ['Banane', 'Épinards', 'Lait d\'amande', 'Beurre de cacahuète'],
          instructions: 'Mixer le tout.',
          prepTime: 5,
          servings: 1,
          sourceUrl: 'local://example',
          sourceName: 'mindlife',
          category: 'petit-dejeuner',
          calories: 320,
          protein: 12,
        },
        {
          name: 'Bowl quinoa légumes',
          description: 'Bowl équilibré',
          ingredients: ['Quinoa', 'Avocat', 'Pois chiches', 'Tomates', 'Concombre'],
          instructions: 'Cuire quinoa, couper légumes, assembler.',
          prepTime: 20,
          servings: 2,
          sourceUrl: 'local://example',
          sourceName: 'mindlife',
          category: 'plat',
          calories: 420,
          protein: 15,
        },
        {
          name: 'Omelette légumes',
          description: 'Omelette légère',
          ingredients: ['Œufs', 'Poivrons', 'Courgettes', 'Oignons', 'Fromage'],
          instructions: 'Battre œufs, revenir légumes, cuire.',
          prepTime: 5,
          cookTime: 10,
          servings: 1,
          sourceUrl: 'local://example',
          sourceName: 'mindlife',
          category: 'petit-dejeuner',
          calories: 280,
          protein: 18,
        },
      ];

      const saved = await saveRecipesToDb(exampleRecipes, userId);

      await broadcastAgentMessage('scraper-agent', 'seed_complete', { count: saved });

      return NextResponse.json({
        success: true,
        message: `${saved} recettes exemples ajoutées`,
        recipes: exampleRecipes,
      });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('Scraper error:', error);
    await updateAgentStatus('scraper-agent', 'error');

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur',
    });
  }
}
