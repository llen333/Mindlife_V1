import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { IpcServer } from '../../kernel/ipc/server';
import type { IpcMethod } from '../../kernel/ipc/types';

describe('Kernel IPC Server', () => {
  let server: IpcServer;
  let port: number;

  beforeAll(async () => {
    server = new IpcServer(0);
    server.onRequest('kernel.ping' as IpcMethod, async () => ({ pong: true, time: Date.now() }));
    server.onRequest('kernel.status' as IpcMethod, async () => ({
      uptime: 100, modules: 3, agents: 3, memory: 0, connections: 0,
    }));
    server.onRequest('sys.fs.exists' as IpcMethod, async (req) => {
      return (req.params.path as string).startsWith('/tmp/mindlife');
    });
    server.onRequest('module.list' as IpcMethod, async () => [
      { id: 'nutrition', name: 'Nutrition' },
      { id: 'sport', name: 'Sport' },
    ]);
    port = await server.start();
  });

  afterAll(() => {
    server.stop();
  });

  function wsConnect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}`);
      ws.onopen = () => resolve(ws);
      ws.onerror = () => reject(new Error('Connection failed'));
    });
  }

  function wsRequest(ws: WebSocket, method: string, params: Record<string, unknown> = {}): Promise<any> {
    return new Promise((resolve) => {
      ws.onmessage = (event) => resolve(JSON.parse(event.data as string));
      ws.send(JSON.stringify({
        type: 'request', id: `req-${Date.now()}`, method, params,
      }));
    });
  }

  it('responds to ping', async () => {
    const ws = await wsConnect();
    const response = await wsRequest(ws, 'kernel.ping');
    expect(response.type).toBe('response');
    expect(response.result.pong).toBe(true);
    ws.close();
  });

  it('handles unknown method gracefully', async () => {
    const ws = await wsConnect();
    const response = await wsRequest(ws, 'nonexistent.method');
    expect(response.type).toBe('response');
    expect(response.error.code).toBe('METHOD_NOT_FOUND');
    ws.close();
  });

  it('returns kernel status', async () => {
    const ws = await wsConnect();
    const response = await wsRequest(ws, 'kernel.status');
    expect(response.result.uptime).toBe(100);
    expect(response.result.modules).toBe(3);
    expect(response.result.connections).toBe(0);
    ws.close();
  });

  it('handles syscall routing', async () => {
    const ws = await wsConnect();
    const response = await wsRequest(ws, 'sys.fs.exists', { path: '/tmp/mindlife/test.txt' });
    expect(response.result).toBe(true);
    ws.close();
  });

  it('lists modules', async () => {
    const ws = await wsConnect();
    const response = await wsRequest(ws, 'module.list');
    expect(response.result).toHaveLength(2);
    expect(response.result[0].id).toBe('nutrition');
    ws.close();
  });

  it('broadcasts events to multiple clients', async () => {
    const ws1 = await wsConnect();
    const ws2 = await wsConnect();

    const eventReceived = Promise.all([
      new Promise<any>((resolve) => { ws1.onmessage = (e) => resolve(JSON.parse(e.data as string)); }),
      new Promise<any>((resolve) => { ws2.onmessage = (e) => resolve(JSON.parse(e.data as string)); }),
    ]);

    server.broadcast('test:event', { msg: 'broadcast test' });

    const [evt1, evt2] = await eventReceived;
    expect(evt1.type).toBe('event');
    expect(evt1.event).toBe('test:event');
    expect(evt1.payload.msg).toBe('broadcast test');
    expect(evt2.event).toBe('test:event');

    ws1.close();
    ws2.close();
  });

  it('handles JSON parse errors gracefully', async () => {
    const ws = await wsConnect();
    const response = await new Promise<any>((resolve) => {
      ws.onmessage = (event) => resolve(JSON.parse(event.data as string));
      ws.send('not json');
    });
    expect(response.type).toBe('error');
    ws.close();
  });

  it('supports concurrent connections', async () => {
    const connections = await Promise.all(Array.from({ length: 5 }, () => wsConnect()));
    const results = await Promise.all(connections.map((ws) => wsRequest(ws, 'kernel.ping')));
    for (const r of results) {
      expect(r.result.pong).toBe(true);
    }
    connections.forEach((ws) => ws.close());
  });
});
