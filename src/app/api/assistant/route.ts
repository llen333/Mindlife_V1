import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { aiChat } from '@/lib/ai-provider';

const FALLBACK_USER_ID = 'user-admin';

// POST - Chat with AI assistant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, userId: bodyUserId } = body;
    const userId = bodyUserId || FALLBACK_USER_ID;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Gather user context for personalized advice
    let contextString = '';
    try {
      const [tasks, goals, habits] = await Promise.all([
        db.task.findMany({
          where: { userId, status: { not: 'completed' } },
          take: 5,
          orderBy: { priority: 'desc' },
        }),
        db.goal.findMany({
          where: { userId, status: 'active' },
          take: 3,
        }),
        db.habit.findMany({
          where: { userId, isActive: true },
          take: 3,
        }),
      ]);

      contextString = `
Contexte utilisateur :
- Tâches en cours : ${tasks.length > 0 ? tasks.map(t => t.title).join(', ') : 'Aucune'}
- Objectifs actifs : ${goals.length > 0 ? goals.map(g => g.title).join(', ') : 'Aucun'}
- Habitudes : ${habits.length > 0 ? habits.map(h => h.name).join(', ') : 'Aucune'}
      `.trim();
    } catch (dbError) {
      console.log('Could not fetch user context');
    }

    // Utiliser le provider configuré pour assistant
    const result = await aiChat(message, {
      func: 'assistant',
      systemPrompt: `Tu es un assistant personnel MindLife utile et bienveillant.

${contextString}

Tu aides à organiser la vie quotidienne. Tu donnes des conseils pratiques pour les tâches, objectifs et organisation. Réponds de manière concise et actionnable.`,
      history: (context || []).slice(-5).map((msg: { role: string; content: string }) => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      })),
    });

    if (result.success && result.content && result.provider !== 'local') {
      return NextResponse.json({
        message: result.content,
        provider: result.provider,
        context: [],
      });
    }

    // Fallback local
    const fallbackContent = "Je comprends. Laisse-moi t'aider à organiser tes tâches et objectifs. Qu'est-ce qui est le plus important pour toi aujourd'hui ?";
    
    return NextResponse.json({
      message: fallbackContent,
      provider: 'local',
      context: [],
    });

  } catch (error) {
    console.error('Error in AI assistant:', error);
    
    return NextResponse.json({
      message: "Je suis là pour t'aider ! Qu'est-ce que tu aimerais faire aujourd'hui ?",
      provider: 'local',
      context: [],
    });
  }
}

// GET - Get chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || FALLBACK_USER_ID;
    const limit = searchParams.get('limit');

    const messages = await db.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: limit ? parseInt(limit) : 50,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ messages: [] });
  }
}
