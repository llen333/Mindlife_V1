#!/usr/bin/env bun
/**
 * ============================================
 * SAUVEGARDE DÉVELOPPEMENT - MindLife
 * ============================================
 * Ce script sauvegarde TOUTES les données dans un fichier JSON
 * Indépendant de la DB SQLite
 * 
 * Usage:
 *   bun run scripts/dev-backup.ts          # Sauvegarder
 *   bun run scripts/dev-backup.ts restore  # Restaurer
 *   bun run scripts/dev-backup.ts status   # Vérifier
 *   bun run scripts/dev-backup.ts auto     # Auto-check au démarrage
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { db } from '../src/lib/db';

const DEV_DATA_DIR = './dev-data';
const DEV_DATA_FILE = join(DEV_DATA_DIR, 'mindlife-dev-backup.json');

interface DevBackup {
  version: string;
  timestamp: string;
  users: any[];
  categories: any[];
  tasks: any[];
  goals: any[];
  notes: any[];
  events: any[];
  habits: any[];
  habitLogs: any[];
  journalEntries: any[];
  sportProfiles: any[];
  nutritionProfiles: any[];
  meals: any[];
}

async function backupAllData() {
  console.log('\n💾 === SAUVEGARDE DÉVELOPPEMENT ===\n');
  
  try {
    const backup: DevBackup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      users: await db.user.findMany(),
      categories: await db.category.findMany(),
      tasks: await db.task.findMany(),
      goals: await db.goal.findMany(),
      notes: await db.note.findMany(),
      events: await db.event.findMany(),
      habits: await db.habit.findMany(),
      habitLogs: await db.habitLog.findMany(),
      journalEntries: await db.journalEntry.findMany(),
      sportProfiles: await db.sportProfile.findMany(),
      nutritionProfiles: await db.nutritionProfile.findMany(),
      meals: await db.meal.findMany(),
    };

    // Créer le dossier
    if (!existsSync(DEV_DATA_DIR)) {
      mkdirSync(DEV_DATA_DIR, { recursive: true });
    }

    // Sauvegarder
    writeFileSync(DEV_DATA_FILE, JSON.stringify(backup, null, 2));
    
    console.log('✅ Données sauvegardées:');
    console.log(`   👤 Users: ${backup.users.length}`);
    console.log(`   📁 Catégories: ${backup.categories.length}`);
    console.log(`   ✅ Tasks: ${backup.tasks.length}`);
    console.log(`   🎯 Goals: ${backup.goals.length}`);
    console.log(`   📝 Notes: ${backup.notes.length}`);
    console.log(`   📅 Events: ${backup.events.length}`);
    console.log(`   🔥 Habits: ${backup.habits.length}`);
    console.log(`   📖 Journal: ${backup.journalEntries.length}`);
    console.log(`\n📦 Fichier: ${DEV_DATA_FILE}`);
    
    return backup;
  } catch (error) {
    console.error('❌ Erreur sauvegarde:', error);
    throw error;
  }
}

async function restoreAllData() {
  console.log('\n🔄 === RESTAURATION DÉVELOPPEMENT ===\n');
  
  if (!existsSync(DEV_DATA_FILE)) {
    console.log('❌ Aucun fichier de sauvegarde trouvé:', DEV_DATA_FILE);
    return;
  }

  try {
    const backup: DevBackup = JSON.parse(readFileSync(DEV_DATA_FILE, 'utf-8'));
    
    console.log(`📅 Sauvegarde du: ${new Date(backup.timestamp).toLocaleString('fr-FR')}`);
    console.log(`   Users à restaurer: ${backup.users.length}`);
    console.log('');

    // Restaurer les users
    for (const user of backup.users) {
      try {
        await db.user.upsert({
          where: { id: user.id },
          update: user,
          create: user,
        });
        console.log(`   ✅ User: ${user.name || user.id}`);
      } catch (e) {
        console.log(`   ⚠️ User ${user.id}: déjà existant ou erreur`);
      }
    }

    // Restaurer les catégories
    for (const cat of backup.categories) {
      try {
        await db.category.upsert({
          where: { id: cat.id },
          update: cat,
          create: cat,
        });
      } catch (e) {
        // Ignore
      }
    }
    console.log(`   ✅ Catégories: ${backup.categories.length}`);

    // Restaurer les tasks
    for (const task of backup.tasks) {
      try {
        await db.task.upsert({
          where: { id: task.id },
          update: task,
          create: task,
        });
      } catch (e) {
        // Ignore
      }
    }
    console.log(`   ✅ Tasks: ${backup.tasks.length}`);

    // Restaurer les events
    for (const event of backup.events) {
      try {
        await db.event.upsert({
          where: { id: event.id },
          update: event,
          create: event,
        });
      } catch (e) {
        // Ignore
      }
    }
    console.log(`   ✅ Events: ${backup.events.length}`);

    // Restaurer les goals
    for (const goal of backup.goals) {
      try {
        await db.goal.upsert({
          where: { id: goal.id },
          update: goal,
          create: goal,
        });
      } catch (e) {
        // Ignore
      }
    }
    console.log(`   ✅ Goals: ${backup.goals.length}`);

    // Restaurer les notes
    for (const note of backup.notes) {
      try {
        await db.note.upsert({
          where: { id: note.id },
          update: note,
          create: note,
        });
      } catch (e) {
        // Ignore
      }
    }
    console.log(`   ✅ Notes: ${backup.notes.length}`);

    // Restaurer les habits
    for (const habit of backup.habits) {
      try {
        await db.habit.upsert({
          where: { id: habit.id },
          update: habit,
          create: habit,
        });
      } catch (e) {
        // Ignore
      }
    }
    console.log(`   ✅ Habits: ${backup.habits.length}`);

    // Restaurer les journal entries
    for (const entry of backup.journalEntries) {
      try {
        await db.journalEntry.upsert({
          where: { id: entry.id },
          update: entry,
          create: entry,
        });
      } catch (e) {
        // Ignore
      }
    }
    console.log(`   ✅ Journal: ${backup.journalEntries.length}`);

    console.log('\n✅ Restauration terminée!');
    console.log('⚠️ Redémarre le serveur pour voir les changements');
    
  } catch (error) {
    console.error('❌ Erreur restauration:', error);
    throw error;
  }
}

async function showStatus() {
  console.log('\n📊 === STATUS DÉVELOPPEMENT ===\n');
  
  // DB Status
  const dbUsers = await db.user.count();
  const dbCategories = await db.category.count();
  const dbTasks = await db.task.count();
  const dbEvents = await db.event.count();
  
  console.log('📦 Base de données actuelle:');
  console.log(`   👤 Users: ${dbUsers}`);
  console.log(`   📁 Catégories: ${dbCategories}`);
  console.log(`   ✅ Tasks: ${dbTasks}`);
  console.log(`   📅 Events: ${dbEvents}`);
  
  // Backup status
  if (existsSync(DEV_DATA_FILE)) {
    const backup: DevBackup = JSON.parse(readFileSync(DEV_DATA_FILE, 'utf-8'));
    console.log('\n💾 Dernière sauvegarde:');
    console.log(`   📅 Date: ${new Date(backup.timestamp).toLocaleString('fr-FR')}`);
    console.log(`   👤 Users: ${backup.users.length}`);
    console.log(`   📁 Catégories: ${backup.categories.length}`);
    console.log(`   ✅ Tasks: ${backup.tasks.length}`);
    console.log(`   📅 Events: ${backup.events.length}`);
  } else {
    console.log('\n❌ Aucune sauvegarde trouvée');
    console.log('   Lance: bun run scripts/dev-backup.ts');
  }
}

async function autoCheck() {
  /**
   * Vérifie automatiquement si les données ont été perdues
   * et restaure si nécessaire. Utilisé au démarrage du serveur.
   * SUPPRIME AUSSI LE CACHE TURBOPACK CORROMPU
   */
  try {
    // 🔧 FIX: Supprimer le cache Turbopack corrompu
    const cachePaths = ['.next', 'node_modules/.cache'];
    
    for (const cachePath of cachePaths) {
      if (existsSync(cachePath)) {
        console.log(`🧹 Suppression du cache: ${cachePath}`);
        try {
          rmSync(cachePath, { recursive: true, force: true });
        } catch (e) {
          // Ignore errors
        }
      }
    }
    
    // Vérifier l'état de la DB
    const dbUsers = await db.user.count();
    const dbCategories = await db.category.count();
    
    // Vérifier si un backup existe
    if (!existsSync(DEV_DATA_FILE)) {
      // Pas de backup, créer une sauvegarde initiale
      if (dbUsers > 0 || dbCategories > 0) {
        console.log('💾 Création d\'une sauvegarde initiale...');
        await backupAllData();
      }
      return;
    }
    
    // Comparer avec le backup
    const backup: DevBackup = JSON.parse(readFileSync(DEV_DATA_FILE, 'utf-8'));
    const backupUsers = backup.users?.length || 0;
    const backupCategories = backup.categories?.length || 0;
    
    // Si la DB a moins de données que le backup, proposer restauration
    if (dbUsers < backupUsers || dbCategories < backupCategories) {
      console.log('\n⚠️ === DONNÉES PERDUES DÉTECTÉES ===');
      console.log(`   DB: ${dbUsers} users, ${dbCategories} catégories`);
      console.log(`   Backup: ${backupUsers} users, ${backupCategories} catégories`);
      console.log('🔄 Restauration automatique...\n');
      await restoreAllData();
    } else {
      // Tout est OK, mettre à jour le backup
      await backupAllData();
    }
  } catch (error) {
    // En cas d'erreur, continuer sans bloquer le démarrage
    console.log('⚠️ Auto-check ignoré:', error);
  }
}

// Exécuter
const args = process.argv.slice(2);
const command = args[0] || 'backup';

(async () => {
  try {
    if (command === 'restore') {
      await restoreAllData();
    } else if (command === 'status') {
      await showStatus();
    } else if (command === 'auto') {
      await autoCheck();
    } else {
      await backupAllData();
    }
    await db.$disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
