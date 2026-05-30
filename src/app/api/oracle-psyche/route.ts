import { NextRequest, NextResponse } from 'next/server';
import { analyzeMessage, generateStoicResponse } from '@/lib/ai-fallback';
import { aiChat } from '@/lib/ai-provider';

// Oracle psyche - Spiritual guidance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, userMemory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    // Try aiChat first
    try {
      let systemPrompt = `Tu es l'Oracle de Psyché, un guide spirituel et philosophique.
Tu parles avec sagesse, poésie et profondeur.
Tu aides les chercheurs de vérité à trouver des réponses en eux-mêmes.
Tu utilises des métaphores et des citations philosophiques.
Réponds de manière mystérieuse mais éclairante.`;

      if (userMemory) {
        systemPrompt += `\n\n[Instructions personnalisées / Mémoire de l'utilisateur] :\n${userMemory}`;
      }

      const result = await aiChat(message, {
        func: 'spirit',
        systemPrompt,
        archetype: 'stoicien',
      });

      if (result.success && result.content && result.provider !== 'local') {
        return NextResponse.json({ message: result.content });
      }
      
      throw new Error('aiChat failed or returned local fallback');
      
    } catch (sdkError) {
      // Use fallback - stoic response is perfect for oracle
      console.log('Using oracle fallback');
      
      const analysis = analyzeMessage(message);
      const response = generateStoicResponse(message, analysis);
      
      // Add oracle flavor
      const oraclePrefix = [
        "🌙 L'Oracle murmure...",
        "✨ Les étoiles révèlent...",
        "🔮 Dans les profondeurs de l'âme...",
        "🌟 La sagesse ancienne éclaire...",
      ];
      
      const prefix = oraclePrefix[Math.floor(Math.random() * oraclePrefix.length)];
      
      return NextResponse.json({ message: `${prefix}\n\n${response}` });
    }

  } catch (error) {
    console.error('Oracle psyche error:', error);
    
    return NextResponse.json({
      message: "✨ L'Oracle médite sur ta question...\n\nLe voyage vers la vérité commence par un pas intérieur. Qu'est-ce que ton cœur cherche vraiment ?"
    });
  }
}
