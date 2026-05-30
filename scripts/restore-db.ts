#!/usr/bin/env bun
/**
 * Script de restauration de la base de données
 * Usage: bun run scripts/restore-db.ts [backup-file]
 * Sans argument: liste les backups disponibles
 */

import { copyFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const DB_PATH = './db/custom.db';
const BACKUP_DIR = './backups';

function listBackups() {
  if (!existsSync(BACKUP_DIR)) {
    console.log('❌ Aucun dossier de backup trouvé');
    return [];
  }

  const files = readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('dev-db-') && f.endsWith('.db'))
    .map(f => ({
      name: f,
      path: join(BACKUP_DIR, f),
      time: statSync(join(BACKUP_DIR, f)).mtime
    }))
    .sort((a, b) => b.time.getTime() - a.time.getTime());

  return files;
}

function restoreDatabase(backupFile?: string) {
  const backups = listBackups();

  if (backups.length === 0) {
    console.log('❌ Aucun backup disponible');
    return;
  }

  // Si aucun fichier spécifié, afficher la liste
  if (!backupFile) {
    console.log('\n📦 Backups disponibles:');
    console.log('Usage: bun run scripts/restore-db.ts <filename>\n');
    backups.forEach((f, i) => {
      const size = (statSync(f.path).size / 1024).toFixed(1);
      console.log(`  ${i + 1}. ${f.name} (${size} KB) - ${f.time.toLocaleString('fr-FR')}`);
    });
    console.log('\n💡 Exemple: bun run scripts/restore-db.ts dev-db-2026-03-01T12-30-00.db');
    return;
  }

  const backupPath = join(BACKUP_DIR, backupFile);

  if (!existsSync(backupPath)) {
    console.log('❌ Backup non trouvé:', backupPath);
    return;
  }

  try {
    // Sauvegarder la base actuelle avant restauration
    if (existsSync(DB_PATH)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const preRestoreBackup = join(BACKUP_DIR, `pre-restore-${timestamp}.db`);
      copyFileSync(DB_PATH, preRestoreBackup);
      console.log('💾 Base actuelle sauvegardée:', preRestoreBackup);
    }

    // Restaurer
    copyFileSync(backupPath, DB_PATH);
    console.log('✅ Base restaurée depuis:', backupFile);
    console.log('⚠️ Redémarrez le serveur pour appliquer les changements');
  } catch (error) {
    console.error('❌ Erreur lors de la restauration:', error);
  }
}

// Exécuter
const args = process.argv.slice(2);
restoreDatabase(args[0]);
