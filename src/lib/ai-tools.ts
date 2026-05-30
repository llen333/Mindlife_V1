import { db } from '@/lib/db';
import * as cheerio from 'cheerio';
import { DEFAULT_USER_ID } from './constants';

export type ToolName =
  | 'create_event' | 'get_events' | 'update_event' | 'delete_event'
  | 'search_recipes' | 'save_meal' | 'get_meals' | 'create_meal_plan' | 'get_meal_plan'
  | 'create_shopping_list' | 'get_shopping_lists'
  | 'create_task' | 'get_tasks'
  | 'log_weight' | 'log_sleep' | 'log_sport_session'
  | 'web_search' | 'scrape_url' | 'save_note' | 'get_notes';

interface ToolExecuteContext {
  userId: string;
}

type ToolExecute = (args: Record<string, any>, ctx: ToolExecuteContext) => Promise<string>;

interface ToolDef {
  name: ToolName;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
  execute: ToolExecute;
}

function parseRelativeDate(input: string): Date | null {
  if (!input || typeof input !== 'string') return null;
  const d = new Date(input);
  if (!isNaN(d.getTime())) return d;

  const now = new Date();
  const lower = input.toLowerCase().trim();

  const dayMap: Record<string, number> = {
    dimanche: 0, lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6,
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
  };

  // "demain", "après-demain", "aujourd'hui"
  if (/aujourd'hui|today/i.test(lower)) return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (/demain|tomorrow/i.test(lower)) return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (/après[ -]demain|day after/i.test(lower)) return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

  // "lundi prochain", "next monday", etc.
  for (const [name, idx] of Object.entries(dayMap)) {
    const regex = new RegExp(`${name}\\s*(prochain|next|)?`, 'i');
    if (regex.test(lower)) {
      const currentDay = now.getDay();
      let diff = idx - currentDay;
      if (diff <= 0) diff += 7;
      if (/prochain|next/i.test(lower) && diff === 0) diff = 7;
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
    }
  }

  // "dans 2 heures", "dans 30 minutes", "dans 3 jours"
  const inMatch = lower.match(/dans\s+(\d+)\s*(heure|minute|jour|h|min|j)s?\b/i);
  if (inMatch) {
    const num = parseInt(inMatch[1]);
    const unit = inMatch[2].toLowerCase();
    const ms = unit.startsWith('h') ? num * 3600000 : unit.startsWith('min') ? num * 60000 : num * 86400000;
    return new Date(now.getTime() + ms);
  }

  // Extract time from string like "14h", "14:00", "2pm"
  let hours = NaN, minutes = 0;
  const timeMatch = lower.match(/(\d{1,2})[h:](\d{2})|(\d{1,2})h|(\d{1,2})\s*(?:pm|am)/i);
  if (timeMatch) {
    hours = parseInt(timeMatch[1] || timeMatch[3] || timeMatch[4]);
    minutes = parseInt(timeMatch[2] || '0');
    if (/pm/i.test(input) && hours < 12) hours += 12;
    if (/am/i.test(input) && hours === 12) hours = 0;
  }

  // If it's just a time, use today or tomorrow
  if (!isNaN(hours)) {
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (base.getHours() >= hours) base.setDate(base.getDate() + 1);
    base.setHours(hours, minutes, 0, 0);
    return base;
  }

  return null;
}

export const TOOLS: Record<ToolName, ToolDef> = {
  // ==================== CALENDAR ====================
  create_event: {
    name: 'create_event',
    description: 'Créer un événement calendrier (rendez-vous, réunion, rappel, RDV). IMPORTANT: retourne TOUJOURS des dates au format ISO 8601 (ex: 2026-06-01T14:00:00.000Z). Ne mets pas de mots comme "demain" — convertis-les en date ISO.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: "Titre de l'événement (ex: RDV dentiste, Réunion projet)" },
        startDate: { type: 'string', description: 'Date/heure début en ISO 8601 (ex: 2026-06-01T14:00:00.000Z). Calcule-la à partir des infos de l\'utilisateur. EXEMPLE: si l\'utilisateur dit "lundi prochain 14h", retourne la date ISO correspondante.' },
        endDate: { type: 'string', description: 'Date/heure fin en ISO 8601. Optionnel — calcule 1h après start si non spécifié.', nullable: true },
        description: { type: 'string', description: "Description de l'événement", nullable: true },
        location: { type: 'string', description: 'Lieu', nullable: true },
        color: { type: 'string', description: 'Couleur hex (ex: #3b82f6)', nullable: true },
      },
      required: ['title', 'startDate'],
    },
    execute: async (args, { userId }) => {
      const { title, startDate, endDate, description, location, color } = args;
      let start = parseRelativeDate(startDate);
      if (!start) start = new Date(startDate);
      if (isNaN(start.getTime())) start = new Date(Date.now() + 3600000);
      const end = endDate ? (parseRelativeDate(endDate) || new Date(endDate)) : new Date(start.getTime() + 3600000);

      const event = await db.event.create({
        data: {
          id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId,
          title: title || 'Événement',
          description: description || null,
          location: location || null,
          startAt: start,
          endAt: end,
          color: color || '#3b82f6',
          isAllDay: false,
        },
      });
      return `✅ Événement créé : "${event.title}"
📅 ${start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
⏰ ${start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
${location ? `📍 ${location}` : ''}`;
    },
  },

  get_events: {
    name: 'get_events',
    description: 'Récupérer les événements du calendrier pour une période donnée.',
    parameters: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Début de période en ISO', nullable: true },
        endDate: { type: 'string', description: 'Fin de période en ISO', nullable: true },
      },
      required: [],
    },
    execute: async (args, { userId }) => {
      const { startDate, endDate } = args;
      const where: any = { userId };
      if (startDate || endDate) {
        where.startAt = {};
        if (startDate) where.startAt.gte = new Date(startDate);
        if (endDate) where.startAt.lte = new Date(endDate);
      }
      const events = await db.event.findMany({ where, orderBy: { startAt: 'asc' }, take: 20 });
      if (events.length === 0) return '📅 Aucun événement trouvé pour cette période.';
      const lines = events.map(e =>
        `• ${e.title} — ${e.startAt.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} ${e.startAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}${e.location ? ` 📍${e.location}` : ''}`
      );
      return `📅 **${events.length} événement(s) trouvé(s)**\n\n${lines.join('\n')}`;
    },
  },

  update_event: {
    name: 'update_event',
    description: "Modifier un événement existant du calendrier.",
    parameters: {
      type: 'object',
      properties: {
        eventId: { type: 'string', description: "ID de l'événement à modifier" },
        title: { type: 'string', description: 'Nouveau titre', nullable: true },
        startDate: { type: 'string', description: 'Nouvelle date début ISO', nullable: true },
        endDate: { type: 'string', description: 'Nouvelle date fin ISO', nullable: true },
        description: { type: 'string', description: 'Nouvelle description', nullable: true },
        location: { type: 'string', description: 'Nouveau lieu', nullable: true },
        color: { type: 'string', description: 'Nouvelle couleur hex', nullable: true },
      },
      required: ['eventId'],
    },
    execute: async (args, { userId }) => {
      const { eventId, title, startDate, endDate, description, location, color } = args;
      const data: any = {};
      if (title) data.title = title;
      if (startDate) data.startAt = new Date(startDate);
      if (endDate) data.endAt = new Date(endDate);
      if (description !== undefined) data.description = description;
      if (location !== undefined) data.location = location;
      if (color) data.color = color;
      await db.event.update({ where: { id: eventId, userId }, data });
      return `✅ Événement "${title || ''}" mis à jour.`;
    },
  },

  delete_event: {
    name: 'delete_event',
    description: "Supprimer un événement du calendrier.",
    parameters: {
      type: 'object',
      properties: {
        eventId: { type: 'string', description: "ID de l'événement à supprimer" },
      },
      required: ['eventId'],
    },
    execute: async (args, { userId }) => {
      const { eventId } = args;
      await db.event.delete({ where: { id: eventId, userId } });
      return '✅ Événement supprimé.';
    },
  },

  // ==================== NUTRITION ====================
  search_recipes: {
    name: 'search_recipes',
    description: 'Chercher une recette de cuisine en ligne (Marmiton, 750g) par nom ou ingrédients.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Nom de la recette ou ingrédients (ex: "paella végétarienne")' },
      },
      required: ['query'],
    },
    execute: async (args) => {
      const { query } = args;
      try {
        const searchUrl = `https://www.marmiton.org/recettes/recherche.aspx?aqt=${encodeURIComponent(query)}`;
        const res = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } });
        const html = await res.text();
        const $ = cheerio.load(html);
        const recipes: { title: string; url: string; desc: string }[] = [];
        $('.recipe-card, .RCP__sc-1g9c9kz-0, article[class*="recipe"]').slice(0, 5).each((_, el) => {
          const link = $(el).find('a').first();
          const href = link.attr('href') || '';
          const title = link.attr('title') || link.text().trim();
          if (href && title) recipes.push({ title, url: href.startsWith('http') ? href : `https://www.marmiton.org${href}`, desc: '' });
        });
        if (recipes.length === 0) {
          const fallbackLinks: string[] = [];
          $('a[href*="/recettes/"]').slice(0, 3).each((_, el) => {
            const t = $(el).text().trim();
            const h = $(el).attr('href') || '';
            if (t) fallbackLinks.push(`• [${t}](https://www.marmiton.org${h.startsWith('/') ? h : '/' + h})`);
          });
          if (fallbackLinks.length > 0) return `🔍 Résultats pour "${query}" :\n\n${fallbackLinks.join('\n')}\n\nSouhaitez-vous que j'aille chercher les détails d'une recette en particulier ?`;
          return `😕 Je n'ai pas trouvé de recette pour "${query}" sur Marmiton. Essaie avec d'autres mots-clés.`;
        }
        let output = `🍳 **Recettes trouvées pour "${query}"**\n\n`;
        output += recipes.map((r, i) => `${i + 1}. **${r.title}**\n   ${r.url}`).join('\n\n');
        output += '\n\n📌 Dis-moi quelle recette t\'intéresse pour que je récupère les ingrédients et la préparation !';
        return output;
      } catch (e) {
        return `❌ Erreur recherche recette: ${e}`;
      }
    },
  },

  save_meal: {
    name: 'save_meal',
    description: 'Enregistrer un repas consommé avec ses infos nutritionnelles.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nom du repas' },
        type: { type: 'string', description: 'Type: breakfast, lunch, dinner, snack', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
        date: { type: 'string', description: 'Date ISO (ex: 2026-06-01)', nullable: true },
        calories: { type: 'number', description: 'Calories', nullable: true },
        protein: { type: 'number', description: 'Protéines en g', nullable: true },
        carbs: { type: 'number', description: 'Glucides en g', nullable: true },
        fat: { type: 'number', description: 'Lipides en g', nullable: true },
        ingredients: { type: 'string', description: 'Ingrédients (texte)', nullable: true },
        instructions: { type: 'string', description: 'Instructions de préparation', nullable: true },
        servings: { type: 'number', description: 'Nombre de portions', nullable: true },
      },
      required: ['name', 'type'],
    },
    execute: async (args, { userId }) => {
      let { name, type, date, calories, protein, carbs, fat, ingredients, instructions, servings } = args;

      // Fallback NLP from query string
      if ((!name || !type) && args.query) {
        const q = args.query;
        const calMatch = q.match(/(\d+)\s*(kcal|calories|cal)/i);
        if (calMatch) calories = parseInt(calMatch[1]);
        if (/ce soir|dîner|diner|dinner/i.test(q)) type = 'dinner';
        else if (/ce midi|midi|déjeuner|dejeuner|lunch/i.test(q)) type = 'lunch';
        else if (/matin|petit.déjeuner|breakfast/i.test(q)) type = 'breakfast';
        else if (/collation|goûter|gouter|snack/i.test(q)) type = 'snack';
        else type = type || 'lunch';
        name = q.replace(/(\d+)\s*(kcal|calories|cal)/gi, '')
          .replace(/ajoute|enregistre|sauvegarde|log|repas|plat|ce soir|ce midi|ce matin|dîner|déjeuner|petit.déjeuner|collation|goûter|snack|collation/gi, '')
          .replace(/,/g, '')
          .trim() || 'Repas';
        if (!date) date = new Date().toISOString();
      }

      const meal = await db.meal.create({
        data: {
          id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId,
          name,
          type: type || 'lunch',
          date: new Date(date || Date.now()),
          calories: calories || null,
          protein: protein || null,
          carbs: carbs || null,
          fat: fat || null,
          ingredients: ingredients || null,
          instructions: instructions || null,
          servings: servings || 1,
          isGenerated: true,
        },
      });
      return `✅ **${meal.name}** enregistré ! ${meal.calories ? `🔥 ${meal.calories} kcal` : ''} ${meal.protein ? `💪 ${meal.protein}g protéines` : ''}`.trim();
    },
  },

  get_meals: {
    name: 'get_meals',
    description: 'Récupérer les repas enregistrés pour une période.',
    parameters: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Début de période ISO', nullable: true },
        endDate: { type: 'string', description: 'Fin de période ISO', nullable: true },
      },
      required: [],
    },
    execute: async (args, { userId }) => {
      const { startDate, endDate } = args;
      const where: any = { userId };
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      }
      const meals = await db.meal.findMany({ where, orderBy: { date: 'asc' } });
      if (meals.length === 0) return '🍽️ Aucun repas enregistré pour cette période.';
      const totalCal = meals.reduce((s, m) => s + (m.calories || 0), 0);
      const lines = meals.map(m =>
        `• ${m.name} — ${m.date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} ${m.calories ? `🔥${m.calories} kcal` : ''}`
      );
      return `🍽️ **${meals.length} repas**${totalCal > 0 ? ` (${totalCal} kcal total)` : ''}\n\n${lines.join('\n')}`;
    },
  },

  create_meal_plan: {
    name: 'create_meal_plan',
    description: 'Créer un plan de repas pour une journée (programmation des repas à l\'avance).',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date ISO (ex: 2026-06-01)' },
        meals: { type: 'string', description: 'Liste des repas au format JSON string: [{"name":"...","type":"breakfast|lunch|dinner|snack","calories":500}]' },
        totalCalories: { type: 'number', description: 'Calories totales estimées', nullable: true },
        notes: { type: 'string', description: 'Notes pour ce plan', nullable: true },
      },
      required: ['date', 'meals'],
    },
    execute: async (args, { userId }) => {
      let { date, meals, totalCalories, notes } = args;
      let mealsJson: string;

      if ((!date) && args.query) {
        const q = args.query;
        if (/demain/i.test(q)) date = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        else if (/cette semaine/i.test(q)) date = new Date().toISOString().split('T')[0];
        else date = date || new Date().toISOString().split('T')[0];
      }
      if (!meals) meals = JSON.stringify([{ name: 'Planification manuelle requise', type: 'lunch' }]);
      if (typeof meals === 'string') mealsJson = meals;
      else mealsJson = JSON.stringify(meals);
      const plan = await db.mealPlan.create({
        data: {
          id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId,
          date: new Date(date),
          meals: mealsJson,
          totalCalories: totalCalories || 0,
          notes: notes || null,
        },
      });
      const parsed = JSON.parse(plan.meals);
      const mealLines = Array.isArray(parsed) ? parsed.map((m: any) => `• ${m.name || 'Repas'}`).join('\n') : plan.meals;
      return `✅ **Plan repas du ${new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}**\n\n${mealLines}\n\n🔥 ${plan.totalCalories} kcal total`;
    },
  },

  get_meal_plan: {
    name: 'get_meal_plan',
    description: 'Récupérer le plan de repas pour une date donnée.',
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date ISO' },
      },
      required: ['date'],
    },
    execute: async (args, { userId }) => {
      const { date } = args;
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 86400000);
      const plans = await db.mealPlan.findMany({
        where: { userId, date: { gte: startOfDay, lt: endOfDay } },
        orderBy: { createdAt: 'desc' },
      });
      if (plans.length === 0) return `📋 Aucun plan repas pour cette date.`;
      const plan = plans[0];
      let meals: any[];
      try { meals = JSON.parse(plan.meals); } catch { meals = [{ name: plan.meals }]; }
      const lines = Array.isArray(meals) ? meals.map((m: any) => `• ${m.name || ''}${m.calories ? ` (${m.calories} kcal)` : ''}`).join('\n') : plan.meals;
      return `📋 **Plan repas du ${startOfDay.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}**\n\n${lines}\n\n🔥 ${plan.totalCalories} kcal\n${plan.notes ? `📝 ${plan.notes}` : ''}`;
    },
  },

  // ==================== SHOPPING ====================
  create_shopping_list: {
    name: 'create_shopping_list',
    description: 'Créer une liste de courses avec des articles.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nom de la liste (ex: "Courses semaine", "Courses paella")' },
        budget: { type: 'number', description: 'Budget estimé', nullable: true },
        items: { type: 'string', description: 'Articles au format JSON: [{"name":"...","quantity":2,"estimatedPrice":3.5,"category":"..."}]' },
        scheduledDate: { type: 'string', description: 'Date prévue des courses ISO', nullable: true },
      },
      required: ['name', 'items'],
    },
    execute: async (args, { userId }) => {
      let { name, budget, items, scheduledDate } = args;

      if ((!name || !items) && args.query) {
        name = args.query.replace(/liste.*course|achats|crée|nouvelle/gi, '').trim() || 'Courses';
        items = JSON.stringify([{ name: args.query.replace(/liste.*course/i, '').trim() || 'Articles divers' }]);
      }

      let itemsArr: any[];
      if (typeof items === 'string') { try { itemsArr = JSON.parse(items); } catch { itemsArr = [{ name: items }]; } }
      else itemsArr = items;
      const listId = `list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const list = await db.$transaction(async (tx) => {
        const created = await tx.shoppingList.create({
          data: {
            id: listId,
            userId,
            name,
            budget: budget || 0,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
          },
        });
        if (itemsArr.length > 0) {
          await tx.shoppingItem.createMany({
            data: itemsArr.map((item: any) => ({
              id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              listId,
              name: item.name,
              quantity: item.quantity || 1,
              estimatedPrice: item.estimatedPrice || 0,
              category: item.category || 'Général',
            })),
          });
        }
        return created;
      });
      const total = itemsArr.reduce((s: number, i: any) => s + ((i.estimatedPrice || 0) * (i.quantity || 1)), 0);
      return `🛒 **${list.name}** créée !\n📦 ${itemsArr.length} article(s)\n💰 ~${total.toFixed(2)}€ estimé${budget ? ` (budget: ${budget}€)` : ''}`;
    },
  },

  get_shopping_lists: {
    name: 'get_shopping_lists',
    description: 'Récupérer les listes de courses.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
    execute: async (_, { userId }) => {
      const lists = await db.shoppingList.findMany({ where: { userId }, include: { items: true }, orderBy: { createdAt: 'desc' }, take: 5 });
      if (lists.length === 0) return '🛒 Aucune liste de courses.';
      return lists.map(l => {
        const checked = l.items.filter(i => i.isChecked).length;
        return `• **${l.name}** — ${l.items.length} art. (${checked}/${l.items.length} coché) ${l.budget ? `💰${l.budget}€` : ''}`;
      }).join('\n');
    },
  },

  // ==================== TASKS ====================
  create_task: {
    name: 'create_task',
    description: 'Créer une nouvelle tâche ou todo.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Titre de la tâche' },
        description: { type: 'string', description: 'Description', nullable: true },
        priority: { type: 'number', description: 'Priorité 1-5 (5 = urgente)', nullable: true },
        dueDate: { type: 'string', description: 'Date échéance ISO', nullable: true },
      },
      required: ['title'],
    },
    execute: async (args, { userId }) => {
      const { title, description, priority, dueDate } = args;
      const task = await db.task.create({
        data: {
          id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId,
          title,
          description: description || null,
          priority: priority || 3,
          status: 'pending',
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });
      return `✅ Tâche créée : "${task.title}"`;
    },
  },

  get_tasks: {
    name: 'get_tasks',
    description: 'Récupérer les tâches, avec filtre optionnel par statut.',
    parameters: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filtrer par statut: pending, in_progress, completed', nullable: true },
      },
      required: [],
    },
    execute: async (args, { userId }) => {
      const where: any = { userId };
      if (args.status) where.status = args.status;
      const tasks = await db.task.findMany({ where, orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }], take: 15 });
      if (tasks.length === 0) return '📋 Aucune tâche trouvée.';
      const lines = tasks.map(t => {
        // Conversion de la priorité string en nombre pour la comparaison
        const pMap: Record<string, number> = { high: 4, medium: 3, low: 2, a_planifier: 1 };
        const pScore = pMap[t.priority] || 0;
        const priorityIcon = pScore >= 4 ? '🔴' : pScore >= 3 ? '🟡' : '🟢';
        return `${priorityIcon} ${t.title}${t.dueDate ? ` (échéance: ${new Date(t.dueDate).toLocaleDateString('fr-FR')})` : ''}`;
      });
      return `📋 **${tasks.length} tâche(s)**\n\n${lines.join('\n')}`;
    },
  },

  // ==================== HEALTH ====================
  log_weight: {
    name: 'log_weight',
    description: "Enregistrer un poids (relevé de pesée).",
    parameters: {
      type: 'object',
      properties: {
        weight: { type: 'number', description: 'Poids en kg' },
        date: { type: 'string', description: 'Date ISO, défaut = aujourd\'hui', nullable: true },
        note: { type: 'string', description: 'Note optionnelle', nullable: true },
      },
      required: ['weight'],
    },
    execute: async (args, { userId }) => {
      let { weight, date, note } = args;

      if (!weight && args.query) {
        const match = args.query.match(/(\d+[.,]?\d*)\s*kg/i);
        if (match) weight = parseFloat(match[1].replace(',', '.'));
      }

      await db.weightEntry.create({
        data: {
          id: `weight-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId,
          weight,
          date: date ? new Date(date) : new Date(),
          note: note || null,
        },
      });
      return `✅ Poids enregistré : ${weight} kg${note ? ` (${note})` : ''}`;
    },
  },

  log_sleep: {
    name: 'log_sleep',
    description: 'Enregistrer une entrée de sommeil (heure coucher, réveil, qualité).',
    parameters: {
      type: 'object',
      properties: {
        bedtime: { type: 'string', description: 'Heure de coucher ISO (ex: 2026-06-01T23:00:00Z)' },
        wakeup: { type: 'string', description: 'Heure de réveil ISO' },
        quality: { type: 'number', description: 'Qualité du sommeil 1-5', minimum: 1, maximum: 5 },
        date: { type: 'string', description: 'Date ISO, défaut extrait du réveil', nullable: true },
        notes: { type: 'string', description: 'Notes', nullable: true },
      },
      required: ['bedtime', 'wakeup', 'quality'],
    },
    execute: async (args, { userId }) => {
      let { bedtime, wakeup, quality, date, notes } = args;

      // Fallback: parse duration from query like "dormi 7h" or "dormi 7h30"
      if ((!bedtime || !wakeup) && args.query) {
        const durMatch = args.query.match(/(\d+)\s*h(?:eure)?s?(?:\s*(\d+))?/i);
        if (durMatch) {
          const h = parseInt(durMatch[1]);
          const m = parseInt(durMatch[2] || '0');
          const hours = h + m / 60;
          if (!bedtime) bedtime = new Date(Date.now() - hours * 3600000).toISOString();
          if (!wakeup) wakeup = new Date().toISOString();
        }
        const qualMatch = args.query.match(/qualité\s*[:\s]*(\d)/i);
        if (qualMatch) quality = parseInt(qualMatch[1]);
        quality = quality || 3;
      }

      const bedDate = new Date(bedtime);
      const wakeDate = new Date(wakeup);
      const durationHours = (wakeDate.getTime() - bedDate.getTime()) / 3600000;
      const entry = await db.sleepEntry.create({
        data: {
          id: `sleep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId,
          date: date ? new Date(date) : new Date(wakeDate.toISOString().split('T')[0]),
          bedtime: bedDate,
          wakeup: wakeDate,
          duration: Math.round(durationHours * 10) / 10,
          quality,
          notes: notes || null,
        },
      });
      const hours = Math.floor(entry.duration);
      const mins = Math.round((entry.duration - hours) * 60);
      return `😴 Sommeil enregistré : ${hours}h${mins} — qualité ${quality}/5`;
    },
  },

  log_sport_session: {
    name: 'log_sport_session',
    description: 'Enregistrer une séance de sport. Crée automatiquement un profil sport si nécessaire.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: "Nom de la séance (ex: 'Footing matin', 'Musculation HIIT')" },
        duration: { type: 'number', description: 'Durée en minutes' },
        intensity: { type: 'number', description: 'Intensité 1-10', nullable: true, minimum: 1, maximum: 10 },
        notes: { type: 'string', description: 'Notes', nullable: true },
        date: { type: 'string', description: 'Date ISO, défaut = maintenant', nullable: true },
      },
      required: ['name', 'duration'],
    },
    execute: async (args, { userId }) => {
      let { name, duration, intensity, notes, date } = args;

      if ((!name || !duration) && args.query) {
        const q = args.query;
        const durMatch = q.match(/(\d+)\s*(min|minutes)|(\d+)\s*h(?:eure)?s?(?:\s*(\d+))?/i);
        if (durMatch) {
          if (durMatch[2] === 'min' || durMatch[2] === 'minutes') {
            duration = parseInt(durMatch[1]);
          } else {
            const h = parseInt(durMatch[3]);
            const m = parseInt(durMatch[4] || '0');
            duration = h * 60 + m;
          }
        }
        name = q.replace(/(\d+)\s*(min|minutes)|(\d+)\s*h(?:eure)?s?(?:\s*(\d+))?/gi, '')
          .replace(/log.*sport|ajoute.*séance|sport|entraînement|entrainement/i, '')
          .trim() || 'Sport';
      }

      let profile = await db.sportProfile.findFirst({ where: { userId } });
      if (!profile) {
        profile = await db.sportProfile.create({
          data: { id: `profile-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, userId, level: 'intermédiaire', goals: '[]', preferredSports: '[]' },
        });
      }
      const session = await db.workoutSession.create({
        data: {
          id: `sport-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          profileId: profile.id,
          name,
          date: date ? new Date(date) : new Date(),
          duration,
          intensity: intensity || null,
          notes: notes || null,
          status: 'completed',
        },
      });
      return `🏋️ Séance enregistrée : "${session.name}" — ${duration}min${intensity ? `, intensité ${intensity}/10` : ''}`;
    },
  },

  // ==================== KNOWLEDGE ====================
  web_search: {
    name: 'web_search',
    description: 'Rechercher sur le web des informations, actualités, connaissances générales.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'La requête de recherche' },
      },
      required: ['query'],
    },
    execute: async (args) => {
      const { query } = args;
      try {
        const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } });
        const html = await res.text();
        const $ = cheerio.load(html);
        const results: string[] = [];
        $('.result__body').slice(0, 5).each((_, el) => {
          const title = $(el).find('.result__title').text().trim();
          const snippet = $(el).find('.result__snippet').text().trim();
          if (title) results.push(`• **${title}**\n  ${snippet}`);
        });
        if (results.length === 0) {
          const altResults: string[] = [];
          $('a[href*="://"]').slice(0, 5).each((_, el) => {
            const t = $(el).text().trim();
            const h = $(el).attr('href') || '';
            if (t && h && !h.includes('duckduckgo.com') && !h.includes('/html/')) altResults.push(`• [${t}](${h})`);
          });
          return altResults.length > 0 ? `🌐 Résultats pour "${query}":\n\n${altResults.join('\n')}` : `😕 Aucun résultat pour "${query}".`;
        }
        return `🌐 **Résultats pour "${query}"**\n\n${results.slice(0, 3).join('\n\n')}`;
      } catch (e) {
        return `❌ Erreur recherche: ${e}`;
      }
    },
  },

  scrape_url: {
    name: 'scrape_url',
    description: "Extraire le contenu textuel d'une page web ou d'un article.",
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: "URL complète de la page à extraire" },
      },
      required: ['url'],
    },
    execute: async (args) => {
      const { url } = args;
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } });
        const html = await res.text();
        const $ = cheerio.load(html);
        $('script, style, nav, footer, header, aside, iframe').remove();
        const title = $('title').text().trim();
        const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 3000);
        if (!text) return `📄 **${title}**\n\n(contenu vide ou inaccessible)`;
        return `📄 **${title}**\n\n${text.slice(0, 2000)}`;
      } catch (e) {
        return `❌ Erreur extraction: ${e}`;
      }
    },
  },

  // ==================== NOTES ====================
  save_note: {
    name: 'save_note',
    description: "Sauvegarder une note ou un contenu écrit (article, poème, texte, idée, journal).",
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Titre de la note' },
        content: { type: 'string', description: 'Contenu de la note' },
      },
      required: ['title', 'content'],
    },
    execute: async (args, { userId }) => {
      const { title, content } = args;
      await db.note.create({
        data: {
          id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId,
          title: title || 'Note',
          content: content || '',
        },
      });
      return `📝 Note sauvegardée : "${title}"`;
    },
  },

  get_notes: {
    name: 'get_notes',
    description: 'Récupérer les notes sauvegardées.',
    parameters: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Recherche dans le titre', nullable: true },
      },
      required: [],
    },
    execute: async (args, { userId }) => {
      const where: any = { userId };
      if (args.search) where.title = { contains: args.search };
      const notes = await db.note.findMany({ where, orderBy: { createdAt: 'desc' }, take: 10 });
      if (notes.length === 0) return '📝 Aucune note trouvée.';
      return notes.map(n => `• **${n.title}** — ${n.content.slice(0, 60)}...`).join('\n');
    },
  },
};

export function getOpenAITools(): any[] {
  return Object.values(TOOLS).map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      strict: true,
      parameters: t.parameters,
    },
  }));
}

export async function executeToolByName(name: string, args: Record<string, any>, userId: string = DEFAULT_USER_ID): Promise<string> {
  const tool = TOOLS[name as ToolName];
  if (!tool) return `Tool "${name}" non trouvé.`;
  try {
    return await tool.execute(args, { userId });
  } catch (e: any) {
    return `❌ Erreur lors de l'exécution de "${name}": ${e?.message || e}`;
  }
}
