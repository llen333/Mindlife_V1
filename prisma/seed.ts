/**
 * MindLife - Script de Seed pour la Base de Données
 * Exécuter avec: bun run seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USER_ID = 'mindlife-user';

async function main() {
  console.log('🌱 Début du seed de la base de données...\n');

  // ============================================================
  // 1. NETTOYAGE COMPLET
  // ============================================================
  console.log('🧹 Nettoyage des données existantes...');
  await prisma.journalEntry.deleteMany({ where: { userId: USER_ID } });
  await prisma.note.deleteMany({ where: { userId: USER_ID } });
  await prisma.task.deleteMany({ where: { userId: USER_ID } });
  await prisma.event.deleteMany({ where: { userId: USER_ID } });
  await prisma.habit.deleteMany({ where: { userId: USER_ID } });
  await prisma.goal.deleteMany({ where: { userId: USER_ID } });
  await prisma.category.deleteMany({ where: { userId: USER_ID } });
  await prisma.user.deleteMany({ where: { id: USER_ID } });
  console.log('✅ Données nettoyées\n');

  // ============================================================
  // 2. CRÉATION DE L'UTILISATEUR
  // ============================================================
  console.log('👤 Création de l\'utilisateur...');
  const user = await prisma.user.create({
    data: {
      id: USER_ID,
      name: 'NICO',
      email: 'nico@mindlife.app',
      avatar: '🦞',
      role: 'admin',
    },
  });
  console.log('✅ Utilisateur créé:', user.name, user.avatar, '\n');

  // ============================================================
  // 3. CRÉATION DES CATÉGORIES
  // ============================================================
  console.log('📁 Création des catégories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: { id: 'cat-personal', name: 'Développement Personnel', icon: '🎯', color: 'violet', type: 'goal', userId: USER_ID },
    }),
    prisma.category.create({
      data: { id: 'cat-professional', name: 'Vie Professionnelle', icon: '💼', color: 'slate', type: 'goal', userId: USER_ID },
    }),
    prisma.category.create({
      data: { id: 'cat-sport', name: 'Sport & Fitness', icon: '🏋️', color: 'emerald', type: 'goal', userId: USER_ID },
    }),
    prisma.category.create({
      data: { id: 'cat-health', name: 'Santé & Bien-être', icon: '❤️', color: 'rose', type: 'goal', userId: USER_ID },
    }),
    prisma.category.create({
      data: { id: 'cat-finance', name: 'Finance & Budget', icon: '💰', color: 'amber', type: 'goal', userId: USER_ID },
    }),
    prisma.category.create({
      data: { id: 'cat-education', name: 'Éducation & Apprentissage', icon: '📚', color: 'blue', type: 'goal', userId: USER_ID },
    }),
    prisma.category.create({
      data: { id: 'cat-social', name: 'Relations Sociales', icon: '👥', color: 'pink', type: 'goal', userId: USER_ID },
    }),
    prisma.category.create({
      data: { id: 'cat-spirituality', name: 'Spiritualité', icon: '🧘', color: 'purple', type: 'goal', userId: USER_ID },
    }),
    prisma.category.create({
      data: { id: 'cat-creativity', name: 'Créativité & Arts', icon: '🎨', color: 'cyan', type: 'goal', userId: USER_ID },
    }),
    prisma.category.create({
      data: { id: 'cat-travel', name: 'Voyages & Aventures', icon: '✈️', color: 'teal', type: 'goal', userId: USER_ID },
    }),
  ]);
  console.log('✅', categories.length, 'catégories créées\n');

  // ============================================================
  // 4. CRÉATION DES OBJECTIFS (GOALS)
  // ============================================================
  console.log('🎯 Création des objectifs...');
  const now = new Date();
  const goals = await Promise.all([
    // Objectif 1: Apprendre le japonais
    prisma.goal.create({
      data: {
        id: 'goal-japanese',
        title: 'Apprendre le japonais',
        description: 'Atteindre un niveau N3 en japonais d\'ici la fin de l\'année',
        categoryId: 'cat-education',
        priority: 'en_cours',
        status: 'active',
        currentValue: 25,
        targetValue: 100,
        unit: '%',
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: new Date(now.getFullYear(), 11, 31),
        milestones: JSON.stringify([
          { id: 'm1', title: 'Hiragana & Katakana', completed: true, dueDate: `${now.getFullYear()}-02-28`, order: 0 },
          { id: 'm2', title: 'Kanji basiques (N5)', completed: true, dueDate: `${now.getFullYear()}-04-30`, order: 1 },
          { id: 'm3', title: 'Grammaire N4', completed: false, dueDate: `${now.getFullYear()}-07-31`, order: 2 },
          { id: 'm4', title: 'Kanji intermédiaires (N4)', completed: false, dueDate: `${now.getFullYear()}-09-30`, order: 3 },
          { id: 'm5', title: 'Préparation N3', completed: false, dueDate: `${now.getFullYear()}-12-15`, order: 4 },
        ]),
        userId: USER_ID,
      },
    }),
    // Objectif 2: Marathon
    prisma.goal.create({
      data: {
        id: 'goal-marathon',
        title: 'Courir un marathon',
        description: 'Participer au marathon de Paris en 2025',
        categoryId: 'cat-sport',
        priority: 'important',
        status: 'active',
        currentValue: 40,
        targetValue: 100,
        unit: '%',
        startDate: new Date(now.getFullYear() - 1, 0, 1),
        endDate: new Date(now.getFullYear() + 1, 3, 15),
        milestones: JSON.stringify([
          { id: 'm1', title: '10km sans arrêt', completed: true, dueDate: `${now.getFullYear()}-02-28`, order: 0 },
          { id: 'm2', title: 'Semi-marathon', completed: true, dueDate: `${now.getFullYear()}-05-15`, order: 1 },
          { id: 'm3', title: '30km en entraînement', completed: false, dueDate: `${now.getFullYear()}-08-31`, order: 2 },
          { id: 'm4', title: 'Marathon de Paris', completed: false, dueDate: `${now.getFullYear() + 1}-04-15`, order: 3 },
        ]),
        userId: USER_ID,
      },
    }),
    // Objectif 3: Épargne
    prisma.goal.create({
      data: {
        id: 'goal-savings',
        title: 'Épargner 10 000€',
        description: 'Constituer une épargne de sécurité',
        categoryId: 'cat-finance',
        priority: 'a_planifier',
        status: 'active',
        currentValue: 6500,
        targetValue: 10000,
        unit: '€',
        startDate: new Date(now.getFullYear() - 1, 0, 1),
        endDate: new Date(now.getFullYear(), 11, 31),
        milestones: JSON.stringify([
          { id: 'm1', title: 'Premier 2500€', completed: true, dueDate: `${now.getFullYear() - 1}-03-31`, order: 0 },
          { id: 'm2', title: 'Cap des 5000€', completed: true, dueDate: `${now.getFullYear() - 1}-06-30`, order: 1 },
          { id: 'm3', title: 'Cap des 7500€', completed: false, dueDate: `${now.getFullYear() - 1}-09-30`, order: 2 },
          { id: 'm4', title: 'Objectif 10 000€', completed: false, dueDate: `${now.getFullYear()}-12-31`, order: 3 },
        ]),
        userId: USER_ID,
      },
    }),
    // Objectif 4: Méditation
    prisma.goal.create({
      data: {
        id: 'goal-meditation',
        title: 'Pratiquer la méditation quotidienne',
        description: 'Méditer 20 minutes chaque jour pendant 100 jours',
        categoryId: 'cat-spirituality',
        priority: 'en_cours',
        status: 'active',
        currentValue: 35,
        targetValue: 100,
        unit: 'jours',
        startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 2, 28),
        milestones: JSON.stringify([
          { id: 'm1', title: '7 jours consécutifs', completed: true, dueDate: `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-08`, order: 0 },
          { id: 'm2', title: '21 jours (habitude formée)', completed: true, dueDate: `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-22`, order: 1 },
          { id: 'm3', title: '50 jours', completed: false, dueDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-20`, order: 2 },
          { id: 'm4', title: '100 jours', completed: false, dueDate: `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}-28`, order: 3 },
        ]),
        userId: USER_ID,
      },
    }),
    // Objectif 5: Pro personnel
    prisma.goal.create({
      data: {
        id: 'goal-website',
        title: 'Créer mon portfolio en ligne',
        description: 'Développer et lancer mon portfolio personnel',
        categoryId: 'cat-professional',
        priority: 'important',
        status: 'active',
        currentValue: 60,
        targetValue: 100,
        unit: '%',
        startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 15),
        milestones: JSON.stringify([
          { id: 'm1', title: 'Design & Wireframes', completed: true, dueDate: `${now.getFullYear()}-${String(now.getMonth() - 1).padStart(2, '0')}-15`, order: 0 },
          { id: 'm2', title: 'Développement Frontend', completed: true, dueDate: `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-01`, order: 1 },
          { id: 'm3', title: 'Intégration Backend', completed: false, dueDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`, order: 2 },
          { id: 'm4', title: 'Déploiement & SEO', completed: false, dueDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-15`, order: 3 },
        ]),
        userId: USER_ID,
      },
    }),
  ]);
  console.log('✅', goals.length, 'objectifs créés\n');

  // ============================================================
  // 5. CRÉATION DES TÂCHES
  // ============================================================
  console.log('✅ Création des tâches...');
  const tasks = await Promise.all([
    // Tâches liées aux objectifs (via catégorie)
    prisma.task.create({
      data: {
        id: 'task-japanese-1',
        title: 'Réviser les kanjis N4',
        description: 'Réviser les 150 kanjis du niveau N4',
        status: 'pending',
        priority: 'high',
        categoryId: 'cat-education',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
        userId: USER_ID,
      },
    }),
    prisma.task.create({
      data: {
        id: 'task-marathon-1',
        title: 'Entraînement 15km',
        description: 'Course de 15km en zone 2',
        status: 'pending',
        priority: 'high',
        categoryId: 'cat-sport',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        userId: USER_ID,
      },
    }),
    prisma.task.create({
      data: {
        id: 'task-savings-1',
        title: 'Virer 500€ sur le LEP',
        description: 'Virement mensuel vers le compte épargne',
        status: 'pending',
        priority: 'medium',
        categoryId: 'cat-finance',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
        userId: USER_ID,
      },
    }),
    // Tâches autonomes
    prisma.task.create({
      data: {
        id: 'task-meeting',
        title: 'Préparer réunion client',
        description: 'Préparer la présentation pour le client Demour',
        status: 'pending',
        priority: 'high',
        categoryId: 'cat-professional',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
        userId: USER_ID,
      },
    }),
    prisma.task.create({
      data: {
        id: 'task-shopping',
        title: 'Courses hebdomadaires',
        description: 'Faire les courses pour la semaine',
        status: 'pending',
        priority: 'low',
        categoryId: 'cat-personal',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        userId: USER_ID,
      },
    }),
    prisma.task.create({
      data: {
        id: 'task-book',
        title: 'Lire "Atomic Habits"',
        description: 'Finir le livre sur les habitudes',
        status: 'in_progress',
        priority: 'medium',
        categoryId: 'cat-personal',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
        progress: 60,
        userId: USER_ID,
      },
    }),
    prisma.task.create({
      data: {
        id: 'task-call',
        title: 'Appeler maman',
        description: 'Appel hebdomadaire',
        status: 'pending',
        priority: 'medium',
        categoryId: 'cat-social',
        dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        userId: USER_ID,
      },
    }),
  ]);
  console.log('✅', tasks.length, 'tâches créées\n');

  // ============================================================
  // 6. CRÉATION DES ÉVÉNEMENTS
  // ============================================================
  console.log('📅 Création des événements...');
  const events = await Promise.all([
    // Événement lié à un objectif (étape)
    prisma.event.create({
      data: {
        id: 'event-milestone-japanese',
        title: '🎯 Examen Kanji N4',
        description: 'Évaluation des kanjis du niveau N4',
        startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 10, 0),
        endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 12, 0),
        color: 'violet',
        categoryId: 'cat-education',
        goalId: 'goal-japanese',
        milestoneId: 'm3',
        userId: USER_ID,
      },
    }),
    // Événements autonomes
    prisma.event.create({
      data: {
        id: 'event-meeting',
        title: '💼 Réunion client Demour',
        description: 'Présentation du projet Q2',
        startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 14, 0),
        endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 16, 0),
        color: 'slate',
        categoryId: 'cat-professional',
        userId: USER_ID,
      },
    }),
    prisma.event.create({
      data: {
        id: 'event-sport',
        title: '🏋️ Coaching sportif',
        description: 'Séance avec le coach',
        startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 18, 0),
        endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 19, 30),
        color: 'emerald',
        categoryId: 'cat-sport',
        userId: USER_ID,
      },
    }),
    prisma.event.create({
      data: {
        id: 'event-dinner',
        title: '🍕 Dîner avec Sophie',
        description: 'Restaurant italien',
        startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 20, 0),
        endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 22, 30),
        color: 'pink',
        categoryId: 'cat-social',
        userId: USER_ID,
      },
    }),
    prisma.event.create({
      data: {
        id: 'event-doctor',
        title: '🏥 RDV Médecin',
        description: 'Bilan annuel',
        startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6, 9, 0),
        endAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6, 9, 30),
        color: 'rose',
        categoryId: 'cat-health',
        userId: USER_ID,
      },
    }),
  ]);
  console.log('✅', events.length, 'événements créés\n');

  // ============================================================
  // 7. CRÉATION DES HABITUDES
  // ============================================================
  console.log('🔄 Création des habitudes...');
  const habits = await Promise.all([
    prisma.habit.create({
      data: {
        id: 'habit-meditation',
        name: 'Méditation matinale',
        description: '20 minutes de méditation au réveil',
        frequency: 'daily',
        targetDays: JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        color: 'purple',
        icon: '🧘',
        isActive: true,
        categoryId: 'cat-spirituality',
        userId: USER_ID,
      },
    }),
    prisma.habit.create({
      data: {
        id: 'habit-sport',
        name: 'Sport',
        description: 'Séance de sport ou marche',
        frequency: 'weekly',
        targetDays: JSON.stringify(['monday', 'wednesday', 'friday']),
        color: 'emerald',
        icon: '🏃',
        isActive: true,
        categoryId: 'cat-sport',
        userId: USER_ID,
      },
    }),
    prisma.habit.create({
      data: {
        id: 'habit-reading',
        name: 'Lecture',
        description: '30 minutes de lecture',
        frequency: 'daily',
        targetDays: JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        color: 'blue',
        icon: '📚',
        isActive: true,
        categoryId: 'cat-education',
        userId: USER_ID,
      },
    }),
    prisma.habit.create({
      data: {
        id: 'habit-water',
        name: 'Hydratation',
        description: 'Boire 2L d\'eau',
        frequency: 'daily',
        targetDays: JSON.stringify(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
        color: 'cyan',
        icon: '💧',
        isActive: true,
        categoryId: 'cat-health',
        userId: USER_ID,
      },
    }),
  ]);
  console.log('✅', habits.length, 'habitudes créées\n');

  // ============================================================
  // 8. CRÉATION DES NOTES
  // ============================================================
  console.log('📝 Création des notes...');
  const notes = await Promise.all([
    prisma.note.create({
      data: {
        id: 'note-ideas',
        title: 'Idées projets 2025',
        content: '## Projets à développer\n\n- App de productivité\n- Blog personnel\n- Chaîne YouTube\n- Podcast développement personnel',
        type: 'markdown',
        tags: JSON.stringify(['idées', 'projets', '2025']),
        isPinned: true,
        categoryId: 'cat-personal',
        userId: USER_ID,
      },
    }),
    prisma.note.create({
      data: {
        id: 'note-japanese',
        title: 'Vocabulaire japonais',
        content: '### Mots appris cette semaine\n\n- 会社 (kaisha) - entreprise\n- 仕事 (shigoto) - travail\n- 友達 (tomodachi) - ami\n- 家族 (kazoku) - famille',
        type: 'markdown',
        tags: JSON.stringify(['japonais', 'vocabulaire', 'N4']),
        isPinned: false,
        categoryId: 'cat-education',
        userId: USER_ID,
      },
    }),
    prisma.note.create({
      data: {
        id: 'note-recipes',
        title: 'Recettes saines',
        content: '### Bowl poké\n\n- Riz complet\n- Saumon\n- Avocat\n- Edamame\n- Sauce soja\n\n### Smoothie énergie\n\n- Banane\n- Beurre de cacahuète\n- Lait d\'avoine\n- Graines de chia',
        type: 'markdown',
        tags: JSON.stringify(['cuisine', 'santé', 'recettes']),
        isPinned: false,
        categoryId: 'cat-health',
        userId: USER_ID,
      },
    }),
  ]);
  console.log('✅', notes.length, 'notes créées\n');

  // ============================================================
  // 9. CRÉATION DES ENTRÉES JOURNAL
  // ============================================================
  console.log('📔 Création des entrées journal...');
  const journalEntries = await Promise.all([
    prisma.journalEntry.create({
      data: {
        id: 'journal-1',
        title: 'Bonne journée productive',
        content: 'Aujourd\'hui j\'ai réussi à terminer ma présentation pour le client. Je me sens satisfait de mon travail. La séance de sport m\'a fait du bien.',
        mood: 'great',
        gratitude: JSON.stringify(['Ma santé', 'Mon travail', 'Ma famille']),
        wins: JSON.stringify(['Présentation terminée', 'Séance sport', 'Méditation matinale']),
        challenges: JSON.stringify(['Gestion du temps sur les réseaux sociaux']),
        userId: USER_ID,
        createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      },
    }),
    prisma.journalEntry.create({
      data: {
        id: 'journal-2',
        title: 'Journée calme',
        content: 'Journée plus calme aujourd\'hui. J\'ai pris le temps de lire et me reposer. Parfois c\'est nécessaire.',
        mood: 'good',
        gratitude: JSON.stringify(['Le temps pour moi', 'Un bon livre', 'Le soleil']),
        wins: JSON.stringify(['Lecture 1h', 'Promenade', 'Cuisine saine']),
        challenges: JSON.stringify(['Motivation le matin']),
        userId: USER_ID,
        createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
      },
    }),
  ]);
  console.log('✅', journalEntries.length, 'entrées journal créées\n');

  // ============================================================
  // 10. SEED DES PATTERNS POUR PERSONAS (SANS LLM)
  // ============================================================
  console.log('🤖 Création des patterns de personas...');

  const defaultPatterns = [
    // === ASSISTANT GÉNÉRAL ===
    { persona: 'assistant', trigger: 'bonjour', response: "Bonjour ! 👋 Je suis ton assistant MindLife. Comment puis-je t'aider aujourd'hui ?", priority: 100 },
    { persona: 'assistant', trigger: 'merci', response: "Avec plaisir ! N'hésite pas si tu as d'autres questions. 😊", priority: 90 },
    { persona: 'assistant', trigger: 'aide', response: "Je peux t'aider avec :\n• 📋 Tes tâches et objectifs\n• 📅 Ton calendrier\n• 🍽️ Des idées de repas\n• 🏋️ Des conseils sport\n• 🧘 Des conseils bien-être\n\nQue souhaites-tu faire ?", priority: 95 },
    { persona: 'assistant', trigger: 'tâche', response: "Tu veux créer une nouvelle tâche ? Dis-moi son nom et je peux t'aider à l'organiser.", priority: 80 },
    { persona: 'assistant', trigger: 'objectif', response: "Définir un objectif est la première étape vers le succès ! Quel objectif veux-tu atteindre ?", priority: 80 },

    // === COACH SPORT ===
    { persona: 'coach', trigger: 'fatigué', response: "Écoute ton corps ! 💪 Une récupération active peut être bénéfique. Que penses-tu d'une marche de 20 min ou de quelques étirements légers ?", priority: 85 },
    { persona: 'coach', trigger: 'motivation', response: "La motivation vient en faisant ! 🏋️ Commence petit : 10 min d'exercice, c'est déjà une victoire. Quel mouvement tu pourrais faire maintenant ?", priority: 90 },
    { persona: 'coach', trigger: 'entraînement', response: "Parfait ! On va se bouger ! 🔥 Dis-moi combien de temps tu as et quel muscle tu veux travailler.", priority: 85 },
    { persona: 'coach', trigger: 'muscle', response: "La prise de masse nécessite : 1️⃣ Entraînement progressif 2️⃣ Protéines suffisantes 3️⃣ Repos optimal. Tu fais quoi actuellement ?", priority: 80 },

    // === NUTRITION ===
    { persona: 'nutrition', trigger: 'recette', response: "J'adore trouver de nouvelles recettes ! 🍽️ Tu cherches quelque chose de particulier ? (petit-déj, déjeuner, dîner, rapide, healthy...)", priority: 85 },
    { persona: 'nutrition', trigger: 'protéine', response: "Les protéines sont essentielles ! 🥩 Sources : viande, poisson, œufs, légumineuses, tofu. Combien de grammes vise-tu par jour ?", priority: 80 },
    { persona: 'nutrition', trigger: 'perte de poids', response: "Pour perdre du poids durablement : 🥗 Déficit calorique modéré, 🏃 Activité physique régulière, 😴 Sommeil suffisant. On établit un plan ensemble ?", priority: 90 },
    { persona: 'nutrition', trigger: 'petit-déjeuner', response: "Un bon petit-déj équilibre : 🥚 Protéines + 🥣 Glucides complexes + 🥑 Lipides sains. Exemple : œufs + flocons d'avoine + fruits. Ça te dit ?", priority: 80 },

    // === PRODUCTIVITÉ ===
    { persona: 'productivity', trigger: 'procrastination', response: "La procrastination nous atteint tous ! 🎯 Technique : commence par 5 min seulement. Souvent, le plus dur est de démarrer. Quelle tâche te fait peur ?", priority: 90 },
    { persona: 'productivity', trigger: 'priorité', response: "Priorise avec la matrice Eisenhower : 🔴 Urgent + Important → Faire maintenant, 🟡 Important → Planifier. Quelles sont tes tâches du jour ?", priority: 85 },
    { persona: 'productivity', trigger: 'temps', response: "Gérer son temps = gérer sa vie. ⏰ Essaie la technique Pomodoro : 25 min de focus, 5 min de pause. Tu veux essayer ?", priority: 80 },

    // === BIEN-ÊTRE ===
    { persona: 'wellness', trigger: 'stress', response: "Le stress est un signal. 🧘 Respire profondément 3 fois : inspire 4s, retiens 4s, expire 6s. Qu'est-ce qui te stresse en ce moment ?", priority: 95 },
    { persona: 'wellness', trigger: 'anxieux', response: "L'anxiété est normale. 💗 Tu n'es pas tes pensées. Prends un moment pour t'ancrer : nomme 5 choses que tu vois, 4 que tu entends, 3 que tu touches.", priority: 90 },
    { persona: 'wellness', trigger: 'dormir', response: "Le sommeil est fondamental. 😴 Conseils : écran off 1h avant, chambre fraîche (18-20°C), routine relaxante. Tu dors combien d'heures ?", priority: 85 },
    { persona: 'wellness', trigger: 'méditation', response: "La méditation transforme. 🧘‍♀️ Commence par 3 min : assis, yeux fermés, concentre-toi sur ta respiration. Tu médites déjà ou c'est nouveau ?", priority: 80 },
  ];

  let patternsCreated = 0;
  for (const pattern of defaultPatterns) {
    const existing = await prisma.personaPattern.findFirst({
      where: { persona: pattern.persona, trigger: pattern.trigger, userId: null },
    });

    if (!existing) {
      await prisma.personaPattern.create({
        data: {
          id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          persona: pattern.persona,
          trigger: pattern.trigger,
          triggerType: 'keyword',
          response: pattern.response,
          priority: pattern.priority,
          useCount: 0,
          avgRating: 0,
          isActive: true,
          source: 'system',
        },
      });
      patternsCreated++;
    }
  }
  console.log('✅', patternsCreated, 'patterns de personas créés\n');

  // ============================================================
  // 11. CRÉATION DES MÉDIAS (VIDÉOS POUR PSYCHE)
  // ============================================================
  console.log('🎬 Création des médias...');
  
  // Nettoyer les médias existants
  await prisma.mediaItem.deleteMany({ where: { userId: USER_ID } });
  
  const mediaItems = await Promise.all([
    // Neville Goddard
    prisma.mediaItem.create({
      data: {
        id: 'media-neville-1',
        userId: USER_ID,
        title: 'Neville Goddard - L\'Imagination Créatrice',
        author: 'Neville Goddard',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=3DX2-u-6dIE',
        description: 'Comprendre le pouvoir de l\'imagination pour manifester vos désirs',
        source: 'psyche',
        category: 'neville-goddard',
        isFavorite: true,
      },
    }),
    prisma.mediaItem.create({
      data: {
        id: 'media-neville-2',
        userId: USER_ID,
        title: 'La Loi de l\'Assumption',
        author: 'Neville Goddard',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=7JX5h8v8yBY',
        description: 'Vivez dans le sentiment du souhait exaucé',
        source: 'psyche',
        category: 'neville-goddard',
        isFavorite: false,
      },
    }),
    // Carl Jung
    prisma.mediaItem.create({
      data: {
        id: 'media-jung-1',
        userId: USER_ID,
        title: 'Carl Jung - L\'Ombre et le Soi',
        author: 'Carl Jung',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=ScMfcGnOYLY',
        description: 'Explorer l\'inconscient et l\'individuation',
        source: 'psyche',
        category: 'carl-jung',
        isFavorite: true,
      },
    }),
    prisma.mediaItem.create({
      data: {
        id: 'media-jung-2',
        userId: USER_ID,
        title: 'Les Archétypes et l\'Inconscient Collectif',
        author: 'Carl Jung',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=RbI-VtXG-KY',
        description: 'Comprendre les patterns universels de la psyché',
        source: 'psyche',
        category: 'carl-jung',
        isFavorite: false,
      },
    }),
    // Hermès Trismégiste
    prisma.mediaItem.create({
      data: {
        id: 'media-hermes-1',
        userId: USER_ID,
        title: 'Le Kybalion - Les 7 Principes Hermétiques',
        author: 'Hermès Trismégiste',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=ZnBf5e4cY0s',
        description: 'Les principes universels de la sagesse hermétique',
        source: 'psyche',
        category: 'hermes',
        isFavorite: false,
      },
    }),
  ]);
  console.log('✅', mediaItems.length, 'médias créés\n');

  // ============================================================
  // RÉSUMÉ
  // ============================================================
  console.log('═══════════════════════════════════════════════════════');
  console.log('🎉 SEED TERMINÉ AVEC SUCCÈS!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`👤 Utilisateur: ${user.name} ${user.avatar}`);
  console.log(`📁 Catégories: ${categories.length}`);
  console.log(`🎯 Objectifs: ${goals.length}`);
  console.log(`✅ Tâches: ${tasks.length}`);
  console.log(`📅 Événements: ${events.length}`);
  console.log(`🔄 Habitudes: ${habits.length}`);
  console.log(`📝 Notes: ${notes.length}`);
  console.log(`📔 Journal: ${journalEntries.length}`);
  console.log(`🤖 Patterns IA: ${patternsCreated}`);
  console.log(`🎬 Médias: ${mediaItems.length}`);
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n🚀 MindLife est prêt à être utilisé!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
