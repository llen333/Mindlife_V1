import { db } from '@/lib/db';
import * as cheerio from 'cheerio';
import { DEFAULT_USER_ID } from './constants';

export type ToolName =
  | 'create_event' | 'get_events' | 'update_event' | 'delete_event'
  | 'search_recipes' | 'save_meal' | 'get_meals' | 'create_meal_plan' | 'get_meal_plan'
  | 'create_shopping_list' | 'get_shopping_lists'
  | 'create_task' | 'get_tasks'
  | 'log_weight' | 'log_sleep' | 'log_sport_session'
  | 'web_search' | 'scrape_url' | 'save_note' | 'get_notes'
  // Mega-Tools
  | 'meal_plan_complex' | 'ai_shopping_assistant' | 'workout_generator';

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
      const { startDate, endDate, description, location, color } = args;
      let rawTitle = args.title || 'Événement';
      rawTitle = rawTitle
        .replace(/^(prendre un |ajouter |créer |cree |planifier |programmer |noter )/i, '')
        .replace(/\b(un |une |des |du |de la |pour |chez |au |aux |le |la |les |mon |mes |ton |ta |sa |notre |votre )/gi, ' ')
        .replace(/\s+(demain|aujourd'hui|ce (soir|matin|midi|après.midi)|à \d+h\d*|à \d+ heures?)/gi, '')
        .replace(/\s+/g, ' ').trim();
      const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
      let start = parseRelativeDate(startDate);
      if (!start) start = new Date(startDate);
      if (isNaN(start.getTime())) start = new Date(Date.now() + 3600000);
      const end = endDate ? (parseRelativeDate(endDate) || new Date(endDate)) : new Date(start.getTime() + 3600000);

      const event = await db.event.create({
        data: {
          id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId,
          title,
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
      const { description, priority, dueDate } = args;
      let rawTitle = args.title || '';
      rawTitle = rawTitle
        .replace(/^(prendre un |ajouter |créer |cree |planifier |programmer |rajouter |noter |faire |aller |voir )/i, '')
        .replace(/\b(un |une |des |du |de la |pour |chez |au |aux |le |la |les |mon |mes |ma |ton |ta |tes |sa |ses |notre |vos |leurs )/gi, ' ')
        .replace(/\s+(demain|aujourd'hui|ce (soir|matin|midi|après.midi)|à \d+h\d*|à \d+ heures?)/gi, '')
        .replace(/\s+/g, ' ').trim();
      const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
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

  // ==================== MEGA TOOLS ====================
  // Outils composites qui réalisent des workflows complexes en une seule action

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

      // 1. Détecter la date si non fournie
      let targetDate = date;
      if (!date) {
        const today = new Date();
        if (/demain/i.test(query.toLowerCase())) {
          targetDate = new Date(today.getTime() + 86400000).toISOString().split('T')[0];
        } else {
          targetDate = today.toISOString().split('T')[0];
        }
      }

      try {
        // 2. Rechercher des recettes
        const searchUrl = `https://www.marmiton.org/recettes/recherche.aspx?aqt=${encodeURIComponent(query)}`;
        const res = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } });
        const html = await res.text();
        const $ = cheerio.load(html);

        // Trouver la première recette pertinente
        let recipeUrl = '';
        let recipeTitle = '';

        $('.recipe-card, .RCP__sc-1g9c9kz-0, article[class*="recipe"]').first().each((_, el) => {
          const link = $(el).find('a').first();
          const href = link.attr('href') || '';
          const title = link.attr('title') || link.text().trim();
          if (href && title) {
            recipeUrl = href.startsWith('http') ? href : `https://www.marmiton.org${href}`;
            recipeTitle = title;
          }
        });

        if (!recipeUrl) {
          return `❌ Je n'ai pas trouvé de recette pour "${query}". Essayez un autre terme.`;
        }

        // 3. Scraper la recette en détail
        const recipeRes = await fetch(recipeUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } });
        const recipeHtml = await recipeRes.text();
        const $$ = cheerio.load(recipeHtml);

        // Extraire les ingrédients avec plus de détails
        const ingredients: any[] = [];
        let ingredientIndex = 1;
        $$('.ingredient, [class*="ingredient"] li, .recipe-ingredients li, .preparation-ingredient, ul.ingredients li').each((_, el) => {
          const text = $$(el).text().trim();
          if (text && !text.includes('©') && text.length > 3 && text.length < 100) {
            // Essayer d'extraire la quantité et l'unité
            const quantityMatch = text.match(/(\d+(?:,\d+)?)\s*(g|kg|ml|l|unité|pièce|cuillère|c.à.s|c.à.c|tasse|verre)/i);
            const quantity = quantityMatch ? quantityMatch[1] : '1';
            const unit = quantityMatch ? quantityMatch[2] : 'pièce';

            // Nettoyer le nom de l'ingrédient
            let name = text.replace(/^\d+[\s,]*(g|kg|ml|l|unité|pièce|cuillère|c\.à\.[sc]|tasse|verre)\s*/i, '').trim();

            ingredients.push({
              id: `ing-${ingredientIndex++}`,
              name: name || text,
              quantity: quantity,
              unit: unit,
              checked: false,
              price: estimatePrice(name, quantity, unit)
            });
          }
        });

        // Si pas assez d'ingrédients trouvés, en générer basés sur le titre
        if (ingredients.length < 5) {
          const additionalIngredients = generateIngredientsFromTitle(title, 5 - ingredients.length);
          ingredients.push(...additionalIngredients);
        }

        // Extraire les étapes avec durées estimées
        const steps: any[] = [];
        let stepIndex = 1;
        $$('.recipe-steps li, [class*="step"] li, .preparation li, .instruction, ol li').each((_, el) => {
          const text = $$(el).text().trim();
          if (text && !text.includes('©') && text.length > 5 && text.length < 300) {
            // Estimer la durée basée sur le contenu
            const duration = estimateStepDuration(text);
            steps.push({
              id: stepIndex++,
              instruction: text,
              duration: duration
            });
          }
        });

        // Si pas assez d'étapes trouvées, en générer basées sur le titre
        if (steps.length < 5) {
          const additionalSteps = generateStepsFromTitle(title, 5 - steps.length);
          steps.push(...additionalSteps);
        }

        // Extraire infos nutritionnelles si disponibles
        const nutritionInfo = extractNutritionFromPage($$);

        // 4. Calculer les approximations de calories
        const estimatedCalories = estimateCalories(ingredients, servings);

        // 5. Créer le repas structuré
        const mealData = {
          name: title,
          type: mealType,
          servings,
          calories: estimatedCalories,
          ingredients,
          steps,
          nutrition: nutritionInfo,
          sourceUrl: recipeUrl,
          isGenerated: true
        };

        // 6. Enregistrer le repas avec TOUTES les données structurées
        const savedMeal = await db.meal.create({
          data: {
            id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            userId,
            name: title,
            description: `Recette complète de ${query} - ${ingredients.length} ingrédients, ${steps.length} étapes`,
            type: mealType,
            date: new Date(targetDate),
            calories: estimatedCalories,
            ingredients: JSON.stringify(ingredients.map(ing => ({
              id: ing.id,
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              checked: false,
              price: ing.price
            }))),
            instructions: JSON.stringify(steps.map(step => ({
              id: step.id,
              instruction: step.instruction,
              duration: step.duration
            }))),
            prepTime: nutritionInfo.prepTime,
            cookTime: nutritionInfo.cookTime,
            servings,
            imageUrl: nutritionInfo.imageUrl,
            isGenerated: true,
            isFavorite: false,
          },
        });

        // 7. Créer le meal plan
        const mealPlan = await db.mealPlan.create({
          data: {
            id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            userId,
            date: new Date(targetDate),
            meals: JSON.stringify([mealData]),
            totalCalories: estimatedCalories,
            notes: `Planifié par l'assistant IA - ${query}`,
          },
        });

        // 8. Générer la liste de courses intelligente
        const shoppingList = await generateSmartShoppingList(ingredients, budget, servings);

        // 9. Synthétiser la réponse complète
        const response = `
🍳 **${title}** programmée pour le ${new Date(targetDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} !

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

        return response;

      } catch (error) {
        console.error('[MEAL_PLAN_COMPLEX] Error:', error);
        return `❌ Une erreur est survenue lors de la planification de votre repas. Veuillez réessayer.`;
      }
    },
  },

  ai_shopping_assistant: {
    name: 'ai_shopping_assistant',
    description: 'Crée une liste de courses intelligente en tenant compte du budget, des besoins nutritionnels et des repas planifiés.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Type de courses ou liste d\'articles' },
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
        // Extraire les ingrédients des repas planifiés
        let allIngredients: string[] = [];
        if (mealPlan) {
          try {
            const meals = JSON.parse(mealPlan);
            allIngredients = meals.flatMap((meal: any) =>
              typeof meal.ingredients === 'string' ? JSON.parse(meal.ingredients) : meal.ingredients || []
            );
          } catch (e) {
            console.error('Error parsing meal plan:', e);
          }
        }

        // Analyser la requête pour ajouter des articles de base
        const baseItems = extractBaseItemsFromQuery(query);
        const allItems = [...allIngredients, ...baseItems];

        // Générer la liste de courses optimisée
        const shoppingList = await generateOptimizedShoppingList(allItems, budget, preferences);

        return `🛒 **Liste de courses intelligente** ${
          date ? `pour ${new Date(date).toLocaleDateString('fr-FR')}` : ''
        } ${
          budget ? `- Budget : ${budget}€` : ''
        }

${shoppingList}

🎯 *Liste générée par IA, optimisée pour éviter les doublons et respecter votre budget !*`;
      } catch (error) {
        return `❌ Impossible de générer la liste de courses : ${error}`;
      }
    },
  },

  workout_generator: {
    name: 'workout_generator',
    description: 'Génère un programme d\'entraînement personnalisé basé sur les objectifs, le niveau et les équipements disponibles.',
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
        // Générer le programme d'entraînement
        const workout = await generatePersonalizedWorkout({
          goal,
          level,
          duration,
          equipment,
          focusArea,
          userId
        });

        return `
💪 **Programme d\'entraînement ${goal} - ${level}**

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

// ==================== FONCTIONS UTILITAIRES ====================

function estimatePrice(ingredientName: string, quantity: string, unit: string): number {
  const priceMap: Record<string, number> = {
    'poulet': 12, 'bœuf': 15, 'poisson': 18, 'saumon': 20, 'thon': 22,
    'riz': 3, 'pâtes': 2, 'pommes de terre': 2, 'légumes': 4, 'tomates': 3,
    'fromage': 8, 'œufs': 4, 'lait': 2, 'beurre': 4, 'huile': 5,
    'farine': 2, 'sucre': 2, 'sel': 1, 'poivre': 3, 'ail': 1, 'oignon': 1
  };

  const lowerName = ingredientName.toLowerCase();
  for (const [key, price] of Object.entries(priceMap)) {
    if (lowerName.includes(key)) {
      return price * (parseFloat(quantity) || 1) / 10;
    }
  }
  return 2.0; // Prix par défaut
}

function estimateStepDuration(stepText: string): number {
  const lower = stepText.toLowerCase();

  // Mots-clés indiquant des durées
  if (lower.includes('cuire') || lower.includes('rôtir') || lower.includes('mijoter')) return 20;
  if (lower.includes('faire revenir') || lower.includes('saisir')) return 8;
  if (lower.includes('préparer') || lower.includes('laver') || lower.includes('éplucher')) return 10;
  if (lower.includes('servir') || lower.includes('dresser')) return 5;
  if (lower.includes('laisser reposer') || lower.includes('refroidir')) return 15;

  return 7; // Durée par défaut
}

function generateIngredientsFromTitle(title: string, count: number): any[] {
  const ingredients: any[] = [];
  const lowerTitle = title.toLowerCase();

  // Générer des ingrédients basés sur le titre
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
      { id: `gen-${Date.now()}-2`, name: 'Huile d\'olive', quantity: '30', unit: 'ml', checked: false, price: 1.50 },
      { id: `gen-${Date.now()}-3`, name: 'Ail', quantity: '3', unit: 'gousses', checked: false, price: 0.50 },
      { id: `gen-${Date.now()}-4`, name: 'Herbes aromatiques', quantity: '10', unit: 'g', checked: false, price: 1.00 }
    );
  } else if (lowerTitle.includes('paella') || lowerTitle.includes('riz')) {
    ingredients.push(
      { id: `gen-${Date.now()}-1`, name: 'Riz', quantity: '300', unit: 'g', checked: false, price: 3.00 },
      { id: `gen-${Date.now()}-2`, name: 'Huile d\'olive', quantity: '40', unit: 'ml', checked: false, price: 2.00 },
      { id: `gen-${Date.now()}-3`, name: 'Safran', quantity: '1', unit: 'pincée', checked: false, price: 3.00 },
      { id: `gen-${Date.now()}-4`, name: 'Légumes variés', quantity: '200', unit: 'g', checked: false, price: 4.00 }
    );
  } else {
    // Ingrédients génériques
    ingredients.push(
      { id: `gen-${Date.now()}-1`, name: 'Ingrédient principal', quantity: '300', unit: 'g', checked: false, price: 8.00 },
      { id: `gen-${Date.now()}-2`, name: 'Huile d\'olive', quantity: '30', unit: 'ml', checked: false, price: 1.50 },
      { id: `gen-${Date.now()}-3`, name: 'Sel et poivre', quantity: '1', unit: 'pincée', checked: false, price: 0.50 },
      { id: `gen-${Date.now()}-4`, name: 'Herbes fraîches', quantity: '10', unit: 'g', checked: false, price: 1.00 }
    );
  }

  return ingredients.slice(0, count);
}

function generateStepsFromTitle(title: string, count: number): any[] {
  const steps: any[] = [];
  const lowerTitle = title.toLowerCase();

  // Générer des étapes basées sur le titre
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
      { id: 2, instruction: 'Faire chauffer l\'huile dans une poêle ou poêle à feu vif.', duration: 3 },
      { id: 3, instruction: 'Saisir la viande des deux côtés pour obtenir une belle couleur.', duration: 8 },
      { id: 4, instruction: 'Cuire à la température interne souhaitée (moyen à point).', duration: 15 },
      { id: 5, instruction: 'Laisser reposer la viande avant de la servir.', duration: 10 }
    );
  } else if (lowerTitle.includes('paella') || lowerTitle.includes('riz')) {
    steps.push(
      { id: 1, instruction: 'Faire chauffer l\'huile dans une poêle large et faire revenir l\'ail.', duration: 5 },
      { id: 2, instruction: 'Ajouter le riz et le faire torréfier 2-3 minutes en remuant.', duration: 5 },
      { id: 3, instruction: 'Verser le bouillon chaud et le safran, couvrir et cuire à feu doux.', duration: 18 },
      { id: 4, instruction: 'Laisser le riz absorber tout le liquide (ne pas remuer après les 5 premières min).', duration: 2 },
      { id: 5, instruction: 'Laisser reposer hors feu 5 minutes avant de servir.', duration: 7 }
    );
  } else {
    // Étapes génériques
    steps.push(
      { id: 1, instruction: 'Préparer tous les ingrédients et les disposer près de votre plan de travail.', duration: 8 },
      { id: 2, instruction: 'Chauffer votre matière grasse dans votre ustensile de cuisson.', duration: 3 },
      { id: 3, instruction: 'Cuire les ingrédients principaux selon les instructions de la recette.', duration: 20 },
      { id: 4, instruction: 'Ajuster l\'assaisonnement et terminer la cuisson.', duration: 10 },
      { id: 5, instruction: 'Présenter le plat et servir chaud avec les accompagnements.', duration: 7 }
    );
  }

  return steps.slice(0, count);
}

// Fonctions utilitaires pour les Mega-Tools

async function extractNutritionFromPage($: any) {
  // Extraction des informations nutritionnelles
  const nutrition: any = {};

  // Essayer différentes sélecteurs pour le temps
  const timeText = $('time, .time, [class*="time"], .prep-time, .cook-time').first().text();
  const timeMatch = timeText.match(/(\d+)\s*min/);
  if (timeMatch) {
    const prepMatch = timeText.match(/préparation.*?(\d+)\s*min/i);
    const cookMatch = timeText.match(/cuisson.*?(\d+)\s*min/i);
    nutrition.prepTime = prepMatch ? parseInt(prepMatch[1]) : Math.floor(parseInt(timeMatch[1]) / 2);
    nutrition.cookTime = cookMatch ? parseInt(cookMatch[1]) : Math.floor(parseInt(timeMatch[1]) / 2);
  }

  // Essayer d'extraire une image
  const imageUrl = $('img[class*="recipe"], img[class*="photo"], .recipe-image img, .main-image img').first().attr('src');
  nutrition.imageUrl = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `https://www.marmiton.org${imageUrl}`) : null;

  return nutrition;
}

function estimateCalories(ingredients: string[], servings: number): number {
  // Estimation basique des calories
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
      if (lower.includes(key)) {
        totalCalories += calories;
        break;
      }
    }
  });

  return Math.round(totalCalories * servings / 4); // Divisé par 4 estimation portions
}

async function generateSmartShoppingList(ingredients: string[], budget?: number, servings: number = 4): Promise<string> {
  // Dé-duplication des ingrédients
  const uniqueIngredients = [...new Set(ingredients.map(i => i.toLowerCase()))];

  // Grouper par catégories
  const categories: Record<string, string[]> = {
    'Légumes': [],
    'Viandes & Poissons': [],
    'Épices & Herbes': [],
    'Produits laitiers': [],
    'Épicerie': [],
    'Boissons': []
  };

  uniqueIngredients.forEach(ingredient => {
    if (ingredient.includes('oignon') || ingredient.includes('ail') || ingredient.includes('tomate') ||
        ingredient.includes('poivron') || ingredient.includes('carotte') || ingredient.includes('légume')) {
      categories['Légumes'].push(ingredient);
    } else if (ingredient.includes('poulet') || ingredient.includes('boeuf') || ingredient.includes('poisson') ||
               ingredient.includes('viande') || ingredient.includes('escalope')) {
      categories['Viandes & Poissons'].push(ingredient);
    } else if (ingredient.includes('sel') || ingredient.includes('poivre') || ingredient.includes('huile') ||
               ingredient.includes('beurre') || ingredient.includes('farine') || ingredient.includes('huile')) {
      categories['Épicerie'].push(ingredient);
    } else if (ingredient.includes('thym') || ingredient.includes('laurel') || ingredient.includes('herbe')) {
      categories['Épices & Herbes'].push(ingredient);
    } else if (ingredient.includes('lait') || ingredient.includes('fromage') || ingredient.includes('yaourt')) {
      categories['Produits laitiers'].push(ingredient);
    } else {
      categories['Boissons'].push(ingredient);
    }
  });

  // Générer la liste formatée
  let shoppingList = '';
  Object.entries(categories).forEach(([category, items]) => {
    if (items.length > 0) {
      shoppingList += `\n**${category} :**\n`;
      shoppingList += items.map(item => `• ${item}`).join('\n') + '\n';
    }
  });

  // Ajouter des conseils si budget limité
  if (budget && budget < 30) {
    shoppingList += `\n💡 *Conseil budget : Privilégiez les légumes de saison et les protéines bon marché comme les œufs et les lentilles !*`;
  }

  return shoppingList;
}

function extractBaseItemsFromQuery(query: string): string[] {
  const items: string[] = [];

  // Articles de base courants
  const baseItems = [
    'sel', 'poivre', 'huile d\'olive', 'sucre', 'vinaigre',
    'sel', 'poivre', 'huile', 'beurre', 'œufs'
  ];

  if (query.includes('dîner') || query.includes('soir')) {
    items.push('pain', 'vin', 'fromage');
  }
  if (query.includes('déjeuner') || query.includes('midi')) {
    items.push('pain', 'fromage', 'fruits');
  }
  if (query.includes('petit-déjeuner') || query.includes('matin')) {
    items.push('café', 'jus de fruits', 'céréales');
  }

  return [...new Set([...items, ...baseItems.slice(0, 3)])];
}

async function generateOptimizedShoppingList(items: string[], budget?: number, preferences?: string): Promise<string> {
  // Optimiser la liste par catégories avec budget
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

  // Base d'exercices par objectif
  const exercisesByGoal: Record<string, string[]> = {
    force: ['Développé couché', 'Tractions', 'Squat', 'Soulevé de terre'],
    endurance: ['Course à pied', 'Vélo', 'Natation', 'Burpees'],
    musculation: ['Presse à cuisse', 'Curl biceps', 'Élévations latérales', 'Crunchs'],
    'perte de poids': ['Jumping jacks', 'Mountain climbers', 'Fentes marchées', 'Rameur'],
    santé: ['Marche rapide', 'Étirements', 'Yoga simple', 'Respiration contrôlée']
  };

  const exercises = exercisesByGoal[goal] || exercisesByGoal.musculation;

  // Adapter par niveau et équipement
  const workout = `
**Série d'échauffement (10 min) :**
- Marche rapide 5 min
- Étirements dynamiques 5 min

**Exercices principaux (${duration - 20} min) :**
${exercises.slice(0, 4).map((ex, i) => `${i + 1}. ${ex} - 3 séries de ${level === 'débutant' ? '10' : level === 'avancé' ? '15' : '12'} répétitions`).join('\n')}

**Série de récupération (10 min) :**
- Respiration profonde
- Étirements légers

*Intensité adaptée à votre niveau ${level}.*
`;

  return workout;
}

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
