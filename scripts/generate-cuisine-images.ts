import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const cuisines = [
  { name: 'french', prompt: 'French cuisine gastronomy, croissants, baguette, cheese board, wine glass, elegant Parisian bistro setting, professional food photography, warm ambient lighting, high detail, appetizing, 4K quality' },
  { name: 'italian', prompt: 'Italian cuisine, fresh pasta, wood-fired pizza, basil, tomato, olive oil, rustic Italian trattoria, professional food photography, warm lighting, high detail, appetizing, 4K quality' },
  { name: 'japanese', prompt: 'Japanese cuisine, sushi platter, sashimi, chopsticks, miso soup, zen presentation, minimalist Japanese restaurant, professional food photography, soft lighting, high detail, appetizing, 4K quality' },
  { name: 'thai', prompt: 'Thai cuisine, pad thai noodles, curry dish, fresh herbs, lime, chili, vibrant colors, Thai street food style, professional food photography, warm lighting, high detail, appetizing, 4K quality' },
  { name: 'indian', prompt: 'Indian cuisine, butter chicken curry, naan bread, basmati rice, colorful spices, traditional thali, professional food photography, warm lighting, high detail, appetizing, 4K quality' },
  { name: 'mexican', prompt: 'Mexican cuisine, tacos, guacamole, fresh salsa, lime, cilantro, vibrant colors, traditional Mexican cantina, professional food photography, bright lighting, high detail, appetizing, 4K quality' },
  { name: 'chinese', prompt: 'Chinese cuisine, dim sum, dumplings, noodles, chopsticks, bamboo steamer, traditional Chinese banquet, professional food photography, warm lighting, high detail, appetizing, 4K quality' },
  { name: 'lebanese', prompt: 'Lebanese cuisine, hummus, falafel, tabbouleh, pita bread, fresh vegetables, meze platter, Mediterranean style, professional food photography, bright lighting, high detail, appetizing, 4K quality' },
];

async function generateImages() {
  const zai = await ZAI.create();
  const outputDir = '/home/z/my-project/public/images/settings/cuisines';
  
  console.log(`Generating ${cuisines.length} cuisine images...`);
  
  for (const cuisine of cuisines) {
    try {
      console.log(`Generating ${cuisine.name}...`);
      
      const response = await zai.images.generations.create({
        prompt: cuisine.prompt,
        size: '1024x1024'
      });
      
      const imageBase64 = response.data[0].base64;
      const buffer = Buffer.from(imageBase64, 'base64');
      const outputPath = path.join(outputDir, `${cuisine.name}.png`);
      
      fs.writeFileSync(outputPath, buffer);
      console.log(`✓ Saved: ${outputPath}`);
      
    } catch (error) {
      console.error(`✗ Failed to generate ${cuisine.name}:`, error);
    }
  }
  
  console.log('Done!');
}

generateImages();
