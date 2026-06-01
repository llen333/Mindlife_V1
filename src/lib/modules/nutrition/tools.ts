import { db } from '@/lib/db';
import * as cheerio from 'cheerio';

interface ExecuteCtx { userId: string }

export const NUTRITION_TOOLS = {
  search_recipes: {
    name: 'search_recipes',
    description: 'Rechercher des recettes de cuisine sur Marmiton.',
    execute: async (args: Record<string, any>, { userId }: ExecuteCtx) => {
      const { query } = args;
      if (!query) return '⚠️ Donne moi un plat ou des ingrédients à chercher.';
      const url = `https://www.marmiton.org/recettes/recherche.aspx?aqt=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } });
      const html = await res.text();
      const $ = cheerio.load(html);
      const recipes: { title: string; url: string; desc: string }[] = [];
      $('.recipe-card, .RCP__sc-1g9c9kz-0, article[class*="recipe"]').slice(0, 5).each((_, el) => {
        const link = $(el).find('a').first();
        const href = link.attr('href');
        const title = link.attr('title') || link.text().trim();
        if (href && title) recipes.push({ title, url: href.startsWith('http') ? href : `https://www.marmiton.org${href}`, desc: '' });
      });
      if (recipes.length === 0) return `😕 Pas de recette pour "${query}" sur Marmiton.`;
      let output = `🍳 **${recipes.length} recette(s)** pour "${query}" :\n\n`;
      output += recipes.map((r, i) => `${i + 1}. **${r.title}**\n   ${r.url}`).join('\n\n');
      return output;
    },
  },

  save_meal: {
    name: 'save_meal',
    description: 'Enregistrer un repas consommé avec ses infos nutritionnelles.',
    execute: async (args: Record<string, any>, { userId }: ExecuteCtx) => {
      let { name, type, date, calories, protein, carbs, fat, ingredients, instructions, servings } = args;
      if (args.query && !name) {
        const q = args.query as string;
        const calMatch = q.match(/(\d+)\s*(kcal|calories|cal)/i);
        if (calMatch) calories = parseInt(calMatch[1]);
        name = q.replace(/(\d+)\s*(kcal|calories|cal)/gi, '').replace(/^(j'ai mangé|je mange|manger|ajoute|sauvegarde|enregistre)\s*/i, '').trim() || 'Repas';
      }
      if (!name) return '⚠️ Nom du repas requis.';
      const meal = await db.meal.create({
        data: {
          id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId,
          name,
          type: type || 'lunch',
          date: date ? new Date(date) : new Date(),
          calories: calories || null,
          protein: protein || null,
          carbs: carbs || null,
          fat: fat || null,
          ingredients: ingredients ? (typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients)) : null,
          instructions: instructions ? (typeof instructions === 'string' ? instructions : JSON.stringify(instructions)) : null,
          servings: servings || null,
        },
      });
      return `✅ **${meal.name}** enregistré ! ${meal.calories ? `🔥 ${meal.calories} kcal` : ''} ${meal.protein ? `💪 ${meal.protein}g protéines` : ''}`.trim();
    },
  },

  get_meals: {
    name: 'get_meals',
    description: 'Récupérer la liste des repas enregistrés.',
    execute: async (args: Record<string, any>, { userId }: ExecuteCtx) => {
      const { from, to } = args;
      const where: any = { userId };
      if (from) where.date = { ...where.date, gte: new Date(from) };
      if (to) where.date = { ...where.date, lte: new Date(to) };
      if (!from && !to) {
        const start = new Date(); start.setDate(start.getDate() - 7);
        where.date = { gte: start };
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
    description: 'Créer un plan de repas pour une date donnée.',
    execute: async (args: Record<string, any>, { userId }: ExecuteCtx) => {
      let { date, meals, totalCalories, notes } = args;
      let mealsJson: string;
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
    execute: async (args: Record<string, any>, { userId }: ExecuteCtx) => {
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
      let mealsParsed: any[];
      try { mealsParsed = JSON.parse(plan.meals); } catch { mealsParsed = [{ name: plan.meals }]; }
      const lines = Array.isArray(mealsParsed) ? mealsParsed.map((m: any) => `• ${m.name || ''}${m.calories ? ` (${m.calories} kcal)` : ''}`).join('\n') : plan.meals;
      return `📋 **Plan repas du ${startOfDay.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}**\n\n${lines}\n\n🔥 ${plan.totalCalories} kcal\n${plan.notes ? `📝 ${plan.notes}` : ''}`;
    },
  },
};
