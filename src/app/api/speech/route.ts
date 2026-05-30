import { NextRequest, NextResponse } from 'next/server';

// Check if we should use local fallback
const USE_LOCAL_FALLBACK = process.env.USE_LOCAL_SPEECH === 'true' || !process.env.ZAI_API_KEY;

// POST - Transcribe audio (ASR) or synthesize speech (TTS)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, audio, text, voice, speed } = body;

    // If local fallback mode, return instructions for client-side processing
    if (USE_LOCAL_FALLBACK) {
      if (action === 'tts' || text) {
        return NextResponse.json({
          success: true,
          action: 'tts',
          provider: 'local',
          useWebSpeech: true,
          text: text,
          options: {
            voice: voice || 'default',
            speed: speed || 1.0,
            lang: 'fr-FR'
          },
          message: 'TTS en mode local. Utilisez la synthèse vocale du navigateur.'
        });
      }

      if (action === 'asr' || audio) {
        return NextResponse.json({
          success: true,
          action: 'asr',
          provider: 'local',
          useWebSpeech: true,
          transcript: null,
          message: 'ASR en mode local. Utilisez la reconnaissance vocale du navigateur.'
        });
      }

      return NextResponse.json(
        { error: 'Invalid action. Specify "tts" with text or "asr" with audio.' },
        { status: 400 }
      );
    }

    // Try Z.ai SDK
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();

      // Text-to-Speech
      if (action === 'tts' || text) {
        if (!text) {
          return NextResponse.json(
            { error: 'Text is required for TTS' },
            { status: 400 }
          );
        }

        const ttsResult = await zai.functions.invoke('tts', {
          text,
          voice: voice || 'alloy',
          speed: speed || 1.0,
        });

        return NextResponse.json({
          success: true,
          action: 'tts',
          audio: ttsResult,
        });
      }

      // Speech-to-Text (ASR)
      if (action === 'asr' || audio) {
        if (!audio) {
          return NextResponse.json(
            { error: 'Audio data is required for ASR' },
            { status: 400 }
          );
        }

        const asrResult = await zai.functions.invoke('asr', {
          audio,
        });

        return NextResponse.json({
          success: true,
          action: 'asr',
          transcript: asrResult,
        });
      }

      return NextResponse.json(
        { error: 'Invalid action. Specify "tts" with text or "asr" with audio.' },
        { status: 400 }
      );
    } catch (sdkError) {
      console.error('Z.ai SDK error, using fallback:', sdkError);

      // Fallback responses
      if (action === 'tts' || text) {
        return NextResponse.json({
          success: true,
          action: 'tts',
          provider: 'local',
          useWebSpeech: true,
          text: text,
          options: {
            voice: voice || 'default',
            speed: speed || 1.0,
            lang: 'fr-FR'
          }
        });
      }

      if (action === 'asr' || audio) {
        return NextResponse.json({
          success: true,
          action: 'asr',
          provider: 'local',
          useWebSpeech: true,
          transcript: null
        });
      }

      return NextResponse.json(
        { error: 'Action non spécifiée' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in speech API:', error);
    return NextResponse.json(
      {
        error: 'Failed to process speech request',
        fallback: true,
        useWebSpeech: true
      },
      { status: 500 }
    );
  }
}
