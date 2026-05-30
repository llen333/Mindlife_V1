// ════════════════════════════════════════════════════════════════
// MindLife - Vérification Système
// ════════════════════════════════════════════════════════════════
// Ce script vérifie que tout est en place.
// Créé le 4 mars 2026 - Pack de Survie MindLife
// ════════════════════════════════════════════════════════════════

import { db } from '../src/lib/db';
import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = '/home/z/my-project';

async function main() {
  console.log('\n');
  console.log('══════════════════════════════════════════════════');
  console.log('   MindLife - Vérification Système');
  console.log('══════════════════════════════════════════════════\n');

  let allGood = true;

  // ─────────────────────────────────────────────────────────────
  // 1. FICHIERS IMPORTANTS
  // ─────────────────────────────────────────────────────────────
  console.log('📁 Vérification des fichiers...\n');

  const filesToCheck = [
    { path: 'src/lib/store.ts', name: 'Store Zustand' },
    { path: 'prisma/schema.prisma', name: 'Schéma Prisma' },
    { path: 'db/custom.db', name: 'Base de données' },
    { path: 'docs/STRUCTURE.md', name: 'Documentation' },
    { path: '.claude-context', name: 'Contexte Claude' },
    { path: 'pack-survie/README.md', name: 'Pack de Survie' },
  ];

  for (const file of filesToCheck) {
    const fullPath = path.join(PROJECT_ROOT, file.path);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`  ✅ ${file.name} (${file.path})`);
      console.log(`     Taille: ${stats.size} bytes`);
    } else {
      console.log(`  ❌ ${file.name} MANQUANT (${file.path})`);
      allGood = false;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. DOSSIERS
  // ─────────────────────────────────────────────────────────────
  console.log('\n📂 Vérification des dossiers...\n');

  const dirsToCheck = [
    { path: 'scripts', name: 'Scripts' },
    { path: 'backups', name: 'Backups' },
    { path: 'pack-survie', name: 'Pack de Survie' },
    { path: 'pack-survie/scripts', name: 'Scripts Pack' },
  ];

  for (const dir of dirsToCheck) {
    const fullPath = path.join(PROJECT_ROOT, dir.path);
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath);
      console.log(`  ✅ ${dir.name}/ (${files.length} fichiers)`);
    } else {
      console.log(`  ❌ ${dir.name}/ MANQUANT`);
      allGood = false;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. BASE DE DONNÉES
  // ─────────────────────────────────────────────────────────────
  console.log('\n🗄️ Vérification de la base de données...\n');

  try {
    // Utilisateurs
    const users = await db.user.findMany({
      select: { id: true, name: true, email: true },
    });
    console.log(`  👤 ${users.length} utilisateurs:`);
    users.forEach((u) => console.log(`     - ${u.name} (${u.id})`));

    // Profils sport
    const sportProfiles = await db.sportProfile.count();
    console.log(`  🏃 ${sportProfiles} profils sport`);

    // Catégories
    const categories = await db.category.count();
    console.log(`  📁 ${categories} catégories`);

    // Biométrie
    const biometrics = await db.biometricData.count();
    console.log(`  📊 ${biometrics} entrées biométriques`);

    // Repas
    const meals = await db.meal.count();
    console.log(`  🍽️ ${meals} repas planifiés`);

  } catch (error) {
    console.log('  ❌ Erreur d\'accès à la base:', error);
    allGood = false;
  }

  // ─────────────────────────────────────────────────────────────
  // 4. SCRIPTS DISPONIBLES
  // ─────────────────────────────────────────────────────────────
  console.log('\n📜 Scripts disponibles...\n');

  const scriptsDir = path.join(PROJECT_ROOT, 'scripts');
  if (fs.existsSync(scriptsDir)) {
    const scripts = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.ts'));
    scripts.forEach(s => console.log(`  • ${s}`));
  }

  // ─────────────────────────────────────────────────────────────
  // RÉSUMÉ
  // ─────────────────────────────────────────────────────────────
  console.log('\n');
  console.log('══════════════════════════════════════════════════');

  if (allGood) {
    console.log('   ✅ SYSTÈME OK - Tout est en place!');
  } else {
    console.log('   ⚠️ ATTENTION - Certains éléments manquent');
    console.log('   → Restaurer depuis pack-survie/');
  }

  console.log('══════════════════════════════════════════════════\n');
}

main()
  .then(async () => {
    await db.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
