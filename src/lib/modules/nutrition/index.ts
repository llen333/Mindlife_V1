import { Module, ModuleResponse, MessageContext, ToolDefinition, SkillDefinition } from '@/lib/bus/types';
import { bus } from '@/lib/bus/orchestrator';
import { NUTRITION_TOOLS } from './tools';
import { FALLBACK } from './fallback';

const toolNames = Object.keys(NUTRITION_TOOLS);

export class NutritionModule implements Module {
  id = 'nutrition';
  name = 'Nutrition';

  canHandle(intent: string): boolean {
    const keywords = ['repas', 'manger', 'mangé', 'cuisine', 'recette', 'recettes', 'menu', 'plan repas',
      'calorie', 'calories', 'nutrition', 'nutritif', 'alimentation', 'aliment', 'dîner', 'diner',
      'déjeuner', 'dejeuner', 'petit-déjeuner', 'petit dejeuner', 'breakfast', 'lunch', 'dinner',
      'ingrédient', 'ingredient', 'course', 'courses', 'marmiton', 'cuisiner', 'faim'];
    return keywords.some(k => intent.toLowerCase().includes(k));
  }

  async execute(context: MessageContext): Promise<ModuleResponse> {
    const { message } = context;
    try {
      const lower = message.toLowerCase();

      if (/recette|recettes|marmiton|cuisiner/i.test(lower)) {
        const query = message.replace(/che(c|r)che|trouve|donne|recette|recettes|de|du|des|marmiton|sur/gi, '').trim();
        const result = await NUTRITION_TOOLS.search_recipes.execute({ query: query || 'plat principal' }, { userId: context.userId || '' });
        return { success: true, content: result, moduleId: this.id };
      }

      if (/mangé|mange|j'ai pris|aujourd'hui.*mang/i.test(lower)) {
        const result = await NUTRITION_TOOLS.save_meal.execute({ query: message }, { userId: context.userId || '' });
        return { success: true, content: result, moduleId: this.id };
      }

      if (/plan.*repas|repas.*plan|planning.*repas|menu/i.test(lower)) {
        const result = await NUTRITION_TOOLS.create_meal_plan.execute({
          date: new Date().toISOString(),
          meals: JSON.stringify([{ name: message.replace(/plan|repas|menu|crée|prépare/gi, '').trim() || 'Repas' }]),
        }, { userId: context.userId || '' });
        return { success: true, content: result, moduleId: this.id };
      }

      if (/proposition|suggère|suggestion|conseil.*manger|quoi.*manger/i.test(lower)) {
        const mealType = lower.match(/petit.?déjeuner|breakfast|déjeuner|lunch|dîner|diner|dinner|snack|goûter/i)?.[0] || 'lunch';
        const typeMap: Record<string, string> = { 'petit-déjeuner': 'petit_dejeuner', 'breakfast': 'petit_dejeuner', 'petit dejeuner': 'petit_dejeuner', 'déjeuner': 'dejeuner', 'dejeuner': 'dejeuner', 'lunch': 'dejeuner', 'dîner': 'diner', 'diner': 'diner', 'dinner': 'diner', 'goûter': 'snack', 'snack': 'snack' };
        return { success: true, content: FALLBACK.suggestMeal(typeMap[mealType] || 'dejeuner'), moduleId: this.id };
      }

      return { success: true, content: FALLBACK.getAdvice('general'), moduleId: this.id };
    } catch (e: any) {
      return { success: true, content: FALLBACK.generateDay(), moduleId: this.id, error: e.message };
    }
  }

  getTools(): ToolDefinition[] {
    return toolNames.map(name => {
      const t = NUTRITION_TOOLS[name as keyof typeof NUTRITION_TOOLS];
      return {
        name: t.name,
        description: t.description,
        parameters: {},
        execute: async (args: Record<string, unknown>, ctx: MessageContext) => {
          return t.execute(args as any, { userId: ctx.userId || '' });
        },
      };
    });
  }

  getSkills(): SkillDefinition[] {
    return [
      { id: 'nutrition-search', name: 'Recherche de recettes', description: 'Chercher des recettes sur Marmiton' },
      { id: 'nutrition-track', name: 'Suivi des repas', description: 'Enregistrer et consulter les repas' },
      { id: 'nutrition-plan', name: 'Planification repas', description: 'Créer des plans de repas' },
      { id: 'nutrition-advice', name: 'Conseils nutrition', description: 'Donner des conseils nutritionnels' },
    ];
  }
}

bus.register(new NutritionModule());

