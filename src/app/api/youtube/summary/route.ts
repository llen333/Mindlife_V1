import { NextRequest, NextResponse } from 'next/server';
import { aiChat } from '@/lib/ai-provider';

const SUMMARY_PROMPT = `Tu es un expert en analyse de contenu vidéo. Analyse la transcription suivante et génère un résumé structuré et complet.

INFORMATIONS SUR LA VIDÉO:
Titre: {title}
Auteur: {author}
Durée: {duration}

TRANSCRIPTION:
{transcript}

Génère un résumé au format suivant:

## 📋 Résumé
[Un paragraphe de 2-3 phrases résumant le sujet principal]

## 🎯 Points Clés
- [Point clé 1]
- [Point clé 2]
- [Point clé 3]
- [Point clé 4]
- [Point clé 5]

## 💡 Idées Principales
### [Thème 1]
[Explication courte]

### [Thème 2]
[Explication courte]

### [Thème 3]
[Explication courte]

## 📌 Citations Notables
> "[Citation 1]"
> "[Citation 2]"

## ⏱️ Moments Clés
- **[Timestamp]**: [Description]
- **[Timestamp]**: [Description]

## 🎓 Ce qu'on en retient
[2-3 phrases sur les leçons à tirer de cette vidéo]

Réponds en français. Si la transcription est trop courte ou incomplète, adapte le résumé en conséquence.`;

export async function POST(request: NextRequest) {
  try {
    const { metadata, transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcription requise" },
        { status: 400 }
      );
    }

    // Build prompt with context
    const prompt = SUMMARY_PROMPT
      .replace('{title}', metadata?.title || 'Inconnu')
      .replace('{author}', metadata?.author || 'Inconnu')
      .replace('{duration}', metadata?.duration || 'Inconnu')
      .replace('{transcript}', transcript);

    // Call aiChat
    const result = await aiChat(prompt, {
      func: 'assistant',
      systemPrompt: "Tu es un expert en analyse de contenu vidéo. Analyse la transcription suivante et génère un résumé structuré et complet en français.",
    });

    if (result.success && result.content) {
      return NextResponse.json({
        success: true,
        summary: result.content,
      });
    }

    throw new Error(result.error || "Impossible de générer un résumé.");

  } catch (error) {
    console.error("YouTube summary error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du résumé" },
      { status: 500 }
    );
  }
}
