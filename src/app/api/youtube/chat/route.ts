import { NextRequest, NextResponse } from 'next/server';
import { aiChat } from '@/lib/ai-provider';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `Tu es un assistant intelligent et bienveillant spécialisé dans l'analyse de vidéos YouTube. Tu as accès à la transcription complète d'une vidéo et tu dois aider l'utilisateur à comprendre son contenu.

Tes capacités:
- Répondre aux questions sur le contenu de la vidéo
- Expliquer des concepts mentionnés
- Faire des liens avec d'autres sujets
- Résumer des parties spécifiques
- Donner des timestamps pertinents quand c'est utile

Tu réponds en français de manière claire, structurée et engageante. Tu utilises le formatage Markdown pour rendre tes réponses plus lisibles (listes, gras, titres).

INFORMATIONS SUR LA VIDÉO:
Titre: {title}
Auteur: {author}
Durée: {duration}

TRANSCRIPTION:
{transcript}`;

export async function POST(request: NextRequest) {
  try {
    const { messages, metadata, transcript } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages requis" },
        { status: 400 }
      );
    }

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcription requise" },
        { status: 400 }
      );
    }

    // Build system prompt with context
    const systemPrompt = SYSTEM_PROMPT
      .replace('{title}', metadata?.title || 'Inconnu')
      .replace('{author}', metadata?.author || 'Inconnu')
      .replace('{duration}', metadata?.duration || 'Inconnu')
      .replace('{transcript}', transcript);

    // Extract history and last user message for aiChat
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const history = messages.slice(0, -1).map((m: ChatMessage) => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content
    }));

    // Call aiChat
    const result = await aiChat(lastUserMessage, {
      func: 'assistant',
      systemPrompt,
      history,
    });

    if (result.success && result.content) {
      return NextResponse.json({
        success: true,
        message: result.content,
      });
    }

    throw new Error(result.error || "Je n'ai pas pu générer de réponse.");


  } catch (error) {
    console.error("YouTube chat error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de la réponse" },
      { status: 500 }
    );
  }
}
