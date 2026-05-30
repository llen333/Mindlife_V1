// ════════════════════════════════════════════════════════════════
// MindLife - Script de Backup Complet
// ════════════════════════════════════════════════════════════════
// Crée une archive tar.gz avec tout le code source
// Usage: bun run scripts/create-backup.ts
// ════════════════════════════════════════════════════════════════

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = '/home/z/my-project';
const DOWNLOAD_DIR = path.join(PROJECT_ROOT, 'download');

// Date format for filename
const now = new Date();
const dateStr = now.toISOString().split('T')[0]; // 2026-03-05
const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // 12-30-45
const backupName = `mindlife-backup-COMPLETE-${dateStr}_${timeStr}`;

console.log('\n');
console.log('══════════════════════════════════════════════════');
console.log('   MindLife - Backup Complet');
console.log('══════════════════════════════════════════════════\n');

// Créer le dossier download si nécessaire
if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// Liste des dossiers/fichiers à sauvegarder
const itemsToBackup = [
  'src/components',
  'src/app/api',
  'src/app/page.tsx',
  'src/app/layout.tsx',
  'src/app/globals.css',
  'src/lib/store.ts',
  'src/lib/db.ts',
  'src/lib/utils.ts',
  'src/lib/i18n.ts',
  'src/lib/providers.tsx',
  'src/lib/query-provider.tsx',
  'src/lib/hooks.ts',
  'src/lib/hooks',
  'prisma/schema.prisma',
  'scripts/restore-all.ts',
  'scripts/check-system.ts',
  'scripts/backup-db.ts',
  'scripts/create-backup.ts',
  'pack-survie/RESTAURATION_CODE.md',
  'pack-survie/CONTEXT-SESSION.md',
  'pack-survie/PROCEDURES.md',
  'pack-survie/README.md',
  'pack-survie/README-PROCEDURE-RESTAURATION.md',
  'download/README-PROCEDURE-RESTAURATION.md',
  'download/RESTAURATION_CODE.md',
];

// Vérifier quels fichiers existent
console.log('📁 Vérification des fichiers à sauvegarder...\n');
const existingItems: string[] = [];

for (const item of itemsToBackup) {
  const fullPath = path.join(PROJECT_ROOT, item);
  if (fs.existsSync(fullPath)) {
    existingItems.push(item);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(fullPath, { recursive: true }) as string[];
      console.log(`  ✅ ${item}/ (${files.length} fichiers)`);
    } else {
      console.log(`  ✅ ${item} (${stats.size} bytes)`);
    }
  } else {
    console.log(`  ⚠️ ${item} - N'existe pas`);
  }
}

// Créer un fichier manifest
const manifest = {
  date: now.toISOString(),
  name: backupName,
  items: existingItems,
  version: '1.0',
};

const manifestPath = path.join(DOWNLOAD_DIR, `${backupName}-manifest.json`);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`\n📄 Manifest créé: ${manifestPath}`);

// Créer l'archive tar.gz
console.log('\n📦 Création de l\'archive tar.gz...\n');

const archivePath = path.join(DOWNLOAD_DIR, `${backupName}.tar.gz`);

try {
  // Créer la liste des fichiers pour tar
  const tarArgs = existingItems.map(item => item).join(' ');
  
  // Commande tar avec compression
  const tarCommand = `cd ${PROJECT_ROOT} && tar -czf ${archivePath} ${tarArgs}`;
  
  console.log(`Exécution: ${tarCommand}\n`);
  
  execSync(tarCommand, { stdio: 'inherit' });
  
  // Vérifier l'archive
  const archiveStats = fs.statSync(archivePath);
  const sizeMB = (archiveStats.size / 1024 / 1024).toFixed(2);
  
  console.log('\n');
  console.log('══════════════════════════════════════════════════');
  console.log('   ✅ Backup créé avec succès!');
  console.log('══════════════════════════════════════════════════\n');
  console.log(`📦 Archive: ${archivePath}`);
  console.log(`📊 Taille: ${sizeMB} MB`);
  console.log(`📄 Manifest: ${manifestPath}`);
  console.log(`📁 Fichiers: ${existingItems.length} éléments`);
  console.log('\n🚀 Pour restaurer:');
  console.log(`   tar -xzf ${backupName}.tar.gz -C /home/z/my-project/`);
  console.log('\n');
} catch (error) {
  console.error('❌ Erreur lors de la création de l\'archive:', error);
  process.exit(1);
}
