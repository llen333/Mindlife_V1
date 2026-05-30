// Script pour réinitialiser complètement la base de données
// Lancer avec: bun run db:fresh

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Réinitialisation complète de la base de données...\n');

  // 1. Supprimer la base de données
  console.log('📁 Suppression de la base de données...');
  const dbPath = path.join(process.cwd(), 'db', 'custom.db');
  
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('✅ Base de données supprimée');
  } else {
    console.log('ℹ️  Base de données non trouvée (déjà supprimée?)');
  }

  // 2. Recréer le schéma avec db:push
  console.log('\n🔧 Recréation du schéma...');
  try {
    execSync('bunx prisma@6 db push', { stdio: 'inherit' });
    console.log('✅ Schéma recréé');
  } catch (error) {
    console.error('❌ Erreur lors de la recréation du schéma');
    throw error;
  }

  // 3. Lancer le seed
  console.log('\n🌱 Peuplement de la base de données...');
  try {
    execSync('bun run scripts/seed-db.ts', { stdio: 'inherit' });
    console.log('✅ Données de test insérées');
  } catch (error) {
    console.error('❌ Erreur lors du seed');
    throw error;
  }

  console.log('\n🎉 BASE DE DONNÉES RÉINITIALISÉE AVEC SUCCÈS !');
  console.log('========================================');
  console.log('Commande pour vérifier: bun run db:check');
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
