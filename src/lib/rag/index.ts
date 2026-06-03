export { chunkText, chunkConversation } from './chunker';
export type { Chunk } from './chunker';
export { getEmbedding, getEmbeddingBatch, cosineSimilarity, useMockEmbeddings, useRealEmbeddings } from './embeddings';
export type { EmbeddingResult } from './embeddings';
export {
  storeMemory,
  storeMemories,
  searchMemories,
  deleteMemories,
  getMemoryCount,
  promoteMemory,
  decayMemories,
  analyzeEmotion,
} from './store';
export type { VectorMemory } from './store';
