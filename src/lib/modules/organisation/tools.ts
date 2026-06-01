import { db } from '@/lib/db';

interface ExecuteCtx { userId: string }

function cleanTitle(raw: string): string {
  let t = raw || '';
  t = t
    .replace(/^(je dois |je vais |j'ai |il faut |nous devons |on doit |je veux |j'aimerais |je souhaite |prendre un |ajouter |créer |cree |planifier |programmer |rajouter |noter |faire |aller |voir |prevoir |prévoir )/i, '')
    .replace(/\b(un |une |des |du |de la |pour |chez |au |aux |le |la |les |mon |mes |ma |ton |ta |tes |sa |ses |notre |vos |leurs )/gi, ' ')
    .replace(/\s+(demain|aujourd'hui|ce (soir|matin|midi|après.midi)|à \d+h\d*|à \d+ heures?)/gi, '')
    .replace(/\s+/g, ' ').trim();
  return t.charAt(0).toUpperCase() + t.slice(1) || 'Sans titre';
}

export const ORGANISATION_TOOLS = {
  create_task: {
    name: 'create_task',
    description: 'Créer une nouvelle tâche ou todo.',
    execute: async (args: Record<string, any>, { userId }: ExecuteCtx) => {
      const { description, priority, dueDate } = args;
      const title = cleanTitle(args.title || '');
      const task = await db.task.create({
        data: {
          id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId, title,
          description: description || null,
          priority: priority || 3,
          status: 'pending',
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });
      return `✅ Tâche créée : "${task.title}"`;
    },
  },

  create_event: {
    name: 'create_event',
    description: "Créer un événement calendrier (rendez-vous, réunion, RDV). Les dates sont en ISO.",
    execute: async (args: Record<string, any>, { userId }: ExecuteCtx) => {
      const { startDate, endDate, description, location, color } = args;
      const title = cleanTitle(args.title || 'Événement');
      let start = new Date(startDate);
      if (isNaN(start.getTime())) start = new Date(Date.now() + 3600000);
      const end = endDate ? new Date(endDate) : new Date(start.getTime() + 3600000);

      const event = await db.event.create({
        data: {
          id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId, title,
          description: description || null,
          location: location || null,
          startAt: start, endAt: end,
          color: color || '#3b82f6', isAllDay: false,
        },
      });
      return `✅ Événement créé : "${event.title}"
📅 ${start.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
⏰ ${start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    },
  },

  create_goal: {
    name: 'create_goal',
    description: 'Créer un nouvel objectif ou but.',
    execute: async (args: Record<string, any>, { userId }: ExecuteCtx) => {
      const title = cleanTitle(args.title || '');
      const goal = await db.goal.create({
        data: {
          id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId, title,
          status: 'active',
          priority: args.priority || 'a_planifier',
          startDate: new Date(),
        },
      });
      return `✅ Objectif créé : "${goal.title}"`;
    },
  },
};
