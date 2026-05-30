#!/usr/bin/env bun
/**
 * MindLife - Script d'installation fraîche complète
 * Ce script prépare l'application pour une utilisation locale
 * 
 * Usage: bun run setup (ou bun run scripts/setup-fresh.ts)
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = process.cwd();

console.log('');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║                                                          ║');
console.log('║            🚀 MINDLIFE - INSTALLATION FRAÎCHE            ║');
console.log('║                                                          ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');

// 1. Vérifier les prérequis
console.log('📋 Étape 1/7 - Vérification des prérequis...');
console.log('');

try {
  const bunVersion = execSync('bun --version', { encoding: 'utf-8' }).trim();
  console.log(`   ✅ Bun ${bunVersion} détecté`);
} catch {
  console.error('   ❌ Bun non installé !');
  console.error('');
  console.error('   Installez-le avec:');
  console.error('   curl -fsSL https://bun.sh/install | bash');
  console.error('');
  console.error('   Ou sur Windows (PowerShell):');
  console.error('   powershell -c "irm bun.sh/install.ps1 | iex"');
  process.exit(1);
}

// 2. Nettoyer les anciens fichiers si nécessaire
console.log('');
console.log('🧹 Étape 2/7 - Nettoyage des anciens fichiers...');
console.log('');

const nodeModulesPath = join(ROOT_DIR, 'node_modules');
const dbPath = join(ROOT_DIR, 'db', 'custom.db');
const prismaGenerated = join(ROOT_DIR, 'node_modules', '.prisma');

// Supprimer node_modules s'il existe mais est corrompu
if (existsSync(nodeModulesPath)) {
  console.log('   ℹ️  node_modules existe déjà - skip');
} else {
  console.log('   ℹ️  Installation fraîche');
}

// 3. Créer le fichier .env
console.log('');
console.log('📝 Étape 3/7 - Configuration de l\'environnement...');
console.log('');

const envPath = join(ROOT_DIR, '.env');

const defaultEnv = `# MindLife - Configuration locale
# Généré automatiquement par setup-fresh.ts

# Base de données SQLite
DATABASE_URL="file:./db/custom.db"

# Mode local (sans API externe)
USE_LOCAL_AI=true
USE_LOCAL_TTS=true
USE_LOCAL_ASR=true
USE_LOCAL_SPEECH=true
USE_LOCAL_SEARCH=true

# Clés API (optionnel - pour activer les fonctionnalités AI avancées)
# Décommentez et ajoutez vos clés pour activer les fonctionnalités AI
# ZAI_API_KEY=your-zai-api-key
# OPENAI_API_KEY=your-openai-key
# GROQ_API_KEY=your-groq-key
# OPENROUTER_API_KEY=your-openrouter-key
# GEMINI_API_KEY=your-gemini-key

# Configuration AI par défaut
AI_PROVIDER=local
AI_USE_FALLBACK=true

# Application
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
`;

if (!existsSync(envPath)) {
  writeFileSync(envPath, defaultEnv);
  console.log('   ✅ Fichier .env créé');
} else {
  console.log('   ℹ️  Fichier .env déjà existant - conservé');
}

// 4. Installer les dépendances
console.log('');
console.log('📦 Étape 4/7 - Installation des dépendances...');
console.log('');

try {
  execSync('bun install', { stdio: 'inherit' });
  console.log('');
  console.log('   ✅ Dépendances installées');
} catch (error) {
  console.error('   ❌ Erreur lors de l\'installation des dépendances');
  console.error('   Essayez: bun install --force');
  process.exit(1);
}

// 5. Préparer la base de données
console.log('');
console.log('📁 Étape 5/7 - Préparation de la base de données...');
console.log('');

const dbDir = join(ROOT_DIR, 'db');
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
  console.log('   ✅ Dossier db/ créé');
}

// Générer le client Prisma
console.log('   ⚙️  Génération du client Prisma...');
try {
  execSync('bunx prisma generate', { stdio: 'inherit' });
  console.log('   ✅ Client Prisma généré');
} catch (error) {
  console.error('   ❌ Erreur lors de la génération Prisma');
  process.exit(1);
}

// Pousser le schéma
console.log('   🗄️  Création des tables...');
try {
  execSync('bunx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('   ✅ Tables créées');
} catch (error) {
  console.error('   ❌ Erreur lors de la création des tables');
  process.exit(1);
}

// 6. Peupler la base de données
console.log('');
console.log('🌱 Étape 6/7 - Peuplement de la base de données...');
console.log('');

try {
  execSync('bun run scripts/seed-db.ts', { stdio: 'inherit' });
  console.log('');
  console.log('   ✅ Base de données peuplée');
} catch (error) {
  console.log('   ⚠️  Erreur lors du seed, mais on continue...');
}

// 7. Vérification finale
console.log('');
console.log('✅ Étape 7/7 - Vérification finale...');
console.log('');

const checks = [
  { name: 'node_modules', path: nodeModulesPath },
  { name: '.env', path: envPath },
  { name: 'db/', path: dbDir },
  { name: 'prisma/schema.prisma', path: join(ROOT_DIR, 'prisma', 'schema.prisma') },
];

let allGood = true;
for (const check of checks) {
  if (existsSync(check.path)) {
    console.log(`   ✅ ${check.name}`);
  } else {
    console.log(`   ❌ ${check.name} manquant`);
    allGood = false;
  }
}

// Résumé final
console.log('');
if (allGood) {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║         🎉 INSTALLATION TERMINÉE AVEC SUCCÈS !           ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
} else {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║         ⚠️  INSTALLATION TERMINÉE AVEC WARNINGS          ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
}

console.log('');
console.log('📖 POUR DÉMARRER L\'APPLICATION:');
console.log('════════════════════════════════════════════════════════════');
console.log('');
console.log('   bun run dev');
console.log('');
console.log('🌐 L\'application sera disponible sur:');
console.log('   http://localhost:3000');
console.log('');
console.log('════════════════════════════════════════════════════════════');
console.log('');
console.log('👤 COMPTES DE TEST CRÉÉS:');
console.log('════════════════════════════════════════════════════════════');
console.log('');
console.log('   Admin     : admin@mindlife.app (Admin)');
console.log('   John      : john@mindlife.app');
console.log('   Mike      : mike@mindlife.app');
console.log('   Sarah     : sarah@mindlife.app');
console.log('   Emma      : emma@mindlife.app');
console.log('');
console.log('════════════════════════════════════════════════════════════');
console.log('');
console.log('⚙️  FONCTIONNALITÉS:');
console.log('════════════════════════════════════════════════════════════');
console.log('');
console.log('   ✅ Dashboard - Vue d\'ensemble');
console.log('   ✅ Calendrier - Planification');
console.log('   ✅ Tâches - Gestion des tâches');
console.log('   ✅ Objectifs - Suivi des objectifs');
console.log('   ✅ Nutrition - Gestion des repas');
console.log('   ✅ Sport - Programme sportif');
console.log('   ✅ Esprit - Bien-être mental');
console.log('   ✅ Sommeil - Suivi du sommeil');
console.log('   ✅ Notes - Prise de notes');
console.log('   ✅ Habitudes - Suivi des habitudes');
console.log('   ✅ Journal - Journal personnel');
console.log('   ✅ Paramètres - Configuration');
console.log('');
console.log('════════════════════════════════════════════════════════════');
console.log('');
console.log('🔧 POUR ACTIVER LES FONCTIONNALITÉS AI AVANCÉES:');
console.log('════════════════════════════════════════════════════════════');
console.log('');
console.log('   1. Obtenir une clé API (Groq gratuit: https://console.groq.com)');
console.log('   2. Modifier .env avec votre clé:');
console.log('      GROQ_API_KEY=your-key-here');
console.log('      AI_PROVIDER=groq');
console.log('   3. Redémarrer l\'application');
console.log('');
console.log('════════════════════════════════════════════════════════════');
console.log('');
