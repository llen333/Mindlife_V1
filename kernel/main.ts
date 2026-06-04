import { bus } from '../src/lib/bus/orchestrator';
import { registry } from '../src/lib/bus/registry';
import { eventBus, SystemEvents } from '../src/lib/bus/events';
import { IpcServer } from './ipc/server';
import { kernelStore } from './store';
import { sysFs } from './syscalls/fs';
import { sysMem } from './syscalls/mem';
import { sysAgent } from './syscalls/agent';
import { moduleStore } from './store/manager';
import { remoteStore } from './store/remote';
import { moduleSandbox } from './runtime/sandbox';
import { rateLimiter } from './runtime/ratelimit';
import { deadLetterQueue } from './runtime/queue';
import { moduleTokenManager } from './security/tokens';
import { auditLogger } from './security/audit';
import { permissionManager } from './security/permissions';
import { ipLimiter } from './security/ip-limiter';
import { securityMonitor } from './security/monitor';
import { memoryConsolidator } from './memory/consolidation';
import type { IpcMethod, KernelStatus } from './ipc/types';
import type { ConsolidationConfig } from './memory/types';
import type { MessageContext } from '../src/lib/bus/types';

const startTime = Date.now();
const server = new IpcServer(parseInt(process.env.KERNEL_PORT || '3091', 10));

function sendEvent(event: string, payload: Record<string, unknown>): void {
  server.broadcast(event, payload);
}

function registerHandlers(): void {
  const handlers: { method: IpcMethod; handler: (req: any) => Promise<unknown> }[] = [
    { method: 'kernel.ping', handler: async () => ({ pong: true, time: Date.now() }) },
    {
      method: 'kernel.status',
      handler: async (): Promise<KernelStatus> => ({
        uptime: Date.now() - startTime,
        modules: bus.getAllModules().length,
        agents: bus.getAllModules().length,
        memory: process.memoryUsage?.()?.rss ?? 0,
        connections: server.connectionCount,
      }),
    },
    {
      method: 'bus.route',
      handler: async (req) => {
        const context = req.params.context as unknown as MessageContext;
        return bus.route(context);
      },
    },
    {
      method: 'bus.routeTo',
      handler: async (req) => {
        const moduleId = req.params.moduleId as string;
        const context = req.params.context as unknown as MessageContext;
        return bus.routeTo(moduleId, context);
      },
    },
    {
      method: 'bus.emit',
      handler: async (req) => {
        const event = req.params.event as string;
        const payload = req.params.payload as Record<string, unknown>;
        await eventBus.emit(event, payload);
        return { emitted: true };
      },
    },
    {
      method: 'module.list',
      handler: async () => bus.getAllModules().map((m) => ({ id: m.id, name: m.name })),
    },
    {
      method: 'module.info',
      handler: async (req) => {
        const id = req.params.moduleId as string;
        const mod = bus.getModule(id);
        if (!mod) throw new Error(`Module '${id}' not found`);
        const manifest = registry.getManifest(id);
        return {
          id: mod.id,
          name: mod.name,
          manifest,
          tools: mod.getTools().map((t) => ({ name: t.name, description: t.description })),
          skills: mod.getSkills().map((s) => ({ id: s.id, name: s.name })),
        };
      },
    },
    {
      method: 'module.loaded',
      handler: async () => bus.getAllModules().map((m) => m.id),
    },
    {
      method: 'registry.discover',
      handler: async () => registry.discover(),
    },
    {
      method: 'registry.manifest',
      handler: async (req) => registry.getManifest(req.params.moduleId as string),
    },
    {
      method: 'sys.fs.read',
      handler: async (req) => sysFs.read(req.params.path as string),
    },
    {
      method: 'sys.fs.write',
      handler: async (req) => {
        await sysFs.write(req.params.path as string, req.params.content as string);
        return { written: true };
      },
    },
    {
      method: 'sys.fs.list',
      handler: async (req) => sysFs.list(req.params.path as string),
    },
    {
      method: 'sys.fs.exists',
      handler: async (req) => sysFs.exists(req.params.path as string),
    },
    {
      method: 'sys.mem.store',
      handler: async (req) => sysMem.store(req.params as any),
    },
    {
      method: 'sys.mem.search',
      handler: async (req) => sysMem.search(req.params as any),
    },
    {
      method: 'sys.mem.delete',
      handler: async (req) => sysMem.delete(req.params as any),
    },
    {
      method: 'sys.mem.count',
      handler: async (req) => sysMem.count(req.params as any),
    },
    {
      method: 'sys.mem.promote',
      handler: async (req) => sysMem.promote(req.params as any),
    },
    {
      method: 'sys.agent.send',
      handler: async (req) => {
        await sysAgent.send(req.params as any);
        return { sent: true };
      },
    },
    {
      method: 'sys.agent.broadcast',
      handler: async (req) => {
        await sysAgent.broadcast(req.params as any);
        return { sent: true };
      },
    },
    {
      method: 'sys.agent.status',
      handler: async (req) => sysAgent.status(req.params as any),
    },

    // === POINT 3 — Module Store ===
    {
      method: 'store.register',
      handler: async (req) => {
        const id = await moduleStore.register(req.params.manifest as any, req.params.source as string, req.params.checksum as string);
        return { id };
      },
    },
    {
      method: 'store.install',
      handler: async (req) => {
        await moduleStore.markInstalled(req.params.name as string);
        const pkg = await moduleStore.get(req.params.name as string);
        if (pkg?.manifest?.permissions) {
          moduleSandbox.configure(pkg.name, {
            timeout: 10000,
            rateLimit: { maxRequests: 60, windowMs: 60000 },
            allowedIntents: pkg.manifest.intents || [],
          });
        }
        return { installed: true };
      },
    },
    {
      method: 'store.uninstall',
      handler: async (req) => {
        await moduleStore.markUninstalled(req.params.name as string);
        return { uninstalled: true };
      },
    },
    {
      method: 'store.list',
      handler: async (req) => moduleStore.list({ installed: req.params.installed as boolean | undefined }),
    },
    {
      method: 'store.search',
      handler: async (req) => moduleStore.search(req.params.query as string),
    },
    {
      method: 'store.get',
      handler: async (req) => moduleStore.get(req.params.name as string),
    },
    {
      method: 'store.dependencies',
      handler: async (req) => moduleStore.checkDependencies(req.params.manifest as any),
    },
    {
      method: 'store.remove',
      handler: async (req) => moduleStore.remove(req.params.name as string),
    },
    {
      method: 'store.remote.search',
      handler: async (req) => remoteStore.search(req.params.query as string),
    },
    {
      method: 'store.remote.info',
      handler: async (req) => remoteStore.getInfo(req.params.name as string),
    },
    {
      method: 'store.remote.install',
      handler: async (req) => remoteStore.install(req.params.name as string, req.params.version as string | undefined),
    },
    {
      method: 'store.remote.uninstall',
      handler: async (req) => remoteStore.uninstall(req.params.name as string),
    },
    {
      method: 'store.remote.listInstalled',
      handler: async () => remoteStore.listInstalled(),
    },
    {
      method: 'store.remote.setRegistry',
      handler: async (req) => { remoteStore.setRegistry(req.params.url as string); return { registry: remoteStore.getRegistry() }; },
    },

    // === POINT 4 — Runtime Isolation ===
    {
      method: 'runtime.sandbox.configure',
      handler: async (req) => {
        moduleSandbox.configure(req.params.moduleId as string, req.params.options as any);
        return { configured: true };
      },
    },
    {
      method: 'runtime.sandbox.status',
      handler: async (req) => moduleSandbox.getStatus(req.params.moduleId as string),
    },
    {
      method: 'runtime.sandbox.statusAll',
      handler: async () => moduleSandbox.getAllStatus(),
    },
    {
      method: 'runtime.sandbox.ban',
      handler: async (req) => { moduleSandbox.ban(req.params.moduleId as string); return { banned: true }; },
    },
    {
      method: 'runtime.sandbox.unban',
      handler: async (req) => { moduleSandbox.unban(req.params.moduleId as string); return { unbanned: true }; },
    },
    {
      method: 'runtime.ratelimit.status',
      handler: async (req) => {
        const key = `sandbox:${req.params.moduleId as string}`;
        return {
          remaining: rateLimiter.getRemaining(key),
          allowed: true,
        };
      },
    },
    {
      method: 'runtime.dlq.list',
      handler: async (req) => deadLetterQueue.list(req.params.processed as boolean),
    },
    {
      method: 'runtime.dlq.retry',
      handler: async (req) => deadLetterQueue.retry(req.params.messageId as string),
    },
    {
      method: 'runtime.dlq.purge',
      handler: async (req) => deadLetterQueue.purge(req.params.olderThanHours as number),
    },

    // === POINT 5 — Security & Audit ===
    {
      method: 'security.token.generate',
      handler: async (req) => moduleTokenManager.generate(req.params as any),
    },
    {
      method: 'security.token.validate',
      handler: async (req) => moduleTokenManager.validate(req.params.token as string),
    },
    {
      method: 'security.token.revoke',
      handler: async (req) => moduleTokenManager.revoke(req.params.tokenId as string),
    },
    {
      method: 'security.token.list',
      handler: async (req) => moduleTokenManager.listForModule(req.params.moduleId as string),
    },
    {
      method: 'security.permission.revoke',
      handler: async (req) => {
        permissionManager.revokePermission(req.params.moduleId as string, req.params.permission as string);
        return { revoked: true };
      },
    },
    {
      method: 'security.permission.restore',
      handler: async (req) => {
        permissionManager.restorePermission(req.params.moduleId as string, req.params.permission as string);
        return { restored: true };
      },
    },
    {
      method: 'security.audit.query',
      handler: async (req) => auditLogger.query(req.params as any),
    },
    {
      method: 'security.audit.recent',
      handler: async (req) => auditLogger.recent(req.params.limit as number),
    },
    {
      method: 'security.ipLimiter.check',
      handler: async (req) => ipLimiter.check(req.params.ip as string),
    },
    {
      method: 'security.ipLimiter.config',
      handler: async (req) => {
        ipLimiter.configure(req.params.maxRequests as number, req.params.windowMs as number);
        return ipLimiter.getStats();
      },
    },
    {
      method: 'security.ipLimiter.stats',
      handler: async () => ipLimiter.getStats(),
    },
    {
      method: 'security.monitor.start',
      handler: async () => { securityMonitor.start(); return { started: true }; },
    },
    {
      method: 'security.monitor.stop',
      handler: async () => { securityMonitor.stop(); return { stopped: true }; },
    },
    {
      method: 'security.monitor.alerts',
      handler: async (req) => securityMonitor.getAlerts(req.params.limit as number),
    },
    {
      method: 'security.monitor.config',
      handler: async (req) => {
        const params = req.params as any;
        if (Object.keys(params).length > 0) securityMonitor.updateConfig(params);
        return securityMonitor.getConfig();
      },
    },

    // === Memory Consolidation Service ===
    {
      method: 'memory.consolidate',
      handler: async () => memoryConsolidator.consolidate(),
    },
    {
      method: 'memory.status',
      handler: async () => memoryConsolidator.getStatus(),
    },
    {
      method: 'memory.config',
      handler: async (req) => {
        const params = req.params as Partial<ConsolidationConfig>;
        if (Object.keys(params).length > 0) {
          memoryConsolidator.updateConfig(params);
        }
        return memoryConsolidator.getConfig();
      },
    },
  ];

  for (const { method, handler } of handlers) {
    server.onRequest(method, handler);
  }
}

async function loadModules(): Promise<void> {
  const discovered = await registry.discover();
  for (const manifest of discovered) {
    try {
      await import(`../src/lib/modules/${manifest.id}`);
      await kernelStore.recordLoadedModule(manifest.id);
    } catch (e) {
      console.error(`[KERNEL] Failed to load module ${manifest.id}:`, e);
    }
  }
  console.log(`[KERNEL] ${bus.getAllModules().length} modules loaded`);
}

async function main(): Promise<void> {
  console.log('[KERNEL] Starting Mindlife Kernel...');

  registerHandlers();

  eventBus.on(SystemEvents.PERMISSION_REQUEST, (payload) => {
    sendEvent('permission:request', payload);
  });
  eventBus.on(SystemEvents.MODULE_ERROR, (payload) => {
    sendEvent('module:error', payload);
  });

  const port = await server.start();
  console.log(`[KERNEL] IPC server listening on ws://127.0.0.1:${port}`);

  memoryConsolidator.start();
  console.log(`[KERNEL] Memory consolidation active (interval: ${memoryConsolidator.getConfig().cycleIntervalMs}ms)`);

  moduleSandbox.startMemorySampling();
  console.log('[KERNEL] Sandbox memory monitoring active');

  securityMonitor.start();
  console.log('[KERNEL] Security monitor active');

  await loadModules();

  process.on('SIGINT', async () => {
    console.log('\n[KERNEL] Shutting down...');
    memoryConsolidator.stop();
    moduleSandbox.stopMemorySampling();
    securityMonitor.stop();
    await kernelStore.clearAllModuleStates();
    server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    memoryConsolidator.stop();
    moduleSandbox.stopMemorySampling();
    server.stop();
    process.exit(0);
  });
}

main().catch((e) => {
  console.error('[KERNEL] Fatal:', e);
  process.exit(1);
});
