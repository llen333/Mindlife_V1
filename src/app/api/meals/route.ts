import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/meals - Load meals for a week
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const where: any = { userId };
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const meals = await db.meal.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json({ meals });
  } catch (error) {
    console.error('Error loading meals:', error);
    return NextResponse.json({ error: 'Failed to load meals' }, { status: 500 });
  }
}

// POST /api/meals - Create a new meal (manual entry)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, type, date, calories, protein, carbs, fat, servings } = body;

    if (!userId || !name) {
      return NextResponse.json({ error: 'userId and name required' }, { status: 400 });
    }

    const meal = await db.meal.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        name,
        type: type || 'lunch',
        date: new Date(date || Date.now()),
        calories: calories ? parseFloat(calories) : 0,
        protein: protein ? parseFloat(protein) : 0,
        carbs: carbs ? parseFloat(carbs) : 0,
        fat: fat ? parseFloat(fat) : 0,
        servings: servings ? parseInt(servings) : 1,
        isGenerated: false,
      },
    });

    return NextResponse.json({ meal });
  } catch (error) {
    console.error('Error creating meal:', error);
    return NextResponse.json({ error: 'Failed to create meal' }, { status: 500 });
  }
}

// PUT /api/meals - Update a meal
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, userId, name, type, date, calories, protein, carbs, fat, servings, description, ingredients, instructions, prepTime, cookTime } = body;

    if (!id || !userId) {
      return NextResponse.json({ error: 'id and userId required' }, { status: 400 });
    }

    const existing = await db.meal.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (date !== undefined) updateData.date = new Date(date);
    if (calories !== undefined) updateData.calories = parseFloat(calories);
    if (protein !== undefined) updateData.protein = parseFloat(protein);
    if (carbs !== undefined) updateData.carbs = parseFloat(carbs);
    if (fat !== undefined) updateData.fat = parseFloat(fat);
    if (servings !== undefined) updateData.servings = parseInt(servings);
    if (description !== undefined) updateData.description = description;
    if (ingredients !== undefined) updateData.ingredients = ingredients;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (prepTime !== undefined) updateData.prepTime = prepTime;
    if (cookTime !== undefined) updateData.cookTime = cookTime;
    updateData.updatedAt = new Date();

    const meal = await db.meal.update({ where: { id }, data: updateData });
    return NextResponse.json({ meal });
  } catch (error) {
    console.error('Error updating meal:', error);
    return NextResponse.json({ error: 'Failed to update meal' }, { status: 500 });
  }
}

// DELETE /api/meals - Delete a meal
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'id and userId required' }, { status: 400 });
    }

    const meal = await db.meal.findFirst({
      where: { id, userId },
    });

    if (!meal) {
      return NextResponse.json({ error: 'Meal not found' }, { status: 404 });
    }

    await db.meal.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal:', error);
    return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 });
  }
}
