export const SystemEvents = {
  MODULE_LOADED: 'module:loaded',
  MODULE_UNLOADED: 'module:unloaded',
  MODULE_ERROR: 'module:error',
  AGENT_MESSAGE: 'agent:message',
  PERMISSION_REQUEST: 'permission:request',
  INTENT_DETECTED: 'intent:detected',
} as const;

export type SystemEventName = (typeof SystemEvents)[keyof typeof SystemEvents];

type EventPayload = Record<string, unknown>;

type EventHandler = (payload: EventPayload) => void | Promise<void>;

export class EventBus {
  private listeners = new Map<string, Set<EventHandler>>();

  on(event: string, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  async emit(event: string, payload: EventPayload = {}): Promise<void> {
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    for (const handler of handlers) {
      await Promise.resolve(handler(payload));
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();
