import { MEGA_TOOLS, executeMegaTool, type ToolDef } from './legacy-tools';
import { DEFAULT_USER_ID } from './constants';
import { bus } from '@/lib/bus/orchestrator';

export type ToolName = 'meal_plan_complex' | 'ai_shopping_assistant' | 'workout_generator';

const MEGA_TOOL_NAMES: ToolName[] = ['meal_plan_complex', 'ai_shopping_assistant', 'workout_generator'];

export const TOOLS: Record<ToolName, ToolDef> = {
  meal_plan_complex: MEGA_TOOLS.meal_plan_complex,
  ai_shopping_assistant: MEGA_TOOLS.ai_shopping_assistant,
  workout_generator: MEGA_TOOLS.workout_generator,
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
  if (MEGA_TOOL_NAMES.includes(name as ToolName)) {
    return executeMegaTool(name, args, userId);
  }

  const allModules = bus.getAllModules();
  for (const module of allModules) {
    const tool = module.getTools().find(t => t.name === name);
    if (tool) {
      try {
        const result = await tool.execute(args, { message: '', history: [], sessionId: '', userId });
        if (typeof result === 'string') return result;
        if (result && typeof result === 'object' && 'content' in result) return (result as any).content;
        return JSON.stringify(result);
      } catch (e: any) {
        return `❌ Erreur lors de l'exécution de "${name}": ${e?.message || e}`;
      }
    }
  }

  return `❌ Tool "${name}" non trouvé.`;
}
