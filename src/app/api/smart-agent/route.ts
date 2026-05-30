/**
 * API Smart Agent - Actions directes via Prisma
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as cheerio from 'cheerio';
import { aiChat } from '@/lib/ai-provider';
import { AIFunction } from '@/lib/ai-config';

const DEFAULT_USER_ID = 'mindlife-user';

// ============================================
// DÉTECTION D'INTENTION
// ============================================

type Intent = 'recipe' | 'appointment' | 'task' | 'goal' | 'exercise' | 'web_search' | 'greeting' | 'help' | 'validation' | 'general';

function detectIntent(message: string): { intent: Intent; confidence: number } {
  const lower = message.toLowerCase().trim();

  console.log(`[DETECT] Message: "${lower}"`);

  // Validation (oui/non)
  if (/^(oui|ok|ouioui|ouais|confirmer|valider|c'est bon|d'accord|go|yes|sauvegarder|enregistrer)/i.test(lower)) {
    return { intent: 'validation', confidence: 0.95 };
  }
  if (/^(non|nonnon|nan|annuler|pas maintenant|refuser|no)/i.test(lower)) {
    return { intent: 'validation', confidence: 0.95 };
  }

  // Recette
  if (/recette|cuisiner|préparer.*plat|comment.*faire.*à manger|ingrédients pour|plat.*facile|crêpe|gâteau|tarte|salade|soupe|pâtes/i.test(lower)) {
    return { intent: 'recipe', confidence: 0.95 };
  }

  // Rendez-vous (avec variantes d'accents)
  if (/rendez-vous|rdv|réunion|reunion|meeting|planifier|calendrier|voir.*le|le.*à.*h|prendre.*rdv|fixer|réserver|reserver|créer.*événement|creer.*evenement/i.test(lower)) {
    return { intent: 'appointment', confidence: 0.95 };
  }

  // Exercice
  if (/exercice|muscle|musculation|fitness|squat|pompes|abdos|training|workout|coach|programme.*sport|entrainer/i.test(lower)) {
    return { intent: 'exercise', confidence: 0.9 };
  }

  // Tâche (avec ou sans accent)
  if (/tâche|tache|todo|à faire|a faire|ajouter.*tâche|ajouter.*tache|nouvelle tâche|nouvelle tache|créer.*tâche|creer.*tache|task/i.test(lower)) {
    return { intent: 'task', confidence: 0.85 };
  }

  // Objectif
  if (/objectif|but|goal|atteindre|accomplir|nouvel objectif/i.test(lower)) {
    return { intent: 'goal', confidence: 0.85 };
  }

  // Recherche web
  if (/cherche|recherche|trouve|quel est|qu'est-ce que|c'est quoi|qui est|comment fonctionne/i.test(lower)) {
    return { intent: 'web_search', confidence: 0.8 };
  }

  // Salutation
  if (/^(bonjour|salut|hello|hey|coucou|yo|hi)/i.test(lower)) {
    return { intent: 'greeting', confidence: 0.95 };
  }

  // Aide
  if (/aide|help|comment ça marche|que peux tu faire|fonctionnalités|que sais tu faire/i.test(lower)) {
    return { intent: 'help', confidence: 0.9 };
  }

  return { intent: 'general', confidence: 0.5 };
}

// ============================================
// EXTRACTION DATE
// ============================================

function extractDateFromQuery(query: string): { date: Date | null; time: string | null; title: string | null } {
  const lower = query.toLowerCase();
  const now = new Date();

  console.log(`[DATE] Extraction depuis: "${query}"`);

  let date: Date | null = null;
  let time: string | null = null;
  let title: string | null = null;

  // Extraction de l'heure
  const timeMatch = query.match(/à\s*(\d{1,2})[h:](\d{0,2})?/i) || query.match(/(\d{1,2})[h:](\d{2})/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Extraction de la date
  if (/aujourd'hui|ce jour/i.test(lower)) {
    date = new Date(now);
    date.setHours(0, 0, 0, 0);
  } else if (/demain/i.test(lower)) {
    date = new Date(now);
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
  } else if (/après[- ]?demain/i.test(lower)) {
    date = new Date(now);
    date.setDate(date.getDate() + 2);
    date.setHours(0, 0, 0, 0);
  } else {
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const dayMatch = lower.match(/(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/i);

    if (dayMatch) {
      const targetDay = days.indexOf(dayMatch[1].toLowerCase());
      const today = now.getDay();
      let diff = targetDay - today;
      if (diff <= 0) diff += 7;
      date = new Date(now);
      date.setDate(date.getDate() + diff);
      date.setHours(0, 0, 0, 0);
    }
  }

  // Extraction du titre
  const titlePatterns = [
    /(?:rdv|rendez[- ]?vous|réunion|reunion|meeting)\s+(?:chez|avec|pour)?\s*([a-zàâäéèêëïîôùûü\s]+)/i,
    /(?:prendre|planifier|créer|creer)\s+(?:un\s+)?(?:rdv|rendez[- ]?vous|réunion|reunion)\s+(?:pour|avec)?\s*([a-zàâäéèêëïîôùûü\s]+)/i,
  ];

  for (const pattern of titlePatterns) {
    const match = query.match(pattern);
    if (match) {
      title = match[1].trim().replace(/\s*(le|la|les|du|des|à|au|aux|pour|avec)\s+/gi, ' ').trim();
      break;
    }
  }

  console.log(`[DATE] Résultat: date=${date?.toISOString()}, time=${time}, title=${title}`);

  return { date, time, title };
}

// ============================================
// CRÉATION D'ÉVÉNEMENT
// ============================================

async function createEventDirectly(userId: string, title: string, date: Date, time: string | null): Promise<{ success: boolean; message: string; eventId?: string }> {
  try {
    const eventDate = new Date(date);
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
    } else {
      eventDate.setHours(9, 0, 0, 0);
    }

    const endAt = new Date(eventDate);
    endAt.setHours(endAt.getHours() + 1);

    const formattedDate = eventDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });

    const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await db.event.create({
      data: {
        id: eventId,
        userId,
        title: title || 'Rendez-vous',
        startAt: eventDate,
        endAt: endAt,
        color: '#10B981',
        isAllDay: false,
      },
    });

    return {
      success: true,
      message: `✅ **Rendez-vous créé !**\n\n📅 **${title}**\n🗓️ ${formattedDate}\n\nAjouté à ton calendrier !`,
      eventId,
    };
  } catch (error) {
    console.error('[EVENT] Erreur création:', error);
    return { success: false, message: '❌ Erreur lors de la création du rendez-vous.' };
  }
}

// ============================================
// CRÉATION DE TÂCHE
// ============================================

async function createTask(userId: string, title: string): Promise<{ success: boolean; message: string }> {
  try {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await db.task.create({
      data: { id: taskId, userId, title, status: 'pending', priority: 'medium' },
    });

    return { success: true, message: `✅ **Tâche créée !**\n\n📋 "${title}"\n\nAjoutée à ta liste !` };
  } catch (error) {
    console.error('[TASK] Erreur:', error);
    return { success: false, message: '❌ Erreur lors de la création de la tâche.' };
  }
}

// ============================================
// CRÉATION D'OBJECTIF
// ============================================

async function createGoal(userId: string, title: string): Promise<{ success: boolean; message: string }> {
  try {
    const goalId = `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await db.goal.create({
      data: { id: goalId, userId, title, status: 'active', priority: 'a_planifier', startDate: new Date() },
    });

    return { success: true, message: `🎯 **Objectif créé !**\n\n**"${title}"**\n\nTu peux le retrouver dans ta liste d'objectifs !` };
  } catch (error) {
    console.error('[GOAL] Erreur:', error);
    return { success: false, message: '❌ Erreur lors de la création de l\'objectif.' };
  }
}

// ============================================
// SCRAPING RECETTE
// ============================================

async function fetchPage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function searchRecipe(query: string): Promise<{ success: boolean; message: string; needsValidation?: boolean; tempId?: string }> {
  try {
    console.log(`[RECIPE] Recherche: "${query}"`);

    const searchUrl = `https://www.marmiton.org/recettes/recherche.aspx?aqt=${encodeURIComponent(query)}`;
    const html = await fetchPage(searchUrl);

    if (!html) {
      return {
        success: true,
        message: `🍳 **Recette de ${query}**\n\nJe n'ai pas pu accéder à Marmiton, mais voici une recette de base :\n\n📝 **Ingrédients:**\n• Farine\n• Oeufs\n• Lait\n• Beurre\n• Sel\n\nVeux-tu que je sauvegarde cette recette ?`,
        needsValidation: true,
        tempId: `fallback-recipe-${Date.now()}`,
      };
    }

    const $ = cheerio.load(html);
    let recipeUrl: string | null = null;

    $('.recipe-card-link').each((_, el) => {
      if (!recipeUrl) {
        const href = $(el).attr('href');
        if (href) {
          recipeUrl = href.startsWith('http') ? href : `https://www.marmiton.org${href}`;
        }
      }
    });

    if (!recipeUrl) {
      return { success: true, message: `🍳 Je n'ai pas trouvé de recette pour "${query}".` };
    }

    const recipeHtml = await fetchPage(recipeUrl);
    if (!recipeHtml) {
      return { success: true, message: `🍳 J'ai trouvé une recette mais impossible d'y accéder: ${recipeUrl}` };
    }

    const r$ = cheerio.load(recipeHtml);
    const name = r$('h1').first().text().trim() || `Recette de ${query}`;

    const ingredients: string[] = [];
    r$('.recipe-ingredients__list li, .SHRP__ingredients li, .ingredient-list li').each((_, el) => {
      const ing = r$(el).text().trim();
      if (ing && ing.length > 2) ingredients.push(ing);
    });

    const steps: string[] = [];
    r$('.recipe-instructions__step, .SHRP__instructions p, .recipe-step').each((_, el) => {
      const step = r$(el).text().trim();
      if (step && step.length > 10) steps.push(step);
    });

    let message = `🍳 **${name}**\n\n📍 [Voir sur Marmiton](${recipeUrl})\n\n`;

    if (ingredients.length > 0) {
      message += `📝 **Ingrédients:**\n${ingredients.slice(0, 10).map(i => `• ${i}`).join('\n')}\n\n`;
    }

    if (steps.length > 0) {
      message += `👨‍🍳 **Préparation:**\n${steps.slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n`;
    }

    message += `\n---\n**Veux-tu que je sauvegarde cette recette ?** (oui/non)`;

    // Sauvegarder en temp
    const tempId = `recipe-${Date.now()}`;
    await db.tempData.create({
      data: {
        id: tempId,
        type: 'recipe',
        data: JSON.stringify({ name, ingredients, steps, sourceUrl: recipeUrl }),
        createdAt: new Date(),
      },
    });

    return { success: true, message, needsValidation: true, tempId };
  } catch (error) {
    console.error('[RECIPE] Erreur:', error);
    return { success: false, message: '❌ Erreur lors de la recherche de recette.' };
  }
}

// ============================================
// VALIDATION
// ============================================

async function validateAndSave(tempId: string, userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const temp = await db.tempData.findUnique({ where: { id: tempId } });

    if (!temp) {
      return { success: false, message: '❌ Données non trouvées. Recommence.' };
    }

    const data = JSON.parse(temp.data);

    if (temp.type === 'recipe') {
      // Sauvegarder dans Prisma
      await db.scrapedRecipe.create({
        data: {
          id: `saved-${Date.now()}`,
          name: data.name || 'Recette',
          ingredients: JSON.stringify(data.ingredients || []),
          instructions: data.steps?.join('\n\n') || '',
          sourceUrl: data.sourceUrl || '',
          sourceName: 'Marmiton',
          userId,
        },
      });

      await db.tempData.delete({ where: { id: tempId } });
      return { success: true, message: `✅ **Recette sauvegardée !**\n\n"${data.name}" a été ajoutée !` };
    }

    return { success: false, message: '❌ Type non reconnu.' };
  } catch (error) {
    console.error('[VALIDATE] Erreur:', error);
    return { success: false, message: '❌ Erreur lors de la sauvegarde.' };
  }
}

// ============================================
// CONTEXT
// ============================================

const conversationContexts = new Map<string, { tempId?: string; type?: string; lastIntent?: Intent }>();

// ============================================
// HANDLER PRINCIPAL
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, persona = 'assistant', userId = DEFAULT_USER_ID, conversationId, userMemory } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    console.log(`[API] Message: "${message}" (persona: ${persona})`);

    const ctx = conversationId ? conversationContexts.get(conversationId) || {} : {};
    const { intent } = detectIntent(message);

    console.log(`[API] Intent: ${intent}`);

    // Validation
    if (intent === 'validation' && ctx.tempId) {
      const isPositive = /^(oui|ok|ouioui|ouais|confirmer|valider|c'est bon|d'accord|go|yes|sauvegarder|enregistrer)/i.test(message.trim());

      if (isPositive) {
        const result = await validateAndSave(ctx.tempId, userId);
        conversationContexts.delete(conversationId);
        return NextResponse.json({ success: result.success, response: result.message, persona });
      } else {
        await db.tempData.delete({ where: { id: ctx.tempId } }).catch(() => {});
        conversationContexts.delete(conversationId);
        return NextResponse.json({ success: true, response: "D'accord, j'ai annulé. Autre chose ?", persona });
      }
    }

    // Traitement par intent
    switch (intent) {
      case 'recipe': {
        const query = message.replace(/recette\s*(de|pour)?\s*/i, '').replace(/comment\s*(faire|préparer|cuisiner)\s*/i, '').trim() || 'crêpes';
        const result = await searchRecipe(query);

        if (result.needsValidation && result.tempId && conversationId) {
          conversationContexts.set(conversationId, { tempId: result.tempId, type: 'recipe', lastIntent: 'recipe' });
        }

        return NextResponse.json({ success: result.success, response: result.message, persona, intent });
      }

      case 'appointment': {
        const { date, time, title } = extractDateFromQuery(message);

        if (!date) {
          return NextResponse.json({
            success: false,
            response: `📅 **Je n'ai pas compris la date.**\n\nExemples:\n• "Rendez-vous demain à 14h"\n• "RDV mardi à 10h"`,
            persona,
            intent,
          });
        }

        const result = await createEventDirectly(userId, title || 'Rendez-vous', date, time);
        return NextResponse.json({ success: result.success, response: result.message, persona, intent, eventId: result.eventId });
      }

      case 'task': {
        const taskTitle = message
          .replace(/tâche\s*(:|-)?\s*/i, '')
          .replace(/tache\s*(:|-)?\s*/i, '')
          .replace(/todo\s*(:|-)?\s*/i, '')
          .replace(/ajouter\s*(une)?\s*tâche\s*(:|-)?\s*/i, '')
          .replace(/ajouter\s*(une)?\s*tache\s*(:|-)?\s*/i, '')
          .replace(/créer\s*(une)?\s*tâche\s*(:|-)?\s*/i, '')
          .replace(/creer\s*(une)?\s*tache\s*(:|-)?\s*/i, '')
          .trim();

        if (!taskTitle) {
          return NextResponse.json({
            success: false,
            response: `📋 **Quel est le titre de la tâche ?**\n\nExemple: "Tâche Acheter du lait"`,
            persona,
            intent,
          });
        }

        const result = await createTask(userId, taskTitle);
        return NextResponse.json({ success: result.success, response: result.message, persona, intent });
      }

      case 'goal': {
        const goalTitle = message
          .replace(/objectif\s*(:|-)?\s*/i, '')
          .replace(/but\s*(:|-)?\s*/i, '')
          .replace(/goal\s*(:|-)?\s*/i, '')
          .replace(/je veux\s*/i, '')
          .trim();

        if (!goalTitle) {
          return NextResponse.json({
            success: false,
            response: `🎯 **Quel est ton objectif ?**\n\nExemple: "Objectif Perdre 5kg"`,
            persona,
            intent,
          });
        }

        const result = await createGoal(userId, goalTitle);
        return NextResponse.json({ success: result.success, response: result.message, persona, intent });
      }

      case 'greeting': {
        return NextResponse.json({
          success: true,
          response: `Salut ! 👋 Je suis ton assistant MindLife.\n\n**Je peux t'aider à :**\n• 🍳 **Trouver des recettes** (ex: "recette de crêpes")\n• 📅 **Planifier des rendez-vous** (ex: "rdv demain à 14h")\n• 📋 **Créer des tâches** (ex: "tâche acheter du lait")\n• 🎯 **Définir des objectifs** (ex: "objectif courir 10km")`,
          persona,
          intent,
        });
      }

      case 'help': {
        return NextResponse.json({
          success: true,
          response: `📚 **Aide MindLife**\n\n**Commandes:**\n\n🍳 **Recettes**\n"Recette de crêpes"\n\n📅 **Rendez-vous**\n"RDV demain à 14h"\n\n📋 **Tâches**\n"Tâche Acheter du lait"\n\n🎯 **Objectifs**\n"Objectif Perdre 5kg"`,
          persona,
          intent,
        });
      }

      default: {
        const personaToFunc: Record<string, AIFunction> = {
          assistant: 'assistant',
          coach: 'sport',
          nutrition: 'meals',
          productivity: 'tasks',
          wellness: 'spirit',
        };

        const func = personaToFunc[persona] || 'assistant';
        let systemPrompt = `Tu es un expert MindLife dans le rôle de ${persona}.
Réponds de manière bienveillante, concise et structurée en français.`;

        if (userMemory) {
          systemPrompt += `\n\n[Instructions personnalisées / Mémoire de l'utilisateur] :\n${userMemory}`;
        }

        try {
          const result = await aiChat(message, {
            func,
            systemPrompt,
          });

          if (result.success && result.content && result.provider !== 'local') {
            return NextResponse.json({
              success: true,
              response: result.content,
              persona,
              intent,
            });
          }
        } catch (chatError) {
          console.error('[SMART-AGENT] AI Chat Error:', chatError);
        }

        return NextResponse.json({
          success: true,
          response: `Je ne suis pas sûr de comprendre. 😊\n\n**Dis-moi ce que tu veux faire :**\n• 🍳 Une recette ? → "recette de crêpes"\n• 📅 Un rendez-vous ? → "rdv demain à 14h"\n• 📋 Une tâche ? → "tâche acheter du lait"\n• 🎯 Un objectif ? → "objectif courir 10km"`,
          persona,
          intent,
        });
      }
    }
  } catch (error) {
    console.error('[API] Erreur:', error);
    return NextResponse.json({ success: false, response: '❌ Une erreur est survenue. Réessaie.' });
  }
}
