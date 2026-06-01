import { NextRequest, NextResponse } from 'next/server';
import { agentService } from '@/lib/services/agent-service';
import { db } from '@/lib/db';
import '@/lib/modules';

const DEFAULT_USER_ID = 'mindlife-user';

// Extraction date/heure/priorité depuis un message
function parseTaskMessage(msg: string): { title: string; dueDate?: string; priority?: string } {
  const lower = msg.toLowerCase();
  let title = msg;
  let dueDate: string | undefined;
  let priority: string | undefined;

  if (lower.includes('urgent') || lower.includes('asap')) {
    priority = 'high';
    title = title.replace(/\b(urgent|asap)\b/gi, '').trim();
  }
  const now = new Date();

  // =================== DATES EXPLICITES (prioritaires) ===================

  // DD/MM/YYYY ou DD/MM
  const dateSlash = lower.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/);
  if (dateSlash) {
    const d = new Date(
      dateSlash[3] ? parseInt(dateSlash[3]) : now.getFullYear(),
      parseInt(dateSlash[2]) - 1,
      parseInt(dateSlash[1]),
      9, 0, 0, 0
    );
    if (!isNaN(d.getTime())) {
      dueDate = d.toISOString();
      title = title.replace(dateSlash[0], '').trim();
    }
  }

  // YYYY-MM-DD (ISO)
  if (!dueDate) {
    const dateIso = lower.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (dateIso) {
      const d = new Date(parseInt(dateIso[1]), parseInt(dateIso[2]) - 1, parseInt(dateIso[3]), 9, 0, 0, 0);
      if (!isNaN(d.getTime())) {
        dueDate = d.toISOString();
        title = title.replace(dateIso[0], '').trim();
      }
    }
  }

  // "7 juin 2026" ou "7 juin" (mois en français)
  if (!dueDate) {
    const mois: Record<string, number> = {
      'janvier': 0, 'février': 1, 'fevrier': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
      'juillet': 6, 'août': 7, 'aout': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11, 'decembre': 11
    };
    for (const [moisNom, moisIdx] of Object.entries(mois)) {
      const regex = new RegExp(`(\\d{1,2})\\s*${moisNom}\\s*(\\d{4})?`, 'i');
      const match = lower.match(regex);
      if (match) {
        const d = new Date(
          match[2] ? parseInt(match[2]) : now.getFullYear(),
          moisIdx,
          parseInt(match[1]),
          9, 0, 0, 0
        );
        if (!isNaN(d.getTime())) {
          dueDate = d.toISOString();
          title = title.replace(match[0], '').trim();
        }
        break;
      }
    }
  }

  // =================== DATES RELATIVES ===================

  const dans = lower.match(/dans\s+(\d+)\s*(heure|minute|mn|h)\b/i);
  if (dans) {
    const d = new Date(now);
    d.setMinutes(d.getMinutes() + parseInt(dans[1]) * (dans[2].startsWith('h') ? 60 : 1));
    dueDate = d.toISOString();
    title = title.replace(dans[0], '').trim();
  }

  if (!dueDate && /apr[èe]s[- ]demain/i.test(lower)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 2);
    d.setHours(9, 0, 0, 0);
    dueDate = d.toISOString();
    title = title.replace(/apr[èe]s[- ]demain/gi, '').trim();
  }

  if (!dueDate && lower.includes('demain')) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    dueDate = d.toISOString();
    title = title.replace(/demain/gi, '').trim();
  }

  if (!dueDate) {
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    for (const j of jours) {
      if (lower.includes(j)) {
        const idx = jours.indexOf(j);
        let diff = idx - now.getDay();
        if (diff <= 0) diff += 7;
        const d = new Date(now);
        d.setDate(d.getDate() + diff);
        d.setHours(9, 0, 0, 0);
        dueDate = d.toISOString();
        title = title.replace(new RegExp(j, 'gi'), '').trim();
        break;
      }
    }
  }

  const heure = lower.match(/(?:à\s*)?(\d{1,2})[h:](\d{2})?\b/);
  if (heure) {
    const h = parseInt(heure[1]), m = heure[2] ? parseInt(heure[2]) : 0;
    if (dueDate) {
      const d = new Date(dueDate);
      d.setHours(h, m, 0, 0);
      dueDate = d.toISOString();
    } else {
      const d = new Date(now);
      d.setHours(h, m, 0, 0);
      if (d < now) d.setDate(d.getDate() + 1);
      dueDate = d.toISOString();
    }
    title = title.replace(heure[0], '').trim();
  }

  title = title.replace(/\s+/g, ' ').trim();
  title = title.replace(/^(prendre un |ajoute |cr[ée]e |planifie |programme |rajoute |note |rappelle.moi |faire |aller |voir )/i, '').trim();
  title = title.replace(/\b(un |une |des |du |de la |pour |chez |au |aux |le |la |les )/gi, ' ').trim();
  title = title.charAt(0).toUpperCase() + title.slice(1);
  return { title: title || msg, dueDate, priority };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId = DEFAULT_USER_ID, sessionId, archetype } = body;
    let { agentId, agentName, role } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    // ============================================
    // DÉTECTION RAPIDE D'INTENTION (avant Plan & Execute)
    // ============================================
    const lower = message.toLowerCase();
    const taskKeywords = ['ajoute', 'crée', 'planifie', 'prendre',
                          'rappelle-moi', 'rajoute', 'note', 'à faire', 'todo'];
    const isSportContext = /programme.*(sport|entraînement|entrainement|fitness|musculation)|entraînement|entrainement|sportif|workout|fitness|musculation|séance|exercice/i.test(lower);
    if ((taskKeywords.some(kw => lower.includes(kw)) || lower.includes('aller faire les courses')) && !isSportContext) {
      const parsed = parseTaskMessage(message);
      try {
        const task = await db.task.create({
          data: {
            id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            title: parsed.title,
            userId,
            status: 'pending',
            priority: parsed.priority || 'medium',
            ...(parsed.dueDate ? { dueDate: new Date(parsed.dueDate) } : {}),
          },
        });

        return NextResponse.json({
          success: true,
          response: `✅ J'ai ajouté la tâche « ${task.title} »${parsed.dueDate ? ` (prévue le ${new Date(parsed.dueDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à ${new Date(parsed.dueDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})` : ''}.`,
          sessionId: sessionId || `session-${Date.now()}`,
          provider: 'local',
          task,
        });
      } catch (taskError) {
        console.error('Task creation error:', taskError);
        // Fall through to normal flow on error
      }
    }

    // ============================================
    // FLUX NORMAL: Plan & Execute
    // ============================================

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
