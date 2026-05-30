import { NextRequest, NextResponse } from 'next/server';
import { getNutritionAdvice } from '@/lib/nutrition-fallback';
import { analyzeMessage } from '@/lib/ai-fallback';
import { aiChat } from '@/lib/ai-provider';

// POST - Nutrition advice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, userId } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question requise' },
        { status: 400 }
      );
    }

    // Try aiChat first
    try {
      const systemPrompt = `Tu es un nutritionniste expert. Donne des conseils nutritionnels personnalisés et scientifiquement fondés.
Sois concis mais informatif. Réponds en français.`;

      const result = await aiChat(question, {
        func: 'meals',
        systemPrompt,
      });

      if (result.success && result.content && result.provider !== 'local') {
        return NextResponse.json({ advice: result.content });
      }
      
      throw new Error('aiChat failed or returned local fallback');
      
    } catch (sdkError) {
      // Use fallback
      console.log('Using nutrition fallback');
      
      const analysis = analyzeMessage(question);
      const topic = analysis.topics[0] || 'general';
      const advice = getNutritionAdvice(topic);
      
      // Generate contextual response
      let response = advice;
      
      if (analysis.topics.includes('fatigue')) {
        response = `Pour l'énergie : ${advice}\n\nDe plus, assure-toi de manger suffisamment de glucides complexes et de t'hydrater correctement.`;
      } else if (analysis.topics.includes('sport')) {
        response = `Pour le sport : ${advice}\n\nN'oublie pas les protéines post-entraînement pour la récupération musculaire.`;
      }
      
      return NextResponse.json({ advice: response });
    }

  } catch (error) {
    console.error('Nutrition AI error:', error);
    
    return NextResponse.json({
      advice: "Mange varié et équilibré. Privilégie les aliments non transformés, les fruits et légumes. Hydrate-toi régulièrement."
    });
  }
}
