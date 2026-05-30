import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/meals/save - Save generated meals
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, meals } = body;

    if (!userId || !meals || !Array.isArray(meals)) {
      return NextResponse.json({ error: 'userId and meals array required' }, { status: 400 });
    }

    let savedCount = 0;
    const savedMeals = [];

    for (const meal of meals) {
      try {
        // Check if meal already exists for this date/type
        const existing = await db.meal.findFirst({
          where: {
            userId,
            date: new Date(meal.date),
            type: meal.type || 'lunch',
          },
        });

        if (existing) {
          // Update existing meal
          const updated = await db.meal.update({
            where: { id: existing.id },
            data: {
              name: meal.name || meal.title,
              description: meal.description,
              calories: meal.calories,
              protein: meal.protein,
              carbs: meal.carbs,
              fat: meal.fat,
              ingredients: typeof meal.ingredients === 'string' 
                ? meal.ingredients 
                : JSON.stringify(meal.ingredients || []),
              instructions: meal.instructions || (meal.steps || []).join('\n'),
              prepTime: meal.prepTime,
              imageUrl: meal.imageUrl || meal.image,
              isGenerated: true,
            },
          });
          savedMeals.push(updated);
        } else {
          // Create new meal
          const created = await db.meal.create({
            data: {
              userId,
              name: meal.name || meal.title,
              description: meal.description || '',
              type: meal.type || 'lunch',
              date: new Date(meal.date),
              calories: meal.calories || 500,
              protein: meal.protein || 25,
              carbs: meal.carbs || 40,
              fat: meal.fat || 15,
              ingredients: typeof meal.ingredients === 'string' 
                ? meal.ingredients 
                : JSON.stringify(meal.ingredients || []),
              instructions: meal.instructions || (meal.steps || []).join('\n'),
              prepTime: meal.prepTime || 20,
              imageUrl: meal.imageUrl || meal.image,
              isGenerated: true,
            },
          });
          savedMeals.push(created);
        }
        savedCount++;
      } catch (err) {
        console.error('Error saving meal:', err);
      }
    }

    return NextResponse.json({ 
      savedCount, 
      meals: savedMeals,
      message: `${savedCount} repas sauvegardés avec succès` 
    });
  } catch (error) {
    console.error('Error saving meals:', error);
    return NextResponse.json({ error: 'Failed to save meals' }, { status: 500 });
  }
}
