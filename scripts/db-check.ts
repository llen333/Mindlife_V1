// Script pour vérifier l'état de la base de données
// Lancer avec: bun run db:check

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Vérification de la base de données...\n');
  console.log('========================================\n');

  // Compter les enregistrements
  const users = await prisma.user.count();
  const categories = await prisma.category.count();
  const tasks = await prisma.task.count();
  const events = await prisma.event.count();
  const goals = await prisma.goal.count();
  const habits = await prisma.habit.count();
  const meals = await prisma.meal.count();
  const notes = await prisma.note.count();
  const journalEntries = await prisma.journalEntry.count();
  const spiritConversations = await prisma.spiritConversation.count();
  const sportProfiles = await prisma.sportProfile.count();

  // Afficher les résultats
  console.log('📊 CONTENU DE LA BASE DE DONNÉES:\n');
  console.log(`👥 Utilisateurs:      ${users}`);
  console.log(`📁 Catégories:       ${categories}`);
  console.log(`📋 Tâches:           ${tasks}`);
  console.log(`📅 Événements:       ${events}`);
  console.log(`🎯 Objectifs:        ${goals}`);
  console.log(`🔄 Habitudes:        ${habits}`);
  console.log(`🍽️  Repas:            ${meals}`);
  console.log(`📝 Notes:            ${notes}`);
  console.log(`📔 Entrées journal:  ${journalEntries}`);
  console.log(`💬 Conversations:    ${spiritConversations}`);
  console.log(`🏋️  Profils sport:    ${sportProfiles}`);

  console.log('\n========================================');

  // Vérifier l'utilisateur principal
  const mainUser = await prisma.user.findUnique({
    where: { id: 'mindlife-user' }
  });

  if (mainUser) {
    console.log('\n✅ Utilisateur principal trouvé:');
    console.log(`   ID:    ${mainUser.id}`);
    console.log(`   Nom:   ${mainUser.name}`);
    console.log(`   Email: ${mainUser.email}`);
    console.log(`   Rôle:  ${mainUser.role}`);
  } else {
    console.log('\n⚠️  Utilisateur principal (mindlife-user) non trouvé');
    console.log('   Lancez: bun run db:seed');
  }

  // Vérifier si la DB est vide
  const totalRecords = users + categories + tasks + events + goals + habits;
  
  console.log('\n========================================');
  if (totalRecords === 0) {
    console.log('⚠️  BASE DE DONNÉES VIDE');
    console.log('   Pour peupler: bun run db:seed');
    console.log('   Pour réinitialiser: bun run db:fresh');
  } else if (tasks === 0 || goals === 0) {
    console.log('⚠️  BASE DE DONNÉES PARTIELLEMENT VIDE');
    console.log('   Pour compléter: bun run db:seed');
  } else {
    console.log('✅ BASE DE DONNÉES PEUPLÉE');
  }
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
