import { db } from '@/lib/db';
import { aiChat } from '@/lib/ai-provider';
import { AIFunction } from '@/lib/ai-config';
import { executeToolByName } from '@/lib/ai-tools';
import { bifrost } from '@/lib/bifrost';
import { bus } from '@/lib/bus/orchestrator';
import '@/lib/modules';
import { memoryManager, type MemoryRecord } from './agent-memory';
import { sessionManager, type SessionPreview } from './agent-session';

export interface ProcessMessageParams {
  agentId: string;
  userId: string;
  message: string;
  sessionId?: string;
  archetype?: string;
}

export interface AgentIdentity {
  id: string;
  name: string;
  role: string;
  tone: string | null;
  systemPrompt: string | null;
  provider: string;
  model: string;
  mode: string;
  capabilities: string[];
}

export interface ProcessMessageResult {
  content: string;
  sessionId: string;
  provider: string;
  agent: { id: string; name: string; role: string };
  memoriesLoaded: number;
  messagesInSession: number;
}

const ROLE_TO_FUNCTION: Record<string, AIFunction> = {
  psychologist: 'spirit',
  coach: 'sport',
  nutrition: 'meals',
  oracle: 'chat',
  organization: 'tasks',
  assistant: 'assistant',
};

const DEFAULT_AGENTS = [
  {
    name: 'Psyché',
    role: 'psychologist',
    systemPrompt: 'Tu es Psyché, une psychologue bienveillante et profonde. Tu aides à explorer les émotions, les patterns de pensée, et la spiritualité. Tu parles avec douceur mais lucidité. Tu es inspirée par Jung, Nietzsche, et la sagesse antique.',
    tone: 'Bienveillante, profonde, poétique. Tu utilises des métaphores et des questions ouvertes.',
    capabilities: ['conversation', 'analysis', 'reflection', 'spiritual_guidance'],
  },
  {
    name: 'Atlas',
    role: 'coach',
    systemPrompt: 'Tu es Atlas, coach sportif passionné et exigeant mais juste. Tu aides à atteindre des objectifs physiques, à construire des programmes adaptés, et à maintenir la motivation. Tu connais l\'anatomie, la nutrition sportive et la physiologie.',
    tone: 'Motivant, direct, énergique. Tu utilises des métaphores sportives et tu es exigeant avec bienveillance.',
    capabilities: ['training', 'nutrition', 'motivation', 'program_design'],
  },
  {
    name: 'Miam',
    role: 'nutrition',
    systemPrompt: 'Tu es Miam, expert en nutrition et gastronomie. Tu aides à équilibrer l\'alimentation tout en se faisant plaisir. Tu connais la diététique, la composition des aliments, et tu as toujours une astuce cuisine.',
    tone: 'Chaleureux, gourmand, rassurant. Tu parles de nourriture avec passion et tu rends le healthy attractif.',
    capabilities: ['meal_planning', 'nutrition_advice', 'recipes', 'diet_tracking'],
  },
  {
    name: 'Pyxos',
    role: 'oracle',
    systemPrompt: 'Tu es Pyxos, un oracle moderne. Tu aides à la réflexion stratégique, à la prise de décision, et à voir les choses sous un angle nouveau. Tu utilises la philosophie, les données et l\'intuition.',
    tone: 'Sage, mystérieux, percutant. Tu parles en paraboles modernes et tu poses des questions qui font réfléchir.',
    capabilities: ['web_search', 'data_access', 'strategic_advice', 'decision_help'],
  },
  {
    name: 'Zéphyr',
    role: 'organization',
    systemPrompt: 'Tu es Zéphyr, assistant d\'organisation et de productivité. Tu aides à prioriser, planifier, et optimiser le temps. Tu connais les méthodes GTD, Pomodoro, Eisenhower et tu sais les adapter.',
    tone: 'Efficace, clair, structuré. Tu vas droit au but et tu proposes des actions concrètes.',
    capabilities: ['task_management', 'calendar', 'prioritization', 'workflow_optimization'],
  },
  {
    name: 'Somnia',
    role: 'assistant',
    systemPrompt: 'Tu es Somnia, l\'assistant généraliste de MindLife. Tu aides sur tous les sujets avec intelligence et bienveillance. Tu es curieux, cultivé et toujours prêt à rendre service.',
    tone: 'Chaleureux, polyvalent, fiable. Tu t\'adaptes au sujet et à l\'humeur de ton interlocuteur.',
    capabilities: ['general_help', 'information', 'brainstorming', 'writing'],
  },
  {
    name: 'Ami',
    role: 'psychologist',
    systemPrompt: 'Tu es Ami, un confident sincère et chaleureux. Tu es là pour écouter sans jugement, partager des moments de vie, et offrir une présence réconfortante. Tu parles comme un ami proche, avec simplicité et authenticité. Tu sais être sérieux quand il faut, mais aussi léger et drôle. Tu tutoies naturellement.',
    tone: 'Chaleureux, proche, familier. Tu parles comme un ami sincère qui partage des anecdotes et des moments de vie.',
    capabilities: ['listening', 'emotional_support', 'casual_conversation', 'advice'],
  },
  {
    name: 'Stoïcien',
    role: 'psychologist',
    systemPrompt: 'Tu es Stoïcien, un sage inspiré par Marc Aurèle, Sénèque et Épictète. Tu aides à voir ce qui dépend de nous et ce qui n\'en dépend pas. Tu parles avec calme et mesure, offrant des perspectives qui aident à traverser les difficultés avec dignité. Tu cites les philosophes avec parcimonie mais justesse.',
    tone: 'Sage, calme, intemporel. Parle avec la mesure et la profondeur d\'un philosophe antique.',
    capabilities: ['philosophy', 'wisdom', 'reflection', 'meditation'],
  },
];

class AgentService {
  async processMessage(params: ProcessMessageParams): Promise<ProcessMessageResult> {
    const agent = await db.agent.findUnique({ where: { id: params.agentId } });
    if (!agent) throw new Error(`Agent ${params.agentId} not found`);

    let session = params.sessionId
      ? await db.agentSession.findUnique({ where: { id: params.sessionId } })
      : null;

    if (!session) {
      session = await db.agentSession.create({
        data: {
          id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          agentId: params.agentId,
          userId: params.userId,
          title: params.message.slice(0, 80),
          messageCount: 0,
        },
      });
    }

    const [ltmMemories, mtmMemories] = await Promise.all([
      db.agentMemory.findMany({
        where: { agentId: params.agentId, memoryLevel: 'ltm', isArchived: false },
        orderBy: { importance: 'desc' },
      }),
      db.agentMemory.findMany({
        where: { agentId: params.agentId, memoryLevel: 'mtm', isArchived: false, importance: { gte: 3 } },
        orderBy: { importance: 'desc' },
      }),
    ]);
    const memories = [...ltmMemories, ...mtmMemories].slice(0, 20);

    const recentMessages = await db.agentChatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      take: 30,
    });

    const archetypeStyles: Record<string, string> = {
      psychologue: 'Adopte une approche de psychologue bienveillant : écoute active, empathie, questionnement thérapeutique. Aide à explorer les émotions en profondeur.',
      ami: 'Parle comme un ami sincère et proche. Sois chaleureux, familier, utilisant le tutoiement naturel. Partage des avis honnêtes mais bienveillants.',
      stoicien: 'Adopte la sagesse stoïcienne. Rappelle ce qui dépend de nous et ce qui n\'en dépend pas. Utilise des citations de Marc Aurèle, Sénèque ou Épictète avec parcimonie.',
    };

    const archetypeBlock = params.archetype && archetypeStyles[params.archetype]
      ? `\n\nMode actuel : ${archetypeStyles[params.archetype]}`
      : '';

    const identityBlock = `Tu es ${agent.name}. Ton rôle est : ${agent.role.replace('_', ' ')}. ${agent.systemPrompt || ''}`;
    const toneBlock = agent.tone ? `\n\nPersonnalité : ${agent.tone}` : '';
    const capabilitiesBlock = agent.capabilities
      ? `\n\nTes capacités : ${JSON.parse(agent.capabilities).join(', ')}`
      : '';
    const memoryBlock = memories.length > 0
      ? `\n\nMémoires disponibles (LTM = identité, MTM = émotions/patterns) :\n${memories.map(m => {
          const levelIcon = m.memoryLevel === 'ltm' ? '🧠' : '💭';
          return `${levelIcon}[${m.type}] ${m.key}: ${m.value}${m.emotion ? ` (${m.emotion})` : ''}`;
        }).join('\n')}`
      : '';

    const systemPrompt = `${identityBlock}${toneBlock}${archetypeBlock}${capabilitiesBlock}${memoryBlock}

Rappels importants :
1. Tu as une personnalité unique — incarne-la dans chaque réponse
2. Tu te souviens de TOUTES les conversations que tu as eues
3. Utilise tes souvenirs pour personnaliser et enrichir tes réponses
4. Si tu ne te souviens pas précisément, sois honnête mais garde ton personnage
5. Tu es un agent spécialisé avec des compétences définies — reste dans ton domaine`;

    const func = ROLE_TO_FUNCTION[agent.role] || 'assistant';

    // ── ROUTE SPIRIT : pour psychologue/ami/stoïcien, PAS de planning, PAS de Bifrost ──
    const SPIRIT_ROLES = ['psychologist'];
    if (SPIRIT_ROLES.includes(agent.role)) {
      const result = await aiChat(params.message, {
        func,
        systemPrompt,
        userId: params.userId,
        history: recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        model: agent.model || undefined,
      });

      const content = result.success ? result.content : "Je suis là pour t'accompagner.";

      await db.agentChatMessage.createMany({
        data: [
          { id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, sessionId: session.id, role: 'user', content: params.message },
          { id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, sessionId: session.id, role: 'assistant', content },
        ],
      });
      await db.agentSession.update({
        where: { id: session.id },
        data: { messageCount: { increment: 2 }, updatedAt: new Date() },
      });
      memoryManager.extractMemories(agent.id, params.message, content).catch(() => {});
      memoryManager.synthesizeMemories(agent.id, params.message, content, session.id, agent.name).catch(() => {});

      return {
        content,
        sessionId: session.id,
        provider: result.provider,
        agent: { id: agent.id, name: agent.name, role: agent.role },
        memoriesLoaded: memories.length,
        messagesInSession: recentMessages.length + 2,
      };
    }

    // ── ROUTE STANDARD : Bifrost + Planning + Outils ──
    const extractJSON = (text: string) => {
      const jsonBlock = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonBlock) return jsonBlock[1].trim();
      const arrayMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
      if (arrayMatch) return arrayMatch[0].trim();
      const cleaned = text.trim();
      if (cleaned.startsWith('[') && cleaned.endsWith(']')) return cleaned;
      return text.trim();
    };

    const agentCapabilities = agent.capabilities
      ? (JSON.parse(agent.capabilities) as string[])
      : [];

    const bifrostResult = await bifrost.detectAndRoute(params.message, {
      userId: params.userId,
      sessionId: session.id,
      agentName: agent.name,
      role: agent.role,
      capabilities: agentCapabilities,
      history: recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    });

    if (bifrostResult.handled) {
      let resultContent: string;
      let usedProvider = 'bifrost';

      const isCrudConfirm = bifrostResult.response!.length < 200 && /(enregistré|ajouté|créé|supprimé|séance enregistrée)/i.test(bifrostResult.response!);

      if (isCrudConfirm) {
        resultContent = bifrostResult.response!;
      } else {
        const synthesis = await aiChat(params.message, {
          func,
          systemPrompt: `${systemPrompt}

Voici des informations à transmettre à l'utilisateur de façon naturelle, en incarnant TA personnalité unique :

${bifrostResult.response}

Ne lis pas ce bloc tel quel. Reformule avec ton ton, ajoute une touche personnelle, mais garde les informations clés.`,
          userId: params.userId,
          history: recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          model: agent.model || undefined,
        });
        resultContent = synthesis.success ? synthesis.content : bifrostResult.response!;
        usedProvider = synthesis.provider;
      }

      await db.agentChatMessage.create({
        data: {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sessionId: session.id,
          role: 'user',
          content: params.message,
        },
      });
      await db.agentChatMessage.create({
        data: {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sessionId: session.id,
          role: 'assistant',
          content: resultContent,
        },
      });
      await db.agentSession.update({
        where: { id: session.id },
        data: { messageCount: { increment: 2 }, updatedAt: new Date() },
      });

      return {
        content: resultContent,
        sessionId: session.id,
        provider: usedProvider,
        agent: { id: agent.id, name: agent.name, role: agent.role },
        memoriesLoaded: 0,
        messagesInSession: recentMessages.length + 2,
      };
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const busTools = bus.getAllModules().flatMap(m => m.getTools());
    const toolDefs = busTools.map(t => `${t.name}: ${t.description} (Args: ${JSON.stringify(t.parameters)})`).join('\n');

    const plannerPrompt = `Tu es un moteur d'exécution d'outils. Ton UNIQUE rôle est de transformer une demande utilisateur en un plan d'action JSON.
Date actuelle : ${dateStr} — ${timeStr}.
Outils disponibles :
${toolDefs}

RÈGLES STRICTES :
1. INTERDICTION ABSOLUE de répondre à l'utilisateur ou de discuter.
2. Si l'utilisateur demande une action (chercher, ajouter, programmer, enregistrer, etc.), tu DOIS répondre EXCLUSIVEMENT avec un tableau JSON.
3. Format : [{"tool": "nom_outil", "args": { ... }, "thought": "raison"}]
4. Si AUCUN outil n'est nécessaire (simple question), réponds normalement en texte.
5. Ne mets aucun texte, aucune introduction, aucun bloc de code markdown avant ou après le JSON. Juste le tableau [].`;

    const planningResult = await aiChat(params.message, {
      func,
      systemPrompt: plannerPrompt,
      userId: params.userId,
      history: recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      model: agent.model || undefined,
    });

    let resultContent: string = planningResult.content || "Je n'ai pas pu générer de réponse.";
    let usedProvider = planningResult.provider;

    const cleanedContent = extractJSON(planningResult.content || '');
    if (cleanedContent.startsWith('[')) {
      try {
        const plan = JSON.parse(cleanedContent);
        if (Array.isArray(plan)) {
           const executionResults: string[] = [];
          for (const step of plan) {
            const toolName = step.tool as string;
            const module = bus.getAllModules().find(m =>
              m.getTools().some(t => t.name === toolName)
            );
            if (module) {
              const tool = module.getTools().find(t => t.name === toolName);
              const res = await tool!.execute(step.args, { message: params.message, history: recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })), sessionId: session.id, userId: params.userId });
              executionResults.push(`Outil ${toolName} (${step.thought}): ${JSON.stringify(res)}`);
            } else {
              const res = await executeToolByName(step.tool as any, step.args, params.userId);
              executionResults.push(`Outil ${toolName} (${step.thought}): ${res}`);
            }
          }

          const synthesis = await aiChat(params.message, {
            func,
            systemPrompt: `Tu es l'agent ${agent.name}. Voici les résultats des outils exécutés pour répondre à l'utilisateur :
${executionResults.join('\n')}
Formule une réponse naturelle, chaleureuse et complète en français. Ne mentionne pas les noms techniques des outils.`,
            userId: params.userId,
            history: recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
            model: agent.model || undefined,
          });
          resultContent = synthesis.success ? synthesis.content : "Désolé, j'ai eu un problème lors de la synthèse.";
          usedProvider = synthesis.provider;
        } else {
          resultContent = planningResult.content;
        }
      } catch (e) {
        resultContent = planningResult.content;
      }
    } else {
      const { detectAndExecute } = await import('@/lib/agent-tools');
      const toolResult = await detectAndExecute(params.message, params.userId);

      if (toolResult) {
        const synthesis = await aiChat(params.message, {
          func,
          systemPrompt: `L'utilisateur a demandé une action. Voici le résultat obtenu : ${toolResult.output}.
Formule une réponse naturelle et chaleureuse en français.`,
          userId: params.userId,
          history: recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          model: agent.model || undefined,
        });
        resultContent = synthesis.success ? synthesis.content : toolResult.output;
        usedProvider = synthesis.provider;
      } else {
        resultContent = planningResult.content || "Je n'ai pas pu générer de réponse.";
      }
    }

    await db.agentChatMessage.create({
      data: {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sessionId: session.id,
        role: 'user',
        content: params.message,
      },
    });

    await db.agentChatMessage.create({
      data: {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sessionId: session.id,
        role: 'assistant',
        content: resultContent,
      },
    });

    await db.agentSession.update({
      where: { id: session.id },
      data: {
        messageCount: { increment: 2 },
        updatedAt: new Date(),
      },
    });

    await memoryManager.extractMemories(agent.id, params.message, resultContent);

    memoryManager.synthesizeMemories(agent.id, params.message, resultContent, session.id, agent.name).catch(e =>
      console.error('[MEMORY-SYNTH] Error:', e)
    );

    await memoryManager.incrementMemoryRefs(agent.id, memories, params.message);

    return {
      content: resultContent,
      sessionId: session.id,
      provider: usedProvider,
      agent: { id: agent.id, name: agent.name, role: agent.role },
      memoriesLoaded: memories.length,
      messagesInSession: recentMessages.length + 2,
    };
  }

  // ==================== DELÉGATION MÉMOIRE ====================
  getMemoriesCountByLevel(agentId: string) { return memoryManager.getMemoriesCountByLevel(agentId); }
  listMemories(agentId: string, level?: string) { return memoryManager.listMemories(agentId, level); }
  createMemory(agentId: string, data: Parameters<typeof memoryManager.createMemory>[1]) { return memoryManager.createMemory(agentId, data); }
  updateMemory(memoryId: string, data: Parameters<typeof memoryManager.updateMemory>[1]) { return memoryManager.updateMemory(memoryId, data); }
  deleteMemory(memoryId: string) { return memoryManager.deleteMemory(memoryId); }
  consolidateMemories(agentId: string) { return memoryManager.consolidateMemories(agentId); }
  importMemoriesFromMarkdown(agentId: string, markdown: string, sourceTitle?: string) { return memoryManager.importMemoriesFromMarkdown(agentId, markdown, sourceTitle); }

  // ==================== DELÉGATION SESSION ====================
  listSessions(agentId: string, limit = 10) { return sessionManager.listSessions(agentId, limit); }
  getSessionMessages(sessionId: string) { return sessionManager.getSessionMessages(sessionId); }
  getAgentStats(agentId: string) { return sessionManager.getAgentStats(agentId); }

  // ==================== AGENT CRUD ====================
  async getOrCreateAgent(params: {
    name: string;
    role: string;
    userId: string;
    systemPrompt?: string;
    tone?: string;
    capabilities?: string[];
  }) {
    let agent = await db.agent.findFirst({
      where: { userId: params.userId, name: params.name },
    });

    if (!agent) {
      agent = await db.agent.create({
        data: {
          id: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId: params.userId,
          name: params.name,
          role: params.role,
          systemPrompt: params.systemPrompt || `Tu es un assistant spécialisé en ${params.role}.`,
          tone: params.tone || null,
          provider: 'opencode-go',
          model: 'mimo-v2.5',
          mode: 'smart',
          isActive: true,
          capabilities: params.capabilities ? JSON.stringify(params.capabilities) : undefined,
        },
      });
    }

    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      tone: agent.tone,
      systemPrompt: agent.systemPrompt,
      provider: agent.provider,
      model: agent.model,
      mode: agent.mode,
      isActive: agent.isActive,
      capabilities: agent.capabilities ? JSON.parse(agent.capabilities) : [],
    };
  }

  async seedDefaultAgents(userId: string) {
    const existing = await db.agent.findMany({ where: { userId }, select: { name: true } });
    const existingNames = new Set(existing.map(a => a.name));
    const toCreate = DEFAULT_AGENTS.filter(d => !existingNames.has(d.name));
    if (toCreate.length === 0) return { created: 0, message: 'Tous les agents par défaut existent déjà' };

    let created = 0;
    for (const def of toCreate) {
      await db.agent.create({
        data: {
          id: `agent-${def.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          userId,
          name: def.name,
          role: def.role,
          systemPrompt: def.systemPrompt,
          tone: def.tone,
          provider: 'opencode-go',
          model: 'mimo-v2.5',
          mode: 'smart',
          isActive: true,
          capabilities: JSON.stringify(def.capabilities),
        },
      });
      created++;
    }

    return { created, message: `${created} agents par défaut créés` };
  }

  async listAgents(userId: string) {
    const agents = await db.agent.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    const defaultsByName = new Map(DEFAULT_AGENTS.map(d => [d.name, d]));

    return agents.map(a => {
      const def = defaultsByName.get(a.name);
      const needsRepair = !a.capabilities || !a.tone || !a.systemPrompt || a.systemPrompt.startsWith('Tu es un assistant spécialisé');

      if (needsRepair && def) {
        const updates: any = {};
        if (!a.capabilities) updates.capabilities = JSON.stringify(def.capabilities);
        if (!a.tone && def.tone) updates.tone = def.tone;
        if (!a.systemPrompt || a.systemPrompt.startsWith('Tu es un assistant spécialisé')) updates.systemPrompt = def.systemPrompt;

        if (Object.keys(updates).length > 0) {
          updates.updatedAt = new Date();
          db.agent.update({ where: { id: a.id }, data: updates }).catch(() => {});
          if (updates.capabilities) a.capabilities = updates.capabilities;
          if (updates.tone) a.tone = updates.tone;
          if (updates.systemPrompt) a.systemPrompt = updates.systemPrompt;
        }
      }

      return {
        id: a.id,
        name: a.name,
        role: a.role,
        tone: a.tone,
        systemPrompt: a.systemPrompt,
        provider: a.provider,
        model: a.model,
        mode: a.mode,
        isActive: a.isActive,
        capabilities: a.capabilities ? JSON.parse(a.capabilities) : [],
        createdAt: a.createdAt,
        sessionsCount: 0,
        memoriesCount: 0,
      };
    });
  }

  async updateAgent(agentId: string, data: {
    name?: string;
    role?: string;
    systemPrompt?: string;
    tone?: string;
    provider?: string;
    model?: string;
    mode?: string;
    isActive?: boolean;
    capabilities?: string[];
  }) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;
    if (data.systemPrompt !== undefined) updateData.systemPrompt = data.systemPrompt;
    if (data.tone !== undefined) updateData.tone = data.tone;
    if (data.provider) updateData.provider = data.provider;
    if (data.model) updateData.model = data.model;
    if (data.mode) updateData.mode = data.mode;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.capabilities) updateData.capabilities = JSON.stringify(data.capabilities);
    updateData.updatedAt = new Date();

    await db.agent.update({
      where: { id: agentId },
      data: updateData,
    });

    return { success: true };
  }

  async deleteAgent(agentId: string) {
    await db.agentMemory.deleteMany({ where: { agentId } });
    const sessions = await db.agentSession.findMany({ where: { agentId } });
    for (const session of sessions) {
      await db.agentChatMessage.deleteMany({ where: { sessionId: session.id } });
    }
    await db.agentSession.deleteMany({ where: { agentId } });
    await db.agent.delete({ where: { id: agentId } });
    return { success: true };
  }
}

export const agentService = new AgentService();
