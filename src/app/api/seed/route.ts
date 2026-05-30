// API Seed - Peuple la BDD avec des données de démo complètes
// 4 users (1 admin + 3 members), 5+ items par section pour chaque user
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Données de seed
const USERS = [
  { id: 'user-admin', name: 'Admin Mindlife', email: 'admin@mindlife.app', role: 'admin' },
  { id: 'user-alice', name: 'Alice Martin', email: 'alice@mindlife.app', role: 'member' },
  { id: 'user-bob', name: 'Bob Durand', email: 'bob@mindlife.app', role: 'member' },
  { id: 'user-claire', name: 'Claire Petit', email: 'claire@mindlife.app', role: 'member' },
];

const CATEGORIES_TASK = [
  { name: 'Professionnel', icon: 'Briefcase', color: 'slate' },
  { name: 'Personnel', icon: 'Heart', color: 'rose' },
  { name: 'Sport', icon: 'Dumbbell', color: 'emerald' },
  { name: 'Éducation', icon: 'BookOpen', color: 'blue' },
  { name: 'Santé', icon: 'Activity', color: 'red' },
];

const CATEGORIES_GOAL = [
  { name: 'Carrière', icon: 'Target', color: 'violet' },
  { name: 'Fitness', icon: 'Trophy', color: 'amber' },
  { name: 'Finances', icon: 'Wallet', color: 'green' },
  { name: 'Relations', icon: 'Users', color: 'pink' },
  { name: 'Développement', icon: 'TrendingUp', color: 'cyan' },
];

const TASK_TITLES = [
  'Finaliser le rapport trimestriel',
  'Appeler le client important',
  'Préparer la présentation',
  'Réviser le budget mensuel',
  'Planifier la réunion d\'équipe',
];

const GOAL_TITLES = [
  'Atteindre 10km de course',
  'Lire 12 livres cette année',
  'Épargner 5000€',
  'Apprendre l\'espagnol',
  'Développer une nouvelle compétence',
];

const EVENT_TITLES = [
  'Réunion projet Alpha',
  'Rendez-vous médecin',
  'Formation continue',
  'Sport avec colleagues',
  'Dîner anniversaire',
];

const HABIT_NAMES = [
  'Méditation matinale',
  'Lecture 30min',
  'Exercice quotidien',
  'Journaling',
  'Hydratation 2L',
];

const NOTE_TITLES = [
  'Idées projet innovant',
  'Liste courses semaine',
  'Notes réunion important',
  'Brainstorm marketing',
  'Plan vacances été',
];

const JOURNAL_PROMPTS = [
  'Gratitude du jour: les petites joies',
  'Réflexion sur mes objectifs',
  'Analyse de la semaine',
  'Leçons apprises ce mois',
  'Vision pour l\'année',
];

const SPIRIT_ARCHETYPES = ['stoicien', 'philosophe', 'guide', 'sage', 'mentor'];

const SPORTS = ['Musculation', 'Running', 'Yoga', 'Natation', 'Cyclisme'];

function generateId(prefix: string, index: number, userId: string) {
  return `${prefix}-${userId}-${index}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { confirm } = body;

    if (confirm !== 'SEED_DATABASE') {
      return NextResponse.json(
        { error: 'Confirmation required. Send { confirm: "SEED_DATABASE" }' },
        { status: 400 }
      );
    }

    console.log('🌱 Starting database seed...');
    const stats: Record<string, number> = {};
    const exportData: any = {
      exportDate: new Date().toISOString(),
      users: [],
      categories: [],
      tasks: [],
      goals: [],
      events: [],
      habits: [],
      habitLogs: [],
      notes: [],
      journalEntries: [],
      spiritConversations: [],
      sportProfiles: [],
      weeklyPrograms: [],
      programDays: [],
      dayExercises: [],
      meals: [],
      weightEntries: [],
    };

    // ==========================================
    // 1. NETTOYER ET CRÉER LES USERS
    // ==========================================
    console.log('👥 Creating users...');
    
    // Supprimer toutes les données existantes
    await db.dayExercise.deleteMany({});
    await db.programDay.deleteMany({});
    await db.weeklyProgram.deleteMany({});
    await db.workoutSession.deleteMany({});
    await db.biometricData.deleteMany({});
    await db.sportGoal.deleteMany({});
    await db.sportProfile.deleteMany({});
    await db.spiritMessage.deleteMany({});
    await db.spiritConversation.deleteMany({});
    await db.habitLog.deleteMany({});
    await db.habit.deleteMany({});
    await db.note.deleteMany({});
    await db.journalEntry.deleteMany({});
    await db.task.deleteMany({});
    await db.goal.deleteMany({});
    await db.event.deleteMany({});
    await db.category.deleteMany({});
    await db.meal.deleteMany({});
    await db.weightEntry.deleteMany({});
    await db.user.deleteMany({});

    // Créer les 4 users
    for (const u of USERS) {
      const user = await db.user.create({
        data: {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          timezone: 'Europe/Paris',
          weight: 70 + Math.floor(Math.random() * 20),
          height: 170 + Math.floor(Math.random() * 15),
          activityLevel: 'moderate',
          sportLevel: 'intermediate',
          updatedAt: new Date(),
        },
      });
      exportData.users.push(user);
      stats.users = (stats.users || 0) + 1;
    }
    console.log(`✅ ${stats.users} users created`);

    // ==========================================
    // 2. CRÉER LES CATÉGORIES POUR CHAQUE USER
    // ==========================================
    console.log('📁 Creating categories...');
    
    for (const user of USERS) {
      // Catégories de type task
      for (let i = 0; i < CATEGORIES_TASK.length; i++) {
        const cat = CATEGORIES_TASK[i];
        const category = await db.category.create({
          data: {
            id: generateId('cat-task', i, user.id),
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            type: 'task',
            userId: user.id,
          },
        });
        exportData.categories.push(category);
        stats.categories = (stats.categories || 0) + 1;
      }
      
      // Catégories de type goal
      for (let i = 0; i < CATEGORIES_GOAL.length; i++) {
        const cat = CATEGORIES_GOAL[i];
        const category = await db.category.create({
          data: {
            id: generateId('cat-goal', i, user.id),
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            type: 'goal',
            userId: user.id,
          },
        });
        exportData.categories.push(category);
        stats.categories = (stats.categories || 0) + 1;
      }
    }
    console.log(`✅ ${stats.categories} categories created`);

    // ==========================================
    // 3. CRÉER LES TASKS POUR CHAQUE USER
    // ==========================================
    console.log('✅ Creating tasks...');
    
    for (const user of USERS) {
      for (let i = 0; i < TASK_TITLES.length; i++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + i);
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + 7);
        
        const task = await db.task.create({
          data: {
            id: generateId('task', i, user.id),
            title: TASK_TITLES[i],
            description: `Description détaillée pour ${TASK_TITLES[i]}`,
            status: i === 0 ? 'completed' : i === 1 ? 'in_progress' : 'pending',
            priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
            startDate,
            dueDate,
            progress: i === 0 ? 100 : i === 1 ? 50 : 0,
            userId: user.id,
            categoryId: generateId('cat-task', i % CATEGORIES_TASK.length, user.id),
          },
        });
        exportData.tasks.push(task);
        stats.tasks = (stats.tasks || 0) + 1;
      }
    }
    console.log(`✅ ${stats.tasks} tasks created`);

    // ==========================================
    // 4. CRÉER LES GOALS POUR CHAQUE USER
    // ==========================================
    console.log('🎯 Creating goals...');
    
    for (const user of USERS) {
      for (let i = 0; i < GOAL_TITLES.length; i++) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        
        const goal = await db.goal.create({
          data: {
            id: generateId('goal', i, user.id),
            title: GOAL_TITLES[i],
            description: `Objectif: ${GOAL_TITLES[i]}`,
            targetValue: 100,
            currentValue: i * 20,
            unit: '%',
            startDate,
            endDate,
            status: i === 0 ? 'completed' : 'active',
            priority: i === 0 ? 'important' : i === 1 ? 'moyen' : 'a_planifier',
            milestones: JSON.stringify([
              { title: 'Étape 1', completed: true },
              { title: 'Étape 2', completed: i > 1 },
              { title: 'Étape 3', completed: false },
            ]),
            userId: user.id,
            categoryId: generateId('cat-goal', i % CATEGORIES_GOAL.length, user.id),
          },
        });
        exportData.goals.push(goal);
        stats.goals = (stats.goals || 0) + 1;
      }
    }
    console.log(`✅ ${stats.goals} goals created`);

    // ==========================================
    // 5. CRÉER LES EVENTS POUR CHAQUE USER
    // ==========================================
    console.log('📅 Creating events...');
    
    for (const user of USERS) {
      for (let i = 0; i < EVENT_TITLES.length; i++) {
        const startAt = new Date();
        startAt.setDate(startAt.getDate() + i); // i=0 = today, i=1 = tomorrow, etc.
        startAt.setHours(9 + i, 0, 0, 0);
        const endAt = new Date(startAt);
        endAt.setHours(endAt.getHours() + 2);
        
        const event = await db.event.create({
          data: {
            id: generateId('event', i, user.id),
            title: EVENT_TITLES[i],
            description: `Événement: ${EVENT_TITLES[i]}`,
            location: i % 2 === 0 ? 'Bureau' : 'En ligne',
            startAt,
            endAt,
            isAllDay: i === 4,
            color: ['emerald', 'blue', 'amber', 'rose', 'violet'][i],
            userId: user.id,
            categoryId: generateId('cat-task', i % CATEGORIES_TASK.length, user.id),
          },
        });
        exportData.events.push(event);
        stats.events = (stats.events || 0) + 1;
      }
    }
    console.log(`✅ ${stats.events} events created`);

    // ==========================================
    // 6. CRÉER LES HABITS POUR CHAQUE USER
    // ==========================================
    console.log('🔄 Creating habits...');
    
    for (const user of USERS) {
      for (let i = 0; i < HABIT_NAMES.length; i++) {
        const habit = await db.habit.create({
          data: {
            id: generateId('habit', i, user.id),
            name: HABIT_NAMES[i],
            description: `Habitude quotidienne: ${HABIT_NAMES[i]}`,
            frequency: 'daily',
            color: ['emerald', 'blue', 'amber', 'rose', 'violet'][i],
            icon: ['🧘', '📚', '💪', '✍️', '💧'][i],
            isActive: true,
            userId: user.id,
            categoryId: generateId('cat-task', 0, user.id),
          },
        });
        exportData.habits.push(habit);
        stats.habits = (stats.habits || 0) + 1;
        
        // Créer des habitLogs pour les 7 derniers jours
        for (let d = 0; d < 7; d++) {
          const date = new Date();
          date.setDate(date.getDate() - d);
          const habitLog = await db.habitLog.create({
            data: {
              id: generateId(`habitlog-${i}-${d}`, 0, user.id),
              date,
              completed: Math.random() > 0.3,
              habitId: habit.id,
              userId: user.id,
            },
          });
          exportData.habitLogs.push(habitLog);
          stats.habitLogs = (stats.habitLogs || 0) + 1;
        }
      }
    }
    console.log(`✅ ${stats.habits} habits created with ${stats.habitLogs} logs`);

    // ==========================================
    // 7. CRÉER LES NOTES POUR CHAQUE USER
    // ==========================================
    console.log('📝 Creating notes...');
    
    for (const user of USERS) {
      for (let i = 0; i < NOTE_TITLES.length; i++) {
        const note = await db.note.create({
          data: {
            id: generateId('note', i, user.id),
            title: NOTE_TITLES[i],
            content: `Contenu de la note: ${NOTE_TITLES[i]}\n\nVoici les détails importants à retenir...\n\n- Point 1\n- Point 2\n- Point 3`,
            type: i % 3 === 0 ? 'markdown' : 'text',
            tags: JSON.stringify(['important', 'projet']),
            isPinned: i === 0,
            userId: user.id,
            categoryId: generateId('cat-task', 0, user.id),
          },
        });
        exportData.notes.push(note);
        stats.notes = (stats.notes || 0) + 1;
      }
    }
    console.log(`✅ ${stats.notes} notes created`);

    // ==========================================
    // 8. CRÉER LES JOURNAL ENTRIES POUR CHAQUE USER
    // ==========================================
    console.log('📔 Creating journal entries...');
    
    for (const user of USERS) {
      for (let i = 0; i < JOURNAL_PROMPTS.length; i++) {
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - i);
        
        const entry = await db.journalEntry.create({
          data: {
            id: generateId('journal', i, user.id),
            title: JOURNAL_PROMPTS[i],
            content: `Aujourd'hui, je réfléchis à: ${JOURNAL_PROMPTS[i]}\n\nMes pensées:\n- Point important 1\n- Point important 2\n\nConclusion: Je dois continuer à progresser.`,
            mood: ['great', 'good', 'okay', 'bad', 'terrible'][i],
            gratitude: i === 0 ? 'Je suis reconnaissant pour ma famille et ma santé.' : null,
            wins: i === 1 ? 'J\'ai terminé mon projet important.' : null,
            challenges: i === 2 ? 'Gérer mon temps plus efficacement.' : null,
            userId: user.id,
            createdAt,
          },
        });
        exportData.journalEntries.push(entry);
        stats.journalEntries = (stats.journalEntries || 0) + 1;
      }
    }
    console.log(`✅ ${stats.journalEntries} journal entries created`);

    // ==========================================
    // 9. CRÉER LES SPIRIT CONVERSATIONS POUR CHAQUE USER
    // ==========================================
    console.log('✨ Creating spirit conversations...');
    
    for (const user of USERS) {
      for (let i = 0; i < 3; i++) {
        const archetype = SPIRIT_ARCHETYPES[i % SPIRIT_ARCHETYPES.length];
        const convId = generateId('spirit', i, user.id);
        
        const conversation = await db.spiritConversation.create({
          data: {
            id: convId,
            userId: user.id,
            archetype,
            title: `Conversation ${archetype}`,
          },
        });
        
        // Créer les messages de la conversation
        const messages = [];
        for (let m = 0; m < 3; m++) {
          const msg = await db.spiritMessage.create({
            data: {
              id: generateId(`spiritmsg-${i}-${m}`, 0, user.id),
              conversationId: convId,
              role: m % 2 === 0 ? 'assistant' : 'user',
              content: m % 2 === 0 
                ? `Message ${m + 1} de ${archetype}: Bienvenue dans cette conversation spirituelle. Comment puis-je t'aider?`
                : `Ma question ${m + 1}: Comment puis-je progresser sur mon chemin?`,
            },
          });
          messages.push(msg);
          stats.spiritMessages = (stats.spiritMessages || 0) + 1;
        }
        
        exportData.spiritConversations.push({ ...conversation, messages });
        stats.spiritConversations = (stats.spiritConversations || 0) + 1;
      }
    }
    console.log(`✅ ${stats.spiritConversations} spirit conversations created`);

    // ==========================================
    // 10. CRÉER LES SPORT PROFILES POUR CHAQUE USER
    // ==========================================
    console.log('💪 Creating sport profiles...');
    
    for (const user of USERS) {
      const profile = await db.sportProfile.create({
        data: {
          id: generateId('sportprofile', 0, user.id),
          userId: user.id,
          level: ['beginner', 'intermediate', 'advanced', 'intermediate'][USERS.indexOf(user)],
          goals: JSON.stringify(['force', 'endurance', 'flexibilite']),
          preferredSports: JSON.stringify(SPORTS.slice(0, 3)),
        },
      });
      exportData.sportProfiles.push(profile);
      stats.sportProfiles = (stats.sportProfiles || 0) + 1;

      // Créer un programme hebdomadaire
      const program = await db.weeklyProgram.create({
        data: {
          id: generateId('program', 0, user.id),
          profileId: profile.id,
          name: 'Semaine Type',
          weekNumber: new Date().getWeek(),
          year: new Date().getFullYear(),
          isActive: true,
        },
      });
      exportData.weeklyPrograms.push(program);
      stats.weeklyPrograms = (stats.weeklyPrograms || 0) + 1;

      // Créer les 7 jours du programme
      const dayNames = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Cardio', 'Rest'];
      const dayTypes = ['workout', 'workout', 'workout', 'workout', 'workout', 'cardio', 'rest'];
      
      for (let d = 0; d < 7; d++) {
        const day = await db.programDay.create({
          data: {
            id: generateId(`programday-${d}`, 0, user.id),
            programId: program.id,
            dayOfWeek: d,
            name: dayNames[d],
            type: dayTypes[d],
            intensity: d === 6 ? 0 : 60 + Math.floor(Math.random() * 30),
          },
        });
        exportData.programDays.push(day);
        stats.programDays = (stats.programDays || 0) + 1;

        // Ajouter des exercices pour les jours d'entraînement
        if (d < 6) {
          const exercises = [
            { name: 'Développé Couché', sets: 4, reps: '8-10', category: 'main' },
            { name: 'Curl Biceps', sets: 3, reps: '12', category: 'isolation' },
            { name: 'Extension Triceps', sets: 3, reps: '12', category: 'isolation' },
          ];
          
          for (let e = 0; e < exercises.length; e++) {
            const ex = exercises[e];
            const exercise = await db.dayExercise.create({
              data: {
                id: generateId(`exercise-${d}-${e}`, 0, user.id),
                dayId: day.id,
                name: ex.name,
                category: ex.category,
                sets: ex.sets,
                reps: ex.reps,
                weight: 20 + Math.floor(Math.random() * 40),
                order: e,
              },
            });
            exportData.dayExercises.push(exercise);
            stats.dayExercises = (stats.dayExercises || 0) + 1;
          }
        }
      }
    }
    console.log(`✅ ${stats.sportProfiles} sport profiles with programs created`);

    // ==========================================
    // 11. CRÉER DES MEALS POUR CHAQUE USER
    // ==========================================
    console.log('🍽️ Creating meals...');
    
    const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
    const mealNames = ['Petit-déjeuner équilibré', 'Déjeuner protéiné', 'Collation saine', 'Dîner léger'];
    
    for (const user of USERS) {
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        for (let m = 0; m < mealTypes.length; m++) {
          const meal = await db.meal.create({
            data: {
              id: generateId(`meal-${i}-${m}`, 0, user.id),
              userId: user.id,
              name: `${mealNames[m]} - Jour ${i + 1}`,
              type: mealTypes[m],
              date,
              calories: 300 + Math.floor(Math.random() * 400),
              protein: 20 + Math.floor(Math.random() * 30),
              carbs: 30 + Math.floor(Math.random() * 40),
              fat: 10 + Math.floor(Math.random() * 20),
            },
          });
          exportData.meals.push(meal);
          stats.meals = (stats.meals || 0) + 1;
        }
      }
    }
    console.log(`✅ ${stats.meals} meals created`);

    // ==========================================
    // 12. CRÉER DES WEIGHT ENTRIES POUR CHAQUE USER
    // ==========================================
    console.log('⚖️ Creating weight entries...');
    
    for (const user of USERS) {
      const baseWeight = 70 + Math.floor(Math.random() * 20);
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        
        const entry = await db.weightEntry.create({
          data: {
            id: generateId('weight', i, user.id),
            userId: user.id,
            weight: baseWeight - (i * 0.5) + (Math.random() * 0.5),
            date,
            note: i === 0 ? 'Poids initial' : `Semaine ${i}`,
          },
        });
        exportData.weightEntries.push(entry);
        stats.weightEntries = (stats.weightEntries || 0) + 1;
      }
    }
    console.log(`✅ ${stats.weightEntries} weight entries created`);

    // ==========================================
    // 13. EXPORTER EN JSON
    // ==========================================
    console.log('📄 Exporting to JSON...');
    
    const exportPath = join(process.cwd(), 'database-export.json');
    writeFileSync(exportPath, JSON.stringify(exportData, null, 2), 'utf-8');
    
    console.log('✅ Export complete!');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      stats,
      exportFile: 'database-export.json',
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}

// Get current week number
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function() {
  const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// Helper: Get current week number
function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil((diff + start.getDay() * 86400000) / oneWeek);
}

// GET - Auto-seed the database if empty (called by store.syncFromLocalStorage)
export async function GET() {
  try {
    // Check if DB already has data
    const userCount = await db.user.count();
    
    if (userCount > 0) {
      return NextResponse.json({
        message: 'Database already has data',
        userCount,
        skipped: true,
      });
    }
    
    // Auto-seed the database
    console.log('🌱 Auto-seeding database via GET request...');
    const stats: Record<string, number> = {};

    // ==========================================
    // 1. CREATE USERS
    // ==========================================
    console.log('👥 Creating users...');
    
    for (const u of USERS) {
      await db.user.create({
        data: {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          timezone: 'Europe/Paris',
          weight: 70 + Math.floor(Math.random() * 20),
          height: 170 + Math.floor(Math.random() * 15),
          activityLevel: 'moderate',
          sportLevel: 'intermediate',
          updatedAt: new Date(),
        },
      });
      stats.users = (stats.users || 0) + 1;
    }
    console.log(`✅ ${stats.users} users created`);

    // ==========================================
    // 2. CREATE CATEGORIES FOR EACH USER
    // ==========================================
    console.log('📁 Creating categories...');
    
    for (const user of USERS) {
      for (let i = 0; i < CATEGORIES_TASK.length; i++) {
        const cat = CATEGORIES_TASK[i];
        await db.category.create({
          data: {
            id: generateId('cat-task', i, user.id),
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            type: 'task',
            userId: user.id,
          },
        });
        stats.categories = (stats.categories || 0) + 1;
      }
      
      for (let i = 0; i < CATEGORIES_GOAL.length; i++) {
        const cat = CATEGORIES_GOAL[i];
        await db.category.create({
          data: {
            id: generateId('cat-goal', i, user.id),
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            type: 'goal',
            userId: user.id,
          },
        });
        stats.categories = (stats.categories || 0) + 1;
      }
    }
    console.log(`✅ ${stats.categories} categories created`);

    // ==========================================
    // 3. CREATE TASKS FOR EACH USER
    // ==========================================
    console.log('✅ Creating tasks...');
    
    for (const user of USERS) {
      for (let i = 0; i < TASK_TITLES.length; i++) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + i);
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + 7);
        
        await db.task.create({
          data: {
            id: generateId('task', i, user.id),
            title: TASK_TITLES[i],
            description: `Description détaillée pour ${TASK_TITLES[i]}`,
            status: i === 0 ? 'completed' : i === 1 ? 'in_progress' : 'pending',
            priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low',
            startDate,
            dueDate,
            progress: i === 0 ? 100 : i === 1 ? 50 : 0,
            userId: user.id,
            categoryId: generateId('cat-task', i % CATEGORIES_TASK.length, user.id),
          },
        });
        stats.tasks = (stats.tasks || 0) + 1;
      }
    }
    console.log(`✅ ${stats.tasks} tasks created`);

    // ==========================================
    // 4. CREATE GOALS FOR EACH USER
    // ==========================================
    console.log('🎯 Creating goals...');
    
    for (const user of USERS) {
      for (let i = 0; i < GOAL_TITLES.length; i++) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        
        await db.goal.create({
          data: {
            id: generateId('goal', i, user.id),
            title: GOAL_TITLES[i],
            description: `Objectif: ${GOAL_TITLES[i]}`,
            targetValue: 100,
            currentValue: i * 20,
            unit: '%',
            startDate,
            endDate,
            status: i === 0 ? 'completed' : 'active',
            priority: i === 0 ? 'important' : i === 1 ? 'moyen' : 'a_planifier',
            milestones: JSON.stringify([
              { title: 'Étape 1', completed: true },
              { title: 'Étape 2', completed: i > 1 },
              { title: 'Étape 3', completed: false },
            ]),
            userId: user.id,
            categoryId: generateId('cat-goal', i % CATEGORIES_GOAL.length, user.id),
          },
        });
        stats.goals = (stats.goals || 0) + 1;
      }
    }
    console.log(`✅ ${stats.goals} goals created`);

    // ==========================================
    // 5. CREATE EVENTS FOR EACH USER
    // ==========================================
    console.log('📅 Creating events...');
    
    for (const user of USERS) {
      for (let i = 0; i < EVENT_TITLES.length; i++) {
        const startAt = new Date();
        startAt.setDate(startAt.getDate() + i); // i=0 = today, i=1 = tomorrow, etc.
        startAt.setHours(9 + i, 0, 0, 0);
        const endAt = new Date(startAt);
        endAt.setHours(endAt.getHours() + 2);
        
        await db.event.create({
          data: {
            id: generateId('event', i, user.id),
            title: EVENT_TITLES[i],
            description: `Événement: ${EVENT_TITLES[i]}`,
            location: i % 2 === 0 ? 'Bureau' : 'En ligne',
            startAt,
            endAt,
            isAllDay: i === 4,
            color: ['emerald', 'blue', 'amber', 'rose', 'violet'][i],
            userId: user.id,
            categoryId: generateId('cat-task', i % CATEGORIES_TASK.length, user.id),
          },
        });
        stats.events = (stats.events || 0) + 1;
      }
    }
    console.log(`✅ ${stats.events} events created`);

    // ==========================================
    // 6. CREATE HABITS FOR EACH USER
    // ==========================================
    console.log('🔄 Creating habits...');
    
    for (const user of USERS) {
      for (let i = 0; i < HABIT_NAMES.length; i++) {
        const habit = await db.habit.create({
          data: {
            id: generateId('habit', i, user.id),
            name: HABIT_NAMES[i],
            description: `Habitude quotidienne: ${HABIT_NAMES[i]}`,
            frequency: 'daily',
            color: ['emerald', 'blue', 'amber', 'rose', 'violet'][i],
            icon: ['🧘', '📚', '💪', '✍️', '💧'][i],
            isActive: true,
            userId: user.id,
            categoryId: generateId('cat-task', 0, user.id),
          },
        });
        stats.habits = (stats.habits || 0) + 1;
        
        // Create habit logs for the last 7 days
        for (let d = 0; d < 7; d++) {
          const date = new Date();
          date.setDate(date.getDate() - d);
          await db.habitLog.create({
            data: {
              id: generateId(`habitlog-${i}-${d}`, 0, user.id),
              date,
              completed: Math.random() > 0.3,
              habitId: habit.id,
              userId: user.id,
            },
          });
          stats.habitLogs = (stats.habitLogs || 0) + 1;
        }
      }
    }
    console.log(`✅ ${stats.habits} habits created with ${stats.habitLogs} logs`);

    // ==========================================
    // 7. CREATE NOTES FOR EACH USER
    // ==========================================
    console.log('📝 Creating notes...');
    
    for (const user of USERS) {
      for (let i = 0; i < NOTE_TITLES.length; i++) {
        await db.note.create({
          data: {
            id: generateId('note', i, user.id),
            title: NOTE_TITLES[i],
            content: `Contenu de la note: ${NOTE_TITLES[i]}\n\nVoici les détails importants à retenir...\n\n- Point 1\n- Point 2\n- Point 3`,
            type: i % 3 === 0 ? 'markdown' : 'text',
            tags: JSON.stringify(['important', 'projet']),
            isPinned: i === 0,
            userId: user.id,
            categoryId: generateId('cat-task', 0, user.id),
          },
        });
        stats.notes = (stats.notes || 0) + 1;
      }
    }
    console.log(`✅ ${stats.notes} notes created`);

    // ==========================================
    // 8. CREATE JOURNAL ENTRIES FOR EACH USER
    // ==========================================
    console.log('📔 Creating journal entries...');
    
    for (const user of USERS) {
      for (let i = 0; i < JOURNAL_PROMPTS.length; i++) {
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - i);
        
        await db.journalEntry.create({
          data: {
            id: generateId('journal', i, user.id),
            title: JOURNAL_PROMPTS[i],
            content: `Aujourd'hui, je réfléchis à: ${JOURNAL_PROMPTS[i]}\n\nMes pensées:\n- Point important 1\n- Point important 2\n\nConclusion: Je dois continuer à progresser.`,
            mood: ['great', 'good', 'okay', 'bad', 'terrible'][i],
            gratitude: i === 0 ? 'Je suis reconnaissant pour ma famille et ma santé.' : null,
            wins: i === 1 ? 'J\'ai terminé mon projet important.' : null,
            challenges: i === 2 ? 'Gérer mon temps plus efficacement.' : null,
            userId: user.id,
            createdAt,
          },
        });
        stats.journalEntries = (stats.journalEntries || 0) + 1;
      }
    }
    console.log(`✅ ${stats.journalEntries} journal entries created`);

    // ==========================================
    // 9. CREATE SPORT PROFILES FOR EACH USER
    // ==========================================
    console.log('💪 Creating sport profiles...');
    
    for (const user of USERS) {
      const profile = await db.sportProfile.create({
        data: {
          id: generateId('sportprofile', 0, user.id),
          userId: user.id,
          level: ['beginner', 'intermediate', 'advanced', 'intermediate'][USERS.indexOf(user)],
          goals: JSON.stringify(['force', 'endurance', 'flexibilite']),
          preferredSports: JSON.stringify(['Musculation', 'Running', 'Yoga']),
        },
      });
      stats.sportProfiles = (stats.sportProfiles || 0) + 1;

      // Create a weekly program
      const program = await db.weeklyProgram.create({
        data: {
          id: generateId('program', 0, user.id),
          profileId: profile.id,
          name: 'Semaine Type',
          weekNumber: getCurrentWeekNumber(),
          year: new Date().getFullYear(),
          isActive: true,
        },
      });
      stats.weeklyPrograms = (stats.weeklyPrograms || 0) + 1;

      // Create program days
      const dayNames = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Cardio', 'Rest'];
      const dayTypes = ['workout', 'workout', 'workout', 'workout', 'workout', 'cardio', 'rest'];
      
      for (let d = 0; d < 7; d++) {
        const day = await db.programDay.create({
          data: {
            id: generateId(`programday-${d}`, 0, user.id),
            programId: program.id,
            dayOfWeek: d,
            name: dayNames[d],
            type: dayTypes[d],
            intensity: d === 6 ? 0 : 60 + Math.floor(Math.random() * 30),
          },
        });
        stats.programDays = (stats.programDays || 0) + 1;

        // Add exercises for workout days
        if (d < 6) {
          const exercises = [
            { name: 'Développé Couché', sets: 4, reps: '8-10', category: 'main' },
            { name: 'Curl Biceps', sets: 3, reps: '12', category: 'isolation' },
          ];
          
          for (let e = 0; e < exercises.length; e++) {
            const ex = exercises[e];
            await db.dayExercise.create({
              data: {
                id: generateId(`exercise-${d}-${e}`, 0, user.id),
                dayId: day.id,
                name: ex.name,
                category: ex.category,
                sets: ex.sets,
                reps: ex.reps,
                weight: 20 + Math.floor(Math.random() * 40),
                order: e,
              },
            });
            stats.dayExercises = (stats.dayExercises || 0) + 1;
          }
        }
      }
    }
    console.log(`✅ ${stats.sportProfiles} sport profiles with programs created`);

    // ==========================================
    // 10. CREATE MEALS FOR EACH USER
    // ==========================================
    console.log('🍽️ Creating meals...');
    
    const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
    const mealNames = ['Petit-déjeuner équilibré', 'Déjeuner protéiné', 'Collation saine', 'Dîner léger'];
    
    for (const user of USERS) {
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        for (let m = 0; m < mealTypes.length; m++) {
          await db.meal.create({
            data: {
              id: generateId(`meal-${i}-${m}`, 0, user.id),
              userId: user.id,
              name: `${mealNames[m]} - Jour ${i + 1}`,
              type: mealTypes[m],
              date,
              calories: 300 + Math.floor(Math.random() * 400),
              protein: 20 + Math.floor(Math.random() * 30),
              carbs: 30 + Math.floor(Math.random() * 40),
              fat: 10 + Math.floor(Math.random() * 20),
              ingredients: JSON.stringify([
                { name: 'Ingrédient 1', quantity: '100g' },
                { name: 'Ingrédient 2', quantity: '50g' },
              ]),
              instructions: 'Étape 1: Préparer les ingrédients.\nÉtape 2: Cuire à feu moyen.\nÉtape 3: Servir chaud.',
            },
          });
          stats.meals = (stats.meals || 0) + 1;
        }
      }
    }
    console.log(`✅ ${stats.meals} meals created`);

    // ==========================================
    // 11. CREATE WEIGHT ENTRIES FOR EACH USER
    // ==========================================
    console.log('⚖️ Creating weight entries...');
    
    for (const user of USERS) {
      const baseWeight = 70 + Math.floor(Math.random() * 20);
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        
        await db.weightEntry.create({
          data: {
            id: generateId('weight', i, user.id),
            userId: user.id,
            weight: baseWeight - (i * 0.5) + (Math.random() * 0.5),
            date,
            note: i === 0 ? 'Poids initial' : `Semaine ${i}`,
          },
        });
        stats.weightEntries = (stats.weightEntries || 0) + 1;
      }
    }
    console.log(`✅ ${stats.weightEntries} weight entries created`);

    console.log('✅ Auto-seed complete!');

    return NextResponse.json({
      success: true,
      message: 'Database auto-seeded successfully!',
      stats,
    });
  } catch (error) {
    console.error('Error auto-seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to auto-seed database', details: String(error) },
      { status: 500 }
    );
  }
}
