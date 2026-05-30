/**
 * Agent Actions - Actions concrètes des personas
 * 100% LOCAL - Pas de dépendance cloud
 * Web Scraping via Fetch + Cheerio
 */

import * as cheerio from 'cheerio';
import { db } from '@/lib/db';

// Types
export type AgentAction = 
  | 'web_search' 
  | 'scrape_recipe' 
  | 'create_event' 
  | 'check_availability' 
  | 'create_task' 
  | 'create_goal'
  | 'scrape_content';

export interface ActionResult {
  success: boolean;
  data?: any;
  message: string;
  needsValidation?: boolean;
  validationData?: any;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface RecipeData {
  name: string;
  ingredients: string[];
  steps: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  sourceUrl: string;
  imageUrl?: string;
}

// User Agent pour éviter les blocages
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ============================================
// FETCH LOCAL - Pas de SDK externe
// ============================================

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

// ============================================
// WEB SEARCH LOCAL via DuckDuckGo
// ============================================

export async function searchWeb(query: string, numResults: number = 5): Promise<SearchResult[]> {
  try {
    console.log(`[LOCAL SEARCH] Recherche: "${query}"`);
    
    // DuckDuckGo HTML (pas d'API, scrape direct)
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const html = await fetchPage(searchUrl);
    
    if (!html) {
      console.log('[LOCAL SEARCH] Pas de résultat HTML');
      return [];
    }
    
    const $ = cheerio.load(html);
    const results: SearchResult[] = [];
    
    // Parser les résultats DuckDuckGo
    $('.result').each((_, el) => {
      if (results.length >= numResults) return false;
      
      const titleEl = $(el).find('.result__title a');
      const snippetEl = $(el).find('.result__snippet');
      
      const title = titleEl.text().trim();
      let url = titleEl.attr('href') || '';
      const snippet = snippetEl.text().trim();
      
      // DuckDuckGo a des URLs redirect, extraire l'URL réelle
      if (url.includes('uddg=')) {
        url = decodeURIComponent(url.split('uddg=')[1].split('&')[0]);
      }
      
      if (title && url && !url.includes('duckduckgo.com')) {
        results.push({ title, url, snippet });
      }
    });
    
    console.log(`[LOCAL SEARCH] ${results.length} résultats trouvés`);
    return results;
  } catch (error) {
    console.error('Local search error:', error);
    return [];
  }
}

// ============================================
// PAGE READER / SCRAPING LOCAL
// ============================================

export async function scrapePage(url: string): Promise<{ title: string; content: string; html: string } | null> {
  try {
    console.log(`[LOCAL SCRAPE] Scraping: ${url}`);
    
    const html = await fetchPage(url);
    
    if (!html) {
      return null;
    }
    
    const $ = cheerio.load(html);
    
    // Supprimer les éléments non pertinents
    $('script, style, nav, header, footer, aside, .ads, .pub').remove();
    
    // Extraire le titre
    const title = $('title').text().trim() || 
                  $('h1').first().text().trim() || 
                  'Sans titre';
    
    // Extraire le contenu textuel
    const content = $('body').text()
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log(`[LOCAL SCRAPE] Titre: "${title}", Contenu: ${content.length} chars`);
    
    return {
      title,
      content,
      html,
    };
  } catch (error) {
    console.error('Page scrape error:', error);
    return null;
  }
}

// ============================================
// RECHERCHE DE RECETTE - SITES FRANÇAIS
// ============================================

export async function searchRecipe(query: string): Promise<ActionResult> {
  try {
    console.log(`[RECIPE SEARCH] Recherche: "${query}"`);
    
    // D'abord, essayer de scraper directement les sites de recettes
    const recipes = await scrapeRecipeSites(query);
    
    if (recipes.length > 0) {
      // Prendre la première recette
      const recipe = recipes[0];
      
      // Stocker provisoirement en BDD locale
      const tempRecipe = await db.tempData.create({
        data: {
          id: `recipe-${Date.now()}`,
          type: 'recipe',
          data: JSON.stringify(recipe),
          createdAt: new Date(),
        },
      });
      
      return {
        success: true,
        message: formatRecipeMessage(recipe),
        needsValidation: true,
        validationData: {
          tempId: tempRecipe.id,
          type: 'recipe',
          data: recipe,
        },
      };
    }
    
    // Fallback: recherche web générale
    const searchResults = await searchWeb(`recette ${query} facile ingredients`, 5);
    
    if (searchResults.length === 0) {
      return {
        success: false,
        message: `Je n'ai pas trouvé de recette pour "${query}". Essaie avec d'autres mots-clés.`,
      };
    }
    
    // Scrape le premier résultat pertinent
    const bestResult = searchResults.find(r => 
      r.url.includes('marmiton') || 
      r.url.includes('750g') || 
      r.url.includes('cuisineaz') ||
      r.url.includes('recette')
    ) || searchResults[0];
    
    const pageContent = await scrapePage(bestResult.url);
    
    if (!pageContent) {
      return {
        success: false,
        message: `J'ai trouvé des résultats mais impossible d'accéder au contenu. Voici les liens :\n\n${searchResults.map(r => `• ${r.title}: ${r.url}`).join('\n')}`,
      };
    }
    
    // Extraire les infos de la recette
    const recipeData = extractRecipeFromContent(pageContent, bestResult.url);
    
    // Stocker provisoirement en BDD locale
    const tempRecipe = await db.tempData.create({
      data: {
        id: `recipe-${Date.now()}`,
        type: 'recipe',
        data: JSON.stringify(recipeData),
        createdAt: new Date(),
      },
    });
    
    return {
      success: true,
      message: formatRecipeMessage(recipeData),
      needsValidation: true,
      validationData: {
        tempId: tempRecipe.id,
        type: 'recipe',
        data: recipeData,
      },
    };
  } catch (error) {
    console.error('Recipe search error:', error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la recherche. Réessaie dans un instant.",
    };
  }
}

// Scraper directement les sites de recettes français
async function scrapeRecipeSites(query: string): Promise<RecipeData[]> {
  const recipes: RecipeData[] = [];
  
  // Marmiton
  try {
    const marmitonRecipes = await scrapeMarmiton(query);
    recipes.push(...marmitonRecipes);
  } catch (e) {
    console.log('[MARMITON] Erreur:', e);
  }
  
  // Si on a déjà des résultats, on s'arrête
  if (recipes.length > 0) return recipes;
  
  // 750g
  try {
    const g750Recipes = await scrape750g(query);
    recipes.push(...g750Recipes);
  } catch (e) {
    console.log('[750G] Erreur:', e);
  }
  
  return recipes;
}

// Scraper Marmiton
async function scrapeMarmiton(query: string): Promise<RecipeData[]> {
  const searchUrl = `https://www.marmiton.org/recettes/recherche.aspx?aqt=${encodeURIComponent(query)}`;
  const html = await fetchPage(searchUrl);
  
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const recipes: RecipeData[] = [];
  
  // Récupérer les liens des recettes
  const recipeLinks: string[] = [];
  $('.recipe-card-link').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      recipeLinks.push(href.startsWith('http') ? href : `https://www.marmiton.org${href}`);
    }
  });
  
  // Limiter à 2 recettes pour la performance
  for (const link of recipeLinks.slice(0, 2)) {
    const recipeHtml = await fetchPage(link);
    if (!recipeHtml) continue;
    
    const r$ = cheerio.load(recipeHtml);
    
    const name = r$('h1.recipe-title, .recipe-header__title, .SHRP__title').text().trim();
    if (!name) continue;
    
    // Ingrédients
    const ingredients: string[] = [];
    r$('.recipe-ingredients__list li, .ingredient-list li, .SHRP__ingredients li').each((_, el) => {
      const ing = r$(el).text().trim();
      if (ing && ing.length > 2) ingredients.push(ing);
    });
    
    // Instructions
    const steps: string[] = [];
    r$('.recipe-instructions__step, .recipe-step, .SHRP__instructions li').each((_, el) => {
      const step = r$(el).text().trim();
      if (step && step.length > 10) steps.push(step);
    });
    
    // Temps
    const prepTimeMatch = r$('.recipe-infos__item--prep-time, .SHRP__preparation-time').text().match(/(\d+)\s*(min|minutes|h|heure)/i);
    const cookTimeMatch = r$('.recipe-infos__item--cooking-time, .SHRP__cooking-time').text().match(/(\d+)\s*(min|minutes|h|heure)/i);
    
    // Image
    const imageUrl = r$('.recipe-image img, .SHRP__image img').attr('src') || 
                     r$('.recipe-media__image').attr('src');
    
    recipes.push({
      name,
      ingredients: ingredients.length > 0 ? ingredients : ['Voir la recette originale'],
      steps: steps.length > 0 ? steps : ['Voir la recette originale'],
      prepTime: prepTimeMatch ? `${prepTimeMatch[1]} ${prepTimeMatch[2]}` : undefined,
      cookTime: cookTimeMatch ? `${cookTimeMatch[1]} ${cookTimeMatch[2]}` : undefined,
      sourceUrl: link,
      imageUrl,
    });
  }
  
  return recipes;
}

// Scraper 750g
async function scrape750g(query: string): Promise<RecipeData[]> {
  const searchUrl = `https://www.750g.com/recherche.htm?q=${encodeURIComponent(query)}`;
  const html = await fetchPage(searchUrl);
  
  if (!html) return [];
  
  const $ = cheerio.load(html);
  const recipes: RecipeData[] = [];
  
  const recipeLinks: string[] = [];
  $('.recipe-card a, .card-recipe a').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      recipeLinks.push(href.startsWith('http') ? href : `https://www.750g.com${href}`);
    }
  });
  
  for (const link of recipeLinks.slice(0, 2)) {
    const recipeHtml = await fetchPage(link);
    if (!recipeHtml) continue;
    
    const r$ = cheerio.load(recipeHtml);
    
    const name = r$('h1, .recipe-title').first().text().trim();
    if (!name) continue;
    
    const ingredients: string[] = [];
    r$('.ingredients li, .recipe-ingredients li').each((_, el) => {
      const ing = r$(el).text().trim();
      if (ing && ing.length > 2) ingredients.push(ing);
    });
    
    const steps: string[] = [];
    r$('.instructions li, .recipe-instructions li, .step').each((_, el) => {
      const step = r$(el).text().trim();
      if (step && step.length > 10) steps.push(step);
    });
    
    const imageUrl = r$('img.recipe-image, .recipe-img img').attr('src');
    
    recipes.push({
      name,
      ingredients: ingredients.length > 0 ? ingredients : ['Voir la recette originale'],
      steps: steps.length > 0 ? steps : ['Voir la recette originale'],
      sourceUrl: link,
      imageUrl,
    });
  }
  
  return recipes;
}

function extractRecipeFromContent(content: { title: string; content: string; html: string }, url: string): RecipeData {
  const text = content.content;
  
  // Essayer d'extraire les ingrédients
  const ingredients: string[] = [];
  const ingredientPatterns = [
    /ingrédients\s*:?([\s\S]*?)(?=préparation|étapes|instruction|recette|$)/i,
    /ingredients\s*:?([\s\S]*?)(?=preparation|steps|instruction|recipe|$)/i,
  ];

  for (const pattern of ingredientPatterns) {
    const match = text.match(pattern);
    if (match) {
      const ingredientText = match[1];
      const lines = ingredientText.split(/[\n•\-\*]/).filter((l: string) => l.trim().length > 2);
      ingredients.push(...lines.slice(0, 15).map((l: string) => l.trim()).filter((l: string) => l.length > 2));
      break;
    }
  }

  // Essayer d'extraire les étapes
  const steps: string[] = [];
  const stepPatterns = [
    /préparation\s*:?([\s\S]*?)(?=conseil|astuce|note|$)/i,
    /étapes\s*:?([\s\S]*?)(?=conseil|astuce|note|$)/i,
  ];

  for (const pattern of stepPatterns) {
    const match = text.match(pattern);
    if (match) {
      const stepText = match[1];
      const lines = stepText.split(/\d+[.\)]\s*/).filter((l: string) => l.trim().length > 10);
      steps.push(...lines.slice(0, 10).map((l: string) => l.trim()).filter((l: string) => l.length > 10));
      break;
    }
  }

  // Extraire les temps
  const prepTimeMatch = text.match(/préparation\s*:?\s*(\d+)\s*(min|minutes|heure|heures|h)/i);
  const cookTimeMatch = text.match(/cuisson\s*:?\s*(\d+)\s*(min|minutes|heure|heures|h)/i);

  return {
    name: content.title.replace(/recette\s*:?\s*/i, '').trim() || 'Recette',
    ingredients: ingredients.length > 0 ? ingredients : ['Ingrédients non détectés - voir la source'],
    steps: steps.length > 0 ? steps : ['Étapes non détectées - voir la source'],
    prepTime: prepTimeMatch ? `${prepTimeMatch[1]} ${prepTimeMatch[2]}` : undefined,
    cookTime: cookTimeMatch ? `${cookTimeMatch[1]} ${cookTimeMatch[2]}` : undefined,
    sourceUrl: url,
  };
}

function formatRecipeMessage(recipe: RecipeData): string {
  let message = `🍳 **${recipe.name}**\n\n`;
  
  if (recipe.prepTime || recipe.cookTime) {
    message += `⏱️ `;
    if (recipe.prepTime) message += `Préparation: ${recipe.prepTime}`;
    if (recipe.cookTime) message += ` | Cuisson: ${recipe.cookTime}`;
    message += `\n\n`;
  }

  message += `📝 **Ingrédients:**\n`;
  recipe.ingredients.slice(0, 10).forEach(ing => {
    message += `• ${ing}\n`;
  });

  message += `\n👨‍🍳 **Préparation:**\n`;
  recipe.steps.slice(0, 5).forEach((step, i) => {
    message += `${i + 1}. ${step}\n`;
  });

  message += `\n🔗 [Voir la recette originale](${recipe.sourceUrl})`;
  message += `\n\n---\n**Veux-tu que je sauvegarde cette recette ?** (oui/non)`;

  return message;
}

// ============================================
// RENDEZ-VOUS
// ============================================

export async function handleAppointment(query: string, userId: string): Promise<ActionResult> {
  try {
    // 1. Extraire la date et l'heure du message
    const dateInfo = extractDateFromQuery(query);
    
    if (!dateInfo.date) {
      return {
        success: false,
        message: `Je n'ai pas compris la date. Peux-tu préciser ?\n\nExemple: "rendez-vous mardi 23 avril à 14h"`,
      };
    }

    // 2. Vérifier les événements existants ce jour
    const startOfDay = new Date(dateInfo.date + 'T00:00:00.000Z');
    const endOfDay = new Date(dateInfo.date + 'T23:59:59.999Z');
    
    const existingEvents = await db.event.findMany({
      where: {
        userId,
        startAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // 3. Vérifier si le créneau est libre
    const requestedTime = dateInfo.time || '09:00';
    const requestedHour = parseInt(requestedTime.split(':')[0]);
    
    const isAvailable = !existingEvents.some(e => {
      const eventStartHour = e.startAt.getHours();
      const eventEndHour = e.endAt ? e.endAt.getHours() : eventStartHour + 1;
      return requestedHour >= eventStartHour && requestedHour < eventEndHour;
    });

    if (isAvailable) {
      // Créneau libre - proposer de créer
      const tempEvent = await db.tempData.create({
        data: {
          id: `event-${Date.now()}`,
          type: 'event',
          data: JSON.stringify({
            title: dateInfo.title || 'Rendez-vous',
            date: dateInfo.date,
            startTime: requestedTime,
            endTime: addHours(requestedTime, 1),
          }),
          createdAt: new Date(),
        },
      });

      return {
        success: true,
        message: `📅 **Créneau disponible !**\n\nJe peux planifier ton rendez-vous :\n• **Date:** ${formatDateFrench(dateInfo.date)}\n• **Heure:** ${requestedTime}\n• **Titre:** ${dateInfo.title || 'Rendez-vous'}\n\n**Confirmer ce rendez-vous ?** (oui/non)`,
        needsValidation: true,
        validationData: {
          tempId: tempEvent.id,
          type: 'event',
          data: {
            title: dateInfo.title || 'Rendez-vous',
            date: dateInfo.date,
            startTime: requestedTime,
          },
        },
      };
    } else {
      // Créneau occupé - proposer des alternatives
      const alternatives = findAvailableSlots(existingEvents, dateInfo.date);
      
      return {
        success: true,
        message: `⚠️ **Créneau déjà occupé** le ${formatDateFrench(dateInfo.date)} à ${requestedTime}.\n\n**Créneaux disponibles proches:**\n${alternatives.map(a => `• ${a.time}`).join('\n')}\n\nLequel te convient ?`,
        data: { alternatives },
      };
    }
  } catch (error) {
    console.error('Appointment error:', error);
    return {
      success: false,
      message: "Une erreur est survenue. Réessaie dans un instant.",
    };
  }
}

function extractDateFromQuery(query: string): { date: string | null; time: string | null; title: string | null } {
  const lowerQuery = query.toLowerCase();
  
  // Extraire l'heure
  const timeMatch = query.match(/à\s*(\d{1,2})[h:](\d{2})?/i) || query.match(/(\d{1,2})[h:](\d{2})?\s*(heure|h)/i);
  const time = timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2] || '00'}` : null;

  // Extraire la date
  let date: string | null = null;
  const today = new Date();
  
  // "demain"
  if (lowerQuery.includes('demain')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    date = tomorrow.toISOString().split('T')[0];
  }
  // "mardi 23 avril" ou "23 avril"
  else {
    const dateMatch = query.match(/(\d{1,2})\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const months: Record<string, number> = {
        'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
        'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
      };
      const month = months[dateMatch[2].toLowerCase()];
      const year = today.getFullYear();
      const parsedDate = new Date(year, month, day);
      date = parsedDate.toISOString().split('T')[0];
    }
  }

  // Extraire le titre
  const titleMatch = query.match(/(?:pour|rdv|rendez-vous|réunion)\s+(.+?)(?:\s+(?:le|mardi|mercredi|jeudi|vendredi|samedi|dimanche|lundi|à|\d))/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  return { date, time, title };
}

function findAvailableSlots(existingEvents: any[], date: string): { time: string }[] {
  const slots = [];
  const hours = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  
  for (const hour of hours) {
    const hourNum = parseInt(hour.split(':')[0]);
    const isOccupied = existingEvents.some(e => {
      const eventStartHour = e.startAt.getHours();
      const eventEndHour = e.endAt ? e.endAt.getHours() : eventStartHour + 1;
      return hourNum >= eventStartHour && hourNum < eventEndHour;
    });
    
    if (!isOccupied) {
      slots.push({ time: hour });
    }
  }
  
  return slots;
}

function addHours(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  const newHour = (h + hours) % 24;
  return `${newHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function formatDateFrench(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });
}

// ============================================
// RECHERCHE WEB GÉNÉRALE
// ============================================

export async function searchGeneral(query: string): Promise<ActionResult> {
  try {
    const searchResults = await searchWeb(query, 5);

    if (searchResults.length === 0) {
      return {
        success: false,
        message: `Je n'ai trouvé aucun résultat pour "${query}".`,
      };
    }

    // Scrape le premier résultat pour avoir plus de détails
    const bestResult = searchResults[0];
    const pageContent = await scrapePage(bestResult.url);

    let message = `🔍 **Résultats pour "${query}"**\n\n`;
    message += `**${bestResult.title}**\n`;
    message += `${bestResult.snippet}\n\n`;
    
    if (pageContent && pageContent.content.length > 100) {
      message += `📖 **Résumé:**\n${pageContent.content.slice(0, 500)}...\n\n`;
    }

    message += `**Autres sources:**\n`;
    searchResults.slice(1, 4).forEach(r => {
      message += `• [${r.title}](${r.url})\n`;
    });

    return {
      success: true,
      message,
    };
  } catch (error) {
    console.error('General search error:', error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la recherche.",
    };
  }
}

// ============================================
// VALIDATION ET SAUVEGARDE
// ============================================

export async function validateAndSave(tempId: string, userId: string): Promise<ActionResult> {
  try {
    const tempData = await db.tempData.findUnique({
      where: { id: tempId },
    });

    if (!tempData) {
      return {
        success: false,
        message: "Données temporaires non trouvées. Recommence la recherche.",
      };
    }

    const data = JSON.parse(tempData.data);

    if (tempData.type === 'recipe') {
      // Sauvegarder dans la table des recettes scrapées
      await db.scrapedRecipe.create({
        data: {
          id: `saved-${Date.now()}`,
          name: data.name,
          description: data.steps?.join('\n'),
          ingredients: JSON.stringify(data.ingredients),
          instructions: data.steps?.join('\n\n'),
          sourceUrl: data.sourceUrl,
          sourceName: 'MindLife Scraper',
          prepTime: data.prepTime ? parseInt(data.prepTime) : undefined,
          cookTime: data.cookTime ? parseInt(data.cookTime) : undefined,
          imageUrl: data.imageUrl,
          userId: userId,
        },
      });
      
      await db.tempData.delete({ where: { id: tempId } });
      
      return {
        success: true,
        message: `✅ **Recette sauvegardée !**\n\n"${data.name}" a été ajoutée à tes recettes.`,
      };
    }

    if (tempData.type === 'event') {
      // Créer l'événement avec les bons champs
      const startAt = new Date(`${data.date}T${data.startTime}:00`);
      const endTime = data.endTime || addHours(data.startTime, 1);
      const endAt = new Date(`${data.date}T${endTime}:00`);
      
      await db.event.create({
        data: {
          id: `event-${Date.now()}`,
          userId,
          title: data.title,
          startAt,
          endAt,
          color: '#10B981',
        },
      });

      await db.tempData.delete({ where: { id: tempId } });

      return {
        success: true,
        message: `✅ **Rendez-vous confirmé !**\n\n"${data.title}" le ${formatDateFrench(data.date)} à ${data.startTime} a été ajouté à ton calendrier.`,
      };
    }

    return {
      success: false,
      message: "Type de données non reconnu.",
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      success: false,
      message: "Erreur lors de la sauvegarde. Réessaie.",
    };
  }
}
