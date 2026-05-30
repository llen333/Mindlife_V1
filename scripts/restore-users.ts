// Restauration des utilisateurs avec données complètes
import { db } from '../src/lib/db';

async function main() {
  console.log('🔄 Restauration des utilisateurs...');
  
  const users = [
    {
      id: 'user-1',
      email: 'john@mindlife.app',
      name: 'John',
      weight: 100,
      height: 175,
      gender: 'male',
      mainGoal: 'perte de poids',
      activityLevel: 'modere',
      dietaryPreferences: JSON.stringify(['végétarien']),
      allergies: null,
      favoriteCuisines: JSON.stringify(['français', 'italien']),
      targetCalories: null,
      proteinTarget: null,
      carbsTarget: null,
      fatTarget: null,
      sportLevel: 'intermediate',
      preferredSports: null,
      sportGoals: null,
      theme: 'dark',
      language: 'fr',
    },
    {
      id: 'mindlife-user',
      email: 'user@mindlife.app',
      name: 'MindLife User',
      weight: 75,
      height: 180,
      gender: 'male',
      mainGoal: 'build_muscle',
      activityLevel: 'moderate',
      targetCalories: 2500,
      proteinTarget: 150,
      carbsTarget: 250,
      fatTarget: 80,
      theme: 'dark',
      language: 'fr',
    },
    {
      id: 'user-2',
      email: 'julie@mindlife.app',
      name: 'Julie Martin',
      weight: 62,
      height: 165,
      gender: 'female',
      mainGoal: 'maintain',
      activityLevel: 'active',
      dietaryPreferences: JSON.stringify(['végétalien']),
      favoriteCuisines: JSON.stringify(['asiatique', 'méditerranéen']),
      targetCalories: 2000,
      proteinTarget: 100,
      carbsTarget: 200,
      fatTarget: 65,
      theme: 'light',
      language: 'fr',
    },
    {
      id: 'user-3',
      email: 'marc@mindlife.app',
      name: 'Marc Dupont',
      weight: 90,
      height: 185,
      gender: 'male',
      mainGoal: 'prise de masse',
      activityLevel: 'very_active',
      dietaryPreferences: JSON.stringify(['sans gluten']),
      favoriteCuisines: JSON.stringify(['français', 'américain']),
      targetCalories: 3200,
      proteinTarget: 220,
      carbsTarget: 350,
      fatTarget: 100,
      sportLevel: 'advanced',
      theme: 'dark',
      language: 'fr',
    },
  ];
  
  for (const user of users) {
    try {
      const existing = await db.user.findUnique({ where: { id: user.id } });
      if (existing) {
        // Mettre à jour l'utilisateur existant
        await db.user.update({
          where: { id: user.id },
          data: {
            ...user,
            updatedAt: new Date(),
          },
        });
        console.log(`✅ ${user.id} (${user.name}) mis à jour`);
      } else {
        // Créer nouvel utilisateur
        await db.user.create({
          data: {
            ...user,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log(`✅ ${user.id} (${user.name}) créé`);
      }
    } catch (error) {
      console.error(`❌ ${user.id}:`, error);
    }
  }
  
  // Afficher le résultat
  const all = await db.user.findMany({
    select: { 
      id: true, 
      name: true, 
      weight: true, 
      height: true, 
      dietaryPreferences: true,
      favoriteCuisines: true 
    }
  });
  
  console.log(`\n📊 Total: ${all.length} utilisateurs`);
  console.log('\n📋 Détails:');
  all.forEach(u => {
    console.log(`  - ${u.name} (${u.id}): ${u.weight}kg, ${u.height}cm`);
    console.log(`    Régime: ${u.dietaryPreferences || 'non spécifié'}`);
    console.log(`    Cuisines: ${u.favoriteCuisines || 'non spécifié'}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
