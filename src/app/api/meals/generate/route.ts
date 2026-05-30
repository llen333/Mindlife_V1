import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRandomMeal, LUNCH_MEALS, DINNER_MEALS, BREAKFAST_MEALS, SNACK_MEALS } from '@/lib/nutrition-fallback';

// Days of the week in French
const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

/**
 * Shuffle array helper using Fisher-Yates algorithm
 * Guarantees a random permutation of the array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Select unique meals ensuring no duplicates within the requested period
 * If more meals are requested than available, cycles through shuffled list
 * with additional shuffle for each cycle to maintain variety
 */
function selectUniqueMeals<T extends { name: string }>(
  meals: T[],
  count: number
): T[] {
  // Handle edge cases
  if (!meals || meals.length === 0) {
    throw new Error('No meals available to select from');
  }
  
  if (count <= 0) {
    return [];
  }
  
  const result: T[] = [];
  let currentPool = shuffleArray(meals);
  let poolIndex = 0;
  
  for (let i = 0; i < count; i++) {
    // If we've exhausted the current pool, reshuffle for more variety
    if (poolIndex >= currentPool.length) {
      currentPool = shuffleArray(meals);
      poolIndex = 0;
    }
    
    result.push(currentPool[poolIndex]);
    poolIndex++;
  }
  
  return result;
}

// POST - Generate meal suggestions for a week
export async function POST(request: NextRequest) {
  try {
    // Parse request body with validation
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        meals: [] 
      }, { status: 400 });
    }
    
    const { mealType = 'both', userId, days = 7, startDate, save = false } = body;
    
    // Validate days parameter
    const validDays = Math.max(1, Math.min(30, Number(days) || 7));
    
    // Validate meal type
    const validMealType = ['lunch', 'dinner', 'both'].includes(mealType) ? mealType : 'both';
    
    // Generate meals for each day
    const meals: Array<{
      id: string;
      name: string;
      description: string;
      date: string;
      dayName: string;
      dayShort: string;
      type: string;
      calories: number;
      protein: number;
      ingredients: Array<{ name: string; quantity: string }>;
      instructions: string;
      prepTime: string;
      cookTime: string;
      tags: string[];
    }> = [];
    
    const start = startDate ? new Date(startDate) : new Date();
    
    // Check if we have enough meals available
    if (LUNCH_MEALS.length === 0 || DINNER_MEALS.length === 0) {
      return NextResponse.json({ 
        error: 'No meal templates available',
        meals: [] 
      }, { status: 500 });
    }
    
    // Select unique meals for the entire period
    // For 'both', we need lunches and dinners for each day
    const lunchesNeeded = validMealType === 'dinner' ? 0 : validDays;
    const dinnersNeeded = validMealType === 'lunch' ? 0 : validDays;
    
    // Use the improved selection algorithm that ensures variety
    const selectedLunches = selectUniqueMeals(LUNCH_MEALS, lunchesNeeded);
    const selectedDinners = selectUniqueMeals(DINNER_MEALS, dinnersNeeded);
    
    let lunchIndex = 0;
    let dinnerIndex = 0;
    
    for (let i = 0; i < validDays; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      
      const dayOfWeek = date.getDay();
      
      // Générer les repas selon le type demandé
      if (validMealType === 'lunch') {
        // Uniquement déjeuners
        const selectedMeal = selectedLunches[lunchIndex++];
        meals.push({
          id: `meal-${date.toISOString().split('T')[0]}-lunch-${i}`,
          name: selectedMeal.name,
          description: selectedMeal.description,
          date: date.toISOString(),
          dayName: DAYS[dayOfWeek],
          dayShort: DAYS_SHORT[dayOfWeek],
          type: 'lunch',
          calories: selectedMeal.calories,
          protein: selectedMeal.protein,
          ingredients: selectedMeal.ingredients,
          instructions: selectedMeal.preparation.join('\n'),
          prepTime: selectedMeal.prepTime,
          cookTime: selectedMeal.cookTime,
          tags: selectedMeal.tags,
        });
      } else if (validMealType === 'dinner') {
        // Uniquement dîners
        const selectedMeal = selectedDinners[dinnerIndex++];
        meals.push({
          id: `meal-${date.toISOString().split('T')[0]}-dinner-${i}`,
          name: selectedMeal.name,
          description: selectedMeal.description,
          date: date.toISOString(),
          dayName: DAYS[dayOfWeek],
          dayShort: DAYS_SHORT[dayOfWeek],
          type: 'dinner',
          calories: selectedMeal.calories,
          protein: selectedMeal.protein,
          ingredients: selectedMeal.ingredients,
          instructions: selectedMeal.preparation.join('\n'),
          prepTime: selectedMeal.prepTime,
          cookTime: selectedMeal.cookTime,
          tags: selectedMeal.tags,
        });
      } else {
        // 'both' - générer déjeuner ET dîner pour chaque jour
        const lunchMeal = selectedLunches[lunchIndex++];
        const dinnerMeal = selectedDinners[dinnerIndex++];
        
        // Ajouter le déjeuner
        meals.push({
          id: `meal-${date.toISOString().split('T')[0]}-lunch-${i}`,
          name: lunchMeal.name,
          description: lunchMeal.description,
          date: date.toISOString(),
          dayName: DAYS[dayOfWeek],
          dayShort: DAYS_SHORT[dayOfWeek],
          type: 'lunch',
          calories: lunchMeal.calories,
          protein: lunchMeal.protein,
          ingredients: lunchMeal.ingredients,
          instructions: lunchMeal.preparation.join('\n'),
          prepTime: lunchMeal.prepTime,
          cookTime: lunchMeal.cookTime,
          tags: lunchMeal.tags,
        });
        
        // Ajouter le dîner
        meals.push({
          id: `meal-${date.toISOString().split('T')[0]}-dinner-${i}`,
          name: dinnerMeal.name,
          description: dinnerMeal.description,
          date: date.toISOString(),
          dayName: DAYS[dayOfWeek],
          dayShort: DAYS_SHORT[dayOfWeek],
          type: 'dinner',
          calories: dinnerMeal.calories,
          protein: dinnerMeal.protein,
          ingredients: dinnerMeal.ingredients,
          instructions: dinnerMeal.preparation.join('\n'),
          prepTime: dinnerMeal.prepTime,
          cookTime: dinnerMeal.cookTime,
          tags: dinnerMeal.tags,
        });
      }
    }
    
    // Save to database if requested
    if (save && userId) {
      for (const meal of meals) {
        try {
          await db.meal.create({
            data: {
              userId,
              name: meal.name,
              description: meal.description,
              type: meal.type || 'lunch',
              date: new Date(meal.date),
              calories: meal.calories,
              protein: meal.protein,
              ingredients: JSON.stringify(meal.ingredients),
              instructions: meal.instructions,
              prepTime: parseInt(meal.prepTime) || 15,
              cookTime: parseInt(meal.cookTime) || 20,
              isGenerated: true,
            }
          });
        } catch (e) {
          console.error('Failed to save meal:', e);
          // Continue saving other meals even if one fails
        }
      }
    }
    
    return NextResponse.json({ 
      meals,
      provider: 'local',
      generatedAt: new Date().toISOString(),
      stats: {
        totalMeals: meals.length,
        uniqueLunches: new Set(meals.filter(m => m.type === 'lunch').map(m => m.name)).size,
        uniqueDinners: new Set(meals.filter(m => m.type === 'dinner').map(m => m.name)).size,
      }
    });
    
  } catch (error) {
    console.error('Meal generation error:', error);
    // Return a safe error response
    return NextResponse.json({ 
      error: 'Failed to generate meals',
      details: error instanceof Error ? error.message : 'Unknown error',
      meals: [] 
    }, { status: 500 });
  }
}

// GET - Get meal plan for day or week
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'day';
    const userId = searchParams.get('userId') || 'user-admin';
    const startDate = searchParams.get('startDate');
    
    // If we have a start date, generate a week of meals
    if (startDate) {
      // Validate date
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return NextResponse.json({ 
          error: 'Invalid start date',
          meals: [] 
        }, { status: 400 });
      }
      
      // Check meal availability
      if (LUNCH_MEALS.length < 7 || DINNER_MEALS.length < 7) {
        return NextResponse.json({ 
          error: 'Insufficient meal templates available',
          meals: [] 
        }, { status: 500 });
      }
      
      // Use the improved selection algorithm
      const selectedLunches = selectUniqueMeals(LUNCH_MEALS, 7);
      const selectedDinners = selectUniqueMeals(DINNER_MEALS, 7);
      
      const meals = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        const dayOfWeek = date.getDay();
        
        // Unique lunch for each day
        meals.push({
          id: `meal-${date.toISOString().split('T')[0]}-lunch`,
          name: selectedLunches[i].name,
          description: selectedLunches[i].description,
          date: date.toISOString(),
          dayName: DAYS[dayOfWeek],
          dayShort: DAYS_SHORT[dayOfWeek],
          type: 'lunch',
          calories: selectedLunches[i].calories,
          protein: selectedLunches[i].protein,
          ingredients: selectedLunches[i].ingredients,
          instructions: selectedLunches[i].preparation.join('\n'),
        });
        
        // Unique dinner for each day
        meals.push({
          id: `meal-${date.toISOString().split('T')[0]}-dinner`,
          name: selectedDinners[i].name,
          description: selectedDinners[i].description,
          date: date.toISOString(),
          dayName: DAYS[dayOfWeek],
          dayShort: DAYS_SHORT[dayOfWeek],
          type: 'dinner',
          calories: selectedDinners[i].calories,
          protein: selectedDinners[i].protein,
          ingredients: selectedDinners[i].ingredients,
          instructions: selectedDinners[i].preparation.join('\n'),
        });
      }
      
      return NextResponse.json({ 
        meals, 
        provider: 'local',
        stats: {
          uniqueLunches: new Set(meals.filter(m => m.type === 'lunch').map(m => m.name)).size,
          uniqueDinners: new Set(meals.filter(m => m.type === 'dinner').map(m => m.name)).size,
        }
      });
    }
    
    // Single day - use random selection
    const lunch = getRandomMeal('dejeuner');
    const dinner = getRandomMeal('diner');
    
    return NextResponse.json({ 
      type: 'day', 
      menu: {
        dejeuner: lunch,
        diner: dinner,
      }
    });
    
  } catch (error) {
    console.error('Meal plan error:', error);
    // Fallback to random meals if something goes wrong
    try {
      return NextResponse.json({ 
        type: 'day', 
        menu: {
          dejeuner: getRandomMeal('dejeuner'),
          diner: getRandomMeal('diner'),
        }
      });
    } catch {
      // Last resort fallback
      return NextResponse.json({ 
        error: 'Failed to generate meals',
        type: 'day',
        menu: null
      }, { status: 500 });
    }
  }
}
