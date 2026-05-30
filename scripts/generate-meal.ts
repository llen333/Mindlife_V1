import ZAI from 'z-ai-web-dev-sdk';
import * as fs from 'fs';

async function generateMeal() {
  console.log('🍽️ Génération d\'un bon repas pour Mon Pote...\n');
  
  try {
    const zai = await ZAI.create();

    const prompt = "Un repas français gourmet somptueux sur une table élégante, avec du foie gras, un magret de canard rôti aux pommes de terre sarladaises, des légumes de saison, un verre de vin rouge bordeaux, éclairage chaud et tamisé, style photographie culinaire professionnelle, appétissant, délicieux, haute qualité, michelin star restaurant";

    const response = await zai.images.generations.create({
      prompt: prompt,
      size: '1344x768'
    });

    const imageBase64 = response.data[0].base64;
    const buffer = Buffer.from(imageBase64, 'base64');
    
    const outputPath = 'upload/repas-pour-mon-pote.png';
    fs.writeFileSync(outputPath, buffer);
    
    console.log('✅ Repas généré avec succès !');
    console.log(`📍 Fichier: ${outputPath}`);
    console.log(`📊 Taille: ${(buffer.length / 1024).toFixed(2)} KB`);
    console.log('\n🤙 Régale-toi Mon Pote !');
    
    return outputPath;
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  }
}

generateMeal();
