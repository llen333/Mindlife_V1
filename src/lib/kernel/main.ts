import { kernel } from './ipc';
import { bus } from '@/lib/bus/orchestrator';
import { registry } from '@/lib/bus/registry';
import { moduleLoader } from '@/lib/bus/loader';
import { eventBus, SystemEvents } from '@/lib/bus/events';
import type { KernelRequest, KernelResponse } from './types';

function registerModuleHandlers(): void {
  const modules = bus.getAllModules();

  for (const mod of modules) {
    const moduleId = mod.id;

    kernel.register(moduleId, 'execute', async (req: KernelRequest) => {
      const context = {
        message: String(req.params.message || ''),
        history: [],
        sessionId: req.id,
        userId: req.userId,
        intent: String(req.params.intent || moduleId),
      };

      const result = await bus.routeTo(moduleId, context);
      return {
        success: result.success,
        data: { content: result.content },
        error: result.error,
      };
    });

    kernel.register(moduleId, 'route', async (req: KernelRequest) => {
      const result = await bus.route({
        message: String(req.params.message || ''),
        history: [],
        sessionId: req.id,
        userId: req.userId,
        intent: String(req.params.intent || ''),
      });
      return {
        success: result.success,
        data: { content: result.content, moduleId: result.moduleId },
        error: result.error,
      };
    });
  }
}

function registerKernelInternalHandlers(): void {
  kernel.register('kernel', 'stats', async () => ({
    success: true,
    data: kernel.getStats(),
  }));

  kernel.register('kernel', 'events', async (req: KernelRequest) => ({
    success: true,
    data: kernel.getEvents(Number(req.params.limit) || 50),
  }));

  kernel.register('kernel', 'modules', async () => ({
    success: true,
    data: registry.getAllManifests(),
  }));

  kernel.register('kernel', 'handlers', async () => ({
    success: true,
    data: kernel.registeredHandlers,
  }));

  // Handler pour le flux conversationnel — chaque message utilisateur transite par le kernel
  kernel.register('agent', 'process', async (req: KernelRequest) => {
    const agentId = String(req.params.agentId || '');
    const messageLength = Number(req.params.messageLength) || 0;
    const hasSession = Boolean(req.params.hasSession);

    if (!agentId) {
      return { success: false, error: 'ID agent requis' };
    }
    if (!hasSession) {
      return { success: false, error: 'Session requise pour le traitement' };
    }
    if (messageLength < 1) {
      return { success: false, error: 'Message vide' };
    }
    if (messageLength > 10000) {
      return { success: false, error: 'Message trop long (max 10000 caractères)' };
    }

    return { success: true, data: { validated: true, agentId, timestamp: Date.now() } };
  });
}

function setupEventBridge(): void {
  eventBus.on(SystemEvents.MODULE_LOADED, async (payload) => {
    registerModuleHandlers();
  });

  eventBus.on(SystemEvents.MODULE_UNLOADED, async () => {
    registerModuleHandlers();
  });
}

export function initKernel(): void {
  registerModuleHandlers();
  setupEventBridge();
  console.log(`[KERNEL] Initialisé — ${kernel.registeredHandlers.length} handlers enregistrés`);
}

// Auto-enregistrement des handlers kernel au chargement du module
// (agent:process, kernel:stats, etc. — pas de dépendance externe)
registerKernelInternalHandlers();

export { kernel };
