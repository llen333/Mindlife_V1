// Recherche approfondie GLM-4.7
const URLS = [
  'https://docs.z.ai/guides/llm/glm-4.7#glm-4-7-flashx',
  'https://docs.z.ai/get-started/quick-start',
  'https://docs.z.ai/get-started/pricing',
];

async function fetchPage(url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return { url, text };
  } catch (error) {
    return { url, error: String(error) };
  }
}

async function main() {
  console.log('🔍 Recherche prix et capacités GLM-4.7-FlashX...\n');
  
  for (const url of URLS) {
    console.log(`📄 Fetching: ${url}`);
    const result = await fetchPage(url);
    
    if (result.text) {
      // Look for pricing info
      const lowerText = result.text.toLowerCase();
      
      if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('$')) {
        console.log('\n💰 PRIX TROUVÉS:\n');
        // Extract pricing section
        const priceMatch = result.text.match(/pricing[\s\S]{0,2000}/i);
        if (priceMatch) console.log(priceMatch[0].substring(0, 1500));
      }
      
      if (lowerText.includes('flashx') || lowerText.includes('flash-x')) {
        console.log('\n⚡ FLASHX INFO:\n');
        const flashMatch = result.text.match(/flashx[\s\S]{0,1500}/i);
        if (flashMatch) console.log(flashMatch[0]);
      }
      
      if (lowerText.includes('multilingual') || lowerText.includes('language') || lowerText.includes('french')) {
        console.log('\n🌐 LANGUES:\n');
        const langMatch = result.text.match(/language[\s\S]{0,1000}/i);
        if (langMatch) console.log(langMatch[0].substring(0, 800));
      }
    }
  }
}

main().catch(console.error);
