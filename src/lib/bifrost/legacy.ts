import { Module, ModuleResponse, MessageContext, ToolDefinition, SkillDefinition } from '@/lib/bus/types';
import { bus } from '@/lib/bus/orchestrator';
import { detectAndExecute } from '@/lib/agent-tools';
import { executeToolByName, getOpenAITools } from '@/lib/ai-tools';

const DEFAULT_USER_ID = 'mindlife-user';

class LegacyModule implements Module {
  id = 'legacy';
  name = 'Legacy Tools';

  canHandle(_intent: string): boolean {
    return false;
  }

  async execute(context: MessageContext): Promise<ModuleResponse> {
    try {
      const result = await detectAndExecute(
        context.message,
        context.userId || DEFAULT_USER_ID
      );

      if (result) {
        return {
          success: result.success,
          content: result.output,
          moduleId: this.id,
        };
      }

      return {
        success: false,
        content: '',
        moduleId: this.id,
        error: 'No tool matched',
      };
    } catch (e: any) {
      return {
        success: false,
        content: '',
        moduleId: this.id,
        error: e.message,
      };
    }
  }

  getTools(): ToolDefinition[] {
    const openaiTools = getOpenAITools();
    return openaiTools.map((t: any) => ({
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters || {},
      execute: async (args: Record<string, unknown>, ctx: MessageContext) => {
        return executeToolByName(
          t.function.name,
          args as Record<string, any>,
          ctx.userId || DEFAULT_USER_ID
        );
      },
    }));
  }

  getSkills(): SkillDefinition[] {
    return [
      { id: 'web-search', name: 'Recherche Web', description: 'Chercher sur Internet' },
      { id: 'task-manage', name: 'Gestion tâches', description: 'Créer et gérer des tâches' },
      { id: 'event-manage', name: 'Gestion événements', description: 'Créer des événements' },
      { id: 'goal-manage', name: 'Gestion objectifs', description: 'Créer des objectifs' },
      { id: 'note-manage', name: 'Notes', description: 'Prendre des notes' },
      { id: 'data-query', name: 'Analyse données', description: 'Interroger les données utilisateur' },
      { id: 'code-exec', name: 'Exécution code', description: 'Exécuter du code' },
      { id: 'image-gen', name: 'Images', description: 'Rechercher des images' },
    ];
  }
}

const legacyModule = new LegacyModule();
bus.register(legacyModule);

export { LegacyModule, legacyModule };
