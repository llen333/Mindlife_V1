import { NextRequest, NextResponse } from 'next/server';

// Check if we should use local fallback (no API key available)
const USE_LOCAL_FALLBACK = process.env.USE_LOCAL_TTS === 'true' || !process.env.ZAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'tongtong', speed = 1.0 } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Truncate text if too long (max 1024 chars for TTS)
    const truncatedText = text.length > 1000 ? text.substring(0, 1000) + '...' : text;

    // If local fallback is enabled, return instructions for client-side TTS
    if (USE_LOCAL_FALLBACK) {
      return NextResponse.json({
        success: true,
        provider: 'local',
        text: truncatedText,
        message: 'TTS en mode local. Utilisez la synthèse vocale du navigateur.',
        useWebSpeech: true, // Flag for client to use Web Speech API
        options: {
          voice,
          speed,
          lang: 'fr-FR'
        }
      });
    }

    // Try Z.ai SDK
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();

      const response = await zai.audio.tts.create({
        input: truncatedText.trim(),
        voice: voice,
        speed: speed,
        response_format: 'wav',
        stream: false,
      });

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(new Uint8Array(arrayBuffer));

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/wav',
          'Content-Length': buffer.length.toString(),
          'Cache-Control': 'no-cache',
        },
      });
    } catch (sdkError) {
      console.error('Z.ai TTS SDK Error, falling back to local:', sdkError);
      
      // Fallback to local
      return NextResponse.json({
        success: true,
        provider: 'local',
        text: truncatedText,
        message: 'TTS API non disponible, mode local activé.',
        useWebSpeech: true,
        options: {
          voice,
          speed,
          lang: 'fr-FR'
        }
      });
    }
  } catch (error) {
    console.error('TTS API Error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate speech',
        fallback: true,
        useWebSpeech: true
      },
      { status: 500 }
    );
  }
}
