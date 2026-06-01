import { searchWeb, scrapePage } from '@/lib/agent-actions';

export const RECHERCHE_TOOLS = {
  web_search: {
    name: 'web_search',
    description: 'Rechercher sur le web des informations, actualités, connaissances générales.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'La requête de recherche' },
      },
      required: ['query'],
    },
    execute: async (args: Record<string, unknown>) => {
      const query = (args.query as string) || '';
      try {
        const results = await searchWeb(query, 5);
        if (results.length === 0) {
          return { success: false, output: `😕 Aucun résultat pour "${query}".` };
        }
        let output = `🌐 **Résultats pour "${query}"**\n\n`;
        results.slice(0, 3).forEach((r) => {
          output += `• **${r.title}**\n  ${r.snippet}\n  → ${r.url}\n\n`;
        });
        if (results.length > 3) {
          output += `*(+${results.length - 3} autres résultats)*`;
        }
        return { success: true, output };
      } catch (e) {
        return { success: false, output: `❌ Erreur recherche: ${e}` };
      }
    },
  },

  scrape_url: {
    name: 'scrape_url',
    description: "Extraire le contenu textuel d'une page web ou d'un article.",
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: "URL complète de la page à extraire" },
      },
      required: ['url'],
    },
    execute: async (args: Record<string, unknown>) => {
      const url = (args.url as string) || '';
      try {
        const page = await scrapePage(url);
        if (!page) {
          return { success: false, output: `📄 Page inaccessible : ${url}` };
        }
        const content = page.content.slice(0, 2000);
        return { success: true, output: `📄 **${page.title}**\n\n${content}` };
      } catch (e) {
        return { success: false, output: `❌ Erreur extraction: ${e}` };
      }
    },
  },
};
