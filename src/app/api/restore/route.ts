// API pour restaurer les données depuis database-export.json
// VERSION 2 - Supprime d'abord les données existantes puis restaure
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { confirm, keepUsers } = body;

    if (confirm !== 'RESTORE_DATA') {
      return NextResponse.json(
        { error: 'Confirmation required. Send { confirm: "RESTORE_DATA" }' },
        { status: 400 }
      );
    }

    // Lire le fichier d'export
    const exportPath = join(process.cwd(), 'database-export.json');
    
    if (!existsSync(exportPath)) {
      return NextResponse.json(
        { error: 'database-export.json not found' },
        { status: 404 }
      );
    }

    const exportData = JSON.parse(readFileSync(exportPath, 'utf-8'));

    let stats = {
      deleted: { tasks: 0, goals: 0, events: 0, categories: 0, spiritMessages: 0, spiritConversations: 0, dayExercises: 0, programDays: 0, weeklyPrograms: 0, sportGoals: 0, biometricData: 0, workoutSessions: 0, sportProfiles: 0 },
      restored: { users: 0, categories: 0, tasks: 0, goals: 0, events: 0, spiritConversations: 0, spiritMessages: 0, sportProfiles: 0, weeklyPrograms: 0, programDays: 0, dayExercises: 0 },
    };

    console.log('🔄 Starting data restoration...');

    // ==========================================
    // ÉTAPE 1: Supprimer les données existantes (dans l'ordre des dépendances)
    // ==========================================
    console.log('🗑️ Deleting existing data...');
    
    // Supprimer dans l'ordre inverse des dépendances
    stats.deleted.dayExercises = await db.dayExercise.deleteMany({});
    stats.deleted.workoutSessions = await db.workoutSession.deleteMany({});
    stats.deleted.biometricData = await db.biometricData.deleteMany({});
    stats.deleted.sportGoals = await db.sportGoal.deleteMany({});
    stats.deleted.programDays = await db.programDay.deleteMany({});
    stats.deleted.weeklyPrograms = await db.weeklyProgram.deleteMany({});
    stats.deleted.sportProfiles = await db.sportProfile.deleteMany({});
    stats.deleted.spiritMessages = await db.spiritMessage.deleteMany({});
    stats.deleted.spiritConversations = await db.spiritConversation.deleteMany({});
    stats.deleted.tasks = await db.task.deleteMany({});
    stats.deleted.goals = await db.goal.deleteMany({});
    stats.deleted.events = await db.event.deleteMany({});
    stats.deleted.categories = await db.category.deleteMany({});

    if (!keepUsers) {
      await db.user.deleteMany({});
    }

    console.log('✅ Existing data deleted');

    // ==========================================
    // ÉTAPE 2: Restaurer les données du JSON
    // ==========================================
    console.log('📥 Restoring data from export...');

    // 1. Restaurer les utilisateurs
    for (const user of exportData.users || []) {
      try {
        await db.user.create({
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            bio: user.bio,
            phone: user.phone,
            birthDate: user.birthDate ? new Date(user.birthDate) : null,
            timezone: user.timezone || 'Europe/Paris',
            country: user.country,
            city: user.city,
            weight: user.weight,
            height: user.height,
            gender: user.gender,
            mainGoal: user.mainGoal,
            activityLevel: user.activityLevel,
            dietaryPreferences: user.dietaryPreferences,
            allergies: user.allergies,
            favoriteCuisines: user.favoriteCuisines,
            targetCalories: user.targetCalories,
            proteinTarget: user.proteinTarget,
            carbsTarget: user.carbsTarget,
            fatTarget: user.fatTarget,
            sportLevel: user.sportLevel,
            preferredSports: user.preferredSports,
            sportGoals: user.sportGoals,
            bmr: user.bmr,
            tdee: user.tdee,
            imc: user.imc,
            theme: user.theme,
            language: user.language,
            notifications: user.notifications,
            preferences: user.preferences,
            role: user.role || 'member',
          },
        });
        stats.restored.users++;
      } catch (e) {
        console.log('Error restoring user:', user.id, e);
      }
    }

    // 2. Restaurer les catégories
    for (const cat of exportData.categories || []) {
      try {
        await db.category.create({
          data: {
            id: cat.id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            type: cat.type,
            userId: cat.userId,
          },
        });
        stats.restored.categories++;
      } catch (e) {
        console.log('Error restoring category:', cat.id, e);
      }
    }

    // 3. Restaurer les events (avant tasks car tasks peuvent référencer events)
    for (const event of exportData.events || []) {
      try {
        await db.event.create({
          data: {
            id: event.id,
            title: event.title,
            description: event.description,
            location: event.location,
            startAt: new Date(event.startAt),
            endAt: event.endAt ? new Date(event.endAt) : null,
            isAllDay: event.isAllDay || false,
            isRecurring: event.isRecurring || false,
            recurrence: event.recurrence,
            reminder: event.reminder,
            color: event.color,
            userId: event.userId,
            categoryId: event.categoryId,
          },
        });
        stats.restored.events++;
      } catch (e) {
        console.log('Error restoring event:', event.id, e);
      }
    }

    // 4. Restaurer les tasks
    for (const task of exportData.tasks || []) {
      try {
        await db.task.create({
          data: {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            startDate: task.startDate ? new Date(task.startDate) : null,
            progress: task.progress || 0,
            chapters: task.chapters,
            observations: task.observations,
            createdBy: task.createdBy || 'user',
            addToCalendar: task.addToCalendar || false,
            completedAt: task.completedAt ? new Date(task.completedAt) : null,
            tags: task.tags,
            userId: task.userId,
            categoryId: task.categoryId,
            eventId: task.eventId,
          },
        });
        stats.restored.tasks++;
      } catch (e) {
        console.log('Error restoring task:', task.id, e);
      }
    }

    // 5. Restaurer les goals
    for (const goal of exportData.goals || []) {
      try {
        await db.goal.create({
          data: {
            id: goal.id,
            title: goal.title,
            description: goal.description,
            targetValue: goal.targetValue,
            currentValue: goal.currentValue || 0,
            unit: goal.unit,
            startDate: new Date(goal.startDate),
            endDate: goal.endDate ? new Date(goal.endDate) : null,
            status: goal.status || 'active',
            priority: goal.priority || 'a_planifier',
            milestones: goal.milestones,
            userId: goal.userId,
            categoryId: goal.categoryId,
          },
        });
        stats.restored.goals++;
      } catch (e) {
        console.log('Error restoring goal:', goal.id, e);
      }
    }

    // 6. Restaurer les spiritConversations et messages
    for (const conv of exportData.spiritConversations || []) {
      try {
        await db.spiritConversation.create({
          data: {
            id: conv.id,
            userId: conv.userId,
            archetype: conv.archetype,
            title: conv.title,
          },
        });
        stats.restored.spiritConversations++;

        // Restaurer les messages
        for (const msg of conv.messages || []) {
          try {
            await db.spiritMessage.create({
              data: {
                id: msg.id,
                conversationId: msg.conversationId,
                role: msg.role,
                content: msg.content,
              },
            });
            stats.restored.spiritMessages++;
          } catch (e) {
            console.log('Error restoring spirit message:', msg.id, e);
          }
        }
      } catch (e) {
        console.log('Error restoring spirit conversation:', conv.id, e);
      }
    }

    // 7. Restaurer les sportProfiles
    for (const profile of exportData.sportProfiles || []) {
      try {
        await db.sportProfile.create({
          data: {
            id: profile.id,
            userId: profile.userId,
            level: profile.level || 'intermediate',
            goals: profile.goals,
            preferredSports: profile.preferredSports,
          },
        });
        stats.restored.sportProfiles++;
      } catch (e) {
        console.log('Error restoring sport profile:', profile.id, e);
      }
    }

    // 8. Restaurer les weeklyPrograms
    for (const program of exportData.weeklyPrograms || []) {
      try {
        await db.weeklyProgram.create({
          data: {
            id: program.id,
            profileId: program.profileId,
            name: program.name,
            weekNumber: program.weekNumber,
            year: program.year,
            isActive: program.isActive ?? true,
          },
        });
        stats.restored.weeklyPrograms++;
      } catch (e) {
        console.log('Error restoring weekly program:', program.id, e);
      }
    }

    // 9. Restaurer les programDays
    for (const day of exportData.programDays || []) {
      try {
        await db.programDay.create({
          data: {
            id: day.id,
            programId: day.programId,
            dayOfWeek: day.dayOfWeek,
            name: day.name,
            type: day.type || 'workout',
            description: day.description,
            intensity: day.intensity,
            estimatedDuration: day.estimatedDuration,
          },
        });
        stats.restored.programDays++;
      } catch (e) {
        console.log('Error restoring program day:', day.id, e);
      }
    }

    // 10. Restaurer les dayExercises
    for (const exercise of exportData.dayExercises || []) {
      try {
        await db.dayExercise.create({
          data: {
            id: exercise.id,
            dayId: exercise.dayId,
            name: exercise.name,
            category: exercise.category,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            weightUnit: exercise.weightUnit || 'kg',
            notes: exercise.notes,
            order: exercise.order || 0,
          },
        });
        stats.restored.dayExercises++;
      } catch (e) {
        console.log('Error restoring day exercise:', exercise.id, e);
      }
    }

    console.log('✅ Data restoration complete!');

    return NextResponse.json({
      success: true,
      message: 'Data restored successfully!',
      stats,
      exportDate: exportData.exportDate,
    });
  } catch (error) {
    console.error('Error restoring data:', error);
    return NextResponse.json(
      { error: 'Failed to restore data', details: String(error) },
      { status: 500 }
    );
  }
}

// GET pour voir les stats du fichier d'export
export async function GET() {
  try {
    const exportPath = join(process.cwd(), 'database-export.json');
    
    if (!existsSync(exportPath)) {
      return NextResponse.json(
        { error: 'database-export.json not found' },
        { status: 404 }
      );
    }

    const exportData = JSON.parse(readFileSync(exportPath, 'utf-8'));

    const stats = {
      exportDate: exportData.exportDate,
      users: exportData.users?.length || 0,
      categories: exportData.categories?.length || 0,
      tasks: exportData.tasks?.length || 0,
      goals: exportData.goals?.length || 0,
      events: exportData.events?.length || 0,
      spiritConversations: exportData.spiritConversations?.length || 0,
      sportProfiles: exportData.sportProfiles?.length || 0,
      weeklyPrograms: exportData.weeklyPrograms?.length || 0,
      programDays: exportData.programDays?.length || 0,
      dayExercises: exportData.dayExercises?.length || 0,
    };

    const usersList = exportData.users?.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
    })) || [];

    return NextResponse.json({
      stats,
      users: usersList,
    });
  } catch (error) {
    console.error('Error reading export file:', error);
    return NextResponse.json(
      { error: 'Failed to read export file' },
      { status: 500 }
    );
  }
}
