// ════════════════════════════════════════════════════════════════
// MindLife - Script de Restauration Complète
// ════════════════════════════════════════════════════════════════
// Ce script restaure tous les utilisateurs et leurs données.
// Créé le 4 mars 2026 - Pack de Survie MindLife
// ════════════════════════════════════════════════════════════════

import { db } from '../src/lib/db';

async function main() {
  console.log('\n');
  console.log('══════════════════════════════════════════════════');
  console.log('   MindLife - Restauration Complète');
  console.log('══════════════════════════════════════════════════\n');

  // ─────────────────────────────────────────────────────────────
  // 1. UTILISATEURS
  // ─────────────────────────────────────────────────────────────
  console.log('👤 Restauration des utilisateurs...\n');

  const users = [
    {
      id: 'mindlife-user',
      email: 'mindlife-user@mindlife.app',
      name: 'Utilisateur MindLife',
      avatar: null,
      bio: 'Utilisateur principal de MindLife',
      weight: 75,
      height: 180,
      gender: 'male',
      mainGoal: 'maintain',
      activityLevel: 'moderate',
      dietaryPreferences: JSON.stringify(['balanced']),
      allergies: null,
      favoriteCuisines: JSON.stringify(['french', 'italian', 'asian']),
      targetCalories: 2200,
      proteinTarget: 140,
      carbsTarget: 220,
      fatTarget: 75,
      sportLevel: 'intermediate',
      preferredSports: JSON.stringify(['musculation', 'running', 'yoga']),
      sportGoals: JSON.stringify(['force', 'endurance']),
      theme: 'dark',
      language: 'fr',
      role: 'admin', // Premier utilisateur = Admin
    },
    {
      id: 'user-1',
      email: 'mindlife@mindlife.app',
      name: 'Mindlife.user',
      avatar: null,
      bio: 'Deuxième utilisateur',
      weight: 80,
      height: 175,
      gender: 'male',
      mainGoal: 'build_muscle',
      activityLevel: 'active',
      dietaryPreferences: JSON.stringify(['balanced', 'mediterranean']),
      allergies: null,
      favoriteCuisines: JSON.stringify(['mediterranean', 'french']),
      targetCalories: 2500,
      proteinTarget: 180,
      carbsTarget: 250,
      fatTarget: 85,
      sportLevel: 'intermediate',
      preferredSports: JSON.stringify(['musculation', 'swimming']),
      sportGoals: JSON.stringify(['hypertrophie', 'force']),
      theme: 'dark',
      language: 'fr',
      role: 'member', // Membre invité
    },
    {
      id: 'user-2',
      email: 'john@mindlife.app',
      name: 'John',
      avatar: null,
      bio: 'John - régime spécial',
      weight: 85,
      height: 182,
      gender: 'male',
      mainGoal: 'lose_weight',
      activityLevel: 'moderate',
      dietaryPreferences: JSON.stringify(['high_protein', 'low_carb', 'Végétarien', 'Méditerranéen']),
      allergies: JSON.stringify(['peanuts', 'Gluten']),
      favoriteCuisines: JSON.stringify(['italian', 'greek', 'spanish']),
      targetCalories: 2000,
      proteinTarget: 160,
      carbsTarget: 100,
      fatTarget: 80,
      sportLevel: 'beginner',
      preferredSports: JSON.stringify(['walking', 'swimming']),
      sportGoals: JSON.stringify(['perte_poids', 'sante']),
      theme: 'light',
      language: 'fr',
      role: 'member', // Membre invité
    },
    {
      id: 'user-1772634370468',
      email: 'user-1772634370468@mindlife.app',
      name: 'Mike',
      avatar: null,
      bio: 'Mike - nouvel utilisateur',
      weight: 70,
      height: 178,
      gender: 'male',
      mainGoal: 'maintain',
      activityLevel: 'moderate',
      dietaryPreferences: JSON.stringify(['balanced']),
      allergies: null,
      favoriteCuisines: JSON.stringify(['french', 'asian']),
      targetCalories: 2100,
      proteinTarget: 130,
      carbsTarget: 210,
      fatTarget: 70,
      sportLevel: 'intermediate',
      preferredSports: JSON.stringify(['running', 'fitness']),
      sportGoals: JSON.stringify(['maintenir_forme']),
      theme: 'dark',
      language: 'fr',
      role: 'member', // Membre invité
    },
  ];

  for (const user of users) {
    try {
      const existing = await db.user.findUnique({ where: { id: user.id } });
      if (existing) {
        await db.user.update({
          where: { id: user.id },
          data: { ...user, updatedAt: new Date() },
        });
        console.log(`  ✅ ${user.id} (${user.name}) mis à jour`);
      } else {
        await db.user.create({
          data: { ...user, createdAt: new Date(), updatedAt: new Date() },
        });
        console.log(`  ✅ ${user.id} (${user.name}) créé`);
      }
    } catch (error) {
      console.error(`  ❌ ${user.id}:`, error);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. PROFILS SPORT
  // ─────────────────────────────────────────────────────────────
  console.log('\n🏃 Création des profils sport...\n');

  for (const user of users) {
    try {
      const existingProfile = await db.sportProfile.findUnique({
        where: { userId: user.id },
      });

      if (!existingProfile) {
        await db.sportProfile.create({
          data: {
            id: `sport-profile-${user.id}`,
            userId: user.id,
            level: (user as any).sportLevel || 'intermediate',
            goals: (user as any).sportGoals || JSON.stringify(['fitness']),
            preferredSports: (user as any).preferredSports || JSON.stringify(['fitness']),
          },
        });
        console.log(`  ✅ Profil sport pour ${user.name}`);
      } else {
        console.log(`  ✓ Profil sport existe déjà pour ${user.name}`);
      }
    } catch (error) {
      console.error(`  ❌ Erreur profil sport ${user.id}:`, error);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. PROGRAMME HEBDOMADAIRE (pour mindlife-user)
  // ─────────────────────────────────────────────────────────────
  console.log('\n📅 Création du programme hebdomadaire...\n');

  try {
    const profile = await db.sportProfile.findUnique({
      where: { userId: 'mindlife-user' },
    });

    if (profile) {
      const existingProgram = await db.weeklyProgram.findFirst({
        where: { profileId: profile.id },
      });

      if (!existingProgram) {
        const program = await db.weeklyProgram.create({
          data: {
            id: 'program-main',
            profileId: profile.id,
            name: 'Programme Principal',
            weekNumber: 1,
            year: 2026,
            isActive: true,
          },
        });

        const days = [
          { dayOfWeek: 0, name: 'POUSSÉE FORCE', type: 'workout', intensity: 85 },
          { dayOfWeek: 1, name: 'Cardio HIIT', type: 'workout', intensity: 70 },
          { dayOfWeek: 2, name: 'JAMBES', type: 'workout', intensity: 80 },
          { dayOfWeek: 3, name: 'Repos Actif', type: 'active_recovery', intensity: 30 },
          { dayOfWeek: 4, name: 'TIRAGE FORCE', type: 'workout', intensity: 85 },
          { dayOfWeek: 5, name: 'ÉPAULES & BRAS', type: 'workout', intensity: 75 },
          { dayOfWeek: 6, name: 'REPOS', type: 'rest', intensity: 0 },
        ];

        for (const day of days) {
          await db.programDay.create({
            data: {
              id: `day-${day.dayOfWeek}`,
              programId: program.id,
              ...day,
            },
          });
        }
        console.log('  ✅ Programme 7 jours créé');
      } else {
        console.log('  ✓ Programme existe déjà');
      }
    }
  } catch (error) {
    console.error('  ❌ Erreur programme:', error);
  }

  // ─────────────────────────────────────────────────────────────
  // 4. CATÉGORIES PAR DÉFAUT (pour mindlife-user)
  // ─────────────────────────────────────────────────────────────
  console.log('\n📁 Création des catégories par défaut...\n');

  const categories = [
    { id: 'cat-sport', name: 'Sport', icon: 'Dumbbell', color: 'emerald', type: 'sport' },
    { id: 'cat-education', name: 'Éducation', icon: 'BookOpen', color: 'blue', type: 'education' },
    { id: 'cat-personal', name: 'Développement Personnel', icon: 'Brain', color: 'purple', type: 'personal' },
    { id: 'cat-spirituality', name: 'Esprit & Spiritualité', icon: 'Sparkles', color: 'orange', type: 'spirituality' },
    { id: 'cat-professional', name: 'Vie Professionnelle', icon: 'Briefcase', color: 'slate', type: 'professional' },
  ];

  for (const cat of categories) {
    try {
      const existing = await db.category.findFirst({
        where: { userId: 'mindlife-user', name: cat.name },
      });

      if (!existing) {
        await db.category.create({
          data: {
            ...cat,
            userId: 'mindlife-user',
          },
        });
        console.log(`  ✅ ${cat.name}`);
      } else {
        console.log(`  ✓ ${cat.name} existe déjà`);
      }
    } catch (error) {
      console.error(`  ❌ Erreur catégorie ${cat.name}:`, error);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. BIOMÉTRIQUE (30 jours)
  // ─────────────────────────────────────────────────────────────
  console.log('\n📊 Génération des données biométriques (30 jours)...\n');

  try {
    const profile = await db.sportProfile.findUnique({
      where: { userId: 'mindlife-user' },
    });

    if (profile) {
      const existingBiometrics = await db.biometricData.findMany({
        where: { profileId: profile.id },
      });

      if (existingBiometrics.length === 0) {
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);

          await db.biometricData.create({
            data: {
              profileId: profile.id,
              date,
              weight: 75 + Math.random() * 2 - 1,
              muscleMass: 32 + Math.random() * 0.5,
              bodyFat: 18 + Math.random() * 0.5,
              hydration: 58 + Math.random() * 2,
              heartRateRest: 60 + Math.floor(Math.random() * 5),
              hrv: 45 + Math.floor(Math.random() * 10),
              recoveryScore: 70 + Math.floor(Math.random() * 20),
              energyLevel: 60 + Math.floor(Math.random() * 30),
            } as any,
          });
        }
        console.log('  ✅ 30 jours de biométrie générés');
      } else {
        console.log(`  ✓ ${existingBiometrics.length} entrées existent déjà`);
      }
    }
  } catch (error) {
    console.error('  ❌ Erreur biométrie:', error);
  }

  // ─────────────────────────────────────────────────────────────
  // RÉSUMÉ FINAL
  // ─────────────────────────────────────────────────────────────
  console.log('\n');
  console.log('══════════════════════════════════════════════════');
  console.log('   ✅ Restauration terminée avec succès!');
  console.log('══════════════════════════════════════════════════\n');

  const allUsers = await db.user.findMany({
    select: { id: true, name: true, email: true },
  });

  console.log('📊 Résumé:');
  console.log(`   👤 ${allUsers.length} utilisateurs`);
  allUsers.forEach((u) => console.log(`      - ${u.name} (${u.id})`));

  console.log('\n🚀 Commandes utiles:');
  console.log('   bun run scripts/check-system.ts  → Vérifier le système');
  console.log('   bun run db:push                  → Mettre à jour le schéma');
  console.log('\n');
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
