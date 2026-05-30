#!/usr/bin/env bun
/**
 * MindLife - Script de seed complet avec toutes les catégories
 * Ce script initialise la base de données avec toutes les données nécessaires
 *
 * Usage: bun run scripts/seed-complete.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Catégories par défaut pour chaque utilisateur (Tasks + Goals)
const DEFAULT_CATEGORIES = [
  // Catégories Tasks
  { id: 'cat-professional', name: 'Professionnel', icon: 'Briefcase', color: 'slate', type: 'task' },
  { id: 'cat-personal', name: 'Personnel', icon: 'Heart', color: 'rose', type: 'task' },
  { id: 'cat-sport-task', name: 'Sport (Tâches)', icon: 'Dumbbell', color: 'emerald', type: 'task' },
  { id: 'cat-education', name: 'Éducation', icon: 'BookOpen', color: 'blue', type: 'task' },
  { id: 'cat-spirituality', name: 'Spiritualité', icon: 'Sparkles', color: 'amber', type: 'task' },
  { id: 'cat-health', name: 'Santé', icon: 'Activity', color: 'red', type: 'task' },
  { id: 'cat-finance-task', name: 'Finance (Tâches)', icon: 'Wallet', color: 'green', type: 'task' },
  { id: 'cat-social', name: 'Social', icon: 'Users', color: 'cyan', type: 'task' },
  { id: 'cat-creative', name: 'Créatif', icon: 'Palette', color: 'purple', type: 'task' },
  { id: 'cat-travel', name: 'Voyage', icon: 'Plane', color: 'indigo', type: 'task' },
  
  // Catégories Goals (spécifiques aux objectifs)
  { id: 'cat-perso', name: 'Perso (Objectif)', icon: 'Heart', color: 'rose', type: 'goal' },
  { id: 'cat-gestion', name: 'Gestion', icon: 'Settings', color: 'slate', type: 'goal' },
  { id: 'cat-competences', name: 'Compétences', icon: 'BookOpen', color: 'violet', type: 'goal' },
  { id: 'cat-sport', name: 'Sport (Objectif)', icon: 'Dumbbell', color: 'emerald', type: 'goal' },
  { id: 'cat-spirit', name: 'Spirit (Objectif)', icon: 'Sparkles', color: 'indigo', type: 'goal' },
  { id: 'cat-alimentation', name: 'Alimentation', icon: 'Utensils', color: 'teal', type: 'goal' },
  { id: 'cat-financier', name: 'Financier', icon: 'Wallet', color: 'yellow', type: 'goal' },
  { id: 'cat-relations', name: 'Relations', icon: 'Users', color: 'rose', type: 'goal' },
  { id: 'cat-creatif', name: 'Créatif (Objectif)', icon: 'Palette', color: 'purple', type: 'goal' },
];

// Archétypes Spirit
const SPIRIT_ARCHETYPES = ['psychologue', 'ami', 'stoicien'];

// Helper pour générer des IDs uniques
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

async function main() {
  console.log('🌱 MindLife - Seed complet');
  console.log('==========================\n');

  const today = new Date();

  // ============================================
  // 1. CRÉER L'UTILISATEUR PRINCIPAL
  // ============================================
  console.log('👤 Création de l\'utilisateur principal...');

  const mainUser = await prisma.user.upsert({
    where: { id: 'mindlife-user' },
    update: {
      name: 'Mindlife',
      email: 'mindlife-user@mindlife.app',
      role: 'admin',
      timezone: 'Europe/Paris',
      activityLevel: 'moderate',
      sportLevel: 'intermediate',
      weight: 75,
      height: 180,
      targetCalories: 2200,
      proteinTarget: 150,
      carbsTarget: 250,
      fatTarget: 75,
    },
    create: {
      id: 'mindlife-user',
      email: 'mindlife-user@mindlife.app',
      name: 'Mindlife',
      role: 'admin',
      timezone: 'Europe/Paris',
      activityLevel: 'moderate',
      sportLevel: 'intermediate',
      dietaryPreferences: '[]',
      allergies: '[]',
      favoriteCuisines: '[]',
      preferredSports: '[]',
      weight: 75,
      height: 180,
      targetCalories: 2200,
      proteinTarget: 150,
      carbsTarget: 250,
      fatTarget: 75,
    },
  });

  console.log(`   ✅ Utilisateur: ${mainUser.name} (${mainUser.role})`);

  // ============================================
  // 2. CRÉER LES CATÉGORIES
  // ============================================
  console.log('\n📁 Création des catégories...');

  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
      },
      create: {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
        userId: mainUser.id,
      },
    });
  }

  console.log(`   ✅ ${DEFAULT_CATEGORIES.length} catégories créées`);

  // ============================================
  // 3. CRÉER LE PROFIL SPORT
  // ============================================
  console.log('\n🏋️ Création du profil sport...');

  const sportProfile = await prisma.sportProfile.upsert({
    where: { userId: mainUser.id },
    update: {
      level: 'intermediate',
      goals: JSON.stringify(['force', 'endurance']),
      preferredSports: JSON.stringify(['Musculation', 'Running', 'Natation']),
    },
    create: {
      id: 'sport-profile-main',
      userId: mainUser.id,
      level: 'intermediate',
      goals: JSON.stringify(['force', 'endurance']),
      preferredSports: JSON.stringify(['Musculation', 'Running', 'Natation']),
    },
  });

  console.log(`   ✅ Profil sport: ${sportProfile.level}`);

  // ============================================
  // 4. CRÉER UN PROGRAMME HEBDOMADAIRE PAR DÉFAUT
  // ============================================
  console.log('\n📅 Création du programme sportif...');

  const weekNumber = getWeekNumber(today);

  const weeklyProgram = await prisma.weeklyProgram.upsert({
    where: { id: 'program-default' },
    update: {},
    create: {
      id: 'program-default',
      profileId: sportProfile.id,
      name: `Semaine ${weekNumber}`,
      weekNumber: weekNumber,
      year: today.getFullYear(),
      isActive: true,
    },
  });

  // Jours de la semaine avec workouts
  const programDays = [
    { id: 'program-day-0', dayOfWeek: 0, name: 'POUSSÉE FORCE', type: 'workout', intensity: 85 },
    { id: 'program-day-1', dayOfWeek: 1, name: 'TIRAGE FORCE', type: 'workout', intensity: 75 },
    { id: 'program-day-2', dayOfWeek: 2, name: 'JAMBES VOLUME', type: 'workout', intensity: 80 },
    { id: 'program-day-3', dayOfWeek: 3, name: 'ÉPAULES / ABS', type: 'workout', intensity: 70 },
    { id: 'program-day-4', dayOfWeek: 4, name: 'BRAS DENSITÉ', type: 'workout', intensity: 65 },
    { id: 'program-day-5', dayOfWeek: 5, name: 'CARDIO HIIT', type: 'workout', intensity: 60 },
    { id: 'program-day-6', dayOfWeek: 6, name: 'REPOS', type: 'rest', intensity: 0 },
  ];

  for (const day of programDays) {
    const existingDay = await prisma.programDay.findFirst({
      where: { programId: weeklyProgram.id, dayOfWeek: day.dayOfWeek }
    });

    if (!existingDay) {
      await prisma.programDay.create({
        data: {
          id: day.id,
          programId: weeklyProgram.id,
          dayOfWeek: day.dayOfWeek,
          name: day.name,
          type: day.type,
          intensity: day.intensity,
        },
      });
    }
  }

  console.log(`   ✅ Programme: ${weeklyProgram.name}`);

  // ============================================
  // 5. CRÉER DES CONVERSATIONS SPIRIT
  // ============================================
  console.log('\n✨ Création des conversations Spirit...');

  for (const [index, archetype] of SPIRIT_ARCHETYPES.entries()) {
    const existingConv = await prisma.spiritConversation.findFirst({
      where: { userId: mainUser.id, archetype }
    });

    if (!existingConv) {
      const greetings: Record<string, string> = {
        psychologue: "Bonjour. Je suis là pour t'écouter. Qu'est-ce qui t'amène aujourd'hui ?",
        ami: "Hey ! Ça fait plaisir. Comment ça va ?",
        stoicien: "\"Considère que tout ce qui t'arrive est nécessaire à l'harmonie du Tout.\" Quelle pensée occupe ton esprit en cet instant ?",
      };

      const conversation = await prisma.spiritConversation.create({
        data: {
          id: `spirit-conv-${index}`,
          userId: mainUser.id,
          archetype,
          title: `Conversation ${archetype}`,
        },
      });

      await prisma.spiritMessage.create({
        data: {
          id: `spirit-msg-${index}-0`,
          conversationId: conversation.id,
          role: 'assistant',
          content: greetings[archetype],
        },
      });
    }
  }

  console.log(`   ✅ ${SPIRIT_ARCHETYPES.length} conversations créées`);

  // ============================================
  // 6. CRÉER DES HABITUDES PAR DÉFAUT
  // ============================================
  console.log('\n🔄 Création des habitudes...');

  const defaultHabits = [
    { id: 'habit-1', name: 'Méditation matinale', description: '10 min de méditation', frequency: 'daily', color: 'amber', icon: '🧘' },
    { id: 'habit-2', name: 'Lecture', description: '30 min de lecture', frequency: 'daily', color: 'blue', icon: '📚' },
    { id: 'habit-3', name: 'Sport', description: 'Séance d\'entraînement', frequency: 'weekly', color: 'emerald', icon: '💪' },
    { id: 'habit-4', name: 'Hydratation', description: 'Boire 2L d\'eau', frequency: 'daily', color: 'cyan', icon: '💧' },
    { id: 'habit-5', name: 'Sommeil', description: 'Dormir 7-8h', frequency: 'daily', color: 'violet', icon: '😴' },
  ];

  for (const habit of defaultHabits) {
    const existing = await prisma.habit.findFirst({
      where: { userId: mainUser.id, name: habit.name }
    });

    if (!existing) {
      await prisma.habit.create({
        data: {
          id: habit.id,
          name: habit.name,
          description: habit.description,
          frequency: habit.frequency,
          color: habit.color,
          icon: habit.icon,
          userId: mainUser.id,
          isActive: true,
        },
      });
    }
  }

  console.log(`   ✅ ${defaultHabits.length} habitudes créées`);

  // ============================================
  // 7. CRÉER DES TÂCHES
  // ============================================
  console.log('\n📋 Création des tâches...');

  const defaultTasks = [
    { id: 'task-1', title: 'Finaliser le design du dashboard', status: 'in_progress', priority: 'high', progress: 60 },
    { id: 'task-2', title: 'Implémenter la synchronisation calendrier', status: 'pending', priority: 'high', progress: 0 },
    { id: 'task-3', title: 'Créer les tests unitaires', status: 'pending', priority: 'medium', progress: 0 },
    { id: 'task-4', title: 'Optimiser les performances', status: 'completed', priority: 'medium', progress: 100 },
    { id: 'task-5', title: 'Documenter l\'API', status: 'in_progress', priority: 'low', progress: 30 },
    { id: 'task-6', title: 'Intégrer le système de notifications', status: 'pending', priority: 'high', progress: 0 },
    { id: 'task-7', title: 'Préparer la présentation client', status: 'in_progress', priority: 'high', progress: 45 },
    { id: 'task-8', title: 'Réviser le code de la page nutrition', status: 'pending', priority: 'medium', progress: 0 },
  ];

  const professionalCategory = await prisma.category.findFirst({
    where: { userId: mainUser.id, name: 'Professionnel' }
  });

  for (const task of defaultTasks) {
    const existing = await prisma.task.findFirst({
      where: { userId: mainUser.id, title: task.title }
    });

    if (!existing) {
      await prisma.task.create({
        data: {
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          progress: task.progress,
          userId: mainUser.id,
          categoryId: professionalCategory?.id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
        },
      });
    }
  }

  console.log(`   ✅ ${defaultTasks.length} tâches créées`);

  // ============================================
  // 8. CRÉER DES ÉVÉNEMENTS CALENDRIER
  // ============================================
  console.log('\n📅 Création des événements calendrier...');
  const defaultEvents = [
    {
      id: 'event-1',
      title: 'Réunion équipe MindLife',
      description: 'Point hebdomadaire sur l\'avancement',
      startAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      endAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
      color: 'blue',
    },
    {
      id: 'event-2',
      title: 'Séance Sport - Musculation',
      description: 'Programme poussée force',
      startAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0),
      endAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 30),
      color: 'emerald',
    },
    {
      id: 'event-3',
      title: 'Méditation matinale',
      description: 'Session de 20 minutes',
      startAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 7, 0),
      endAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 7, 20),
      color: 'amber',
    },
    {
      id: 'event-4',
      title: 'Call client important',
      description: 'Présentation des nouvelles fonctionnalités',
      startAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
      endAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 0),
      color: 'red',
    },
    {
      id: 'event-5',
      title: 'Rendez-vous médical',
      description: 'Check-up annuel',
      startAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 9, 0),
      endAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0),
      color: 'rose',
    },
    {
      id: 'event-6',
      title: 'Formation React avancé',
      description: 'Module sur les hooks personnalisés',
      startAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 0),
      endAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 30),
      color: 'cyan',
    },
    {
      id: 'event-7',
      title: 'Dîner avec Marie',
      description: 'Restaurant italien',
      startAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 19, 30),
      endAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 22, 0),
      color: 'purple',
    },
    {
      id: 'event-8',
      title: 'Séance Running',
      description: '10km footing',
      startAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 7, 0),
      endAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 8, 0),
      color: 'emerald',
    },
    {
      id: 'event-9',
      title: 'Brainstorming features',
      description: 'Nouvelles idées pour Q2',
      startAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 10, 0),
      endAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 12, 0),
      color: 'indigo',
    },
    {
      id: 'event-10',
      title: 'Yoga & Stretching',
      description: 'Récupération active',
      startAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 8, 0),
      endAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 9, 0),
      color: 'amber',
    },
  ];

  for (const event of defaultEvents) {
    const existing = await prisma.event.findFirst({
      where: { userId: mainUser.id, title: event.title }
    });

    if (!existing) {
      await prisma.event.create({
        data: {
          id: event.id,
          title: event.title,
          description: event.description,
          startAt: event.startAt,
          endAt: event.endAt,
          color: event.color,
          userId: mainUser.id,
          isAllDay: false,
        },
      });
    }
  }

  console.log(`   ✅ ${defaultEvents.length} événements créés`);

  // ============================================
  // 9. CRÉER DES OBJECTIFS (pour la page Goals)
  // ============================================
  console.log('\n🎯 Création des objectifs...');

  const defaultGoals = [
    {
      id: 'goal-1',
      title: 'Perdre 5kg',
      description: 'Objectif de perte de poids pour améliorer ma santé et mon bien-être',
      status: 'active',
      priority: 'important',
      targetValue: 5,
      currentValue: 1.75,
      unit: 'kg',
      categoryId: 'cat-sport',
      milestones: JSON.stringify([
        { id: 'm1', title: 'Consultation nutritionniste', completed: true, order: 1 },
        { id: 'm2', title: 'Établir routine sportive 3x/semaine', completed: true, order: 2 },
        { id: 'm3', title: 'Perdre 2kg (étape 1)', completed: true, order: 3 },
        { id: 'm4', title: 'Perdre 3.5kg (étape 2)', completed: false, order: 4 },
        { id: 'm5', title: 'Atteindre 5kg (objectif final)', completed: false, order: 5 },
      ]),
    },
    {
      id: 'goal-2',
      title: 'Maîtriser React & Next.js',
      description: 'Devenir un développeur expert en React et Next.js avec une maîtrise complète des hooks, Server Components et patterns avancés',
      status: 'active',
      priority: 'important',
      targetValue: 100,
      currentValue: 72,
      unit: '%',
      categoryId: 'cat-competences',
      milestones: JSON.stringify([
        { id: 'm1', title: 'Comprendre les hooks de base', completed: true, order: 1 },
        { id: 'm2', title: 'Maîtriser Server Components', completed: true, order: 2 },
        { id: 'm3', title: 'Créer une application complète', completed: true, order: 3 },
        { id: 'm4', title: 'Optimiser les performances', completed: false, order: 4 },
        { id: 'm5', title: 'Déployer en production', completed: false, order: 5 },
      ]),
    },
    {
      id: 'goal-3',
      title: 'Méditation quotidienne',
      description: 'Pratiquer la méditation 10 minutes par jour pendant 30 jours consécutifs',
      status: 'active',
      priority: 'a_planifier',
      targetValue: 30,
      currentValue: 12,
      unit: 'jours',
      categoryId: 'cat-spirit',
      milestones: JSON.stringify([
        { id: 'm1', title: '7 jours consécutifs', completed: true, order: 1 },
        { id: 'm2', title: '14 jours consécutifs', completed: false, order: 2 },
        { id: 'm3', title: '21 jours consécutifs', completed: false, order: 3 },
        { id: 'm4', title: '30 jours consécutifs', completed: false, order: 4 },
      ]),
    },
    {
      id: 'goal-4',
      title: 'Économiser 3000€',
      description: 'Constituer une épargne de sécurité pour les imprévus',
      status: 'active',
      priority: 'urgent',
      targetValue: 3000,
      currentValue: 1200,
      unit: '€',
      categoryId: 'cat-financier',
      milestones: JSON.stringify([
        { id: 'm1', title: 'Ouvrir compte épargne', completed: true, order: 1 },
        { id: 'm2', title: 'Épargner 1000€', completed: true, order: 2 },
        { id: 'm3', title: 'Épargner 2000€', completed: false, order: 3 },
        { id: 'm4', title: 'Atteindre 3000€', completed: false, order: 4 },
      ]),
    },
    {
      id: 'goal-5',
      title: 'Lire 24 livres cette année',
      description: 'Développer ma culture générale et mes compétences via la lecture régulière',
      status: 'active',
      priority: 'a_planifier',
      targetValue: 24,
      currentValue: 6,
      unit: 'livres',
      categoryId: 'cat-competences',
      milestones: JSON.stringify([
        { id: 'm1', title: '6 livres Q1', completed: true, order: 1 },
        { id: 'm2', title: '6 livres Q2', completed: false, order: 2 },
        { id: 'm3', title: '6 livres Q3', completed: false, order: 3 },
        { id: 'm4', title: '6 livres Q4', completed: false, order: 4 },
      ]),
    },
    {
      id: 'goal-6',
      title: 'Courir un semi-marathon',
      description: 'Préparer et terminer un semi-marathon (21km) d\'ici 6 mois',
      status: 'active',
      priority: 'important',
      targetValue: 21,
      currentValue: 10,
      unit: 'km',
      categoryId: 'cat-sport',
      milestones: JSON.stringify([
        { id: 'm1', title: 'Courir 5km sans pause', completed: true, order: 1 },
        { id: 'm2', title: 'Courir 10km sans pause', completed: true, order: 2 },
        { id: 'm3', title: 'Courir 15km', completed: false, order: 3 },
        { id: 'm4', title: 'Terminer le semi-marathon', completed: false, order: 4 },
      ]),
    },
  ];

  for (const goal of defaultGoals) {
    const existing = await prisma.goal.findFirst({
      where: { userId: mainUser.id, title: goal.title }
    });

    if (!existing) {
      await prisma.goal.create({
        data: {
          id: goal.id,
          title: goal.title,
          description: goal.description,
          status: goal.status,
          priority: goal.priority,
          targetValue: goal.targetValue,
          currentValue: goal.currentValue,
          unit: goal.unit,
          categoryId: goal.categoryId,
          milestones: goal.milestones,
          userId: mainUser.id,
          startDate: new Date(today.getFullYear(), today.getMonth(), 1),
          endDate: goal.priority === 'urgent' 
            ? new Date(today.getFullYear(), today.getMonth() + 1, 0)
            : new Date(today.getFullYear(), today.getMonth() + 6, 0),
        },
      });
    }
  }

  console.log(`   ✅ ${defaultGoals.length} objectifs créés`);

  // ============================================
  // 10. CRÉER DES NOTES
  // ============================================
  console.log('\n📝 Création des notes...');

  const defaultNotes = [
    { id: 'note-1', title: 'Idées pour MindLife', content: '1. Intégrer une fonctionnalité de statistiques avancées\n2. Ajouter un mode sombre/clair\n3. Créer une application mobile', type: 'text', isPinned: true },
    { id: 'note-2', title: 'Liste de courses', content: '- Légumes frais\n- Protéines (poulet, poisson)\n- Fruits\n- Produits laitiers', type: 'text', isPinned: false },
    { id: 'note-3', title: 'Objectifs Q2', content: '- Finaliser la version 2.0\n- Atteindre 1000 utilisateurs\n- Lancer la fonctionnalité premium', type: 'text', isPinned: false },
  ];

  for (const note of defaultNotes) {
    const existing = await prisma.note.findFirst({
      where: { userId: mainUser.id, title: note.title }
    });

    if (!existing) {
      await prisma.note.create({
        data: {
          id: note.id,
          title: note.title,
          content: note.content,
          type: note.type,
          isPinned: note.isPinned,
          userId: mainUser.id,
          categoryId: professionalCategory?.id,
        },
      });
    }
  }

  console.log(`   ✅ ${defaultNotes.length} notes créées`);

  // ============================================
  // 11. CRÉER DES ENTRÉES JOURNAL
  // ============================================
  console.log('\n📔 Création des entrées journal...');

  const defaultJournalEntries = [
    {
      id: 'journal-1',
      title: 'Bonne journée productive',
      content: 'Aujourd\'hui j\'ai réussi à terminer plusieurs tâches importantes. Je me sens motivé et plein d\'énergie.',
      mood: 'great',
      gratitude: 'Je suis reconnaissant pour ma famille et mes amis qui me soutiennent.',
      wins: 'Finalisation du dashboard, sport fait, méditation complète',
      challenges: 'Gérer le temps entre travail et vie personnelle',
    },
    {
      id: 'journal-2',
      title: 'Réflexion du week-end',
      content: 'Un week-end calme et reposant. J\'ai pu lire un bon livre et me promener dans la nature.',
      mood: 'good',
      gratitude: 'La nature et les moments de calme',
      wins: 'Lecture, marche, temps en famille',
      challenges: 'Reprendre le rythme lundi',
    },
  ];

  for (const entry of defaultJournalEntries) {
    const existing = await prisma.journalEntry.findFirst({
      where: { userId: mainUser.id, title: entry.title }
    });

    if (!existing) {
      await prisma.journalEntry.create({
        data: {
          id: entry.id,
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          gratitude: entry.gratitude,
          wins: entry.wins,
          challenges: entry.challenges,
          userId: mainUser.id,
        },
      });
    }
  }

  console.log(`   ✅ ${defaultJournalEntries.length} entrées journal créées`);

  // ============================================
  // 12. CRÉER DES REPAS (NUTRITION)
  // ============================================
  console.log('\n🍽️ Création des repas...');

  const defaultMeals = [
    {
      id: 'meal-1',
      name: 'Petit-déjeuner équilibré',
      description: 'Flocons d\'avoine avec fruits rouges et miel',
      type: 'breakfast',
      date: today,
      calories: 450,
      protein: 15,
      carbs: 65,
      fat: 12,
    },
    {
      id: 'meal-2',
      name: 'Déjeuner protéiné',
      description: 'Poulet grillé avec riz et légumes verts',
      type: 'lunch',
      date: today,
      calories: 650,
      protein: 45,
      carbs: 55,
      fat: 18,
    },
    {
      id: 'meal-3',
      name: 'Dîner léger',
      description: 'Salade méditerranéenne avec feta et olives',
      type: 'dinner',
      date: today,
      calories: 380,
      protein: 18,
      carbs: 25,
      fat: 22,
    },
  ];

  for (const meal of defaultMeals) {
    const existing = await prisma.meal.findFirst({
      where: { userId: mainUser.id, name: meal.name, date: meal.date }
    });

    if (!existing) {
      await prisma.meal.create({
        data: {
          id: meal.id,
          userId: mainUser.id,
          name: meal.name,
          description: meal.description,
          type: meal.type,
          date: meal.date,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
        },
      });
    }
  }

  console.log(`   ✅ ${defaultMeals.length} repas créés`);

  // ============================================
  // 13. CRÉER LE PROFIL NUTRITION
  // ============================================
  console.log('\n🥗 Création du profil nutrition...');

  const nutritionProfile = await prisma.nutritionProfile.upsert({
    where: { userId: mainUser.id },
    update: {
      weight: 75,
      height: 180,
      age: 30,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'maintain',
      bmr: 1750,
      tdee: 2700,
      imc: 23.1,
      targetCalories: 2200,
      protein: 150,
      carbs: 250,
      fat: 75,
    },
    create: {
      id: 'nutrition-profile-main',
      userId: mainUser.id,
      weight: 75,
      height: 180,
      age: 30,
      gender: 'male',
      activityLevel: 'moderate',
      goal: 'maintain',
      dietaryPreferences: '[]',
      allergies: '[]',
      favoriteCuisines: '[]',
      bmr: 1750,
      tdee: 2700,
      imc: 23.1,
      targetCalories: 2200,
      protein: 150,
      carbs: 250,
      fat: 75,
    },
  });

  console.log(`   ✅ Profil nutrition: ${nutritionProfile.targetCalories} kcal/jour`);

  // ============================================
  // RÉSUMÉ
  // ============================================
  console.log('\n');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║                                            ║');
  console.log('║      🎉 SEED COMPLET TERMINÉ !            ║');
  console.log('║                                            ║');
  console.log('╚════════════════════════════════════════════╝');
  const taskCount = await prisma.task.count({ where: { userId: mainUser.id } });
  const eventCount = await prisma.event.count({ where: { userId: mainUser.id } });
  const goalCount = await prisma.goal.count({ where: { userId: mainUser.id } });
  const habitCount = await prisma.habit.count({ where: { userId: mainUser.id } });
  const noteCount = await prisma.note.count({ where: { userId: mainUser.id } });
  const journalCount = await prisma.journalEntry.count({ where: { userId: mainUser.id } });
  const mealCount = await prisma.meal.count({ where: { userId: mainUser.id } });

  console.log('\n📊 Résumé:');
  console.log(`   - Utilisateur: ${mainUser.email}`);
  console.log(`   - Catégories: ${DEFAULT_CATEGORIES.length}`);
  console.log(`   - Profil sport: ${sportProfile.level}`);
  console.log(`   - Programme: Semaine ${weekNumber}`);
  console.log(`   - Conversations Spirit: ${SPIRIT_ARCHETYPES.length}`);
  console.log(`   - Tâches: ${taskCount}`);
  console.log(`   - Événements: ${eventCount}`);
  console.log(`   - Objectifs: ${goalCount}`);
  console.log(`   - Habitudes: ${habitCount}`);
  console.log(`   - Notes: ${noteCount}`);
  console.log(`   - Journal: ${journalCount}`);
  console.log(`   - Repas: ${mealCount}`);
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
