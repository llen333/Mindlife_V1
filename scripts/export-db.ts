import { db } from '../src/lib/db';
import * as fs from 'fs';

async function exportDatabase() {
  console.log('📦 Export de la base de données...\n');
  
  try {
    // Export Users
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        bio: true,
        phone: true,
        birthDate: true,
        timezone: true,
        country: true,
        city: true,
        weight: true,
        height: true,
        gender: true,
        mainGoal: true,
        activityLevel: true,
        dietaryPreferences: true,
        allergies: true,
        favoriteCuisines: true,
        targetCalories: true,
        proteinTarget: true,
        carbsTarget: true,
        fatTarget: true,
        sportLevel: true,
        preferredSports: true,
        sportGoals: true,
        bmr: true,
        tdee: true,
        imc: true,
        theme: true,
        language: true,
        role: true,
        createdAt: true,
      }
    });
    console.log(`✅ Users: ${users.length}`);
    
    // Export Categories
    const categories = await db.category.findMany();
    console.log(`✅ Categories: ${categories.length}`);
    
    // Export Tasks
    const tasks = await db.task.findMany();
    console.log(`✅ Tasks: ${tasks.length}`);
    
    // Export Goals
    const goals = await db.goal.findMany();
    console.log(`✅ Goals: ${goals.length}`);
    
    // Export Notes
    const notes = await db.note.findMany();
    console.log(`✅ Notes: ${notes.length}`);
    
    // Export Events
    const events = await db.event.findMany();
    console.log(`✅ Events: ${events.length}`);
    
    // Export Habits
    const habits = await db.habit.findMany();
    console.log(`✅ Habits: ${habits.length}`);
    
    // Export HabitLogs
    const habitLogs = await db.habitLog.findMany();
    console.log(`✅ HabitLogs: ${habitLogs.length}`);
    
    // Export JournalEntries
    const journalEntries = await db.journalEntry.findMany();
    console.log(`✅ JournalEntries: ${journalEntries.length}`);
    
    // Export VoiceMemos
    const voiceMemos = await db.voiceMemo.findMany();
    console.log(`✅ VoiceMemos: ${voiceMemos.length}`);
    
    // Export SpiritConversations
    const spiritConversations = await db.spiritConversation.findMany();
    console.log(`✅ SpiritConversations: ${spiritConversations.length}`);
    
    // Export SpiritMessages
    const spiritMessages = await db.spiritMessage.findMany();
    console.log(`✅ SpiritMessages: ${spiritMessages.length}`);
    
    // Export SportProfile
    const sportProfiles = await db.sportProfile.findMany();
    console.log(`✅ SportProfiles: ${sportProfiles.length}`);
    
    // Export BiometricData
    const biometrics = await db.biometricData.findMany();
    console.log(`✅ BiometricData: ${biometrics.length}`);
    
    // Export SportGoals
    const sportGoals = await db.sportGoal.findMany();
    console.log(`✅ SportGoals: ${sportGoals.length}`);
    
    // Export WeeklyPrograms
    const weeklyPrograms = await db.weeklyProgram.findMany();
    console.log(`✅ WeeklyPrograms: ${weeklyPrograms.length}`);
    
    // Export ProgramDays
    const programDays = await db.programDay.findMany();
    console.log(`✅ ProgramDays: ${programDays.length}`);
    
    // Export DayExercises
    const dayExercises = await db.dayExercise.findMany();
    console.log(`✅ DayExercises: ${dayExercises.length}`);
    
    // Export WorkoutSessions
    const workoutSessions = await db.workoutSession.findMany();
    console.log(`✅ WorkoutSessions: ${workoutSessions.length}`);
    
    // Export SessionExercises
    const sessionExercises = await db.sessionExercise.findMany();
    console.log(`✅ SessionExercises: ${sessionExercises.length}`);
    
    // Export Meals
    const meals = await db.meal.findMany();
    console.log(`✅ Meals: ${meals.length}`);
    
    // Export NutritionProfiles
    const nutritionProfiles = await db.nutritionProfile.findMany();
    console.log(`✅ NutritionProfiles: ${nutritionProfiles.length}`);
    
    // Export WeightEntries
    const weightEntries = await db.weightEntry.findMany();
    console.log(`✅ WeightEntries: ${weightEntries.length}`);
    
    // Export MealPlans
    const mealPlans = await db.mealPlan.findMany();
    console.log(`✅ MealPlans: ${mealPlans.length}`);
    
    // Assembler les données
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: {
        users,
        categories,
        tasks,
        goals,
        notes,
        events,
        habits,
        habitLogs,
        journalEntries,
        voiceMemos,
        spiritConversations,
        spiritMessages,
        sportProfiles,
        biometrics,
        sportGoals,
        weeklyPrograms,
        programDays,
        dayExercises,
        workoutSessions,
        sessionExercises,
        meals,
        nutritionProfiles,
        weightEntries,
        mealPlans,
      }
    };
    
    // Sauvegarder en JSON
    const outputPath = 'pack-survie/db-export.json';
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
    console.log(`\n💾 Export sauvegardé: ${outputPath}`);
    console.log(`📊 Taille: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    
    // Afficher résumé
    console.log('\n═══════════════════════════════════════');
    console.log('📋 RÉSUMÉ DES DONNÉES À RESTAURER:');
    console.log('═══════════════════════════════════════');
    console.log(`👥 Users:          ${users.length}`);
    console.log(`📁 Categories:     ${categories.length}`);
    console.log(`✅ Tasks:          ${tasks.length}`);
    console.log(`🎯 Goals:          ${goals.length}`);
    console.log(`📝 Notes:          ${notes.length}`);
    console.log(`📅 Events:         ${events.length}`);
    console.log(`🔄 Habits:         ${habits.length}`);
    console.log(`📊 HabitLogs:      ${habitLogs.length}`);
    console.log(`📔 Journal:        ${journalEntries.length}`);
    console.log(`🏋️ SportProfiles:  ${sportProfiles.length}`);
    console.log(`📈 Biometrics:     ${biometrics.length}`);
    console.log(`🍽️ Meals:          ${meals.length}`);
    console.log('═══════════════════════════════════════');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

exportDatabase();
