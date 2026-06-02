import { Module, ModuleResponse, MessageContext, ToolDefinition, SkillDefinition } from '@/lib/bus/types';
import { registry } from '@/lib/bus/registry';
import manifest from './module.json';
import { RECHERCHE_TOOLS } from './tools';
import { getFallback } from './fallback';

const INTENTS = ['web_search', 'scrape_url'] as const;
type RechercheIntent = typeof INTENTS[number];

function parseIntent(context: MessageContext): RechercheIntent | null {
  const msg = context.message.toLowerCase();
  if (context.intent === 'web_search') return 'web_search';
  if (context.intent === 'scrape_url') return 'scrape_url';
  if (/cherche|recherche|trouve|quel est|qu'est-ce que|c'est quoi|comment fonctionne|actualité|info sur|va chercher|va voir/i.test(msg)) return 'web_search';
  if (/extrais|scrape|contenu de|page web|site.*va/i.test(msg)) return 'scrape_url';
  return null;
}

export class RechercheModule implements Module {
  id = 'recherche';
  name = 'Recherche Web';

  canHandle(intent: string): boolean {
    return INTENTS.includes(intent as RechercheIntent);
  }

  async execute(context: MessageContext): Promise<ModuleResponse> {
    const intent = parseIntent(context);
    if (!intent) {
      return { success: false, content: "Je n'ai pas compris quoi chercher.", moduleId: this.id };
    }

    try {
      let result: { success: boolean; output: string };
      if (intent === 'web_search') {
        const query = context.message
          .replace(/^(cherche|recherche|trouve|donne|quel est|qu'est-ce que|c'est quoi|qui est|comment fonctionne|info sur|va chercher|va voir|je cherche)\s+(sur\s+le\s+web|sur\s+internet|sur\s+internet\s+des?\s+infos?\s+)?/i, '')
          .replace(/^(cherche|recherche|trouve|donne|quel est|qu'est-ce que|c'est quoi|qui est|comment fonctionne|info sur|va chercher|va voir)\s+/i, '')
          .trim() || context.message;
        result = await RECHERCHE_TOOLS.web_search.execute({ query });
      } else {
        const urlMatch = context.message.match(/https?:\/\/[^\s]+/);
        const url = urlMatch ? urlMatch[0] : context.message;
        result = await RECHERCHE_TOOLS.scrape_url.execute({ url });
      }
      return { success: result.success, content: result.output, moduleId: this.id };
    } catch {
      return { success: false, content: getFallback(intent), moduleId: this.id };
    }
  }

  getTools(): ToolDefinition[] {
    return Object.values(RECHERCHE_TOOLS);
  }

  getSkills(): SkillDefinition[] {
    return [
      { id: 'web-search', name: 'Recherche Web', description: 'Chercher sur Internet', triggers: ['cherche info', 'recherche web', 'trouve info', 'quel est', 'qu\'est-ce que', 'actualité'], allowedRoles: ['oracle', 'assistant'] },
      { id: 'scrape-url', name: 'Extraction de page', description: 'Lire le contenu d\'une page web', triggers: ['extrais contenu', 'scrape page', 'contenu de la page', 'résumé article'], allowedRoles: ['oracle', 'assistant'] },
    ];
  }
}

import { bus } from '@/lib/bus/orchestrator';
const rechercheModule = new RechercheModule();
bus.register(rechercheModule);
registry.register(manifest);
