import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/services/agent-service';
import { db } from '@/lib/db';

const DEFAULT_USER_ID = 'mindlife-user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId = DEFAULT_USER_ID, sessionId, archetype } = body;
    let { agentId, agentName, role } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    // Find or create agent
    if (!agentId) {
      const name = agentName || role || 'Somnia';
      const existingAgent = await db.agent.findFirst({ where: { userId, name } });

      if (existingAgent) {
        agentId = existingAgent.id;
      } else {
        const newAgent = await agentService.getOrCreateAgent({
          name,
          role: role || 'assistant',
          userId,
          systemPrompt: undefined,
          tone: undefined,
          capabilities: undefined,
        });
        agentId = newAgent.id;
      }
    }

    // Ensure default agents exist
    await agentService.seedDefaultAgents(userId).catch(() => {});

    const result = await agentService.processMessage({
      agentId,
      userId,
      message,
      sessionId: sessionId || undefined,
      archetype: archetype || undefined,
    });

    return NextResponse.json({
      success: true,
      response: result.content,
      sessionId: result.sessionId,
      provider: result.provider,
      agent: result.agent,
      memoriesLoaded: result.memoriesLoaded,
      messagesInSession: result.messagesInSession,
    });
  } catch (error) {
    console.error('[AGENT-SERVICE] Error:', error);
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({
      success: false,
      error: message,
      response: '❌ Désolé, une erreur est survenue. Réessaie.',
    });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('userId') || DEFAULT_USER_ID;
  const agentId = searchParams.get('agentId');
  const sessionId = searchParams.get('sessionId');

  try {
    switch (action) {
      case 'seed':
        const seedResult = await agentService.seedDefaultAgents(userId);
        return NextResponse.json({ success: true, ...seedResult });

      case 'agents':
        const agents = await agentService.listAgents(userId);
        return NextResponse.json({ success: true, agents });

      case 'sessions':
        if (!agentId) {
          return NextResponse.json({ error: 'agentId requis' }, { status: 400 });
        }
        const sessions = await agentService.listSessions(agentId);
        return NextResponse.json({ success: true, sessions });

      case 'messages':
        if (!sessionId) {
          return NextResponse.json({ error: 'sessionId requis' }, { status: 400 });
        }
        const messages = await agentService.getSessionMessages(sessionId);
        return NextResponse.json({ success: true, messages });

      case 'stats':
        if (!agentId) {
          return NextResponse.json({ error: 'agentId requis' }, { status: 400 });
        }
        const stats = await agentService.getAgentStats(agentId);
        return NextResponse.json({ success: true, stats });

      case 'memories':
        if (!agentId) {
          return NextResponse.json({ error: 'agentId requis' }, { status: 400 });
        }
        const level = searchParams.get('level') || undefined;
        const memories = await agentService.listMemories(agentId, level);
        return NextResponse.json({ success: true, memories });

      case 'memoriesCount':
        if (!agentId) {
          return NextResponse.json({ error: 'agentId requis' }, { status: 400 });
        }
        const counts = await agentService.getMemoriesCountByLevel(agentId);
        return NextResponse.json({ success: true, ...counts });

      default:
        return NextResponse.json({
          success: true,
          message: 'Agent Service API disponible. Utilisez POST pour chatter, GET avec action pour les données.',
          actions: ['seed', 'agents', 'sessions', 'messages', 'stats', 'memories', 'memoriesCount'],
        });
    }
  } catch (error) {
    console.error('[AGENT-SERVICE-GET] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
}
