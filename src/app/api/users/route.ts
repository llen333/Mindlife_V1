// Users API - With role-based permissions (admin/member)
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get all users or specific user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const listAll = searchParams.get('all') === 'true';

    // List all users - WITH PERMISSION CHECK
    if (listAll) {
      // Utiliser une requête brute pour contourner le cache Prisma
      const rawUsers = await db.$queryRaw`
        SELECT id, name, email, avatar, role, createdAt FROM User ORDER BY createdAt ASC
      `;
      const users = rawUsers as any[];

      // Si un userId est fourni, vérifier le rôle
      if (userId) {
        const currentUser = users.find(u => u.id === userId);

        // Si member, retourner seulement lui-même
        if (currentUser?.role !== 'admin') {
          return NextResponse.json({ users: currentUser ? [currentUser] : [] });
        }
      }

      return NextResponse.json({ users });
    }

    // Get specific user with full profile
    const targetUserId = userId || 'user-admin';

    // Utiliser une requête brute pour contourner le cache Prisma
    const rawUser = await db.$queryRaw`
      SELECT * FROM User WHERE id = ${targetUserId}
    `;

    let user = rawUser && (rawUser as any[]).length > 0 ? (rawUser as any[])[0] : null;

    // Récupérer les catégories séparément
    if (user) {
      const categories = await db.category.findMany({
        where: { userId: targetUserId },
      });
      (user as any).categories = categories;

      // Compter les relations
      const [tasks, goals, notes, habits, events] = await Promise.all([
        db.task.count({ where: { userId: targetUserId } }),
        db.goal.count({ where: { userId: targetUserId } }),
        db.note.count({ where: { userId: targetUserId } }),
        db.habit.count({ where: { userId: targetUserId } }),
        db.event.count({ where: { userId: targetUserId } }),
      ]);
      (user as any)._count = { tasks, goals, notes, habits, events };
    }

    // Create default user if not exists
    if (!user) {
      // Vérifier s'il existe déjà des users
      const existingUsersCount = await db.user.count();
      const isFirstUser = existingUsersCount === 0;

      user = await db.user.create({
        data: {
          id: targetUserId,
          email: `${targetUserId}@mindlife.app`,
          name: 'Nouvel Utilisateur',
          timezone: 'Europe/Paris',
          role: isFirstUser ? 'admin' : 'member', // Premier user = admin
        },
      });

      // Récupérer les catégories et counts séparément (comme pour les autres requêtes)
      const categories = await db.category.findMany({
        where: { userId: targetUserId },
      });
      (user as any).categories = categories;
      (user as any)._count = { tasks: 0, goals: 0, notes: 0, habits: 0, events: 0 };
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// POST - Create/update user profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      // Identité
      name, 
      email, 
      avatar, 
      bio, 
      phone,
      birthDate,
      // Localisation
      timezone, 
      country,
      city,
      // Physique
      weight,
      height,
      gender,
      // Objectifs
      mainGoal,
      activityLevel,
      // Nutrition
      dietaryPreferences,
      allergies,
      favoriteCuisines,
      targetCalories,
      proteinTarget,
      carbsTarget,
      fatTarget,
      // Sport
      sportLevel,
      preferredSports,
      sportGoals,
      // App
      theme,
      language,
      notifications,
      preferences,
      // Role (seulement pour création)
      role: requestedRole,
    } = body;

    const targetUserId = userId || 'user-admin';

    // Vérifier si c'est un nouveau user ou une mise à jour (requête brute pour le rôle)
    const existingUserRaw = await db.$queryRaw`
      SELECT id, role FROM User WHERE id = ${targetUserId}
    `;
    const existingUser = (existingUserRaw as any[])?.[0] || null;

    // Déterminer le rôle
    let userRole = 'member';
    if (existingUser) {
      // Garder le rôle existant
      userRole = existingUser.role || 'member';
    } else {
      // Nouveau user : vérifier s'il existe déjà des users
      const existingUsersCount = await db.user.count();
      const isFirstUser = existingUsersCount === 0;
      userRole = isFirstUser ? 'admin' : 'member';
    }

    // Calculs automatiques
    let bmr = null;
    let tdee = null;
    let imc = null;

    if (weight && height && gender) {
      // IMC
      imc = weight / ((height / 100) ** 2);

      // BMR (Mifflin-St Jeor)
      const age = birthDate ? Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 30;
      if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }

      // TDEE
      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };
      const multiplier = activityMultipliers[activityLevel || 'moderate'] || 1.55;
      tdee = bmr * multiplier;
    }

    const user = await db.user.upsert({
      where: { id: targetUserId },
      update: {
        // Identité
        name: name ?? undefined,
        email: email ?? undefined,
        avatar: avatar ?? undefined,
        bio: bio ?? undefined,
        phone: phone ?? undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        // Localisation
        timezone: timezone ?? undefined,
        country: country ?? undefined,
        city: city ?? undefined,
        // Physique
        weight: weight !== undefined ? weight : undefined,
        height: height !== undefined ? height : undefined,
        gender: gender ?? undefined,
        // Objectifs
        mainGoal: mainGoal ?? undefined,
        activityLevel: activityLevel ?? undefined,
        // Nutrition
        dietaryPreferences: dietaryPreferences ?? undefined,
        allergies: allergies ?? undefined,
        favoriteCuisines: favoriteCuisines ?? undefined,
        targetCalories: targetCalories !== undefined ? targetCalories : undefined,
        proteinTarget: proteinTarget !== undefined ? proteinTarget : undefined,
        carbsTarget: carbsTarget !== undefined ? carbsTarget : undefined,
        fatTarget: fatTarget !== undefined ? fatTarget : undefined,
        // Sport
        sportLevel: sportLevel ?? undefined,
        preferredSports: preferredSports ?? undefined,
        sportGoals: sportGoals ?? undefined,
        // Calculs auto
        bmr: bmr ?? undefined,
        tdee: tdee ?? undefined,
        imc: imc ?? undefined,
        // App
        theme: theme ?? undefined,
        language: language ?? undefined,
        notifications: notifications ?? undefined,
        preferences: preferences ?? undefined,
        updatedAt: new Date(),
      },
      create: {
        id: targetUserId,
        email: email || `${targetUserId}@mindlife.app`,
        name: name || 'Nouvel Utilisateur',
        avatar: avatar || undefined,
        bio: bio || undefined,
        phone: phone || undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        timezone: timezone || 'Europe/Paris',
        country: country || undefined,
        city: city || undefined,
        weight: weight || undefined,
        height: height || undefined,
        gender: gender || undefined,
        mainGoal: mainGoal || undefined,
        activityLevel: activityLevel || undefined,
        dietaryPreferences: dietaryPreferences || undefined,
        allergies: allergies || undefined,
        favoriteCuisines: favoriteCuisines || undefined,
        targetCalories: targetCalories || undefined,
        proteinTarget: proteinTarget || undefined,
        carbsTarget: carbsTarget || undefined,
        fatTarget: fatTarget || undefined,
        sportLevel: sportLevel || undefined,
        preferredSports: preferredSports || undefined,
        sportGoals: sportGoals || undefined,
        bmr: bmr || undefined,
        tdee: tdee || undefined,
        imc: imc || undefined,
        theme: theme || undefined,
        language: language || undefined,
        notifications: notifications || undefined,
        preferences: preferences || undefined,
        role: userRole,
      },
    });

    // Create default categories for new users
    if (!existingUser) {
      const defaultCategories = [
        { id: `${targetUserId}-cat-professional`, name: 'Professionnel', icon: 'Briefcase', color: 'slate', type: 'task' },
        { id: `${targetUserId}-cat-personal`, name: 'Personnel', icon: 'Brain', color: 'purple', type: 'task' },
        { id: `${targetUserId}-cat-sport`, name: 'Sport', icon: 'Dumbbell', color: 'emerald', type: 'task' },
        { id: `${targetUserId}-cat-education`, name: 'Éducation', icon: 'BookOpen', color: 'blue', type: 'task' },
        { id: `${targetUserId}-cat-spirituality`, name: 'Spiritualité', icon: 'Sparkles', color: 'orange', type: 'task' },
      ];

      for (const cat of defaultCategories) {
        try {
          await db.category.create({
            data: {
              id: cat.id,
              name: cat.name,
              icon: cat.icon,
              color: cat.color,
              type: cat.type,
              userId: targetUserId,
            },
          });
        } catch (e) {
          console.log('Category already exists:', cat.id);
        }
      }
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user (admin cannot delete their own account)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const requestingUserId = searchParams.get('requestingUserId'); // Qui fait la demande

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur à supprimer (requête brute pour le rôle)
    const userToDeleteRaw = await db.$queryRaw`
      SELECT id, role FROM User WHERE id = ${userId}
    `;
    const userToDelete = (userToDeleteRaw as any[])?.[0] || null;

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Un admin ne peut pas supprimer son propre compte
    if (userToDelete.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete an admin account. Transfer ownership first.' },
        { status: 403 }
      );
    }

    // Vérifier les permissions
    if (requestingUserId) {
      const requestingUserRaw = await db.$queryRaw`
        SELECT id, role FROM User WHERE id = ${requestingUserId}
      `;
      const requestingUser = (requestingUserRaw as any[])?.[0] || null;

      // Seul un admin peut supprimer un autre user
      // Un member peut supprimer son propre compte
      const isSelfDeletion = userId === requestingUserId;
      const isAdmin = requestingUser?.role === 'admin';

      if (!isSelfDeletion && !isAdmin) {
        return NextResponse.json(
          { error: 'Permission denied. Only admins can delete other users.' },
          { status: 403 }
        );
      }
    }

    // Supprimer l'utilisateur
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
