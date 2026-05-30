/**
 * Agent de Scraping SANS LLM
 * Utilise Cheerio pour extraire des données structurées du web
 */

import * as cheerio from 'cheerio';
import { db } from '@/lib/db';

// Types
export interface ScrapedRecipe {
  name: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  imageUrl?: string;
  source: string;
  category?: string;
  tags?: string[];
}

export interface ScrapedExercise {
  name: string;
  muscleGroup: string;
  description?: string;
  instructions?: string[];
  imageUrl?: string;
  difficulty?: string;
  equipment?: string[];
}

// ============================================
// SCRAPER DE RECETTES (SANS LLM)
// ============================================

/**
 * Scraper générique pour les sites de recettes
 * Utilise des sélecteurs CSS pour extraire les données
 */
export async function scrapeRecipes(
  url: string,
  selectors: {
    recipeCard: string;
    name: string;
    ingredients: string;
    instructions?: string;
    time?: string;
    image?: string;
    servings?: string;
  }
): Promise<ScrapedRecipe[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MindLifeBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const recipes: ScrapedRecipe[] = [];

    $(selectors.recipeCard).each((_, card) => {
      const $card = $(card);

      const name = $card.find(selectors.name).text().trim();
      if (!name) return;

      const ingredients: string[] = [];
      $card.find(selectors.ingredients).each((_, ing) => {
        const ingredient = $(ing).text().trim();
        if (ingredient) ingredients.push(ingredient);
      });

      const instructions: string[] = [];
      if (selectors.instructions) {
        $card.find(selectors.instructions).each((_, inst) => {
          const instruction = $(inst).text().trim();
          if (instruction) instructions.push(instruction);
        });
      }

      const recipe: ScrapedRecipe = {
        name,
        ingredients,
        instructions,
        prepTime: selectors.time ? $card.find(selectors.time).text().trim() : undefined,
        imageUrl: selectors.image ? $card.find(selectors.image).attr('src') : undefined,
        source: url,
      };

      recipes.push(recipe);
    });

    return recipes;
  } catch (error) {
    console.error('Scraping error:', error);
    return [];
  }
}

/**
 * Scraper pour Marmiton (exemple)
 */
export async function scrapeMarmiton(searchTerm: string): Promise<ScrapedRecipe[]> {
  const searchUrl = `https://www.marmiton.org/recettes/recherche.aspx?aqt=${encodeURIComponent(searchTerm)}`;

  return scrapeRecipes(searchUrl, {
    recipeCard: '.recipe-card',
    name: '.recipe-card__title',
    ingredients: '.recipe-card__ingredient',
    instructions: '.recipe-card__instruction',
    time: '.recipe-card__time',
    image: '.recipe-card__img img',
  });
}

/**
 * Scraper pour 750g (exemple)
 */
export async function scrape750g(searchTerm: string): Promise<ScrapedRecipe[]> {
  const searchUrl = `https://www.750g.com/recherche.htm?search=${encodeURIComponent(searchTerm)}`;

  return scrapeRecipes(searchUrl, {
    recipeCard: '.recipe-item',
    name: '.recipe-item__title',
    ingredients: '.recipe-item__ingredient',
    time: '.recipe-item__time',
    image: '.recipe-item__img img',
  });
}

// ============================================
// SCRAPER D'EXERCICES (SANS LLM)
// ============================================

/**
 * Scraper pour exercices de musculation
 */
export async function scrapeExercises(
  url: string,
  selectors: {
    exerciseCard: string;
    name: string;
    muscleGroup: string;
    description?: string;
    instructions?: string;
    image?: string;
  }
): Promise<ScrapedExercise[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MindLifeBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const exercises: ScrapedExercise[] = [];

    $(selectors.exerciseCard).each((_, card) => {
      const $card = $(card);

      const name = $card.find(selectors.name).text().trim();
      if (!name) return;

      const muscleGroup = $card.find(selectors.muscleGroup).text().trim();

      const instructions: string[] = [];
      if (selectors.instructions) {
        $card.find(selectors.instructions).each((_, inst) => {
          const instruction = $(inst).text().trim();
          if (instruction) instructions.push(instruction);
        });
      }

      exercises.push({
        name,
        muscleGroup,
        description: selectors.description ? $card.find(selectors.description).text().trim() : undefined,
        instructions,
        imageUrl: selectors.image ? $card.find(selectors.image).attr('src') : undefined,
      });
    });

    return exercises;
  } catch (error) {
    console.error('Exercise scraping error:', error);
    return [];
  }
}

// ============================================
// STOCKAGE EN BDD
// ============================================

/**
 * Stocker les recettes scrapées en BDD
 */
export async function saveRecipesToDb(recipes: ScrapedRecipe[], userId: string): Promise<number> {
  let saved = 0;

  for (const recipe of recipes) {
    try {
      // Vérifier si la recette existe déjà (par nom)
      const existing = await db.meal.findFirst({
        where: {
          name: recipe.name,
          userId,
        },
      });

      if (existing) continue;

       await db.meal.create({
         data: {
           id: crypto.randomUUID(),
           date: new Date(),
           name: recipe.name,
           description: recipe.description || recipe.instructions?.join('\n'),
           ingredients: JSON.stringify(recipe.ingredients),
           instructions: recipe.instructions?.join('\n'),
           prepTime: recipe.prepTime ? parseInt(recipe.prepTime.replace(/\D/g, ''), 10) || null : null,
           imageUrl: recipe.imageUrl,
           type: 'dejeuner',
           userId,
           isGenerated: false,
           isFavorite: false,
         },
       });

      saved++;
    } catch (error) {
      console.error(`Error saving recipe ${recipe.name}:`, error);
    }
  }

  return saved;
}

// ============================================
// EXPORT PRINCIPAL
// ============================================

/**
 * Scrape et stocke en une fonction
 */
export async function scrapeAndStore(searchTerm: string, userId: string): Promise<{
  scraped: number;
  saved: number;
  recipes: ScrapedRecipe[];
}> {
  const recipes = await scrapeMarmiton(searchTerm);
  const saved = await saveRecipesToDb(recipes, userId);

  return {
    scraped: recipes.length,
    saved,
    recipes,
  };
}
