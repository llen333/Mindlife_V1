import { NextRequest, NextResponse } from 'next/server';
import { generateRecipe } from '@/lib/nutrition-fallback';
import { aiChat } from '@/lib/ai-provider';

// POST - Generate a recipe based on ingredients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, type = 'plat' } = body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'Ingrédients requis (array)' },
        { status: 400 }
      );
    }

    // Try aiChat first
    try {
      const systemPrompt = `Tu es un chef cuisinier créatif. Crée une recette avec les ingrédients fournis.
Réponds en JSON avec cette structure :
{
  "name": "Nom de la recette",
  "description": "Description appétissante",
  "ingredients": [{"name": "ingrédient", "quantity": "quantité"}],
  "preparation": ["étape 1", "étape 2", ...],
  "prepTime": "X min",
  "cookTime": "X min",
  "calories": nombre,
  "protein": nombre,
  "tags": ["tag1", "tag2"]
}`;

      const result = await aiChat(`Crée une recette ${type} avec : ${ingredients.join(', ')}`, {
        func: 'meals',
        systemPrompt,
      });

      if (result.success && result.content && result.provider !== 'local') {
        let cleanContent = result.content.trim();
        // Remove markdown wrappers if any
        if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        }
        try {
          const recipe = JSON.parse(cleanContent);
          return NextResponse.json({ recipe });
        } catch {
          // Invalid JSON
        }
      }
      
      throw new Error('aiChat response empty or invalid JSON');
      
    } catch (sdkError) {
      // Use fallback
      console.log('Using recipe fallback');
      
      const recipe = generateRecipe(ingredients, type);
      return NextResponse.json({ recipe });
    }

  } catch (error) {
    console.error('Recipe generation error:', error);
    
    const recipe = generateRecipe(['ingrédients variés'], 'plat');
    return NextResponse.json({ recipe });
  }
}
