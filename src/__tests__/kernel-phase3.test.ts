import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { IpcServer } from '../../kernel/ipc/server';
import { moduleStore } from '../../kernel/store/manager';
import { rateLimiter } from '../../kernel/runtime/ratelimit';
import { deadLetterQueue } from '../../kernel/runtime/queue';
import { moduleSandbox } from '../../kernel/runtime/sandbox';
import { moduleTokenManager } from '../../kernel/security/tokens';
import { auditLogger } from '../../kernel/security/audit';
import { permissionManager } from '../../kernel/security/permissions';
import type { IpcMethod } from '../../kernel/ipc/types';

describe('Point 3 — Module Store', () => {
  afterAll(async () => {
    await moduleStore.remove('test-store-module');
    await moduleStore.remove('test-dep-module');
  });

  it('should register a module package', async () => {
    const id = await moduleStore.register({
      id: 'test-store-module',
      version: '1.0.0',
      description: 'Test module',
      author: 'test',
      permissions: ['sys.fs.read'],
      intents: ['test'],
    } as any);
    expect(id).toBeTruthy();
  });

  it('should list packages', async () => {
    const list = await moduleStore.list();
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list.some((p) => p.name === 'test-store-module')).toBe(true);
  });

  it('should get package by name', async () => {
    const pkg = await moduleStore.get('test-store-module');
    expect(pkg).not.toBeNull();
    expect(pkg!.version).toBe('1.0.0');
  });

  it('should mark installed and uninstalled', async () => {
    await moduleStore.markInstalled('test-store-module');
    let pkg = await moduleStore.get('test-store-module');
    expect(pkg!.isInstalled).toBe(true);

    await moduleStore.markUninstalled('test-store-module');
    pkg = await moduleStore.get('test-store-module');
    expect(pkg!.isInstalled).toBe(false);
  });

  it('should filter list by installed status', async () => {
    await moduleStore.markInstalled('test-store-module');
    const installed = await moduleStore.list({ installed: true });
    expect(installed.some((p) => p.name === 'test-store-module')).toBe(true);

    await moduleStore.markUninstalled('test-store-module');
    const uninstalled = await moduleStore.list({ installed: false });
    expect(uninstalled.some((p) => p.name === 'test-store-module')).toBe(true);
  });

  it('should search packages', async () => {
    const results = await moduleStore.search('test-store');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].name).toBe('test-store-module');
  });

  it('should resolve dependencies', async () => {
    const deps = moduleStore.resolveDependencies({
      id: 'test-module',
      version: '1.0.0',
      dependencies: { depA: '^1.0.0', depB: '^2.0.0' },
    } as any);
    expect(deps).toEqual([
      { name: 'depA', version: '^1.0.0' },
      { name: 'depB', version: '^2.0.0' },
    ]);
  });

  it('should check dependencies and report missing', async () => {
    await moduleStore.markInstalled('test-store-module');
    const result = await moduleStore.checkDependencies({
      id: 'test-module',
      version: '1.0.0',
      dependencies: { 'test-store-module': '^1.0.0', 'nonexistent-dep': '^1.0.0' },
    } as any);
    expect(result.satisfied).toContain('test-store-module');
    expect(result.missing.some((m) => m.startsWith('nonexistent-dep'))).toBe(true);
  });

  it('should remove package', async () => {
    await moduleStore.register({
      id: 'test-temp-module',
      version: '0.0.1',
    } as any);
    const removed = await moduleStore.remove('test-temp-module');
    expect(removed).toBe(true);
    const pkg = await moduleStore.get('test-temp-module');
    expect(pkg).toBeNull();
  });
});

describe('Point 4 — Runtime Isolation', () => {
  describe('RateLimiter', () => {
    afterEach(() => rateLimiter.resetAll());

    it('should allow unlimited by default', () => {
      const result = rateLimiter.check('unknown-key');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(Infinity);
    });

    it('should allow requests within limit', () => {
      rateLimiter.setLimit('test-key', 3, 60000);
      expect(rateLimiter.check('test-key').allowed).toBe(true);
      expect(rateLimiter.check('test-key').allowed).toBe(true);
      expect(rateLimiter.check('test-key').allowed).toBe(true);
    });

    it('should block requests over limit', () => {
      rateLimiter.setLimit('test-key', 2, 60000);
      rateLimiter.check('test-key');
      rateLimiter.check('test-key');
      const result = rateLimiter.check('test-key');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should report correct remaining count', () => {
      rateLimiter.setLimit('test-key', 5, 60000);
      rateLimiter.check('test-key');
      rateLimiter.check('test-key');
      expect(rateLimiter.getRemaining('test-key')).toBe(3);
    });

    it('should reset a key', () => {
      rateLimiter.setLimit('test-key', 1, 60000);
      rateLimiter.check('test-key');
      rateLimiter.reset('test-key');
      expect(rateLimiter.check('test-key').allowed).toBe(true);
    });
  });

  describe('ModuleSandbox', () => {
    const mockModule = {
      id: 'test-sandbox-module',
      name: 'Test Sandbox',
      getTools: () => [],
      getSkills: () => [],
      process: async () => ({ success: true, content: 'ok', moduleId: 'test-sandbox-module' }),
    };

    it('should execute successfully', async () => {
      const result = await moduleSandbox.execute(
        mockModule as any,
        { sender: 'user', text: 'test', intent: 'test' },
        async () => ({ success: true, content: 'done', moduleId: 'test-sandbox-module' }),
      );
      expect(result.success).toBe(true);
      expect(result.content).toBe('done');
    });

    it('should block disallowed intents', async () => {
      moduleSandbox.configure('test-sandbox-module', {
        allowedIntents: ['finance'],
      });
      const result = await moduleSandbox.execute(
        mockModule as any,
        { sender: 'user', text: 'test', intent: 'sport' },
        async () => ({ success: true, content: 'done', moduleId: 'test-sandbox-module' }),
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('not in allowed list');
    });

    it('should rate limit modules', async () => {
      moduleSandbox.configure('test-sandbox-module', {
        rateLimit: { maxRequests: 1, windowMs: 60000 },
      });
      await moduleSandbox.execute(
        mockModule as any,
        { sender: 'user', text: 'test', intent: 'test' },
        async () => ({ success: true, content: 'ok', moduleId: 'test-sandbox-module' }),
      );
      const result = await moduleSandbox.execute(
        mockModule as any,
        { sender: 'user', text: 'test', intent: 'test' },
        async () => ({ success: true, content: 'ok', moduleId: 'test-sandbox-module' }),
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('rate limit exceeded');
    });

    it('should catch errors to dead letter queue', async () => {
      moduleSandbox.configure('test-sandbox-module', {});
      const result = await moduleSandbox.execute(
        mockModule as any,
        { sender: 'user', text: 'test', intent: 'test' },
        async () => { throw new Error('crash test'); },
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('crash test');
    });

    it('should timeout slow modules', async () => {
      moduleSandbox.configure('test-slow-module', { timeout: 50 });
      const result = await moduleSandbox.execute(
        { ...mockModule, id: 'test-slow-module' } as any,
        { sender: 'user', text: 'test', intent: 'test' },
        async () => { await new Promise((r) => setTimeout(r, 500)); return { success: true, content: 'late', moduleId: 'test-slow-module' }; },
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain('timed out');
    });
  });

  describe('DeadLetterQueue', () => {
    it('should enqueue a dead letter', async () => {
      const id = await deadLetterQueue.enqueue({
        fromModule: 'test-module',
        toModule: null,
        messageType: 'test_error',
        payload: JSON.stringify({ test: true }),
        error: 'test error message',
      });
      expect(id).toBeTruthy();
    });

    it('should list dead letters', async () => {
      const list = await deadLetterQueue.list();
      expect(list.length).toBeGreaterThanOrEqual(1);
      expect(list.some((dl) => dl.fromModule === 'test-module')).toBe(true);
    });

    it('should retry and eventually mark as failed', async () => {
      await deadLetterQueue.enqueue({
        fromModule: 'test-retry-module',
        toModule: null,
        messageType: 'retry_test',
        payload: JSON.stringify({ test: true }),
        error: 'retry test error',
        maxRetries: 1,
      });
      const list = await deadLetterQueue.list();
      const entry = list.find((dl) => dl.fromModule === 'test-retry-module');
      expect(entry).toBeDefined();

      const result1 = await deadLetterQueue.retry(entry!.id);
      expect(result1).toBe(true);

      const result2 = await deadLetterQueue.retry(entry!.id);
      expect(result2).toBe(false);
    });

    it('should purge old entries', async () => {
      const purged = await deadLetterQueue.purge(0);
      expect(purged).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Point 5 — Security & Audit', () => {
  describe('ModuleTokenManager', () => {
    let token: string;
    let tokenInfo: any;

    it('should generate a token', async () => {
      const result = await moduleTokenManager.generate({
        moduleId: 'test-sec-module',
        name: 'Test Token',
        permissions: ['sys.fs.read', 'sys.mem.search'],
      });
      token = result.token;
      tokenInfo = result.info;
      expect(token).toMatch(/^mrt_/);
      expect(tokenInfo.moduleId).toBe('test-sec-module');
      expect(tokenInfo.permissions).toContain('sys.fs.read');
    });

    it('should validate a valid token', async () => {
      const info = await moduleTokenManager.validate(token);
      expect(info).not.toBeNull();
      expect(info!.moduleId).toBe('test-sec-module');
    });

    it('should reject invalid token', async () => {
      const info = await moduleTokenManager.validate('mrt_invalid_token');
      expect(info).toBeNull();
    });

    it('should check permissions', async () => {
      const hasRead = await moduleTokenManager.hasPermission(token, 'sys.fs.read');
      expect(hasRead).toBe(true);

      const hasWrite = await moduleTokenManager.hasPermission(token, 'sys.fs.write');
      expect(hasWrite).toBe(false);
    });

    it('should list tokens for a module', async () => {
      const tokens = await moduleTokenManager.listForModule('test-sec-module');
      expect(tokens.length).toBeGreaterThanOrEqual(1);
      expect(tokens[0].name).toBe('Test Token');
    });

    it('should revoke a token', async () => {
      const revoked = await moduleTokenManager.revoke(tokenInfo.id);
      expect(revoked).toBe(true);

      const info = await moduleTokenManager.validate(token);
      expect(info).toBeNull();
    });
  });

  describe('PermissionManager', () => {
    it('should check permissions against manifest', async () => {
      await moduleStore.register({
        id: 'test-perm-module',
        version: '1.0.0',
        permissions: ['sys.fs.read', 'sys.fs.list'],
      } as any);

      const result = await permissionManager.check({
        moduleId: 'test-perm-module',
        permission: 'sys.fs.read',
        action: 'test.read',
      });
      expect(result.allowed).toBe(true);
    });

    it('should deny undeclared permissions', async () => {
      const result = await permissionManager.check({
        moduleId: 'test-perm-module',
        permission: 'sys.fs.write',
        action: 'test.write',
      });
      expect(result.allowed).toBe(false);
    });

    it('should revoke permissions at runtime', async () => {
      permissionManager.revokePermission('test-perm-module', 'sys.fs.read');
      const result = await permissionManager.check({
        moduleId: 'test-perm-module',
        permission: 'sys.fs.read',
        action: 'test.read_revoked',
      });
      expect(result.allowed).toBe(false);
    });

    it('should restore permissions', async () => {
      permissionManager.restorePermission('test-perm-module', 'sys.fs.read');
      const result = await permissionManager.check({
        moduleId: 'test-perm-module',
        permission: 'sys.fs.read',
        action: 'test.read_restored',
      });
      expect(result.allowed).toBe(true);
    });

    it('should revoke all permissions', async () => {
      permissionManager.revokeAll('test-perm-module');
      const result = await permissionManager.check({
        moduleId: 'test-perm-module',
        permission: 'sys.fs.list',
        action: 'test.list_all_revoked',
      });
      expect(result.allowed).toBe(false);
    });
  });

  describe('AuditLogger', () => {
    let auditId: string;

    it('should log entries', async () => {
      auditId = await auditLogger.log({
        moduleId: 'test-audit-module',
        action: 'test.action',
        result: 'success',
        details: { key: 'value' },
      });
      expect(auditId).toMatch(/^audit-/);
    });

    it('should query recent entries', async () => {
      const recent = await auditLogger.recent(5);
      expect(recent.length).toBeGreaterThanOrEqual(1);
      expect(recent.some((e) => e.moduleId === 'test-audit-module')).toBe(true);
    });

    it('should filter by moduleId', async () => {
      const result = await auditLogger.query({ moduleId: 'test-audit-module' });
      expect(result.entries.length).toBeGreaterThanOrEqual(1);
      expect(result.total).toBeGreaterThanOrEqual(1);
    });

    it('should filter by action', async () => {
      const result = await auditLogger.query({ action: 'test.action' });
      expect(result.entries.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by date range', async () => {
      const result = await auditLogger.query({
        since: new Date(Date.now() - 3600000),
        until: new Date(),
      });
      expect(result.entries.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('Points 3-5 — IPC Integration', () => {
  let server: IpcServer;
  let port: number;

  beforeAll(async () => {
    server = new IpcServer(0);
    server.onRequest('store.register' as IpcMethod, async (req) => {
      const id = await moduleStore.register(req.params.manifest as any);
      return { id };
    });
    server.onRequest('store.list' as IpcMethod, async () => moduleStore.list());
    server.onRequest('runtime.dlq.list' as IpcMethod, async () => deadLetterQueue.list());
    server.onRequest('security.token.generate' as IpcMethod, async (req) => moduleTokenManager.generate(req.params as any));
    server.onRequest('security.audit.recent' as IpcMethod, async () => auditLogger.recent());
    port = await server.start();
  });

  afterAll(() => server.stop());

  async function sendRequest(method: string, params: Record<string, unknown> = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}`);
      const id = `test-${Date.now()}`;
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'request', id, method, params }));
      };
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data as string);
        ws.close();
        if (msg.type === 'response' && msg.id === id) {
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      };
      ws.onerror = (err) => reject(err);
    });
  }

  it('should handle store.register via IPC', async () => {
    const result = await sendRequest('store.register', {
      manifest: { id: 'ipc-store-test', version: '1.0.0', permissions: [] },
    });
    expect(result).toHaveProperty('id');
  });

  it('should handle store.list via IPC', async () => {
    const result = await sendRequest('store.list');
    expect(Array.isArray(result)).toBe(true);
    expect(result.some((p: any) => p.name === 'ipc-store-test')).toBe(true);
  });

  it('should handle security.token.generate via IPC', async () => {
    const result = await sendRequest('security.token.generate', {
      moduleId: 'ipc-sec-test',
      name: 'IPC Test',
      permissions: ['*'],
    });
    expect(result).toHaveProperty('token');
    expect(result.token).toMatch(/^mrt_/);
  });
});
