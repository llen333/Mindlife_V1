#!/usr/bin/env bun
/**
 * Script de sauvegarde automatique de la base de données
 * Usage: bun run scripts/backup-db.ts
 * 
 * Options:
 *   --force   Force le backup même s'il y en a un récent
 */

import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';

const DB_PATH = './db/custom.db';
const BACKUP_DIR = './backups';
const MAX_BACKUPS = 10; // Garder les 10 derniers backups
const MIN_INTERVAL = 1 * 60 * 60 * 1000; // 1 heure minimum entre les backups (en ms)

function backupDatabase(force: boolean = false) {
  // Vérifier que la base existe
  if (!existsSync(DB_PATH)) {
    console.log('❌ Base de données non trouvée:', DB_PATH);
    return;
  }

  // Créer le dossier de backup
  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // Vérifier s'il y a un backup récent
  if (!force) {
    const recentBackup = getRecentBackup();
    if (recentBackup) {
      const age = Date.now() - recentBackup.time;
      const ageMinutes = Math.round(age / 60000);
      console.log(`⏭️ Backup récent trouvé (${ageMinutes} min), pas besoin d'un nouveau`);
      return;
    }
  }

  // Générer le nom du fichier avec timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFile = join(BACKUP_DIR, `dev-db-${timestamp}.db`);

  // Copier la base
  try {
    copyFileSync(DB_PATH, backupFile);
    console.log('✅ Backup créé:', backupFile);

    // Nettoyer les anciens backups
    cleanOldBackups();
  } catch (error) {
    console.error('❌ Erreur lors du backup:', error);
  }
}

function getRecentBackup(): { name: string; time: number } | null {
  if (!existsSync(BACKUP_DIR)) return null;

  const files = readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('dev-db-') && f.endsWith('.db'))
    .map(f => ({
      name: f,
      time: statSync(join(BACKUP_DIR, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  if (files.length === 0) return null;

  const latestFile = files[0];
  const age = Date.now() - latestFile.time;

  // Si le backup a moins de MIN_INTERVAL, on le considère comme récent
  if (age < MIN_INTERVAL) {
    return latestFile;
  }

  return null;
}

function cleanOldBackups() {
  const files = readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('dev-db-') && f.endsWith('.db'))
    .map(f => ({
      name: f,
      path: join(BACKUP_DIR, f),
      time: statSync(join(BACKUP_DIR, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  // Supprimer les anciens backups
  if (files.length > MAX_BACKUPS) {
    files.slice(MAX_BACKUPS).forEach(f => {
      unlinkSync(f.path);
      console.log('🗑️ Ancien backup supprimé:', f.name);
    });
  }
}

function listBackups() {
  if (!existsSync(BACKUP_DIR)) {
    console.log('📦 Aucun backup disponible');
    return;
  }

  const files = readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('dev-db-') && f.endsWith('.db'))
    .map(f => ({
      name: f,
      time: statSync(join(BACKUP_DIR, f)).mtime
    }))
    .sort((a, b) => b.time.getTime() - a.time.getTime());

  if (files.length === 0) {
    console.log('📦 Aucun backup disponible');
    return;
  }

  console.log('\n📦 Backups disponibles:');
  files.forEach((f, i) => {
    const size = (statSync(join(BACKUP_DIR, f.name)).size / 1024).toFixed(1);
    console.log(`  ${i + 1}. ${f.name} (${size} KB) - ${f.time.toLocaleString('fr-FR')}`);
  });
}

// Vérifier les arguments
const args = process.argv.slice(2);
const force = args.includes('--force');

// Exécuter
if (args.includes('--list')) {
  listBackups();
} else {
  backupDatabase(force);
}
