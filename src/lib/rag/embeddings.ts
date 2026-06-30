const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

export interface EmbeddingResult {
  vector: number[];
  dimensions: number;
  model: string;
}

// Auto-détection : pas de clé OpenAI → mode mock déterministe
const mockMode = !process.env.OPENAI_API_KEY;

export function useMockEmbeddings(): void {
  // Maintenu pour compatibilité avec les tests
}

export function useRealEmbeddings(): void {
  // Maintenu pour compatibilité avec les tests
}

if (mockMode) {
  console.warn('[EMBEDDINGS] Pas de OPENAI_API_KEY — utilisation du mode mock déterministe');
} else {
  console.log('[EMBEDDINGS] OpenAI API key détectée — embeddings réels activés');
}

function deterministicVector(text: string, dims = EMBEDDING_DIMENSIONS): number[] {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  const seed = Math.abs(hash);
  const vec: number[] = [];
  for (let i = 0; i < dims; i++) {
    vec.push(Math.sin(seed + i * 0.1) * 0.5 + 0.5);
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
  return vec.map(v => v / norm);
}

export async function getEmbedding(text: string): Promise<EmbeddingResult> {
  if (mockMode) {
    return { vector: deterministicVector(text), dimensions: EMBEDDING_DIMENSIONS, model: `${EMBEDDING_MODEL} (mock)` };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1'}/embeddings`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
        model: EMBEDDING_MODEL,
        dimensions: EMBEDDING_DIMENSIONS,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return {
    vector: data.data[0].embedding,
    dimensions: EMBEDDING_DIMENSIONS,
    model: EMBEDDING_MODEL,
  };
}

export async function getEmbeddingBatch(texts: string[]): Promise<EmbeddingResult[]> {
  if (mockMode) {
    return texts.map(t => ({ vector: deterministicVector(t), dimensions: EMBEDDING_DIMENSIONS, model: `${EMBEDDING_MODEL} (mock)` }));
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1'}/embeddings`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: texts,
        model: EMBEDDING_MODEL,
        dimensions: EMBEDDING_DIMENSIONS,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Embedding API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.map((item: any) => ({
    vector: item.embedding,
    dimensions: EMBEDDING_DIMENSIONS,
    model: EMBEDDING_MODEL,
  }));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}
