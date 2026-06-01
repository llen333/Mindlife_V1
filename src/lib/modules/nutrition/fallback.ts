import { getRandomMeal, getNutritionAdvice, generateDayMenu } from '@/lib/nutrition-fallback';

export const FALLBACK = {
  suggestMeal(type: string): string {
    const meal = getRandomMeal(type);
    if (!meal) return '🍽️ Désolé, je n\'ai pas de suggestion pour ce type de repas.';
    return `🍳 **${meal.name}**\n\n${meal.description}\n\n⏱️ Préparation: ${meal.prepTime} | Cuisson: ${meal.cookTime}\n🔥 ${meal.calories} kcal | 💪 ${meal.protein}g protéines`;
  },

  getAdvice(topic: string): string {
    return getNutritionAdvice(topic);
  },

  generateDay(): string {
    const day = generateDayMenu();
    const lines = Object.values(day).map(m => `\u2022 **${m.name}** (${m.calories} kcal)`);
    return `\uD83D\uDCC5 **Menu du jour**\n\n${lines.join('\n')}`;
  },
};
