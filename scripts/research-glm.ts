// Script de recherche sur GLM-4.7-FlashX
const DOCS_URLS = [
  'https://docs.z.ai/guides/llm/glm-4.7',
  'https://docs.z.ai/models/glm-4',
];

async function fetchPage(url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Extract text content
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return { url, text: text.substring(0, 5000) };
  } catch (error) {
    return { url, error: String(error) };
  }
}

async function main() {
  console.log('🔍 Recherche d\'infos sur GLM-4.7-FlashX...\n');
  
  for (const url of DOCS_URLS) {
    console.log(`📄 Fetching: ${url}`);
    const result = await fetchPage(url);
    
    if (result.text) {
      console.log('\n--- CONTENU ---\n');
      console.log(result.text.substring(0, 3000));
      console.log('\n--- FIN ---\n');
    } else {
      console.log(`❌ Erreur: ${result.error}`);
    }
  }
}

main().catch(console.error);
