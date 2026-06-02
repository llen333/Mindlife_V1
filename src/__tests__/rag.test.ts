import { chunkText, chunkConversation } from '@/lib/rag/chunker';

describe('RAG Chunker', () => {
  it('splits text into chunks', () => {
    const text = 'Première phrase. Deuxième phrase. Troisième phrase.';
    const chunks = chunkText(text, { size: 100, overlap: 0 });
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks[0].content).toContain('Première phrase');
    expect(chunks[0].index).toBe(0);
    expect(chunks[0].tokens).toBeGreaterThan(0);
  });

  it('returns a single chunk for short text', () => {
    const chunks = chunkText('Hello world.', { size: 1000, overlap: 0 });
    expect(chunks).toHaveLength(1);
    expect(chunks[0].content).toBe('Hello world.');
  });

  it('returns empty array for empty text', () => {
    expect(chunkText('', { size: 100, overlap: 0 })).toEqual([]);
  });

  it('handles text without punctuation', () => {
    const chunks = chunkText('just some words without any punctuation', { size: 100, overlap: 0 });
    expect(chunks.length).toBe(1);
    expect(chunks[0].content).toContain('just some words');
  });

  it('chunks conversation messages', () => {
    const messages = [
      { role: 'user', content: 'Bonjour' },
      { role: 'assistant', content: 'Salut comment vas-tu' },
    ];
    const chunks = chunkConversation(messages, { size: 1000, overlap: 0 });
    expect(chunks.length).toBe(1);
    expect(chunks[0].content).toContain('[user]');
    expect(chunks[0].content).toContain('[assistant]');
  });

  it('creates multiple chunks for long text', () => {
    const longText = Array(50).fill('Une phrase de test pour vérifier le chunking automatique du service RAG.').join(' ');
    const chunks = chunkText(longText, { size: 200, overlap: 20 });
    expect(chunks.length).toBeGreaterThan(1);
  });
});
