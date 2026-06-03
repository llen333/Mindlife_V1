export interface Chunk {
  content: string;
  index: number;
  tokens: number;
}

const CHUNK_SIZE = 512;
const CHUNK_OVERLAP = 64;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function chunkText(text: string, options?: { size?: number; overlap?: number }): Chunk[] {
  const size = options?.size ?? CHUNK_SIZE;
  const overlap = options?.overlap ?? CHUNK_OVERLAP;
  const chunks: Chunk[] = [];
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) ?? [text];
  let current = '';
  let index = 0;

  for (const sentence of sentences) {
    const combined = current ? `${current} ${sentence.trim()}` : sentence.trim();
    if (estimateTokens(combined) > size && current) {
      chunks.push({ content: current.trim(), index: index++, tokens: estimateTokens(current) });
      current = sentence.trim();
      const words = current.split(' ');
      if (words.length > overlap) {
        current = words.slice(-overlap).join(' ');
      }
    } else {
      current = combined;
    }
  }

  if (current.trim()) {
    chunks.push({ content: current.trim(), index: index++, tokens: estimateTokens(current) });
  }

  if (chunks.length === 0 && text.trim()) {
    chunks.push({ content: text.trim(), index: 0, tokens: estimateTokens(text) });
  }

  return chunks;
}

export function chunkConversation(
  messages: { role: string; content: string }[],
  options?: { size?: number; overlap?: number }
): Chunk[] {
  return chunkText(
    messages.map((m) => `[${m.role}] ${m.content}`).join('\n'),
    options
  );
}
