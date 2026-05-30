/**
 * Service de Web Scraping - MindLife
 * Récupère les recettes, exercices et informations depuis le web
 * SANS LLM, SANS CLOUD - Tout en local
 */

import * as cheerio from 'cheerio';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Types
interface ScrapedRecipe {
  id: string;
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
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface ScrapedExercise {
  id: string;
  name: string;
  muscleGroup: string;
  description?: string;
  instructions: string[];
  imageUrl?: string;
  videoUrl?: string;
  sourceUrl: string;
  sourceName: string;
  difficulty?: string;
  equipment: string[];
}

interface AppointmentSlot {
  date: string;
  time: string;
  available: boolean;
  conflictWith?: string;
}

// User Agent pour éviter les blocages
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Fetch une page web avec gestion d'erreurs
 */
async function fetchPage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
    });
    
    if (!response.ok) {
      console.error(`HTTP ${response.status} pour ${url}`);
      return null;
    }
    
    return await response.text();
  } catch (error) {
    console.error(`Erreur fetch ${url}:`, error);
    return null;
  }
}

/**
 * Scraper une recette depuis Marmiton
 */
export async function scrapeMarmiton(query: string): Promise<ScrapedRecipe[]> {
  const searchUrl = `https://www.marmiton.org/recettes/recherche.aspx?aqt=${encodeURIComponent(query)}`;
  const html = await fetchPage(searchUrl);
  
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const recipes: ScrapedRecipe[] = [];
  
  // Récupérer les liens des recettes
  const recipeLinks: string[] = [];
  $('.recipe-card-link').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      recipeLinks.push(href.startsWith('http') ? href : `https://www.marmiton.org${href}`);
    }
  });
  
  // Limiter à 3 recettes pour la performance
  const limitedLinks = recipeLinks.slice(0, 3);
  
  for (const link of limitedLinks) {
    const recipeHtml = await fetchPage(link);
    if (!recipeHtml) continue;
    
    const r$ = cheerio.load(recipeHtml);
    
    const name = r$('h1.recipe-title, .recipe-header__title').text().trim();
    if (!name) continue;
    
    // Ingrédients
    const ingredients: string[] = [];
    r$('.recipe-ingredients__list li, .ingredient-list li').each((_, el) => {
      const ing = r$(el).text().trim();
      if (ing) ingredients.push(ing);
    });
    
    // Instructions
    const instructions: string[] = [];
    r$('.recipe-instructions__step, .recipe-step').each((_, el) => {
      const step = r$(el).text().trim();
      if (step) instructions.push(step);
    });
    
    // Image
    const imageUrl = r$('.recipe-image img, .recipe-media__image').attr('src') || 
                     r$('.recipe-image img, .recipe-media__image').attr('data-src');
    
    // Temps
    const prepTimeMatch = r$('.recipe-infos__item--prep-time').text().match(/(\d+)/);
    const cookTimeMatch = r$('.recipe-infos__item--cooking-time').text().match(/(\d+)/);
    
    recipes.push({
      id: uuidv4(),
      name,
      description: r$('.recipe-description, .recipe-header__description').text().trim(),
      ingredients,
      instructions: instructions.join('\n\n'),
      prepTime: prepTimeMatch ? parseInt(prepTimeMatch[1]) : undefined,
      cookTime: cookTimeMatch ? parseInt(cookTimeMatch[1]) : undefined,
      imageUrl,
      sourceUrl: link,
      sourceName: 'Marmiton',
    });
  }
  
  return recipes;
}

/**
 * Scraper une recette depuis 750g
 */
export async function scrape750g(query: string): Promise<ScrapedRecipe[]> {
  const searchUrl = `https://www.750g.com/recherche.htm?q=${encodeURIComponent(query)}`;
  const html = await fetchPage(searchUrl);
  
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const recipes: ScrapedRecipe[] = [];
  
  const recipeLinks: string[] = [];
  $('.recipe-card a, .card-recipe a').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      recipeLinks.push(href.startsWith('http') ? href : `https://www.750g.com${href}`);
    }
  });
  
  const limitedLinks = recipeLinks.slice(0, 3);
  
  for (const link of limitedLinks) {
    const recipeHtml = await fetchPage(link);
    if (!recipeHtml) continue;
    
    const r$ = cheerio.load(recipeHtml);
    
    const name = r$('h1, .recipe-title').first().text().trim();
    if (!name) continue;
    
    const ingredients: string[] = [];
    r$('.ingredients li, .recipe-ingredients li').each((_, el) => {
      const ing = r$(el).text().trim();
      if (ing) ingredients.push(ing);
    });
    
    const instructions: string[] = [];
    r$('.instructions li, .recipe-instructions li, .step').each((_, el) => {
      const step = r$(el).text().trim();
      if (step) instructions.push(step);
    });
    
    const imageUrl = r$('img.recipe-image, .recipe-img img').attr('src');
    
    recipes.push({
      id: uuidv4(),
      name,
      ingredients,
      instructions: instructions.join('\n\n'),
      imageUrl,
      sourceUrl: link,
      sourceName: '750g',
    });
  }
  
  return recipes;
}

/**
 * Scraper une recette depuis Cuisine AZ
 */
export async function scrapeCuisineAZ(query: string): Promise<ScrapedRecipe[]> {
  const searchUrl = `https://www.cuisineaz.com/recettes/recherche.aspx?recherche=${encodeURIComponent(query)}`;
  const html = await fetchPage(searchUrl);
  
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const recipes: ScrapedRecipe[] = [];
  
  const recipeLinks: string[] = [];
  $('a.recipe-card, .recipe-link').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      recipeLinks.push(href.startsWith('http') ? href : `https://www.cuisineaz.com${href}`);
    }
  });
  
  const limitedLinks = recipeLinks.slice(0, 3);
  
  for (const link of limitedLinks) {
    const recipeHtml = await fetchPage(link);
    if (!recipeHtml) continue;
    
    const r$ = cheerio.load(recipeHtml);
    
    const name = r$('h1, .recipe-title').first().text().trim();
    if (!name) continue;
    
    const ingredients: string[] = [];
    r$('.ingredients li, .recipe-ingredients li').each((_, el) => {
      const ing = r$(el).text().trim();
      if (ing) ingredients.push(ing);
    });
    
    const instructions: string[] = [];
    r$('.instructions p, .recipe-instructions li').each((_, el) => {
      const step = r$(el).text().trim();
      if (step) instructions.push(step);
    });
    
    const imageUrl = r$('img.recipe-image, .recipe-photo').attr('src');
    
    recipes.push({
      id: uuidv4(),
      name,
      ingredients,
      instructions: instructions.join('\n\n'),
      imageUrl,
      sourceUrl: link,
      sourceName: 'CuisineAZ',
    });
  }
  
  return recipes;
}

/**
 * Rechercher des recettes sur tous les sites
 */
export async function searchRecipes(query: string): Promise<ScrapedRecipe[]> {
  console.log(`[SCRAPER] Recherche recettes: "${query}"`);
  
  // Lancer les recherches en parallèle
  const [marmiton, g750, cuisineAZ] = await Promise.allSettled([
    scrapeMarmiton(query),
    scrape750g(query),
    scrapeCuisineAZ(query),
  ]);
  
  const recipes: ScrapedRecipe[] = [];
  
  if (marmiton.status === 'fulfilled') recipes.push(...marmiton.value);
  if (g750.status === 'fulfilled') recipes.push(...g750.value);
  if (cuisineAZ.status === 'fulfilled') recipes.push(...cuisineAZ.value);
  
  console.log(`[SCRAPER] ${recipes.length} recettes trouvées`);
  
  return recipes;
}

/**
 * Sauvegarder une recette en BDD (SQLite)
 */
export async function saveRecipe(recipe: ScrapedRecipe, userId?: string): Promise<string> {
  const existing = await db.scrapedRecipe.findFirst({
    where: {
      name: recipe.name,
      sourceUrl: recipe.sourceUrl,
    },
  });
  
  if (existing) {
    return existing.id;
  }
  
  const saved = await db.scrapedRecipe.create({
    data: {
      id: recipe.id,
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
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      userId: userId,
    },
  });
  
  return saved.id;
}

/**
 * Stocker temporairement une recette pour validation
 */
export async function storeTempRecipe(recipe: ScrapedRecipe, userId: string): Promise<string> {
  const tempData = await db.tempData.create({
    data: {
      id: uuidv4(),
      type: 'recipe',
      data: JSON.stringify(recipe),
      userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  });
  
  return tempData.id;
}

/**
 * Récupérer les recettes temporaires d'un user
 */
export async function getTempRecipes(userId: string): Promise<ScrapedRecipe[]> {
  const tempData = await db.tempData.findMany({
    where: {
      type: 'recipe',
      userId,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return tempData.map(t => JSON.parse(t.data) as ScrapedRecipe);
}

/**
 * Valider une recette temporaire (déplacer vers ScrapedRecipe)
 */
export async function validateTempRecipe(tempId: string, userId: string): Promise<boolean> {
  const temp = await db.tempData.findUnique({
    where: { id: tempId },
  });
  
  if (!temp || temp.userId !== userId) return false;
  
  const recipe = JSON.parse(temp.data) as ScrapedRecipe;
  await saveRecipe(recipe, userId);
  
  // Supprimer le temp
  await db.tempData.delete({ where: { id: tempId } });
  
  return true;
}

/**
 * Vérifier la disponibilité d'un créneau rendez-vous
 */
export async function checkAppointmentAvailability(
  userId: string,
  date: Date,
  durationMinutes: number = 60
): Promise<{ available: boolean; conflicts: { title: string; startAt: Date; endAt: Date }[]; alternatives: Date[] }> {
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Récupérer tous les événements du jour
  const events = await db.event.findMany({
    where: {
      userId,
      startAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: { startAt: 'asc' },
  });
  
  const requestedStart = new Date(date);
  const requestedEnd = new Date(requestedStart.getTime() + durationMinutes * 60 * 1000);
  
  const conflicts: { title: string; startAt: Date; endAt: Date }[] = [];
  
  // Vérifier les conflits
  for (const event of events) {
    const eventStart = new Date(event.startAt);
    const eventEnd = event.endAt ? new Date(event.endAt) : new Date(eventStart.getTime() + 60 * 60 * 1000);
    
    if (
      (requestedStart >= eventStart && requestedStart < eventEnd) ||
      (requestedEnd > eventStart && requestedEnd <= eventEnd) ||
      (requestedStart <= eventStart && requestedEnd >= eventEnd)
    ) {
      conflicts.push({
        title: event.title,
        startAt: eventStart,
        endAt: eventEnd,
      });
    }
  }
  
  // Générer des alternatives
  const alternatives: Date[] = [];
  if (conflicts.length > 0) {
    // Trouver les créneaux libres du jour
    const workStart = 8; // 8h
    const workEnd = 20; // 20h
    
    for (let hour = workStart; hour < workEnd; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, min, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
        
        // Vérifier si ce créneau est libre
        let isFree = true;
        for (const event of events) {
          const eventStart = new Date(event.startAt);
          const eventEnd = event.endAt ? new Date(event.endAt) : new Date(eventStart.getTime() + 60 * 60 * 1000);
          
          if (
            (slotStart >= eventStart && slotStart < eventEnd) ||
            (slotEnd > eventStart && slotEnd <= eventEnd) ||
            (slotStart <= eventStart && slotEnd >= eventEnd)
          ) {
            isFree = false;
            break;
          }
        }
        
        if (isFree && alternatives.length < 5) {
          alternatives.push(slotStart);
        }
      }
    }
  }
  
  return {
    available: conflicts.length === 0,
    conflicts,
    alternatives: alternatives.slice(0, 5),
  };
}

/**
 * Créer un événement dans le calendrier
 */
export async function createAppointment(
  userId: string,
  title: string,
  startAt: Date,
  durationMinutes: number = 60,
  description?: string,
  location?: string
): Promise<string> {
  const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000);
  
  const event = await db.event.create({
    data: {
      id: uuidv4(),
      title,
      description,
      location,
      startAt,
      endAt,
      isAllDay: false,
      userId,
    },
  });
  
  return event.id;
}

/**
 * Formater une recette pour l'affichage dans le chat
 */
export function formatRecipeForChat(recipe: ScrapedRecipe): string {
  let message = `🍽️ **${recipe.name}**\n\n`;
  
  if (recipe.description) {
    message += `_${recipe.description}_\n\n`;
  }
  
  if (recipe.prepTime || recipe.cookTime) {
    message += `⏱️ `;
    if (recipe.prepTime) message += `Préparation: ${recipe.prepTime}min `;
    if (recipe.cookTime) message += `Cuisson: ${recipe.cookTime}min`;
    message += `\n\n`;
  }
  
  message += `**Ingrédients:**\n`;
  recipe.ingredients.slice(0, 10).forEach(ing => {
    message += `• ${ing}\n`;
  });
  if (recipe.ingredients.length > 10) {
    message += `... et ${recipe.ingredients.length - 10} autres\n`;
  }
  
  message += `\n📍 Source: ${recipe.sourceName}`;
  
  return message;
}

/**
 * Scraper des exercices fitness
 */
export async function scrapeExercises(muscleGroup: string): Promise<ScrapedExercise[]> {
  // Pour l'instant, retourner des exercices de base depuis la base de connaissances
  const exercises: ScrapedExercise[] = [];
  
  const exerciseDatabase: Record<string, ScrapedExercise[]> = {
    'pectoraux': [
      {
        id: uuidv4(),
        name: 'Développé couché',
        muscleGroup: 'pectoraux',
        description: 'Exercice de base pour les pectoraux',
        instructions: [
          'Allongez-vous sur le banc, pieds au sol',
          'Saisissez la barbe avec un écartement supérieur à la largeur des épaules',
          'Descendez la barre jusqu\'à la poitrine',
          'Poussez la barre vers le haut en contractant les pectoraux',
        ],
        difficulty: 'intermediate',
        equipment: ['banc', 'barre', 'poids'],
        sourceUrl: 'https://example.com',
        sourceName: 'MindLife Database',
      },
      {
        id: uuidv4(),
        name: 'Pompes',
        muscleGroup: 'pectoraux',
        description: 'Exercice au poids de corps pour les pectoraux',
        instructions: [
          'Placez vos mains au sol, plus larges que les épaules',
          'Gardez le corps droit',
          'Descendez en fléchissant les coudes',
          'Remontez en poussant sur les mains',
        ],
        difficulty: 'beginner',
        equipment: [],
        sourceUrl: 'https://example.com',
        sourceName: 'MindLife Database',
      },
    ],
    'dos': [
      {
        id: uuidv4(),
        name: 'Tirage horizontal',
        muscleGroup: 'dos',
        description: 'Exercice pour le grand dorsal',
        instructions: [
          'Asseyez-vous sur la machine',
          'Saisissez la poignée',
          'Tirez vers vous en serrant les omoplates',
          'Contrôlez le retour',
        ],
        difficulty: 'beginner',
        equipment: ['machine'],
        sourceUrl: 'https://example.com',
        sourceName: 'MindLife Database',
      },
    ],
    'jambes': [
      {
        id: uuidv4(),
        name: 'Squat',
        muscleGroup: 'jambes',
        description: 'Exercice roi pour les jambes',
        instructions: [
          'Placez la barre sur les trapèzes',
          'Fléchissez les genoux en gardant le dos droit',
          'Descendez jusqu\'à ce que les cuisses soient parallèles au sol',
          'Remontez en poussant sur les talons',
        ],
        difficulty: 'intermediate',
        equipment: ['barre', 'poids'],
        sourceUrl: 'https://example.com',
        sourceName: 'MindLife Database',
      },
    ],
  };
  
  const normalized = muscleGroup.toLowerCase();
  for (const [key, exs] of Object.entries(exerciseDatabase)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      exercises.push(...exs);
    }
  }
  
  return exercises;
}

export const scraperService = {
  searchRecipes,
  saveRecipe,
  storeTempRecipe,
  getTempRecipes,
  validateTempRecipe,
  checkAppointmentAvailability,
  createAppointment,
  formatRecipeForChat,
  scrapeExercises,
};
