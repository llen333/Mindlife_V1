#!/usr/bin/env bun
/**
 * MindLife - Script d'export pour installation locale
 * Crée une archive complète avec tout le nécessaire
 *
 * Usage: bun run scripts/export-for-local.ts
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';

const ROOT_DIR = process.cwd();
const EXPORT_DIR = join(ROOT_DIR, 'export');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const ARCHIVE_NAME = `mindlife-local-${TIMESTAMP}`;

console.log('📦 MindLife - Export pour installation locale');
console.log('=============================================\n');

// 1. Créer le dossier d'export
console.log('📁 Préparation du dossier d\'export...');

if (existsSync(EXPORT_DIR)) {
  execSync(`rm -rf ${EXPORT_DIR}`);
}
mkdirSync(EXPORT_DIR, { recursive: true });
mkdirSync(join(EXPORT_DIR, 'mindlife'), { recursive: true });

const TARGET = join(EXPORT_DIR, 'mindlife');

// 2. Exporter la base de données
console.log('💾 Export de la base de données...');

// Copier la DB
if (existsSync(join(ROOT_DIR, 'db', 'custom.db'))) {
  mkdirSync(join(TARGET, 'db'), { recursive: true });
  copyFileSync(
    join(ROOT_DIR, 'db', 'custom.db'),
    join(TARGET, 'db', 'custom.db')
  );
  console.log('   ✅ Base de données copiée');
}

// Créer l'export JSON
try {
  execSync('bun run scripts/export-db.ts', { stdio: 'inherit' });
  if (existsSync(join(ROOT_DIR, 'database-export.json'))) {
    copyFileSync(
      join(ROOT_DIR, 'database-export.json'),
      join(TARGET, 'database-export.json')
    );
    console.log('   ✅ Export JSON créé');
  }
} catch {
  console.log('   ⚠️ Export JSON non créé');
}

// 3. Copier les fichiers essentiels
console.log('\n📋 Copie des fichiers essentiels...');

const essentialFiles = [
  'package.json',
  'package-lock.json',
  'bun.lock',
  'tsconfig.json',
  'tailwind.config.ts',
  'postcss.config.mjs',
  'next.config.ts',
  'eslint.config.mjs',
  'components.json',
  '.env.example',
  'prisma/schema.prisma',
  'INSTALL_LOCAL.md',
  'README.md',
];

for (const file of essentialFiles) {
  const src = join(ROOT_DIR, file);
  const dest = join(TARGET, file);

  if (existsSync(src)) {
    // Créer les dossiers parents si nécessaire
    const destDir = join(dest, '..');
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }
    copyFileSync(src, dest);
    console.log(`   ✅ ${file}`);
  }
}

// 4. Copier les dossiers source
console.log('\n📂 Copie des dossiers source...');

const srcFolders = [
  'src',
  'public',
  'scripts',
];

function copyDir(src: string, dest: string) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src);
  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);

    if (statSync(srcPath).isDirectory()) {
      // Ignorer node_modules et .next
      if (entry !== 'node_modules' && entry !== '.next') {
        copyDir(srcPath, destPath);
      }
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

for (const folder of srcFolders) {
  const src = join(ROOT_DIR, folder);
  const dest = join(TARGET, folder);

  if (existsSync(src)) {
    copyDir(src, dest);
    console.log(`   ✅ ${folder}/`);
  }
}

// 5. Créer le fichier .env par défaut
console.log('\n⚙️  Création du .env par défaut...');

const defaultEnv = `# MindLife - Configuration locale
# Généré automatiquement

# Base de données
DATABASE_URL="file:./db/custom.db"

# Mode local (sans API externe)
USE_LOCAL_AI=true
USE_LOCAL_TTS=true
USE_LOCAL_ASR=true

# Application
NODE_ENV=development
`;

writeFileSync(join(TARGET, '.env'), defaultEnv);
console.log('   ✅ .env créé');

// 6. Créer le script de démarrage rapide
console.log('\n🚀 Création du script de démarrage...');

const startScript = `#!/bin/bash
echo "🚀 Installation de MindLife..."
bun install
bun run db:generate
bun run db:push
echo "✅ Installation terminée !"
echo "📖 Lisez INSTALL_LOCAL.md pour plus d'informations"
echo "▶️  Démarrez avec: bun run dev"
`;

writeFileSync(join(TARGET, 'start.sh'), startScript);
console.log('   ✅ start.sh créé');

// 7. Créer l'archive
console.log('\n📦 Création de l\'archive...');

try {
  // TAR.GZ
  execSync(`cd ${EXPORT_DIR} && tar -czvf ${ARCHIVE_NAME}.tar.gz mindlife/`, { stdio: 'inherit' });
  console.log(`   ✅ ${ARCHIVE_NAME}.tar.gz`);

  // ZIP
  execSync(`cd ${EXPORT_DIR} && zip -r ${ARCHIVE_NAME}.zip mindlife/`, { stdio: 'inherit' });
  console.log(`   ✅ ${ARCHIVE_NAME}.zip`);
} catch {
  console.log('   ⚠️ Archive non créée (installez tar/zip)');
}

// 8. Résumé
console.log('\n');
console.log('╔════════════════════════════════════════════╗');
console.log('║                                            ║');
console.log('║      🎉 EXPORT TERMINÉ AVEC SUCCÈS !      ║');
console.log('║                                            ║');
console.log('╚════════════════════════════════════════════╝');
console.log('\n');
console.log('📂 Dossier d\'export:', EXPORT_DIR);
console.log('📦 Archives créées:');
console.log(`   - ${EXPORT_DIR}/${ARCHIVE_NAME}.tar.gz`);
console.log(`   - ${EXPORT_DIR}/${ARCHIVE_NAME}.zip`);
console.log('\n');
console.log('📋 Contenu de l\'archive:');
console.log('   - Code source complet');
console.log('   - Base de données avec données');
console.log('   - Scripts de setup');
console.log('   - Documentation');
console.log('\n');
console.log('🚀 Pour installer en local:');
console.log('   1. Télécharger l\'archive');
console.log('   2. Extraire: tar -xzvf mindlife-*.tar.gz');
console.log('   3. cd mindlife');
console.log('   4. chmod +x start.sh && ./start.sh');
console.log('   5. bun run dev');
console.log('\n');
