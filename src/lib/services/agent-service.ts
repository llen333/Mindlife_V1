import { db } from '@/lib/db';
import { aiChat } from '@/lib/ai-provider';
import { AIFunction } from '@/lib/ai-config';
import { getOpenAITools, executeToolByName } from '@/lib/ai-tools';
import { bifrost } from '@/lib/bifrost';
import { bus } from '@/lib/bus/orchestrator';
import '@/lib/modules';

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

export interface SessionPreview {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: Date;
  preview: string;
}

export interface MemoryRecord {
  id: string;
  agentId: string;
  type: string;
  key: string;
  value: string;
  importance: number;
  memoryLevel: string;
  emotion: string | null;
  tags: string | null;
  refCount: number;
  isArchived: boolean;
  sourceSessionId: string | null;
  sourceTitle: string | null;
  createdAt: string;
  updatedAt: string;
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

    // Load memories: LTM first (always), then high-importance MTM
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

    // Helper pour extraire le JSON des blocs markdown
    const extractJSON = (text: string) => {
      // 1. Tente de trouver un bloc de code JSON
      const jsonBlock = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonBlock) return jsonBlock[1].trim();
      
      // 2. Tente de trouver un tableau JSON n'importe où dans le texte
      const arrayMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
      if (arrayMatch) return arrayMatch[0].trim();
      
      // 3. Nettoyage final pour essayer de sauver le JSON
      const cleaned = text.trim();
      if (cleaned.startsWith('[') && cleaned.endsWith(']')) return cleaned;
      
      return text.trim();
    };

    // ============================================
    // BIFROST: détection et routage rapide
    // ============================================
    const bifrostResult = await bifrost.detectAndRoute(params.message, {
      userId: params.userId,
      sessionId: session.id,
      agentName: agent.name,
      role: agent.role,
      history: recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    });

    if (bifrostResult.handled) {
      let resultContent: string;
      let usedProvider = 'bifrost';

      const isCrudConfirm = bifrostResult.response!.length < 200 && /(enregistré|ajouté|créé|supprimé|séance enregistrée)/i.test(bifrostResult.response!);

      if (isCrudConfirm) {
        // Confirmation CRUD → pas besoin de LLM
        resultContent = bifrostResult.response!;
      } else {
        // Contenu → wrapping LLM avec la personnalité de l'agent
        const synthesis = await aiChat(params.message, {
          func,
          systemPrompt: `${systemPrompt}

Voici des informations à transmettre à l'utilisateur de façon naturelle, en incarnant TA personnalité unique :

${bifrostResult.response}

Ne lis pas ce bloc tel quel. Reformule avec ton ton, ajoute une touche personnelle, mais garde les informations clés.`,
          userId: params.userId,
          history: recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
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

    // --- PLAN & EXECUTE FLOW (fallback) ---
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Les outils viennent des modules enregistrés sur le Bus
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
    });

    let resultContent: string;
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
      // FALLBACK : Si le LLM a discuté au lieu de planifier, on tente la détection par mots-clés
      const { detectAndExecute } = await import('@/lib/agent-tools');
      const toolResult = await detectAndExecute(params.message, params.userId);
      
      if (toolResult) {
        const synthesis = await aiChat(params.message, {
          func,
          systemPrompt: `L'utilisateur a demandé une action. Voici le résultat obtenu : ${toolResult.output}. 
Formule une réponse naturelle et chaleureuse en français.`,
          userId: params.userId,
          history: recentMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
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

    await this.extractMemories(agent.id, params.message, resultContent);

    // Fire-and-forget: run memory synthesis (non-blocking)
    this.synthesizeMemories(agent.id, params.message, resultContent, session.id, agent.name).catch(e =>
      console.error('[MEMORY-SYNTH] Error:', e)
    );

    // Increment refCount for referenced memories
    await this.incrementMemoryRefs(agent.id, memories, params.message);

    return {
      content: resultContent,
      sessionId: session.id,
      provider: usedProvider,
      agent: { id: agent.id, name: agent.name, role: agent.role },
      memoriesLoaded: memories.length,
      messagesInSession: recentMessages.length + 2,
    };
  }

  private async incrementMemoryRefs(agentId: string, loadedMemories: any[], userMessage: string) {
    const msg = userMessage.toLowerCase();
    for (const mem of loadedMemories) {
      const keyLower = mem.key.replace(/_/g, ' ').toLowerCase();
      if (msg.includes(keyLower) || msg.includes(mem.key.toLowerCase())) {
        try {
          await db.agentMemory.update({
            where: { id: mem.id },
            data: { refCount: { increment: 1 }, updatedAt: new Date() },
          });
        } catch {}
      }
    }
  }

  private async extractMemories(agentId: string, userMessage: string, aiResponse: string) {
    const extractions: Array<{ type: string; key: string; value: string; importance: number }> = [];

    const patterns = [
      { regex: /je m'appelle\s+(\w+)/i, type: 'context', key: 'nom_utilisateur', importance: 5 },
      { regex: /j'ai\s+(\d+)\s*ans/i, type: 'context', key: 'age_utilisateur', importance: 4 },
      { regex: /je suis\s+(.+?)(?:\.|!|\?|$)/i, type: 'context', key: 'identite', importance: 4 },
      { regex: /(?:mon objectif|je veux|j'aimerais|je souhaite)\s+(.+?)(?:\.|!|\?|$)/i, type: 'learning', key: 'objectif', importance: 5 },
      { regex: /je me sens\s+(.+?)(?:\.|!|\?|$)/i, type: 'learning', key: 'ressenti', importance: 3 },
      { regex: /j'aime\s+(.+?)(?:\.|!|\?|$)/i, type: 'preference', key: 'aime', importance: 3 },
      { regex: /(?:j'ai du mal|je n'arrive pas|je lutte avec)\s+(.+?)(?:\.|!|\?|$)/i, type: 'learning', key: 'difficulte', importance: 4 },
      { regex: /(?:je travaille|mon travail|c'est un)\s+(.+?)(?:\.|!|\?|$)/i, type: 'context', key: 'travail', importance: 3 },
    ];

    for (const { regex, type, key, importance } of patterns) {
      const match = userMessage.match(regex);
      if (match) {
        const value = match[1].trim();
        if (value.length > 2 && value.length < 200) {
          const suffix = match[0].slice(0, 30).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
          const uniqueKey = `${key}_${suffix}`;
          extractions.push({ type, key: uniqueKey, value, importance });
        }
      }
    }

    for (const extraction of extractions) {
      const existing = await db.agentMemory.findFirst({
        where: { agentId, type: extraction.type, key: { startsWith: extraction.key.split('_')[0] } },
      });

      if (existing) {
        if (existing.importance < extraction.importance) {
          await db.agentMemory.update({
            where: { id: existing.id },
            data: { value: extraction.value, importance: extraction.importance, updatedAt: new Date() },
          });
        }
      } else {
        await db.agentMemory.create({
          data: {
            id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            agentId,
            type: extraction.type,
            key: extraction.key,
            value: extraction.value,
            importance: extraction.importance,
            memoryLevel: 'ltm',
          },
        });
      }
    }
  }

  private async synthesizeMemories(
    agentId: string,
    userMessage: string,
    aiResponse: string,
    sessionId: string,
    agentName: string
  ) {
    const extractionPrompt = `Tu es un extracteur de mémoire agentique pour ${agentName}. Analyse cet échange et extrait des souvenirs au format MTM (moyen terme).

Échange Utilisateur :
"${userMessage.slice(0, 1000)}"

Réponse de ${agentName} :
"${aiResponse.slice(0, 1000)}"

Instructions : extrais si pertinent :
1. ÉMOTIONS exprimées par l'utilisateur (joie, tristesse, colère, peur, surprise, confiance, anticipation)
2. PATTERNS de pensée ou comportement récurrents
3. APPRENTISSAGES ou insights de la conversation
4. RÉFLEXIONS philosophiques ou stratégiques

Retourne UNIQUEMENT un tableau JSON valide (ou [] si rien à extraire) :
[{ "type": "mtm_emotion"|"mtm_pattern"|"mtm_learning"|"mtm_reflection", "key": "identifiant_court", "value": "description concise", "emotion": "joie"|null, "importance": 1-5 }]`;

    const result = await aiChat('Extrais les souvenirs de cet échange.', {
      func: 'chat',
      systemPrompt: extractionPrompt,
    });

    if (!result.success || !result.content) return;

    try {
      const jsonStr = result.content.replace(/```json\s*|\s*```/g, '').trim();
      const entries = JSON.parse(jsonStr);
      if (!Array.isArray(entries)) return;

      for (const entry of entries) {
        if (!entry.type || !entry.key || !entry.value) continue;
        if (entry.type === 'mtm_emotion' && !entry.emotion) continue;

        await db.agentMemory.create({
          data: {
            id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            agentId,
            type: entry.type,
            key: entry.key,
            value: entry.value,
            importance: entry.importance || 3,
            memoryLevel: 'mtm',
            emotion: entry.emotion || null,
            sourceSessionId: sessionId,
          },
        });
      }
    } catch {}
  }

  async consolidateMemories(agentId: string) {
    const results = { decayed: 0, archived: 0, promoted: 0 };

    // 1. Decay MTM older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oldMtms = await db.agentMemory.findMany({
      where: { agentId, memoryLevel: 'mtm', isArchived: false, updatedAt: { lt: sevenDaysAgo } },
    });

    for (const mem of oldMtms) {
      const newImp = mem.importance - 1;
      if (newImp <= 0) {
        await db.agentMemory.update({ where: { id: mem.id }, data: { isArchived: true, updatedAt: new Date() } });
        results.archived++;
      } else {
        await db.agentMemory.update({ where: { id: mem.id }, data: { importance: newImp, updatedAt: new Date() } });
        results.decayed++;
      }
    }

    // 2. Promote MTM with refCount >= 3 to LTM
    const promotable = await db.agentMemory.findMany({
      where: { agentId, memoryLevel: 'mtm', isArchived: false, refCount: { gte: 3 } },
    });

    for (const mem of promotable) {
      const ltmType = mem.type.replace(/^mtm_/, 'ltm_');
      const existingLtm = await db.agentMemory.findFirst({
        where: { agentId, key: mem.key, memoryLevel: 'ltm' },
      });
      if (!existingLtm) {
        await db.agentMemory.update({
          where: { id: mem.id },
          data: { memoryLevel: 'ltm', type: ltmType, importance: Math.min(mem.importance + 1, 5), updatedAt: new Date() },
        });
        results.promoted++;
      }
    }

    return results;
  }

  async importMemoriesFromMarkdown(agentId: string, markdown: string, sourceTitle?: string) {
    const importPrompt = `Tu es un extracteur de mémoire à vie. Analyse ce document markdown et convertis-le en souvenirs persistants LTM (long terme) pour un agent IA.

Document :
"${markdown.slice(0, 4000)}"

Instructions : extrais les informations factuelles, les valeurs, les croyances, les événements marquants, les relations, les compétences, les préférences durables.

Retourne UNIQUEMENT un tableau JSON valide (ou [] si rien) :
[{ "type": "ltm_identity"|"ltm_milestone"|"ltm_value"|"ltm_relationship", "key": "identifiant_court", "value": "description", "tags": ["tag1","tag2"], "importance": 1-5 }]`;

    const result = await aiChat('Importe ces connaissances dans la mémoire permanente.', {
      func: 'chat',
      systemPrompt: importPrompt,
    });

    if (!result.success || !result.content) {
      return { created: 0, error: 'LLM extraction failed' };
    }

    try {
      const jsonStr = result.content.replace(/```json\s*|\s*```/g, '').trim();
      const entries = JSON.parse(jsonStr);
      if (!Array.isArray(entries)) return { created: 0, error: 'Invalid response format' };

      let created = 0;
      for (const entry of entries) {
        if (!entry.type || !entry.key || !entry.value) continue;

        const existing = await db.agentMemory.findFirst({
          where: { agentId, key: entry.key, memoryLevel: 'ltm' },
        });
        if (!existing) {
          await db.agentMemory.create({
            data: {
              id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              agentId,
              type: entry.type,
              key: entry.key,
              value: entry.value,
              importance: entry.importance || 3,
              memoryLevel: 'ltm',
              tags: entry.tags ? JSON.stringify(entry.tags) : null,
              sourceTitle: sourceTitle || 'Import .md',
            },
          });
          created++;
        }
      }

      return { created, error: null };
    } catch {
      return { created: 0, error: 'JSON parse failed' };
    }
  }

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
          provider: 'zai',
          model: 'glm-4.5-air',
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
          provider: 'zai',
          model: 'glm-4.5-air',
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
        memoriesCount: 0,
        sessionsCount: 0,
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

  async getMemoriesCountByLevel(agentId: string) {
    const [stm, mtm, ltm] = await Promise.all([
      db.agentMemory.count({ where: { agentId, memoryLevel: 'stm' } }),
      db.agentMemory.count({ where: { agentId, memoryLevel: 'mtm' } }),
      db.agentMemory.count({ where: { agentId, memoryLevel: 'ltm' } }),
    ]);
    return { stm, mtm, ltm, total: stm + mtm + ltm };
  }

  async listMemories(agentId: string, level?: string) {
    const where: any = { agentId };
    if (level && ['stm', 'mtm', 'ltm'].includes(level)) {
      where.memoryLevel = level;
    }
    return db.agentMemory.findMany({
      where,
      orderBy: [{ importance: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async createMemory(agentId: string, data: {
    key: string;
    value: string;
    type: string;
    importance: number;
    memoryLevel?: string;
    emotion?: string;
    tags?: string;
  }) {
    return db.agentMemory.create({
      data: {
        id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        agentId,
        key: data.key,
        value: data.value,
        type: data.type,
        importance: data.importance,
        memoryLevel: data.memoryLevel || 'ltm',
        emotion: data.emotion || null,
        tags: data.tags || null,
      },
    });
  }

  async updateMemory(memoryId: string, data: {
    key?: string;
    value?: string;
    type?: string;
    importance?: number;
    memoryLevel?: string;
    emotion?: string;
    tags?: string;
  }) {
    return db.agentMemory.update({
      where: { id: memoryId },
      data,
    });
  }

  async deleteMemory(memoryId: string) {
    await db.agentMemory.delete({ where: { id: memoryId } });
    return { success: true };
  }
}

export const agentService = new AgentService();
