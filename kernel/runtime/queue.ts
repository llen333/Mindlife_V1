import { db } from '../../src/lib/db';

export interface DeadLetter {
  id: string;
  fromModule: string;
  toModule: string | null;
  messageType: string;
  payload: string;
  error: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  nextRetryAt: Date | null;
}

export class DeadLetterQueue {
  async enqueue(params: {
    fromModule: string;
    toModule: string | null;
    messageType: string;
    payload: string;
    error: string;
    maxRetries?: number;
  }): Promise<string> {
    const id = `dlq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const nextRetryAt = params.maxRetries && params.maxRetries > 0
      ? new Date(Date.now() + 30000)
      : null;

    await db.agentMessage.create({
      data: {
        id,
        fromAgent: params.fromModule,
        toAgent: params.toModule,
        messageType: `dead_letter:${params.messageType}`,
        payload: JSON.stringify({
          originalPayload: params.payload,
          error: params.error,
          retryCount: 0,
          maxRetries: params.maxRetries ?? 3,
        }),
        processed: false,
      },
    });

    return id;
  }

  async list(includeProcessed = false): Promise<DeadLetter[]> {
    const messages = await db.agentMessage.findMany({
      where: {
        messageType: { startsWith: 'dead_letter:' },
        ...(includeProcessed ? {} : { processed: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return messages.map((m) => this.toDeadLetter(m));
  }

  async retry(messageId: string): Promise<boolean> {
    const msg = await db.agentMessage.findUnique({ where: { id: messageId } });
    if (!msg || msg.processed) return false;

    const payload = JSON.parse(msg.payload);
    const retryCount = (payload.retryCount || 0) + 1;
    const maxRetries = payload.maxRetries || 3;

    if (retryCount > maxRetries) {
      await db.agentMessage.update({
        where: { id: messageId },
        data: {
          processed: true,
          payload: JSON.stringify({ ...payload, retryCount, status: 'failed_permanent' }),
        },
      });
      return false;
    }

    await db.agentMessage.update({
      where: { id: messageId },
      data: {
        payload: JSON.stringify({ ...payload, retryCount }),
        processed: false,
      },
    });

    return true;
  }

  async purge(olderThanHours = 24): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    const result = await db.agentMessage.deleteMany({
      where: {
        messageType: { startsWith: 'dead_letter:' },
        createdAt: { lt: cutoff },
      },
    });
    return result.count;
  }

  private toDeadLetter(m: any): DeadLetter {
    const payload = JSON.parse(m.payload);
    return {
      id: m.id,
      fromModule: m.fromAgent,
      toModule: m.toAgent,
      messageType: m.messageType.replace('dead_letter:', ''),
      payload: payload.originalPayload || m.payload,
      error: payload.error || 'unknown',
      retryCount: payload.retryCount || 0,
      maxRetries: payload.maxRetries || 3,
      createdAt: m.createdAt,
      nextRetryAt: null,
    };
  }
}

export const deadLetterQueue = new DeadLetterQueue();
