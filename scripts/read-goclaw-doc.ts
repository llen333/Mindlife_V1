import ZAI from 'z-ai-web-dev-sdk';

async function main() {
  try {
    const zai = await ZAI.create();

    // Read GoClaw documentation
    const result = await zai.functions.invoke('page_reader', {
      url: 'https://docs.goclaw.sh/getting-started/installation'
    });

    console.log('=== GOCLAW INSTALLATION ===');
    console.log('Title:', result.data?.title);

    // Extract text from HTML
    const text = result.data?.html
      ?.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      ?.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      ?.replace(/<[^>]*>/g, '\n')
      ?.replace(/\n+/g, '\n')
      ?.trim() || '';

    console.log('\nContent:\n', text.substring(0, 5000));

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
