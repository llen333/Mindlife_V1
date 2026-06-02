import { Module, ModuleResponse, MessageContext } from './types';
import { EventBus, eventBus, SystemEvents } from './events';

export class Orchestrator {
  private modules: Map<string, Module> = new Map();

  register(module: Module): void {
    this.modules.set(module.id, module);
    console.log(`[BUS] Module '${module.id}' (${module.name}) enregistré`);
    eventBus.emit(SystemEvents.MODULE_LOADED, { moduleId: module.id, name: module.name });
  }

  getModule(id: string): Module | undefined {
    return this.modules.get(id);
  }

  getAllModules(): Module[] {
    return Array.from(this.modules.values());
  }

  unregister(moduleId: string): boolean {
    const module = this.modules.get(moduleId);
    if (!module) return false;
    this.modules.delete(moduleId);
    console.log(`[BUS] Module '${moduleId}' (${module.name}) désenregistré`);
    eventBus.emit(SystemEvents.MODULE_UNLOADED, { moduleId, name: module.name });
    return true;
  }

  getEventBus(): EventBus {
    return eventBus;
  }

  async route(context: MessageContext): Promise<ModuleResponse> {
    const { intent } = context;

    if (intent) {
      eventBus.emit(SystemEvents.INTENT_DETECTED, { intent, sessionId: context.sessionId });

      for (const module of this.modules.values()) {
        if (module.canHandle(intent)) {
          try {
            const response = await module.execute(context);
            return response;
          } catch (e: any) {
            eventBus.emit(SystemEvents.MODULE_ERROR, {
              moduleId: module.id,
              intent,
              error: e.message,
            });
            return {
              success: false,
              content: `Erreur dans le module '${module.id}': ${e.message}`,
              moduleId: module.id,
              error: e.message,
            };
          }
        }
      }
    }

    return {
      success: false,
      content: `Aucun module trouvé pour l'intention: ${intent || 'non spécifiée'}`,
      moduleId: 'bus',
      error: `No handler for intent: ${intent}`,
    };
  }

  async routeTo(moduleId: string, context: MessageContext): Promise<ModuleResponse> {
    const module = this.modules.get(moduleId);
    if (!module) {
      return {
        success: false,
        content: `Module '${moduleId}' introuvable`,
        moduleId: 'bus',
        error: `Module not found: ${moduleId}`,
      };
    }
    try {
      return await module.execute(context);
    } catch (e: any) {
      return {
        success: false,
        content: `Erreur dans le module '${moduleId}': ${e.message}`,
        moduleId,
        error: e.message,
      };
    }
  }
}

export const bus = new Orchestrator();
