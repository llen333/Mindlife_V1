import { NextRequest, NextResponse } from 'next/server';

// Check if we should use local fallback
const USE_LOCAL_FALLBACK = process.env.USE_LOCAL_SEARCH === 'true' || !process.env.ZAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { query, num = 10 } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'La requête est requise' }, { status: 400 });
    }

    // If local fallback mode, return simulated response
    if (USE_LOCAL_FALLBACK) {
      return NextResponse.json({
        success: true,
        provider: 'local',
        query: query,
        results: [],
        totalResults: 0,
        message: 'Recherche web non disponible en mode local. Configurez une clé API pour activer la recherche web.'
      });
    }

    // Try Z.ai SDK
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
      const zai = await ZAI.create();

      const results = await zai.functions.invoke('web_search', {
        query: query,
        num: Math.min(num, 15)
      });

      return NextResponse.json({
        success: true,
        query: query,
        results: results,
        totalResults: results.length
      });
    } catch (sdkError) {
      console.error('Z.ai search SDK error:', sdkError);

      return NextResponse.json({
        success: false,
        provider: 'local',
        query: query,
        results: [],
        totalResults: 0,
        message: 'Recherche web temporairement indisponible. Veuillez réessayer plus tard.'
      });
    }

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Erreur lors de la recherche',
        results: [],
        totalResults: 0
      },
      { status: 500 }
    );
  }
}
