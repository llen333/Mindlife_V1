import type { ModuleResponse, MessageContext } from './bus/types';
import type { VectorMemory, MemoryLevel } from './rag';
import type { ModuleManifest } from './bus/types';

interface IpcResponse {
  type: 'response';
  id: string;
  result?: unknown;
  error?: { code: string; message: string };
}

interface IpcEvent {
  type: 'event';
  event: string;
  payload: Record<string, unknown>;
}

type IpcMessage = IpcResponse | IpcEvent;

type EventHandler = (payload: Record<string, unknown>) => void;

export class KernelClient {
  private ws: WebSocket | null = null;
  private pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private reqId = 0;
  private connected = false;
  private eventHandlers = new Map<string, Set<EventHandler>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private url: string;
  private autoReconnect: boolean;
  private connectPromise: Promise<void> | null = null;
  private connectResolve: (() => void) | null = null;

  constructor(url?: string, autoReconnect = true) {
    this.url = url || process.env.NEXT_PUBLIC_KERNEL_URL || 'ws://127.0.0.1:3091';
    this.autoReconnect = autoReconnect;
  }

  async connect(): Promise<void> {
    if (this.connected) return;
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = new Promise((resolve, reject) => {
      this.connectResolve = resolve;

      try {
        this.ws = new WebSocket(this.url);
      } catch (e) {
        this.connectPromise = null;
        reject(e);
        return;
      }

      this.ws.onopen = () => {
        this.connected = true;
        this.connectResolve?.();
        this.connectResolve = null;
        this.connectPromise = null;
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: IpcMessage = JSON.parse(event.data as string);
          if (msg.type === 'response') {
            const pending = this.pending.get(msg.id);
            if (pending) {
              this.pending.delete(msg.id);
              if (msg.error) {
                pending.reject(new Error(msg.error.message));
              } else {
                pending.resolve(msg.result);
              }
            }
          } else if (msg.type === 'event') {
            const handlers = this.eventHandlers.get(msg.event);
            if (handlers) {
              for (const handler of handlers) {
                handler(msg.payload);
              }
            }
          }
        } catch {}
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.ws = null;
        for (const [, pending] of this.pending) {
          pending.reject(new Error('Kernel disconnected'));
        }
        this.pending.clear();
        if (this.autoReconnect) {
          this.reconnectTimer = setTimeout(() => {
            this.connect().catch(() => {});
          }, 3000);
        }
      };

      this.ws.onerror = () => {
        this.connected = false;
        reject(new Error('WebSocket connection failed'));
        this.connectPromise = null;
      };
    });

    return this.connectPromise;
  }

  async disconnect(): Promise<void> {
    this.autoReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  on(event: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
    return () => this.eventHandlers.get(event)?.delete(handler);
  }

  async call(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
    if (!this.connected) await this.connect();
    const id = `req-${++this.reqId}`;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws?.send(JSON.stringify({ type: 'request', id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Request '${method}' timed out`));
        }
      }, 30000);
    });
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.call('kernel.ping') as { pong: boolean };
      return result.pong === true;
    } catch { return false; }
  }

  async route(context: MessageContext): Promise<ModuleResponse> {
    return this.call('bus.route', { context }) as Promise<ModuleResponse>;
  }

  async routeTo(moduleId: string, context: MessageContext): Promise<ModuleResponse> {
    return this.call('bus.routeTo', { moduleId, context }) as Promise<ModuleResponse>;
  }

  async listModules(): Promise<{ id: string; name: string }[]> {
    return this.call('module.list') as Promise<{ id: string; name: string }[]>;
  }

  async discoverModules(): Promise<ModuleManifest[]> {
    return this.call('registry.discover') as Promise<ModuleManifest[]>;
  }

  async sysFsRead(path: string): Promise<string> {
    return this.call('sys.fs.read', { path }) as Promise<string>;
  }

  async sysFsWrite(path: string, content: string): Promise<void> {
    await this.call('sys.fs.write', { path, content });
  }

  async sysMemStore(agentId: string, content: string, metadata?: Record<string, unknown>, importance?: number, memoryLevel?: MemoryLevel, emotion?: string): Promise<string> {
    return this.call('sys.mem.store', { agentId, content, metadata, importance, memoryLevel, emotion }) as Promise<string>;
  }

  async sysMemSearch(agentId: string, query: string, limit?: number, minScore?: number, level?: MemoryLevel): Promise<VectorMemory[]> {
    return this.call('sys.mem.search', { agentId, query, limit, minScore, level }) as Promise<VectorMemory[]>;
  }
}

export const kernelClient = new KernelClient();
