import { db } from '@/lib/db';

function parseWeightFromQuery(query: string): number | null {
  const match = query.match(/(\d+[.,]?\d*)\s*kg/i);
  return match ? parseFloat(match[1].replace(',', '.')) : null;
}

function parseSleepFromQuery(query: string): { bedtime?: string; wakeup?: string; quality?: number } {
  const result: { bedtime?: string; wakeup?: string; quality?: number } = {};
  const durMatch = query.match(/(\d+)\s*h(?:eure)?s?(?:\s*(\d+))?/i);
  if (durMatch) {
    const h = parseInt(durMatch[1]);
    const m = parseInt(durMatch[2] || '0');
    const hours = h + m / 60;
    result.bedtime = new Date(Date.now() - hours * 3600000).toISOString();
    result.wakeup = new Date().toISOString();
  }
  const qualMatch = query.match(/qualité\s*[:\s]*(\d)/i);
  if (qualMatch) result.quality = parseInt(qualMatch[1]);
  return result;
}

export const DONNEES_TOOLS = {
  save_note: {
    name: 'save_note',
    description: "Sauvegarder une note ou un contenu écrit (article, poème, texte, idée, journal).",
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Titre de la note' },
        content: { type: 'string', description: 'Contenu de la note' },
      },
      required: ['title', 'content'],
    },
    execute: async (args: Record<string, unknown>, ctx: { userId: string }) => {
      const { title, content } = args;
      await db.note.create({
        data: {
          id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId: ctx.userId,
          title: (title as string) || 'Note',
          content: (content as string) || '',
        },
      });
      return { success: true, output: `📝 Note sauvegardée : "${title}"` };
    },
  },

  get_notes: {
    name: 'get_notes',
    description: 'Récupérer les notes sauvegardées.',
    parameters: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Recherche dans le titre', nullable: true },
      },
      required: [],
    },
    execute: async (args: Record<string, unknown>, ctx: { userId: string }) => {
      const where: any = { userId: ctx.userId };
      if (args.search) where.title = { contains: args.search as string };
      const notes = await db.note.findMany({ where, orderBy: { createdAt: 'desc' }, take: 10 });
      if (notes.length === 0) return { success: true, output: '📝 Aucune note trouvée.' };
      const output = notes.map((n: any) => `• **${n.title}** — ${(n.content || '').slice(0, 60)}...`).join('\n');
      return { success: true, output };
    },
  },

  log_weight: {
    name: 'log_weight',
    description: "Enregistrer un poids (relevé de pesée).",
    parameters: {
      type: 'object',
      properties: {
        weight: { type: 'number', description: 'Poids en kg' },
        date: { type: 'string', description: "Date ISO, défaut = aujourd'hui", nullable: true },
        note: { type: 'string', description: 'Note optionnelle', nullable: true },
      },
      required: ['weight'],
    },
    execute: async (args: Record<string, unknown>, ctx: { userId: string }) => {
      let { weight, date, note } = args as any;
      if (!weight && args.query) weight = parseWeightFromQuery(args.query as string);
      await db.weightEntry.create({
        data: {
          id: `weight-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId: ctx.userId,
          weight,
          date: date ? new Date(date as string) : new Date(),
          note: note || null,
        },
      });
      return { success: true, output: `✅ Poids enregistré : ${weight} kg${note ? ` (${note})` : ''}` };
    },
  },

  log_sleep: {
    name: 'log_sleep',
    description: 'Enregistrer une entrée de sommeil (heure coucher, réveil, qualité).',
    parameters: {
      type: 'object',
      properties: {
        bedtime: { type: 'string', description: 'Heure de coucher ISO (ex: 2026-06-01T23:00:00Z)' },
        wakeup: { type: 'string', description: "Heure de réveil ISO" },
        quality: { type: 'number', description: 'Qualité du sommeil 1-5', minimum: 1, maximum: 5 },
        date: { type: 'string', description: 'Date ISO, défaut extrait du réveil', nullable: true },
        notes: { type: 'string', description: 'Notes', nullable: true },
      },
      required: ['bedtime', 'wakeup', 'quality'],
    },
    execute: async (args: Record<string, unknown>, ctx: { userId: string }) => {
      let { bedtime, wakeup, quality, date, notes } = args as any;
      if ((!bedtime || !wakeup) && args.query) {
        const parsed = parseSleepFromQuery(args.query as string);
        if (!bedtime) bedtime = parsed.bedtime;
        if (!wakeup) wakeup = parsed.wakeup;
        quality = quality || parsed.quality || 3;
      }
      const bedDate = new Date(bedtime as string);
      const wakeDate = new Date(wakeup as string);
      const durationHours = (wakeDate.getTime() - bedDate.getTime()) / 3600000;
      await db.sleepEntry.create({
        data: {
          id: `sleep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId: ctx.userId,
          bedtime: bedDate,
          wakeup: wakeDate,
          quality: quality || 3,
          date: date ? new Date(date as string) : wakeDate,
          notes: notes || null,
        } as any,
      });
      const h = Math.floor(durationHours);
      const m = Math.round((durationHours - h) * 60);
      return { success: true, output: `😴 Sommeil enregistré : ${h}h${m > 0 ? m : ''} (qualité: ${'⭐'.repeat(quality || 3)})` };
    },
  },

  create_shopping_list: {
    name: 'create_shopping_list',
    description: 'Créer une liste de courses avec des articles.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nom de la liste' },
        budget: { type: 'number', description: 'Budget estimé', nullable: true },
        items: { type: 'string', description: 'Articles au format JSON: [{"name":"...","quantity":2,"estimatedPrice":3.5}]' },
        scheduledDate: { type: 'string', description: 'Date prévue des courses ISO', nullable: true },
      },
      required: ['name', 'items'],
    },
    execute: async (args: Record<string, unknown>, ctx: { userId: string }) => {
      let { name, budget, items, scheduledDate } = args as any;
      if ((!name || !items) && args.query) {
        name = (args.query as string).replace(/liste.*course|achats|crée|nouvelle/gi, '').trim() || 'Courses';
        items = JSON.stringify([{ name: (args.query as string).replace(/liste.*course/i, '').trim() || 'Articles divers' }]);
      }
      let itemsArr: any[];
      if (typeof items === 'string') { try { itemsArr = JSON.parse(items); } catch { itemsArr = [{ name: items }]; } }
      else itemsArr = items;
      const listId = `list-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const list = await db.$transaction(async (tx: any) => {
        const created = await tx.shoppingList.create({
          data: {
            id: listId, userId: ctx.userId, name,
            budget: budget || 0,
            scheduledDate: scheduledDate ? new Date(scheduledDate as string) : null,
          },
        });
        if (itemsArr.length > 0) {
          await tx.shoppingItem.createMany({
            data: itemsArr.map((item: any) => ({
              id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              listId, name: item.name, quantity: item.quantity || 1,
              estimatedPrice: item.estimatedPrice || 0, category: item.category || 'Général',
            })),
          });
        }
        return created;
      });
      const total = itemsArr.reduce((s: number, i: any) => s + ((i.estimatedPrice || 0) * (i.quantity || 1)), 0);
      return { success: true, output: `🛒 **${list.name}** créée !\n📦 ${itemsArr.length} article(s)\n💰 ~${total.toFixed(2)}€ estimé${budget ? ` (budget: ${budget}€)` : ''}` };
    },
  },

  get_shopping_lists: {
    name: 'get_shopping_lists',
    description: 'Récupérer les listes de courses.',
    parameters: { type: 'object', properties: {}, required: [] },
    execute: async (_args: Record<string, unknown>, ctx: { userId: string }) => {
      const lists = await db.shoppingList.findMany({ where: { userId: ctx.userId }, include: { items: true }, orderBy: { createdAt: 'desc' }, take: 5 });
      if (lists.length === 0) return { success: true, output: '🛒 Aucune liste de courses.' };
      const output = lists.map((l: any) => {
        const checked = l.items.filter((i: any) => i.isChecked).length;
        return `• **${l.name}** — ${l.items.length} art. (${checked}/${l.items.length} coché) ${l.budget ? `💰${l.budget}€` : ''}`;
      }).join('\n');
      return { success: true, output };
    },
  },
};
