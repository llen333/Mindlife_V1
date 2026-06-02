// Récupérer la page de pricing complète
async function main() {
  console.log('💰 Récupération des prix Z.ai...\n');
  
  const response = await fetch('https://docs.z.ai/get-started/pricing');
  const html = await response.text();
  
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Look for GLM-4.7 pricing
  const glm47Match = text.match(/GLM-4\.7[\s\S]{0,3000}/i);
  if (glm47Match) {
    console.log('📊 GLM-4.7 PRIX:\n');
    console.log(glm47Match[0]);
  }
  
  // Look for flashx pricing
  const flashxMatch = text.match(/flashx[\s\S]{0,1500}/i);
  if (flashxMatch) {
    console.log('\n⚡ FLASHX PRIX:\n');
    console.log(flashxMatch[0]);
  }
  
  // Look for dollar amounts
  const pricePattern = /\$[\d.]+/g;
  const prices = text.match(pricePattern);
  if (prices) {
    console.log('\n💵 Tous les prix trouvés:', [...new Set(prices)].join(', '));
  }
}

main().catch(console.error);
export {};
