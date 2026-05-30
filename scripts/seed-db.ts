// Script pour peupler la base de données MindLife
// Lancer avec: bun run scripts/seed-db.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...');

  // ============================================
  // 1. CRÉER LES UTILISATEURS
  // ============================================
  console.log('📝 Création des utilisateurs...');

  const adminUser = await prisma.user.upsert({
    where: { id: 'mindlife-user' },
    update: {},
    create: {
      id: 'mindlife-user',
      email: 'admin@mindlife.app',
      name: 'Admin',
      role: 'admin',
      timezone: 'Europe/Paris',
      language: 'fr',
      theme: 'dark',
    },
  });

  const johnUser = await prisma.user.upsert({
    where: { id: 'user-john' },
    update: {},
    create: {
      id: 'user-john',
      email: 'john@mindlife.app',
      name: 'John',
      role: 'member',
      timezone: 'Europe/Paris',
      language: 'fr',
    },
  });

  const mikeUser = await prisma.user.upsert({
    where: { id: 'user-mike' },
    update: {},
    create: {
      id: 'user-mike',
      email: 'mike@mindlife.app',
      name: 'Mike',
      role: 'member',
      timezone: 'Europe/Paris',
      language: 'fr',
    },
  });

  const sarahUser = await prisma.user.upsert({
    where: { id: 'user-sarah' },
    update: {},
    create: {
      id: 'user-sarah',
      email: 'sarah@mindlife.app',
      name: 'Sarah',
      role: 'member',
      timezone: 'Europe/Paris',
      language: 'fr',
    },
  });

  const EmmaUser = await prisma.user.upsert({
    where: { id: 'user-emma' },
    update: {},
    create: {
      id: 'user-emma',
      email: 'emma@mindlife.app',
      name: 'Emma',
      role: 'member',
      timezone: 'Europe/Paris',
      language: 'fr',
    },
  });

  console.log('✅ Utilisateurs créés:', [adminUser.name, johnUser.name, mikeUser.name, sarahUser.name, EmmaUser.name].join(', '));

  // ============================================
  // 2. CRÉER LES CATÉGORIES (pour l'admin)
  // ============================================
  console.log('📁 Création des catégories...');

  const categories = [
    { id: 'cat-sport', name: 'Sport', icon: '🏃', color: 'emerald', type: 'task' },
    { id: 'cat-education', name: 'Éducation', icon: '📚', color: 'blue', type: 'task' },
    { id: 'cat-personal', name: 'Développement Personnel', icon: '🧠', color: 'purple', type: 'task' },
    { id: 'cat-spirituality', name: 'Esprit & Spiritualité', icon: '🧘', color: 'orange', type: 'task' },
    { id: 'cat-professional', name: 'Vie Professionnelle', icon: '💼', color: 'slate', type: 'task' },
    { id: 'cat-health', name: 'Santé', icon: '❤️', color: 'rose', type: 'task' },
    { id: 'cat-finance', name: 'Finance', icon: '💰', color: 'amber', type: 'task' },
    { id: 'cat-social', name: 'Social', icon: '👥', color: 'cyan', type: 'task' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
        userId: adminUser.id,
      },
    });
  }

  console.log('✅ Catégories créées:', categories.length);

  // ============================================
  // 3. CRÉER DES TÂCHES DE TEST (pour l'admin)
  // ============================================
  console.log('📋 Création des tâches...');

  // Définir today pour les dates
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const tasks = [
    {
      id: 'task-1',
      title: 'Finaliser le rapport mensuel',
      description: 'Rapport à remettre au directeur',
      status: 'in_progress',
      priority: 'high',
      dueDate: today, // Aujourd'hui
      categoryId: 'cat-professional',
      userId: adminUser.id,
    },
    {
      id: 'task-2',
      title: 'Séance de sport - Cardio',
      description: '45 min de course à pied',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Demain
      categoryId: 'cat-sport',
      userId: adminUser.id,
    },
    {
      id: 'task-3',
      title: 'Lire "Atomic Habits"',
      description: 'Continuer la lecture du chapitre 5',
      status: 'pending',
      priority: 'low',
      dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // Après-demain
      categoryId: 'cat-personal',
      userId: adminUser.id,
    },
    {
      id: 'task-4',
      title: 'Méditation matinale',
      description: '20 min de méditation guidée',
      status: 'completed',
      priority: 'medium',
      dueDate: today, // Aujourd'hui
      categoryId: 'cat-spirituality',
      userId: adminUser.id,
    },
    {
      id: 'task-5',
      title: 'Apprendre TypeScript',
      description: 'Terminer le cours en ligne',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
      categoryId: 'cat-education',
      userId: johnUser.id,
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: {
        ...task,
        progress: task.status === 'completed' ? 100 : 0,
      },
    });
  }

  console.log('✅ Tâches créées:', tasks.length);

  // ============================================
  // 4. CRÉER DES ÉVÉNEMENTS DE TEST
  // ============================================
  console.log('📅 Création des événements...');

  const events = [
    {
      id: 'event-1',
      title: 'Réunion équipe',
      description: 'Point hebdomadaire avec l\'équipe',
      startAt: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10h aujourd'hui
      endAt: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11h
      color: 'blue',
      categoryId: 'cat-professional',
      userId: adminUser.id,
    },
    {
      id: 'event-2',
      title: 'Séance sport',
      description: 'Musculation',
      startAt: new Date(today.getTime() + 18 * 60 * 60 * 1000), // 18h
      endAt: new Date(today.getTime() + 19 * 60 * 60 * 1000), // 19h
      color: 'emerald',
      categoryId: 'cat-sport',
      userId: adminUser.id,
    },
    {
      id: 'event-3',
      title: 'Rendez-vous médical',
      startAt: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // 14h demain
      endAt: new Date(today.getTime() + 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000),
      color: 'rose',
      categoryId: 'cat-health',
      userId: adminUser.id,
    },
    // Événement pour John
    {
      id: 'event-john-1',
      title: 'Cours de guitare',
      startAt: new Date(today.getTime() + 16 * 60 * 60 * 1000),
      endAt: new Date(today.getTime() + 17 * 60 * 60 * 1000),
      color: 'purple',
      categoryId: 'cat-personal',
      userId: johnUser.id,
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: {},
      create: event,
    });
  }

  console.log('✅ Événements créés:', events.length);

  // ============================================
  // 5. CRÉER DES HABITUDES DE TEST
  // ============================================
  console.log('🔄 Création des habitudes...');

  const habits = [
    {
      id: 'habit-1',
      name: 'Méditation matinale',
      description: '10 min de méditation chaque matin',
      frequency: 'daily',
      icon: '🧘',
      color: 'orange',
      categoryId: 'cat-spirituality',
      userId: adminUser.id,
    },
    {
      id: 'habit-2',
      name: 'Lecture',
      description: '30 min de lecture',
      frequency: 'daily',
      icon: '📚',
      color: 'blue',
      categoryId: 'cat-education',
      userId: adminUser.id,
    },
    {
      id: 'habit-3',
      name: 'Sport',
      description: 'Séance de sport',
      frequency: 'weekly',
      icon: '🏃',
      color: 'emerald',
      categoryId: 'cat-sport',
      userId: adminUser.id,
    },
  ];

  for (const habit of habits) {
    await prisma.habit.upsert({
      where: { id: habit.id },
      update: {},
      create: habit,
    });
  }

  console.log('✅ Habitudes créées:', habits.length);

  // ============================================
  // 6. CRÉER DES OBJECTIFS DE TEST
  // ============================================
  console.log('🎯 Création des objectifs...');

  // Calcul des dates pour les différentes périodes (réutilise now et today déclarés plus haut)
  
  // Fin de journée aujourd'hui
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);
  
  // Fin de semaine (dimanche)
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  
  // Fin du mois
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  // Fin du trimestre
  const currentQuarter = Math.floor(now.getMonth() / 3);
  const endOfQuarter = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59, 999);
  
  // Fin de l'année
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  const goals = [
    // Objectif qui finit AUJOURD'HUI (pour vue jour)
    {
      id: 'goal-1',
      title: 'Terminer le rapport urgent',
      description: 'Objectif avec deadline aujourd\'hui',
      targetValue: 1,
      currentValue: 0.8,
      unit: 'rapport',
      status: 'active',
      priority: 'urgent',
      categoryId: 'cat-professional',
      userId: adminUser.id,
      startDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // commencé il y a 2 jours
      endDate: endOfToday,
    },
    // Objectif qui finit cette SEMAINE (pour vue semaine)
    {
      id: 'goal-2',
      title: 'Perdre 1 kg cette semaine',
      description: 'Objectif de perte de poids hebdomadaire',
      targetValue: 1,
      currentValue: 0.5,
      unit: 'kg',
      status: 'active',
      priority: 'important',
      categoryId: 'cat-health',
      userId: adminUser.id,
      startDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // commencé il y a 3 jours
      endDate: endOfWeek,
    },
    // Objectif qui finit ce MOIS (pour vue mois)
    {
      id: 'goal-3',
      title: 'Lire 2 livres ce mois',
      description: 'Objectif lecture mensuel',
      targetValue: 2,
      currentValue: 1,
      unit: 'livres',
      status: 'active',
      priority: 'normal',
      categoryId: 'cat-education',
      userId: adminUser.id,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1), // début du mois
      endDate: endOfMonth,
    },
    // Objectif qui finit ce TRIMESTRE (pour vue trimestre)
    {
      id: 'goal-4',
      title: 'Perdre 5 kg',
      description: 'Objectif de perte de poids trimestriel',
      targetValue: 5,
      currentValue: 1.5,
      unit: 'kg',
      status: 'active',
      priority: 'normal',
      categoryId: 'cat-health',
      userId: adminUser.id,
      startDate: new Date(now.getFullYear(), currentQuarter * 3, 1), // début du trimestre
      endDate: endOfQuarter,
    },
    // Objectif annuel
    {
      id: 'goal-5',
      title: 'Lire 12 livres cette année',
      description: 'Un livre par mois',
      targetValue: 12,
      currentValue: 3,
      unit: 'livres',
      status: 'active',
      priority: 'a_planifier',
      categoryId: 'cat-education',
      userId: adminUser.id,
      startDate: new Date(now.getFullYear(), 0, 1), // début de l'année
      endDate: endOfYear,
    },
  ];

  for (const goal of goals) {
    await prisma.goal.upsert({
      where: { id: goal.id },
      update: {},
      create: goal,
    });
  }

  console.log('✅ Objectifs créés (admin):', goals.length);
  console.log('   - 1 objectif avec fin AUJOURD\'HUI (vue jour)');
  console.log('   - 1 objectif avec fin SEMAINE (vue semaine)');
  console.log('   - 1 objectif avec fin MOIS (vue mois)');
  console.log('   - 1 objectif avec fin TRIMESTRE (vue trimestre)');
  console.log('   - 1 objectif avec fin ANNÉE (vue année)');

  // ============================================
  // 6b. OBJECTIFS POUR LES AUTRES UTILISATEURS
  // ============================================
  console.log('🎯 Création des objectifs pour les autres utilisateurs...');

  // Objectifs pour John (2)
  const johnGoals = [
    {
      id: 'goal-john-1',
      title: 'Apprendre l\'espagnol',
      description: 'Objectif d\'apprentissage linguistique',
      targetValue: 100,
      currentValue: 25,
      unit: '%',
      status: 'active',
      priority: 'important',
      categoryId: 'cat-education',
      userId: johnUser.id,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1), // Début du mois
      endDate: new Date(now.getFullYear(), now.getMonth() + 3, 0), // Fin du trimestre
    },
    {
      id: 'goal-john-2',
      title: 'Courir un semi-marathon',
      description: 'Préparation physique sur 3 mois',
      targetValue: 21,
      currentValue: 5,
      unit: 'km',
      status: 'active',
      priority: 'normal',
      categoryId: 'cat-sport',
      userId: johnUser.id,
      startDate: new Date(now.getFullYear(), now.getMonth(), 15), // Milieu du mois
      endDate: new Date(now.getFullYear(), now.getMonth() + 5, 15), // Dans ~5 mois
    },
  ];

  // Objectifs pour Mike (2)
  const mikeGoals = [
    {
      id: 'goal-mike-1',
      title: 'Économiser pour les vacances',
      description: 'Épargne pour un voyage en Italie',
      targetValue: 2000,
      currentValue: 500,
      unit: '€',
      status: 'active',
      priority: 'important',
      categoryId: 'cat-finance',
      userId: mikeUser.id,
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1), // Mois dernier
      endDate: new Date(now.getFullYear(), now.getMonth() + 6, 0), // Dans ~6 mois
    },
    {
      id: 'goal-mike-2',
      title: 'Développer une application mobile',
      description: 'Projet personnel de développement',
      targetValue: 1,
      currentValue: 0.3,
      unit: 'app',
      status: 'active',
      priority: 'normal',
      categoryId: 'cat-professional',
      userId: mikeUser.id,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: endOfYear, // Fin de l'année
    },
  ];

  // Objectif pour Sarah (1)
  const sarahGoals = [
    {
      id: 'goal-sarah-1',
      title: 'Méditation quotidienne',
      description: 'Établir une pratique régulière de méditation',
      targetValue: 30,
      currentValue: 12,
      unit: 'jours',
      status: 'active',
      priority: 'normal',
      categoryId: 'cat-spirituality',
      userId: sarahUser.id,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: endOfMonth, // Fin du mois
    },
  ];

  // Objectif pour Emma (1)
  const emmaGoals = [
    {
      id: 'goal-emma-1',
      title: 'Lire 3 livres ce trimestre',
      description: 'Objectif lecture personnel',
      targetValue: 3,
      currentValue: 1,
      unit: 'livres',
      status: 'active',
      priority: 'a_planifier',
      categoryId: 'cat-personal',
      userId: EmmaUser.id,
      startDate: new Date(now.getFullYear(), currentQuarter * 3, 1), // Début du trimestre
      endDate: endOfQuarter, // Fin du trimestre
    },
  ];

  // Insérer tous les objectifs des autres utilisateurs
  const allOtherGoals = [...johnGoals, ...mikeGoals, ...sarahGoals, ...emmaGoals];
  for (const goal of allOtherGoals) {
    await prisma.goal.upsert({
      where: { id: goal.id },
      update: {},
      create: goal,
    });
  }

  console.log('✅ Objectifs créés pour les autres utilisateurs:', allOtherGoals.length);
  console.log('   - John: 2 objectifs');
  console.log('   - Mike: 2 objectifs');
  console.log('   - Sarah: 1 objectif');
  console.log('   - Emma: 1 objectif');

  // ============================================
  // 7. CRÉER UN PROFIL SPORT
  // ============================================
  console.log('🏋️ Création du profil sport...');

  await prisma.sportProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      id: 'sport-profile-1',
      userId: adminUser.id,
      level: 'intermediate',
      goals: JSON.stringify(['force', 'endurance']),
      preferredSports: JSON.stringify(['Musculation', 'Running', 'Natation']),
    },
  });

  console.log('✅ Profil sport créé');

  console.log('\n🎉 SEED TERMINÉ AVEC SUCCÈS !');
  console.log('========================================');
  console.log('Utilisateurs: 5 (1 admin + 4 membres)');
  console.log('Catégories: 8');
  console.log('Tâches: 5');
  console.log('Événements: 4');
  console.log('Habitudes: 3');
  console.log('Objectifs: 10 (5 admin + 2 John + 2 Mike + 1 Sarah + 1 Emma)');
  console.log('========================================');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
