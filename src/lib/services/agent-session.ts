import { db } from '@/lib/db';

export interface SessionPreview {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: Date;
  preview: string;
}

export class SessionManager {
  async listSessions(agentId: string, limit = 10): Promise<SessionPreview[]> {
    const sessions = await db.agentSession.findMany({
      where: { agentId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        AgentMessage: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    return sessions.map(s => ({
      id: s.id,
      title: s.title || 'Session sans titre',
      messageCount: s.messageCount,
      updatedAt: s.updatedAt,
      preview: s.AgentMessage[0]?.content?.slice(0, 100) || '',
    }));
  }

  async getSessionMessages(sessionId: string) {
    return db.agentChatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getAgentStats(agentId: string) {
    const [memories, sessions, messages] = await Promise.all([
      db.agentMemory.count({ where: { agentId } }),
      db.agentSession.count({ where: { agentId } }),
      db.agentChatMessage.count({
        where: {
          sessionId: { in: (await db.agentSession.findMany({ where: { agentId }, select: { id: true } })).map(s => s.id) },
        },
      }),
    ]);

    return { memories, sessions, messages };
  }
}

export const sessionManager = new SessionManager();
