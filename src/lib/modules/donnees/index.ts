import { Module, ModuleResponse, MessageContext, ToolDefinition, SkillDefinition } from '@/lib/bus/types';
import { DONNEES_TOOLS } from './tools';
import { getFallback } from './fallback';

const INTENTS = ['save_note', 'get_notes', 'log_weight', 'log_sleep', 'create_shopping_list', 'get_shopping_lists'] as const;
type DonneesIntent = typeof INTENTS[number];

function parseIntent(context: MessageContext): DonneesIntent | null {
  const msg = context.message.toLowerCase();
  if (context.intent && INTENTS.includes(context.intent as DonneesIntent)) return context.intent as DonneesIntent;

  if (/note.*sauvegarde|sauvegarde.*note|écris.*note|mémorise|note.*pour|souviens.*toi|je note/i.test(msg)) return 'save_note';
  if (/mes notes|affiche.*note|liste.*note|rappelle.*note/i.test(msg)) return 'get_notes';
  if (/poids|pesée|peser|kg\b|weight/i.test(msg)) return 'log_weight';
  if (/dormi|sommeil|coucher|réveil|réveiller|endormi|qualité.*sommeil/i.test(msg)) return 'log_sleep';
  if (/liste.*course|liste.*achat|shopping|course.*alimentaire/i.test(msg)) return 'create_shopping_list';
  if (/mes.*liste.*course|affiche.*course/i.test(msg)) return 'get_shopping_lists';

  return null;
}

export class DonneesModule implements Module {
  id = 'donnees';
  name = 'Données & Logs';

  canHandle(intent: string): boolean {
    return INTENTS.includes(intent as DonneesIntent);
  }

  async execute(context: MessageContext): Promise<ModuleResponse> {
    const intent = parseIntent(context);
    if (!intent) {
      return { success: false, content: "Je n'ai pas compris quelle donnée enregistrer ou consulter.", moduleId: this.id };
    }

    try {
      let result: { success: boolean; output: string };

      const toolCtx = { userId: context.userId || 'mindlife-user' };
      const msg = context.message;

      if (intent === 'save_note') {
        const titleMatch = msg.match(/intitule[ée]\s*[«"]?([^»"]+)[»"]|titre\s*[«"]?([^»"]+)[»"]/i);
        const title = titleMatch?.[1] || titleMatch?.[2] || msg.replace(/sauvegarde|note|écris|mémorise/gi, '').trim().slice(0, 50) || 'Note';
        const content = msg.replace(/sauvegarde.*note|note.*sauvegarde|écris.*note/gi, '').trim();
        result = await DONNEES_TOOLS.save_note.execute({ title, content }, toolCtx);
      } else if (intent === 'get_notes') {
        const search = msg.replace(/mes notes|affiche.*note|liste.*note|rappelle.*note/gi, '').trim();
        result = await DONNEES_TOOLS.get_notes.execute({ search: search || undefined }, toolCtx);
      } else if (intent === 'log_weight') {
        const weightMatch = msg.match(/(\d+[.,]?\d*)\s*kg/i);
        result = await DONNEES_TOOLS.log_weight.execute({ weight: weightMatch ? parseFloat(weightMatch[1].replace(',', '.')) : undefined, query: msg }, toolCtx);
      } else if (intent === 'log_sleep') {
        result = await DONNEES_TOOLS.log_sleep.execute({ query: msg, bedtime: undefined, wakeup: undefined, quality: undefined }, toolCtx);
      } else if (intent === 'create_shopping_list') {
        result = await DONNEES_TOOLS.create_shopping_list.execute({ query: msg }, toolCtx);
      } else {
        result = await DONNEES_TOOLS.get_shopping_lists.execute({}, toolCtx);
      }

      return { success: result.success, content: result.output, moduleId: this.id };
    } catch {
      return { success: false, content: getFallback(intent), moduleId: this.id };
    }
  }

  getTools(): ToolDefinition[] {
    return Object.values(DONNEES_TOOLS);
  }

  getSkills(): SkillDefinition[] {
    return [
      { id: 'notes', name: 'Notes', description: 'Sauvegarder et consulter des notes' },
      { id: 'weight-tracking', name: 'Poids', description: 'Enregistrer des relevés de poids' },
      { id: 'sleep-tracking', name: 'Sommeil', description: 'Logger ses heures de sommeil' },
      { id: 'shopping', name: 'Courses', description: 'Créer et gérer des listes de courses' },
    ];
  }
}

import { bus } from '@/lib/bus/orchestrator';
const donneesModule = new DonneesModule();
bus.register(donneesModule);
