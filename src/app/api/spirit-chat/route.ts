import { NextRequest, NextResponse } from 'next/server';
import { aiChat } from '@/lib/ai-provider';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const archetype: 'psychologue' | 'ami' | 'stoicien' = body.archetype || 'stoicien';
    const message = body.message || '';
    const history = body.history || [];

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // aiChat gère automatiquement le fallback local si pas de clé API
    const result = await aiChat(message, {
      func: 'spirit',
      archetype,
      history: history.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      })),
    });

    if (result.success && result.content) {
      return NextResponse.json({
        message: result.content,
        provider: result.provider,
      });
    }

    // Fallback final
    return NextResponse.json({
      message: "Je suis là pour t'écouter. Dis-moi ce qui te préoccupe.",
      provider: 'local',
    });

  } catch (error) {
    console.error('Spirit chat error:', error);
    return NextResponse.json({
      message: "Je suis là pour t'écouter. Dis-moi ce qui te préoccupe.",
      provider: 'local',
    });
  }
}
