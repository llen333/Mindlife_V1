import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/services/agent-service';
import { db } from '@/lib/db';

const DEFAULT_USER_ID = 'mindlife-user';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || DEFAULT_USER_ID;
  const agentId = searchParams.get('agentId');

  try {
    if (agentId) {
      const agent = await db.agent.findUnique({ where: { id: agentId } });
      if (!agent) {
        return NextResponse.json({ error: 'Agent non trouvé' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        agent: {
          id: agent.id,
          name: agent.name,
          role: agent.role,
          systemPrompt: agent.systemPrompt,
          tone: agent.tone,
          provider: agent.provider,
          model: agent.model,
          mode: agent.mode,
          isActive: agent.isActive,
          capabilities: agent.capabilities ? JSON.parse(agent.capabilities) : [],
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt,
        },
      });
    }

    const agents = await agentService.listAgents(userId);
    return NextResponse.json({ success: true, agents });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Erreur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId = DEFAULT_USER_ID, agentId, ...agentData } = body;

    switch (action) {
      case 'create':
        const agent = await agentService.getOrCreateAgent({
          name: agentData.name,
          role: agentData.role || 'assistant',
          userId,
          systemPrompt: agentData.systemPrompt,
          tone: agentData.tone,
          capabilities: agentData.capabilities,
        });
        return NextResponse.json({ success: true, agent });

      case 'update':
        if (!agentId) {
          return NextResponse.json({ error: 'agentId requis' }, { status: 400 });
        }
        await agentService.updateAgent(agentId, agentData);
        return NextResponse.json({ success: true });

      case 'delete':
        if (!agentId) {
          return NextResponse.json({ error: 'agentId requis' }, { status: 400 });
        }
        await agentService.deleteAgent(agentId);
        return NextResponse.json({ success: true });

      case 'memory-create':
        const memory = await agentService.createMemory(agentId!, agentData);
        return NextResponse.json({ success: true, memory });

      case 'memory-update':
        if (!agentData.memoryId) {
          return NextResponse.json({ error: 'memoryId requis' }, { status: 400 });
        }
        await agentService.updateMemory(agentData.memoryId, agentData);
        return NextResponse.json({ success: true });

      case 'memory-delete':
        if (!agentData.memoryId) {
          return NextResponse.json({ error: 'memoryId requis' }, { status: 400 });
        }
        await agentService.deleteMemory(agentData.memoryId);
        return NextResponse.json({ success: true });

      case 'memory-import':
        if (!agentData.markdown) {
          return NextResponse.json({ error: 'markdown requis' }, { status: 400 });
        }
        const importResult = await agentService.importMemoriesFromMarkdown(
          agentId!,
          agentData.markdown,
          agentData.sourceTitle || 'Import manuel'
        );
        return NextResponse.json({ success: true, ...importResult });

      case 'memory-consolidate':
        if (!agentId) {
          return NextResponse.json({ error: 'agentId requis' }, { status: 400 });
        }
        const consolidateResult = await agentService.consolidateMemories(agentId);
        return NextResponse.json({ success: true, ...consolidateResult });

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Erreur' }, { status: 500 });
  }
}
