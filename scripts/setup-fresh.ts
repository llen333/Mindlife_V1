#!/usr/bin/env bun
/**
 * MindLife — Installation complète (PostgreSQL + pgvector)
 * 
 * Usage : bun run setup
 * 
 * Prérequis :
 *   - Bun   (curl -fsSL https://bun.sh/install | bash)
 *   - PostgreSQL 18+ (avec extension pgvector)
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { createInterface } from 'readline';

const ROOT = process.cwd();
const PG_DEFAULT_PORT = '5432';

function prompt(query: string, def?: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(def ? `${query} [${def}] : ` : `${query} : `, answer => {
      rl.close();
      resolve(answer.trim() || def || '');
    });
  });
}

function run(cmd: string, opts: { silent?: boolean; ignore?: boolean } = {}): { stdout: string; stderr: string; ok: boolean } {
  try {
    const out = execSync(cmd, { encoding: 'utf-8', stdio: opts.silent ? 'pipe' : 'inherit' });
    return { stdout: (out || '').toString(), stderr: '', ok: true };
  } catch (e: any) {
    if (opts.ignore) return { stdout: '', stderr: e.stderr || e.message, ok: false };
    throw e;
  }
}

function check(command: string, label: string): boolean {
  const r = run(command, { silent: true, ignore: true });
  if (!r.ok) console.log(`   ❌ ${label} — non trouvé`);
  else console.log(`   ✅ ${label}`);
  return r.ok;
}

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║            🚀 MINDLIFE — INSTALLATION                    ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  // ── 1. Prérequis ──────────────────────────────────────────────
  console.log('📋 Étape 1/7 — Vérification des prérequis');
  console.log('');

  const okBun = check('bun --version', 'Bun');
  const okPsql = check('psql --version', 'PostgreSQL (psql)');
  const okPgvector = run(`psql -U postgres -c "SELECT extversion FROM pg_extension WHERE extname='vector';" -t 2>/dev/null`, { silent: true, ignore: true });
  const hasPgvector = okPgvector.ok && okPgvector.stdout.trim().length > 0;
  console.log(`   ${hasPgvector ? '✅' : '❌'} pgvector — ${hasPgvector ? 'installé' : 'non trouvé'}`);
  
  if (!okBun || !okPsql) {
    console.error('\n   ⛔ Prérequis manquants. Installez :');
    if (!okBun) console.error('      Bun   : curl -fsSL https://bun.sh/install | bash');
    if (!okPsql) console.error('      PostgreSQL : brew install postgresql@18');
    console.error('');
    process.exit(1);
  }

  if (!hasPgvector) {
    console.log('\n   ⚠️  pgvector non détecté. Installation recommandée :');
    console.log('      brew install pgvector');
    console.log('      Puis dans votre base : CREATE EXTENSION vector;');
    console.log('');
    const cont = await prompt('Continuer sans pgvector ? (le RAG vectoriel sera désactivé)', 'non');
    if (cont.toLowerCase() !== 'oui' && cont.toLowerCase() !== 'o' && cont.toLowerCase() !== 'yes' && cont.toLowerCase() !== 'y') {
      console.log('   ⛔ Installation annulée. Installez pgvector puis relancez.');
      process.exit(1);
    }
  }

  // ── 2. Configuration PostgreSQL ──────────────────────────────
  console.log('');
  console.log('🛢️  Étape 2/7 — Configuration PostgreSQL');
  console.log('');

  const pgHost = await prompt('Hôte PostgreSQL', 'localhost');
  const pgPort = await prompt('Port', PG_DEFAULT_PORT);
  const pgUser = await prompt('Utilisateur', 'postgres');
  const pgDb   = await prompt('Nom de la base de données', 'mindlife');

  // Tester la connexion
  const connOk = run(`psql -h ${pgHost} -p ${pgPort} -U ${pgUser} -d ${pgDb} -c "SELECT 1" -t 2>/dev/null`, { silent: true, ignore: true });
  if (!connOk.ok) {
    console.log('\n   ⚙️  La base n\'existe pas encore. Tentative de création...');
    const createOk = run(`psql -h ${pgHost} -p ${pgPort} -U ${pgUser} -d postgres -c "CREATE DATABASE ${pgDb};" 2>/dev/null`, { silent: true, ignore: true });
    if (!createOk.ok) {
      console.log('   ⚠️  Impossible de créer la base automatiquement.');
      console.log(`   Créez-la manuellement : createdb -h ${pgHost} -p ${pgPort} -U ${pgUser} ${pgDb}`);
      const wait = await prompt('Appuyez sur Entrée après avoir créé la base');
    } else {
      console.log(`   ✅ Base "${pgDb}" créée`);
    }
  } else {
    console.log(`   ✅ Connexion à "${pgDb}" OK`);
  }

  // Activer pgvector
  if (hasPgvector) {
    run(`psql -h ${pgHost} -p ${pgPort} -U ${pgUser} -d ${pgDb} -c "CREATE EXTENSION IF NOT EXISTS vector;"`, { silent: true, ignore: true });
    console.log('   ✅ Extension vector activée');
  }

  // ── 3. Fichier .env ──────────────────────────────────────────
  console.log('');
  console.log('📝 Étape 3/7 — Configuration de l\'environnement');
  console.log('');

  const pgPass = process.env.PGPASSWORD || await prompt('Mot de passe PostgreSQL', '');

  const envContent = `# Mindlife — Configuration
# Généré par setup-fresh.ts

# Base de données PostgreSQL
DATABASE_URL="postgresql://${pgUser}${pgPass ? `:${pgPass}` : ''}@${pgHost}:${pgPort}/${pgDb}?schema=public"

# Mode local (sans API externe)
USE_LOCAL_AI=true
USE_LOCAL_TTS=true
USE_LOCAL_ASR=true
USE_LOCAL_SPEECH=true
USE_LOCAL_SEARCH=true

# Provider AI par défaut
AI_PROVIDER=local
AI_USE_FALLBACK=true

# Clés API (optionnel — décommentez pour activer)
# OPENAI_API_KEY=sk-...
# GROQ_API_KEY=gsk_...
# ZAI_API_KEY=...
# OPENROUTER_API_KEY=...

# Application
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
`;

  writeFileSync('.env', envContent);
  console.log('   ✅ .env créé');

  // ── 4. Dépendances ───────────────────────────────────────────
  console.log('');
  console.log('📦 Étape 4/7 — Installation des dépendances');
  console.log('');

  run('bun install');
  console.log('   ✅ Dépendances installées');

  // ── 5. Base de données — Prisma ──────────────────────────────
  console.log('');
  console.log('🗄️  Étape 5/7 — Création des tables (Prisma)');
  console.log('');

  run('bunx prisma generate', { silent: false });
  console.log('   ✅ Client Prisma généré');
  run('bunx prisma db push --accept-data-loss', { silent: false });
  console.log('   ✅ Tables Prisma créées');

  // ── 6. Initialisation vectorielle ────────────────────────────
  console.log('');
  console.log('🧠 Étape 6/7 — Initialisation du RAG vectoriel');
  console.log('');

  if (hasPgvector) {
    const sqlPath = join(ROOT, 'db', 'init-vector.sql');
    if (existsSync(sqlPath)) {
      run(`psql -h ${pgHost} -p ${pgPort} -U ${pgUser} -d ${pgDb} -f "${sqlPath}"`, { silent: false });
      console.log('   ✅ Table vector_memories créée');
    }
  } else {
    console.log('   ⏭️  pgvector non installé — RAG vectoriel désactivé');
    console.log('   Pour l\'activer plus tard :');
    console.log(`      psql -h ${pgHost} -p ${pgPort} -U ${pgUser} -d ${pgDb} -c "CREATE EXTENSION vector;"`);
    console.log(`      psql -h ${pgHost} -p ${pgPort} -U ${pgUser} -d ${pgDb} -f db/init-vector.sql`);
  }

  // ── 7. Seed ──────────────────────────────────────────────────
  console.log('');
  console.log('🌱 Étape 7/7 — Peuplement de la base');
  console.log('');

  try {
    run('bun run scripts/seed-db.ts', { silent: false, ignore: true });
    console.log('   ✅ Base peuplée');
  } catch {
    console.log('   ⚠️  Erreur seed (non bloquant)');
    console.log('   Réessayez : bun run seed');
  }

  // ── Final ────────────────────────────────────────────────────
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║         🎉 INSTALLATION TERMINÉE AVEC SUCCÈS !           ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('   Lancer l\'application :');
  console.log('   ──────────────────────────────────────────────────');
  console.log('   bun run dev');
  console.log('');
  console.log('   http://localhost:3090');
  console.log('');
  console.log('   https://github.com/llen333/Mindlife_V1');
  console.log('');
}

main().catch(e => {
  console.error('💥 Erreur fatale :', e.message);
  process.exit(1);
});
