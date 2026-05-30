import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Récupère le userId depuis les params ou utilise 'user-admin' par défaut
function getUserId(searchParams: URLSearchParams, body?: Record<string, unknown>): string {
  return (body?.userId as string) || searchParams.get('userId') || 'mindlife-user';
}

// Parser les milestones
function parseMilestones(milestones: unknown): string | undefined {
  if (!milestones) return undefined;
  if (typeof milestones === 'string') return milestones;
  return JSON.stringify(milestones);
}

// Définition des catégories d'objectifs - Aligné avec le seed
const DEFAULT_GOAL_CATEGORIES = [
  { id: 'cat-personal', name: 'Développement Personnel', icon: '🧠', color: 'purple', type: 'goal' },
  { id: 'cat-professional', name: 'Vie Professionnelle', icon: '💼', color: 'slate', type: 'goal' },
  { id: 'cat-education', name: 'Éducation', icon: '📚', color: 'blue', type: 'goal' },
  { id: 'cat-sport', name: 'Sport', icon: '🏃', color: 'emerald', type: 'goal' },
  { id: 'cat-spirituality', name: 'Esprit & Spiritualité', icon: '🧘', color: 'orange', type: 'goal' },
  { id: 'cat-health', name: 'Santé', icon: '❤️', color: 'rose', type: 'goal' },
  { id: 'cat-finance', name: 'Finance', icon: '💰', color: 'amber', type: 'goal' },
  { id: 'cat-social', name: 'Social', icon: '👥', color: 'cyan', type: 'goal' },
];

// S'assurer que les catégories existent pour l'utilisateur
// Vérifie par NOM (pas par ID) pour éviter les conflits avec le seed
async function ensureCategoriesExist(userId: string): Promise<void> {
  for (const cat of DEFAULT_GOAL_CATEGORIES) {
    // Chercher par nom ET userId (contrainte unique)
    const existing = await db.category.findFirst({
      where: { 
        name: cat.name,
        userId 
      }
    });
    
    if (!existing) {
      // Créer seulement si aucune catégorie avec ce nom n'existe pour ce user
      try {
        await db.category.create({
          data: {
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            type: cat.type,
            userId,
          }
        });
      } catch (e) {
        // Si erreur de contrainte, ignore (une autre requête a peut-être créé la catégorie)
        console.log(`Category ${cat.name} already exists, skipping...`);
      }
    }
  }
}

// GET - List goals with progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const categoryId = searchParams.get('categoryId');
    const userId = getUserId(searchParams);

    // S'assurer que les catégories existent
    await ensureCategoriesExist(userId);

    const where: Record<string, unknown> = {
      userId,
    };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const goals = await db.goal.findMany({
      where,
      orderBy: [
        { priority: 'asc' },
        { status: 'asc' },
        { endDate: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        Category: true,
      },
    });

    // Calculate progress percentage and parse milestones
    const goalsWithProgress = goals.map((goal) => {
      const progress = goal.targetValue && goal.targetValue > 0
        ? Math.min(100, (goal.currentValue / goal.targetValue) * 100)
        : 0;

      // Parse milestones from JSON string
      let milestones = [];
      if (goal.milestones) {
        try {
          milestones = JSON.parse(goal.milestones);
        } catch {
          milestones = [];
        }
      }

      // Calculate milestones progress
      const completedMilestones = milestones.filter((m: { completed?: boolean }) => m.completed).length;
      const milestonesProgress = milestones.length > 0 
        ? Math.round((completedMilestones / milestones.length) * 100) 
        : 0;

      return {
        ...goal,
        progress: Math.round(progress * 10) / 10,
        milestones,
        completedMilestones,
        totalMilestones: milestones.length,
        milestonesProgress,
      };
    });

    return NextResponse.json({ goals: goalsWithProgress });
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
}

// POST - Create goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, description, targetValue, currentValue, unit, 
      startDate, endDate, categoryId, priority, milestones,
      userId: bodyUserId
    } = body;
    const userId = bodyUserId || 'mindlife-user';

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // S'assurer que les catégories existent
    await ensureCategoriesExist(userId);

    // Trouver la bonne catégorie
    // 1. D'abord par ID
    // 2. Si pas trouvée, par nom (mapping depuis les IDs par défaut)
    let finalCategoryId = null;
    if (categoryId) {
      const existingById = await db.category.findUnique({
        where: { id: categoryId }
      });
      
      if (existingById && existingById.userId === userId) {
        finalCategoryId = categoryId;
      } else {
        // Chercher par nom correspondant à l'ID demandé
        const defaultCat = DEFAULT_GOAL_CATEGORIES.find(c => c.id === categoryId);
        if (defaultCat) {
          const existingByName = await db.category.findFirst({
            where: { name: defaultCat.name, userId }
          });
          if (existingByName) {
            finalCategoryId = existingByName.id;
          }
        }
      }
    }

    const goal = await db.goal.create({
      data: {
        id: body.id || `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        description,
        targetValue: targetValue ? parseFloat(targetValue) : undefined,
        currentValue: currentValue ? parseFloat(currentValue) : 0,
        unit,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
        categoryId: finalCategoryId,
        priority: priority || 'a_planifier',
        milestones: parseMilestones(milestones),
        userId,
      },
      include: {
        Category: true,
      },
    });

    // Calculate progress
    const progress = goal.targetValue && goal.targetValue > 0
      ? Math.min(100, (goal.currentValue / goal.targetValue) * 100)
      : 0;

    // Parse milestones for response
    let parsedMilestones = [];
    if (goal.milestones) {
      try {
        parsedMilestones = JSON.parse(goal.milestones);
      } catch {
        parsedMilestones = [];
      }
    }

    return NextResponse.json({ 
      goal: { 
        ...goal, 
        progress: Math.round(progress * 10) / 10,
        milestones: parsedMilestones,
        completedMilestones: parsedMilestones.filter((m: { completed?: boolean }) => m.completed).length,
        totalMilestones: parsedMilestones.length,
      } 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update goal (including progress)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, title, description, targetValue, currentValue, unit, 
      startDate, endDate, status, categoryId, priority, milestones,
      userId: bodyUserId
    } = body;
    const userId = bodyUserId || 'mindlife-user';

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    // S'assurer que les catégories existent
    await ensureCategoriesExist(userId);

    const updateData: Record<string, unknown> = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (targetValue !== undefined) updateData.targetValue = parseFloat(targetValue);
    if (currentValue !== undefined) updateData.currentValue = parseFloat(currentValue);
    if (unit !== undefined) updateData.unit = unit;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (milestones !== undefined) updateData.milestones = parseMilestones(milestones);

    const goal = await db.goal.update({
      where: { id, userId },
      data: updateData,
      include: {
        Category: true,
      },
    });

    // Calculate progress
    const progress = goal.targetValue && goal.targetValue > 0
      ? Math.min(100, (goal.currentValue / goal.targetValue) * 100)
      : 0;

    // Parse milestones for response
    let parsedMilestones = [];
    if (goal.milestones) {
      try {
        parsedMilestones = JSON.parse(goal.milestones);
      } catch {
        parsedMilestones = [];
      }
    }

    return NextResponse.json({ 
      goal: { 
        ...goal, 
        progress: Math.round(progress * 10) / 10,
        milestones: parsedMilestones,
        completedMilestones: parsedMilestones.filter((m: { completed?: boolean }) => m.completed).length,
        totalMilestones: parsedMilestones.length,
      } 
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Failed to update goal' },
      { status: 500 }
    );
  }
}

// DELETE - Delete goal
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = getUserId(searchParams);

    if (!id) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    await db.goal.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    );
  }
}
