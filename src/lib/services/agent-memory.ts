import { db } from '@/lib/db';
import { aiChat } from '@/lib/ai-provider';

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

export class MemoryManager {
  async extractMemories(agentId: string, userMessage: string, aiResponse: string) {
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

  async synthesizeMemories(
    agentId: string,
    userMessage: string,
    aiResponse: string,
    sessionId: string,
    agentName: string
  ) {
    const extractionPrompt = `Tu es un extracteur de mémoire agentique pour ${agentName}. Analyse cet échange et extrais des souvenirs au format MTM (moyen terme).

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

  async incrementMemoryRefs(agentId: string, loadedMemories: any[], userMessage: string) {
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

export const memoryManager = new MemoryManager();
