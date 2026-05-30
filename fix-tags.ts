import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- DEBUT DE LA MIGRATION DES TAGS ---');
  
  // Récupérer toutes les vidéos et audios
  const items = await prisma.mediaItem.findMany();
  let updatedCount = 0;
  
  for (const item of items) {
    const title = item.title.toLowerCase();
    const author = item.author ? item.author.toLowerCase() : '';
    const autoTags: string[] = [];
    
    // Logique de taxonomie automatique basée sur le titre
    if (title.includes('music') || title.includes('musique') || title.includes('mix') || title.includes('ost') || title.includes('album') || title.includes('live')) {
      autoTags.push('musique');
    }
    if (title.includes('jung') || author.includes('jung') || title.includes('conscience') || title.includes('spirituel') || title.includes('âme') || title.includes('éveil')) {
      autoTags.push('spiritualité');
      if (title.includes('jung') || author.includes('jung')) {
        autoTags.push('carl jung');
      }
    }
    if (title.includes('tuto') || title.includes('comment') || title.includes('how to')) {
      autoTags.push('tutos');
    }
    
    // Auto-tagging de la chaine / auteur
    if (author && author.trim() !== '') {
      autoTags.push(author.trim().toLowerCase());
    }
    
    // Maintien des tags existants
    let currentTags = item.category ? item.category.split(',').map(t => t.trim().toLowerCase()) : [];
    
    // On ignore le tag par défaut unique 'croissance' si on a trouvé d'autres choses
    if (currentTags.length === 1 && currentTags[0] === 'croissance' && autoTags.length > 0) {
      currentTags = [];
    }
    
    // Fusion et déduplication
    const finalTags = Array.from(new Set([...currentTags, ...autoTags])).filter(t => t !== '');
    if (finalTags.length === 0) finalTags.push('croissance');
    
    // Détection Audio vs Vidéo
    const isAudio = finalTags.includes('musique') || title.includes('podcast');
    const newType = isAudio ? 'audio' : item.type;
    
    const newCategory = finalTags.join(',');
    
    // Si modification détectée
    if (newCategory !== item.category || newType !== item.type) {
      await prisma.mediaItem.update({
        where: { id: item.id },
        data: {
          category: newCategory,
          type: newType
        }
      });
      updatedCount++;
      console.log(`✅ Mis à jour: "${item.title}"`);
      console.log(`   - Tags: [${newCategory}]`);
      console.log(`   - Type: ${newType}`);
    }
  }
  
  console.log(`\n--- FIN DE LA MIGRATION ---`);
  console.log(`${updatedCount} ressources ont été taguées/catégorisées automatiquement.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
