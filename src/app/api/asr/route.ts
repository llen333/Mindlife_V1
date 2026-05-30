import { NextRequest, NextResponse } from 'next/server';

// Check if we should use local fallback
const USE_LOCAL_FALLBACK = process.env.USE_LOCAL_ASR === 'true' || !process.env.ZAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { audioBase64 } = await req.json();

    if (!audioBase64) {
      return NextResponse.json({ error: 'L\'audio est requis' }, { status: 400 });
    }

    // If local fallback is enabled, return instructions for client-side ASR
    if (USE_LOCAL_FALLBACK) {
      return NextResponse.json({
        success: true,
        provider: 'local',
        message: 'ASR en mode local. Utilisez la reconnaissance vocale du navigateur.',
        useWebSpeech: true,
        transcription: null // Client should use Web Speech API instead
      });
    }

    // Try Z.ai SDK
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();

      const response = await zai.audio.asr.create({
        file_base64: audioBase64
      });

      return NextResponse.json({
        success: true,
        transcription: response.text
      });
    } catch (sdkError) {
      console.error('Z.ai ASR SDK Error, falling back to local:', sdkError);
      
      // Fallback to local
      return NextResponse.json({
        success: true,
        provider: 'local',
        message: 'ASR API non disponible, mode local activé.',
        useWebSpeech: true,
        transcription: null
      });
    }

  } catch (error) {
    console.error('ASR API Error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur lors de la transcription',
        fallback: true,
        useWebSpeech: true
      },
      { status: 500 }
    );
  }
}
