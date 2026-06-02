import { Module, ModuleResponse, MessageContext, ToolDefinition, SkillDefinition } from '@/lib/bus/types';
import { bus } from '@/lib/bus/orchestrator';
import { registry } from '@/lib/bus/registry';
import manifest from './module.json';
import { SPORT_TOOLS } from './tools';
import { FALLBACK } from './fallback';

const toolNames = Object.keys(SPORT_TOOLS);

export class SportModule implements Module {
  id = 'sport';
  name = 'Sport';

  canHandle(intent: string): boolean {
    const keywords = ['sport', 'entraînement', 'entrainement', 'workout', 'exercice', 'musculation',
      'cardio', 'hiit', 'séance', 'seance', 'pompe', 'traction', 'squat', 'course',
      'programme sport', 'coach', 'fitness', 'training', 'gym', 'salle', 'abdo',
      'muscle', 'muscles', 'force', 'endurance', 'échauffement', 'echauffement',
      'étirement', 'etirement', 'stretching', 'jambes', 'bras', 'dos', 'pectoraux'];
    return keywords.some(k => intent.toLowerCase().includes(k));
  }

  async execute(context: MessageContext): Promise<ModuleResponse> {
    const { message } = context;
    try {
      const lower = message.toLowerCase();

      if (/programme|planning|semaine|planning/i.test(lower)) {
        const levelMatch = lower.match(/débutant|debutant|intermédiaire|intermediaire|avancé|avance|advanced/i)?.[0] || 'intermédiaire';
        const levelMap: Record<string, string> = {
          'débutant': 'débutant', 'debutant': 'débutant',
          'intermédiaire': 'intermédiaire', 'intermediaire': 'intermédiaire',
          'avancé': 'avancé', 'avance': 'avancé', 'advanced': 'avancé',
        };
        return { success: true, content: FALLBACK.getProgram(levelMap[levelMatch] || 'intermédiaire'), moduleId: this.id };
      }

      if (/rapide|express|court|quick/i.test(lower)) {
        return { success: true, content: FALLBACK.getQuickWorkout(30), moduleId: this.id };
      }

      if (/exercice.*(?:pour|muscle|dos|bras|jambes|pectoraux|épaules|epaules|abdos)|exercice/i.test(lower)) {
        const muscleMatch = lower.match(/(?:pour |muscle )?(dos|bras|jambes|pectoraux?|épaules|epaules|abdos?|poitrine|cuisse|mollet|biceps|triceps|épaules?|epaules?)/i)?.[1] || 'full body';
        return { success: true, content: FALLBACK.getExercisesByMuscle(muscleMatch), moduleId: this.id };
      }

      if (/hebdo|semaine|weekly|schedule/i.test(lower)) {
        return { success: true, content: FALLBACK.getWeekly('general'), moduleId: this.id };
      }

      if (/conseil|astuce|motivation|progression|récupération|recuperation|nutrition/i.test(lower)) {
        const topicMatch = lower.match(/motivation|récupération|recuperation|progression|nutrition/i)?.[0] || 'motivation';
        return { success: true, content: `💪 **Conseil sport**\n\n${FALLBACK.getAdvice(topicMatch)}\n\nDis-moi si tu veux un programme personnalisé !`, moduleId: this.id };
      }

      if (/enregistre|ajoute|log|sauvegarde|séance|seance/i.test(lower)) {
        const result = await SPORT_TOOLS.log_sport_session.execute({ query: message }, { userId: context.userId || '' });
        return { success: true, content: result, moduleId: this.id };
      }

      return { success: true, content: `💪 Je suis ton coach sportif ! Dis-moi ce que tu veux :\n\n• Un **programme** (précise ton niveau)\n• Une **séance rapide**\n• Des **exercices** pour un muscle\n• Un **conseil** personnalisé\n• **Enregistrer** une séance`, moduleId: this.id };
    } catch (e: any) {
      return { success: true, content: FALLBACK.getAdvice('motivation'), moduleId: this.id, error: e.message };
    }
  }

  getTools(): ToolDefinition[] {
    return toolNames.map(name => {
      const t = SPORT_TOOLS[name as keyof typeof SPORT_TOOLS];
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
      { id: 'sport-log', name: 'Enregistrement séance', description: 'Enregistrer une séance de sport', triggers: ['sport', 'séance', 'entraînement', 'workout', 'enregistre sport'], allowedRoles: ['coach', 'nutrition', 'assistant'] },
      { id: 'sport-program', name: 'Programmes entraînement', description: 'Générer des programmes personnalisés', triggers: ['programme sport', 'plan entraînement', 'programme musculation', 'programme fitness'], allowedRoles: ['coach', 'assistant'] },
      { id: 'sport-exercises', name: 'Banque d\'exercices', description: 'Consulter des exercices par muscle', triggers: ['exercice pour', 'exercice muscle', 'muscle dos', 'muscle bras', 'exercice'], allowedRoles: ['coach', 'assistant'] },
      { id: 'sport-advice', name: 'Conseils sport', description: 'Donner des conseils sport et motivation', triggers: ['conseil sport', 'astuce entraînement', 'motivation sport', 'récupération sport'], allowedRoles: ['coach', 'assistant'] },
    ];
  }
}

const sportModule = new SportModule();
bus.register(sportModule);
registry.register(manifest);
