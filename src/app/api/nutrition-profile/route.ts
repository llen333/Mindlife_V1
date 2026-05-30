import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Retrieve nutrition profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-admin';
    
    // Try to get existing profile from database
    const profile = await db.nutritionProfile.findUnique({
      where: { userId }
    });

    if (profile) {
      return NextResponse.json({ profile });
    }

    // Return default profile if none exists
    return NextResponse.json({ 
      profile: {
        weight: 75,
        height: 175,
        age: 30,
        gender: 'male',
        activityLevel: 'moderate',
        goal: 'maintain',
        dietaryPreferences: [],
        allergies: [],
        favoriteCuisines: [],
      }
    });
  } catch (error) {
    console.error('Error fetching nutrition profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nutrition profile' },
      { status: 500 }
    );
  }
}

// PUT - Update nutrition profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || 'user-admin';
    
    const {
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
      dietaryPreferences,
      allergies,
      favoriteCuisines,
      bmr,
      tdee,
      imc,
      targetCalories,
      protein,
      carbs,
      fat,
    } = body;

    // Try to update or create profile
    const profile = await db.nutritionProfile.upsert({
      where: { userId },
      update: {
        weight,
        height,
        age,
        gender,
        activityLevel,
        goal,
        dietaryPreferences: JSON.stringify(dietaryPreferences),
        allergies: JSON.stringify(allergies),
        favoriteCuisines: JSON.stringify(favoriteCuisines),
        bmr,
        tdee,
        imc,
        targetCalories,
        protein,
        carbs,
        fat,
        updatedAt: new Date(),
      },
      create: {
        id: `nutrition-profile-${Date.now()}`,
        userId,
        weight,
        height,
        age,
        gender,
        activityLevel,
        goal,
        dietaryPreferences: JSON.stringify(dietaryPreferences),
        allergies: JSON.stringify(allergies),
        favoriteCuisines: JSON.stringify(favoriteCuisines),
        bmr,
        tdee,
        imc,
        targetCalories,
        protein,
        carbs,
        fat,
      }
    });

    return NextResponse.json({ 
      success: true, 
      profile,
      message: 'Profil nutritionnel sauvegardé avec succès'
    });
  } catch (error) {
    console.error('Error saving nutrition profile:', error);
    return NextResponse.json(
      { error: 'Failed to save nutrition profile' },
      { status: 500 }
    );
  }
}

// POST - Create new nutrition profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || 'user-admin';
    
    const {
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
      dietaryPreferences,
      allergies,
      favoriteCuisines,
    } = body;

    const profile = await db.nutritionProfile.create({
      data: {
        id: `nutrition-profile-${Date.now()}`,
        userId,
        weight,
        height,
        age,
        gender,
        activityLevel,
        goal,
        dietaryPreferences: JSON.stringify(dietaryPreferences || []),
        allergies: JSON.stringify(allergies || []),
        favoriteCuisines: JSON.stringify(favoriteCuisines || []),
        bmr: 0,
        tdee: 0,
        imc: 0,
        targetCalories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      }
    });

    return NextResponse.json({ 
      success: true, 
      profile,
      message: 'Profil nutritionnel créé avec succès'
    });
  } catch (error) {
    console.error('Error creating nutrition profile:', error);
    return NextResponse.json(
      { error: 'Failed to create nutrition profile' },
      { status: 500 }
    );
  }
}
