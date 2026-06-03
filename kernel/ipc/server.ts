import type { Server, ServerWebSocket } from 'bun';
import type { IpcMessage, IpcRequest, IpcMethod } from './types';

type RequestHandler = (req: IpcRequest) => Promise<unknown>;
type EventHandler = (event: string, payload: Record<string, unknown>) => void;

export class IpcServer {
  private server: Server | null = null;
  private connections = new Set<ServerWebSocket<unknown>>();
  private handlers = new Map<IpcMethod, RequestHandler>();
  private onEvent: EventHandler[] = [];
  private port: number;

  constructor(port = 3091) {
    this.port = port;
  }

  onRequest(method: IpcMethod, handler: RequestHandler): void {
    this.handlers.set(method, handler);
  }

  onEventReceived(cb: EventHandler): void {
    this.onEvent.push(cb);
  }

  broadcast(event: string, payload: Record<string, unknown>): void {
    const msg: IpcMessage = { type: 'event', event, payload };
    const data = JSON.stringify(msg);
    for (const ws of this.connections) {
      try { ws.send(data); } catch {}
    }
  }

  start(): Promise<number> {
    return new Promise((resolve) => {
      this.server = Bun.serve<unknown>({
        hostname: '127.0.0.1',
        port: this.port,
        fetch: (req, server) => {
          if (server.upgrade(req)) return undefined;
          return new Response('WebSocket upgrade failed', { status: 426 });
        },
        websocket: {
          open: (ws) => {
            this.connections.add(ws);
          },
          message: (ws, raw) => {
            let msg: IpcMessage;
            try {
              msg = JSON.parse(raw.toString());
            } catch {
              ws.send(JSON.stringify({ type: 'error', id: '', error: { code: 'PARSE_ERROR', message: 'Invalid JSON' } }));
              return;
            }

            if (msg.type === 'request') {
              this.handleRequest(ws, msg);
            }
          },
          close: (ws) => {
            this.connections.delete(ws);
          },
          drain: (_ws) => { /* noop */ },
        },
      });
      resolve(this.server.port);
    });
  }

  stop(): void {
    for (const ws of this.connections) {
      try { ws.close(); } catch {}
    }
    this.connections.clear();
    this.server?.stop(true);
  }

  get connectionCount(): number {
    return this.connections.size;
  }

  private async handleRequest(ws: ServerWebSocket<unknown>, req: IpcRequest): Promise<void> {
    const handler = this.handlers.get(req.method);
    if (!handler) {
      ws.send(JSON.stringify({
        type: 'response',
        id: req.id,
        error: { code: 'METHOD_NOT_FOUND', message: `Unknown method: ${req.method}` },
      }));
      return;
    }
    try {
      const result = await handler(req);
      ws.send(JSON.stringify({ type: 'response', id: req.id, result }));
    } catch (e: any) {
      ws.send(JSON.stringify({
        type: 'response',
        id: req.id,
        error: { code: 'HANDLER_ERROR', message: e.message || String(e) },
      }));
    }
  }
}
