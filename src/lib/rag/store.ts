import { Pool } from 'pg';
import { Chunk } from './chunker';
import { getEmbedding, getEmbeddingBatch } from './embeddings';

const pool = new Pool({
  connectionString: process.env.VECTOR_DATABASE_URL || 'postgresql://llen@localhost:5432/mindlife',
});

export type MemoryLevel = 'stm' | 'mtm' | 'ltm';

export interface VectorMemory {
  id: string;
  agentId: string;
  content: string;
  metadata: Record<string, unknown>;
  importance: number;
  memoryLevel: MemoryLevel;
  emotion: string | null;
  score?: number;
  createdAt: Date;
}

export async function storeMemory(
  agentId: string,
  content: string,
  metadata: Record<string, unknown> = {},
  importance = 3,
  memoryLevel: MemoryLevel = 'mtm',
  emotion?: string
): Promise<string> {
  const id = `vec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const embedding = await getEmbedding(content);

  await pool.query(
    `INSERT INTO vector_memories (id, agent_id, content, embedding, metadata, importance, memory_level, emotion)
     VALUES ($1, $2, $3, $4::vector, $5::jsonb, $6, $7, $8)`,
    [id, agentId, content, `[${embedding.vector.join(',')}]`, JSON.stringify({ ...metadata, memoryLevel, emotion }), importance, memoryLevel, emotion || null]
  );

  return id;
}

export async function storeMemories(
  agentId: string,
  chunks: Chunk[],
  metadata: Record<string, unknown> = {},
  memoryLevel: MemoryLevel = 'mtm',
  emotion?: string
): Promise<string[]> {
  const texts = chunks.map((c) => c.content);
  const embeddings = await getEmbeddingBatch(texts);
  const ids: string[] = [];
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    for (let i = 0; i < chunks.length; i++) {
      const id = `vec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${i}`;
      ids.push(id);
      await client.query(
        `INSERT INTO vector_memories (id, agent_id, content, embedding, metadata, importance, memory_level, emotion)
         VALUES ($1, $2, $3, $4::vector, $5::jsonb, $6, $7, $8)`,
        [id, agentId, chunks[i].content, `[${embeddings[i].vector.join(',')}]`,
          JSON.stringify({ ...metadata, chunkIndex: i, memoryLevel, emotion }),
          chunks[i].tokens > 50 ? 3 : 2, memoryLevel, emotion || null]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  return ids;
}

export async function searchMemories(
  agentId: string,
  query: string,
  limit = 5,
  minScore = 0.7,
  level?: MemoryLevel
): Promise<VectorMemory[]> {
  const embedding = await getEmbedding(query);

  let sql: string;
  const params: any[] = [`[${embedding.vector.join(',')}]`, agentId, minScore, limit];

  if (level) {
    sql = `SELECT id, agent_id, content, metadata, importance, memory_level, emotion, created_at,
                 1 - (embedding <=> $1::vector) AS score
           FROM vector_memories
           WHERE agent_id = $2
             AND memory_level = $5
             AND 1 - (embedding <=> $1::vector) > $3
           ORDER BY score DESC
           LIMIT $4`;
    params.push(level);
  } else {
    sql = `SELECT id, agent_id, content, metadata, importance, memory_level, emotion, created_at,
                 1 - (embedding <=> $1::vector) AS score
           FROM vector_memories
           WHERE agent_id = $2
             AND 1 - (embedding <=> $1::vector) > $3
           ORDER BY score DESC
           LIMIT $4`;
  }

  const result = await pool.query(sql, params);

  return result.rows.map((row: any) => ({
    id: row.id,
    agentId: row.agent_id,
    content: row.content,
    metadata: row.metadata || {},
    importance: row.importance || 3,
    memoryLevel: row.memory_level || 'mtm',
    emotion: row.emotion || null,
    score: row.score,
    createdAt: row.created_at,
  }));
}

export async function promoteMemory(memoryId: string, newLevel: MemoryLevel): Promise<boolean> {
  const result = await pool.query(
    `UPDATE vector_memories SET memory_level = $1, importance = LEAST(importance + 1, 5) WHERE id = $2`,
    [newLevel, memoryId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function decayMemories(agentId?: string, daysThreshold = 7): Promise<number> {
  const threshold = new Date(Date.now() - daysThreshold * 24 * 60 * 60 * 1000).toISOString();

  if (agentId) {
    const result = await pool.query(
      `UPDATE vector_memories
       SET importance = GREATEST(importance - 1, 0), memory_level = CASE
         WHEN memory_level = 'ltm' AND importance <= 1 THEN 'mtm'
         WHEN memory_level = 'mtm' AND importance <= 0 THEN 'stm'
         ELSE memory_level
       END
       WHERE agent_id = $1 AND created_at < $2 AND importance > 0`,
      [agentId, threshold]
    );
    return result.rowCount ?? 0;
  }

  const result = await pool.query(
    `UPDATE vector_memories
     SET importance = GREATEST(importance - 1, 0), memory_level = CASE
       WHEN memory_level = 'ltm' AND importance <= 1 THEN 'mtm'
       WHEN memory_level = 'mtm' AND importance <= 0 THEN 'stm'
       ELSE memory_level
     END
     WHERE created_at < $1 AND importance > 0`,
    [threshold]
  );
  return result.rowCount ?? 0;
}

export function analyzeEmotion(text: string): { emotion: string | null; intensity: number } {
  const lower = text.toLowerCase();

  const patterns: [RegExp, string, number][] = [
    [/(je suis (très |vraiment |tellement )?(content|heureux|ravi|enchanté|joyeux|satisfait|fier))/, 'joie', 4],
    [/(super |génial |magnifique |parfait |excellent )/, 'joie', 3],
    [/(je suis (triste|déprimé|abattu|morose|mélancolique))/, 'tristesse', 4],
    [/(je (suis |me sens )(fâché|énervé|furieux|agacé|contrarié|en colère))/, 'colère', 4],
    [/(ça m'(énerve|agace|exaspère))/, 'colère', 3],
    [/(j'ai (peur|crainte|appréhension)|je suis (inquiet|anxieux|stressé|angoissé))/, 'peur', 4],
    [/(je (suis surpris|ne m'attendais pas|stupéfait|étonné))/, 'surprise', 3],
    [/(j'ai confiance|je suis (confiant|optimiste|serein|tranquille))/, 'confiance', 3],
    [/(j'anticipe|j'attends avec (impatience|hâte))/, 'anticipation', 3],
  ];

  for (const [regex, emotion, intensity] of patterns) {
    if (regex.test(lower)) {
      return { emotion, intensity };
    }
  }

  return { emotion: null, intensity: 0 };
}

export async function deleteMemories(agentId: string): Promise<number> {
  const result = await pool.query('DELETE FROM vector_memories WHERE agent_id = $1', [agentId]);
  return result.rowCount ?? 0;
}

export async function getMemoryCount(agentId?: string): Promise<number> {
  if (agentId) {
    const result = await pool.query('SELECT COUNT(*) FROM vector_memories WHERE agent_id = $1', [agentId]);
    return parseInt(result.rows[0].count, 10);
  }
  const result = await pool.query('SELECT COUNT(*) FROM vector_memories');
  return parseInt(result.rows[0].count, 10);
}
