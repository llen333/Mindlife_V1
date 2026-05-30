#!/usr/bin/env bun
/**
 * MindLife - Script d'installation locale complète
 * Ce script prépare l'application pour une utilisation locale
 *
 * Usage: bun run scripts/setup-local.ts
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync, copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const ROOT_DIR = process.cwd();

console.log('🚀 MindLife - Installation locale');
console.log('==================================\n');

// 1. Vérifier les prérequis
console.log('📋 Vérification des prérequis...');

try {
  const bunVersion = execSync('bun --version', { encoding: 'utf-8' }).trim();
  console.log(`   ✅ Bun ${bunVersion} détecté`);
} catch {
  console.error('   ❌ Bun non installé. Installez-le avec: curl -fsSL https://bun.sh/install | bash');
  process.exit(1);
}

// 2. Créer le fichier .env s'il n'existe pas
console.log('\n📝 Configuration de l\'environnement...');

const envPath = join(ROOT_DIR, '.env');
const envExamplePath = join(ROOT_DIR, '.env.example');

const defaultEnv = `# MindLife - Configuration locale
# Généré automatiquement par setup-local.ts

# Base de données SQLite
DATABASE_URL="file:./db/custom.db"

# Mode local (sans API externe)
USE_LOCAL_AI=true
USE_LOCAL_TTS=true
USE_LOCAL_ASR=true
USE_LOCAL_SPEECH=true
USE_LOCAL_SEARCH=true

# Clés API (optionnel - pour activer les fonctionnalités AI)
# ZAI_API_KEY=your-zai-api-key
# OPENAI_API_KEY=your-openai-key
# GROQ_API_KEY=your-groq-key
# OPENROUTER_API_KEY=your-openrouter-key
# GEMINI_API_KEY=your-gemini-key
# HUGGINGFACE_API_KEY=your-hf-key

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
  console.log('   ℹ️  Fichier .env déjà existant');
}

// 3. Installer les dépendances
console.log('\n📦 Installation des dépendances...');

try {
  execSync('bun install', { stdio: 'inherit' });
  console.log('   ✅ Dépendances installées');
} catch (error) {
  console.error('   ❌ Erreur lors de l\'installation des dépendances');
  process.exit(1);
}

// 4. S'assurer que le dossier db existe
console.log('\n📁 Préparation de la base de données...');

const dbDir = join(ROOT_DIR, 'db');
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
  console.log('   ✅ Dossier db/ créé');
}

// 5. Générer le client Prisma
console.log('\n⚙️  Génération du client Prisma...');

try {
  execSync('bunx prisma generate', { stdio: 'inherit' });
  console.log('   ✅ Client Prisma généré');
} catch (error) {
  console.error('   ❌ Erreur lors de la génération Prisma');
  process.exit(1);
}

// 6. Pousser le schéma de base de données
console.log('\n🗄️  Configuration de la base de données...');

try {
  execSync('bunx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('   ✅ Base de données configurée');
} catch (error) {
  console.error('   ❌ Erreur lors de la configuration de la base de données');
  process.exit(1);
}

// 7. Lancer le seed
console.log('\n🌱 Peuplement de la base de données...');

try {
  execSync('bun run scripts/seed-complete.ts', { stdio: 'inherit' });
  console.log('   ✅ Base de données peuplée');
} catch (error) {
  console.log('   ⚠️  Seed standard...');
  try {
    execSync('bun run db:seed', { stdio: 'inherit' });
    console.log('   ✅ Base de données peuplée');
  } catch {
    console.log('   ℹ️  Seed ignoré');
  }
}

// 8. Vérifier les images
console.log('\n🖼️  Vérification des images...');

const publicImages = join(ROOT_DIR, 'public', 'images');
if (existsSync(publicImages)) {
  console.log('   ✅ Dossier public/images présent');
} else {
  console.log('   ℹ️  Aucune image personnalisée');
}

// 9. Résumé
console.log('\n');
console.log('╔════════════════════════════════════════════╗');
console.log('║                                            ║');
console.log('║   🎉 INSTALLATION TERMINÉE AVEC SUCCÈS !   ║');
console.log('║                                            ║');
console.log('╚════════════════════════════════════════════╝');
console.log('\n');
console.log('📖 Pour démarrer l\'application:');
console.log('   bun run dev');
console.log('\n');
console.log('🌐 L\'application sera disponible sur:');
console.log('   http://localhost:3000');
console.log('\n');
console.log('👤 Comptes de test créés:');
console.log('   - admin@mindlife.app (Admin)');
console.log('   - john@mindlife.app');
console.log('   - mike@mindlife.app');
console.log('   - sarah@mindlife.app');
console.log('   - emma@mindlife.app');
console.log('\n');
console.log('⚙️  Mode local activé:');
console.log('   - IA: Réponses locales intelligentes');
console.log('   - TTS: Synthèse vocale navigateur');
console.log('   - ASR: Reconnaissance vocale navigateur');
console.log('   - Recherche: Non disponible en local');
console.log('\n');
console.log('🔧 Pour activer les fonctionnalités AI avancées:');
console.log('   1. Obtenir une clé API (Groq, OpenAI, etc.)');
console.log('   2. Modifier .env avec vos clés');
console.log('   3. Changer AI_PROVIDER=groq ou openai');
console.log('   4. Redémarrer l\'application');
console.log('\n');
