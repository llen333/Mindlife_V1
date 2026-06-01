import { Module, ModuleResponse, MessageContext, ToolDefinition, SkillDefinition } from '@/lib/bus/types';
import { bus } from '@/lib/bus/orchestrator';
import { ORGANISATION_TOOLS } from './tools';
import { FALLBACK } from './fallback';

const toolNames = Object.keys(ORGANISATION_TOOLS);

export class OrganisationModule implements Module {
  id = 'organisation';
  name = 'Organisation';

  canHandle(intent: string): boolean {
    const keywords = [
      'tâche', 'tache', 'todo', 'à faire', 'a faire', 'task',
      'rendez-vous', 'rdv', 'réunion', 'reunion', 'meeting', 'calendrier', 'événement', 'evenement', 'agenda',
      'objectif', 'but', 'goal', 'projet',
      'rappelle', 'planifier', 'programmer', 'prévoir', 'prevoir',
      'liste', 'organisation', 'organiser', 'priorité', 'priorite',
      'je dois', 'je vais', 'j\'ai', 'il faut', 'on doit',
    ];
    return keywords.some(k => intent.toLowerCase().includes(k));
  }

  async execute(context: MessageContext): Promise<ModuleResponse> {
    const { message, intent } = context;
    try {
      const lower = message.toLowerCase();

      // Priorité à l'intention fournie par Bifrost
      if (intent === 'event_create' || (!intent && (/rendez-vous|rdv|réunion|reunion|meeting|calendrier|agenda/i.test(lower)))) {
        const startDate = parseRelativeDate(lower) || new Date(Date.now() + 3600000).toISOString();
        const result = await ORGANISATION_TOOLS.create_event.execute({
          title: message, startDate,
        }, { userId: context.userId || '' });
        return { success: true, content: result, moduleId: this.id };
      }

      if (intent === 'task_create' || (!intent && (/je dois|je vais.*(faire|aller|prendre)|il faut|doit.*(faire|aller|prendre)|urgent|tâche|tache|todo|à faire|a faire|ajoute.*note/i.test(lower)))) {
        const isUrgent = /urgent/i.test(lower) && !/programme.*(sport|entraînement)/i.test(lower);
        const dueDate = parseRelativeDate(lower);
        const result = await ORGANISATION_TOOLS.create_task.execute({
          title: message,
          priority: isUrgent ? 5 : 3,
          dueDate: dueDate || undefined,
        }, { userId: context.userId || '' });
        return { success: true, content: result, moduleId: this.id };
      }

      if (intent === 'goal_create' || (!intent && (/objectif|but|goal|projet|veux.*(atteindre|accomplir|devenir)/i.test(lower)))) {
        const result = await ORGANISATION_TOOLS.create_goal.execute({
          title: message,
        }, { userId: context.userId || '' });
        return { success: true, content: result, moduleId: this.id };
      }

      if (intent === 'org_advice' || (!intent && (/conseil.*organis|astuce.*productiv|priorit|méthode|methode/i.test(lower)))) {
        const topic = lower.match(/organis|productiv|priorit/)?.[0] || 'organisation';
        const map: Record<string, string> = { organis: 'organisation', productiv: 'productivite', priorit: 'priorites' };
        return { success: true, content: `📋 **Conseil organisation**\n\n${FALLBACK.getAdvice(map[topic] || 'organisation')}`, moduleId: this.id };
      }

      return {
        success: true,
        content: `📋 Je suis ton assistant organisation. Voici ce que je peux faire :
• Créer une **tâche** (dis "ajoute aller chez le médecin demain")
• Planifier un **rendez-vous** (dis "rdv banquier vendredi 14h")
• Définir un **objectif** (dis "je veux courir 5km")
• Donner des **conseils** d'organisation`,
        moduleId: this.id,
      };
    } catch (e: any) {
      return { success: true, content: FALLBACK.noConnection(), moduleId: this.id, error: e.message };
    }
  }

  getTools(): ToolDefinition[] {
    return toolNames.map(name => {
      const t = ORGANISATION_TOOLS[name as keyof typeof ORGANISATION_TOOLS];
      return {
        name: t.name,
        description: t.description,
        parameters: {},
        execute: async (args: Record<string, unknown>, ctx: MessageContext) => {
          return t.execute(args as any, { userId: ctx.userId || '' });
        },
      };
    });
  }

  getSkills(): SkillDefinition[] {
    return [
      { id: 'org-task', name: 'Gestion tâches', description: 'Créer et gérer des tâches' },
      { id: 'org-event', name: 'Gestion calendrier', description: 'Créer des événements et rendez-vous' },
      { id: 'org-goal', name: 'Objectifs', description: 'Créer et suivre des objectifs' },
      { id: 'org-advice', name: 'Conseils productivité', description: 'Donner des conseils d\'organisation' },
    ];
  }
}

function parseRelativeDate(text: string): string | null {
  const lower = text.toLowerCase();
  const now = new Date();
  let target: Date | null = null;

  if (/apr[èe]s[- ]demain/i.test(lower)) {
    target = new Date(now); target.setDate(target.getDate() + 2);
  } else if (/demain/i.test(lower)) {
    target = new Date(now); target.setDate(target.getDate() + 1);
  } else {
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    for (const j of jours) {
      if (lower.includes(j)) {
        target = new Date(now);
        let diff = jours.indexOf(j) - now.getDay();
        if (diff <= 0) diff += 7;
        target.setDate(target.getDate() + diff);
        break;
      }
    }
  }

  if (target) {
    target.setHours(9, 0, 0, 0);
    const heure = lower.match(/(?:à\s*)?(\d{1,2})[h:](\d{2})?\b/);
    if (heure) {
      target.setHours(parseInt(heure[1]), parseInt(heure[2] || '0'), 0, 0);
    }
    return target.toISOString();
  }

  return null;
}

bus.register(new OrganisationModule());
