// ============================================================
// GOAL-CALENDAR SYNC SERVICE
// ============================================================
// Ce service gère la synchronisation automatique entre les objectifs
// et les événements du calendrier.
// 
// RÈGLES :
// - Un objectif crée 2 événements : Début (🎯) et Fin (⏰)
// - Quand un objectif est supprimé, ses événements sont supprimés
// - Quand un objectif est modifié, ses événements sont mis à jour
// ============================================================

import { db } from '@/lib/db';

// Préfixes pour identifier les événements liés aux objectifs
const GOAL_EVENT_PREFIX_START = 'goal-start-';
const GOAL_EVENT_PREFIX_END = 'goal-end-';

// Couleurs par défaut pour les événements
const START_EVENT_COLOR = 'violet';
const END_EVENT_COLOR = 'rose';

// ============================================================
// CRÉATION D'ÉVÉNEMENTS
// ============================================================

interface CreateGoalEventsParams {
  goalId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date | null;
  categoryId?: string | null;
  userId: string;
}

export async function createGoalEvents(params: CreateGoalEventsParams): Promise<{ startEventId?: string; endEventId?: string }> {
  const { goalId, title, description, startDate, endDate, categoryId, userId } = params;
  
  const result: { startEventId?: string; endEventId?: string } = {};
  
  try {
    // Créer une copie de la date pour éviter les mutations
    const start = new Date(startDate);
    
    // 1. Créer l'événement de début
    const startEventId = `${GOAL_EVENT_PREFIX_START}${goalId}`;
    await db.event.create({
      data: {
        id: startEventId,
        title: `🎯 Début: ${title}`,
        description: description || `Début de l'objectif: ${title}`,
        startAt: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 9, 0, 0),
        endAt: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 10, 0, 0),
        isAllDay: true,
        color: START_EVENT_COLOR,
        categoryId: categoryId,
        userId,
      },
    }).catch((err) => {
      // L'événement existe peut-être déjà, on ignore l'erreur
      console.log(`Event ${startEventId} already exists or error creating:`, err.message);
    });
    result.startEventId = startEventId;
    
    // 2. Créer l'événement de fin (si date de fin existe)
    if (endDate) {
      const end = new Date(endDate);
      const endEventId = `${GOAL_EVENT_PREFIX_END}${goalId}`;
      await db.event.create({
        data: {
          id: endEventId,
          title: `⏰ Fin: ${title}`,
          description: `Date limite de l'objectif: ${title}`,
          startAt: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 18, 0, 0),
          endAt: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 19, 0, 0),
          isAllDay: true,
          color: END_EVENT_COLOR,
          categoryId: categoryId,
          userId,
        },
      }).catch((err) => {
        console.log(`Event ${endEventId} already exists or error creating:`, err.message);
      });
      result.endEventId = endEventId;
    }
    
    return result;
  } catch (error) {
    console.error('Error creating goal events:', error);
    return result;
  }
}

// ============================================================
// MISE À JOUR D'ÉVÉNEMENTS
// ============================================================

interface UpdateGoalEventsParams {
  goalId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date | null;
  categoryId?: string | null;
  userId: string;
}

export async function updateGoalEvents(params: UpdateGoalEventsParams): Promise<void> {
  const { goalId, title, description, startDate, endDate, categoryId, userId } = params;
  
  try {
    const start = new Date(startDate);
    
    // 1. Mettre à jour l'événement de début
    const startEventId = `${GOAL_EVENT_PREFIX_START}${goalId}`;
    await db.event.update({
      where: { id: startEventId, userId },
      data: {
        title: `🎯 Début: ${title}`,
        description: description || `Début de l'objectif: ${title}`,
        startAt: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 9, 0, 0),
        endAt: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 10, 0, 0),
        categoryId,
      },
    }).catch(async () => {
      // L'événement n'existe peut-être pas, on le crée
      await db.event.create({
        data: {
          id: startEventId,
          title: `🎯 Début: ${title}`,
          description: description || `Début de l'objectif: ${title}`,
          startAt: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 9, 0, 0),
          endAt: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 10, 0, 0),
          isAllDay: true,
          color: START_EVENT_COLOR,
          categoryId,
          userId,
        },
      }).catch(() => {});
    });
    
    // 2. Gérer l'événement de fin
    const endEventId = `${GOAL_EVENT_PREFIX_END}${goalId}`;
    
    if (endDate) {
      const end = new Date(endDate);
      // Mettre à jour ou créer l'événement de fin
      await db.event.update({
        where: { id: endEventId, userId },
        data: {
          title: `⏰ Fin: ${title}`,
          description: `Date limite de l'objectif: ${title}`,
          startAt: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 18, 0, 0),
          endAt: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 19, 0, 0),
          categoryId,
        },
      }).catch(async () => {
        await db.event.create({
          data: {
            id: endEventId,
            title: `⏰ Fin: ${title}`,
            description: `Date limite de l'objectif: ${title}`,
            startAt: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 18, 0, 0),
            endAt: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 19, 0, 0),
            isAllDay: true,
            color: END_EVENT_COLOR,
            categoryId,
            userId,
          },
        }).catch(() => {});
      });
    } else {
      // Supprimer l'événement de fin si plus de date de fin
      await db.event.delete({
        where: { id: endEventId, userId },
      }).catch(() => {
        // Ignorer si n'existe pas
      });
    }
  } catch (error) {
    console.error('Error updating goal events:', error);
  }
}

// ============================================================
// SUPPRESSION D'ÉVÉNEMENTS
// ============================================================

export async function deleteGoalEvents(goalId: string, userId: string): Promise<void> {
  try {
    // Supprimer l'événement de début
    const startEventId = `${GOAL_EVENT_PREFIX_START}${goalId}`;
    await db.event.delete({
      where: { id: startEventId, userId },
    }).catch(() => {
      // Ignorer si n'existe pas
    });
    
    // Supprimer l'événement de fin
    const endEventId = `${GOAL_EVENT_PREFIX_END}${goalId}`;
    await db.event.delete({
      where: { id: endEventId, userId },
    }).catch(() => {
      // Ignorer si n'existe pas
    });
    
    console.log(`Deleted goal events for goal ${goalId}`);
  } catch (error) {
    console.error('Error deleting goal events:', error);
  }
}

// ============================================================
// VÉRIFICATION D'ÉVÉNEMENTS
// ============================================================

export async function getGoalEvents(goalId: string, userId: string): Promise<{ startEvent?: { id: string; title: string } | null; endEvent?: { id: string; title: string } | null }> {
  const startEventId = `${GOAL_EVENT_PREFIX_START}${goalId}`;
  const endEventId = `${GOAL_EVENT_PREFIX_END}${goalId}`;
  
  const [startEvent, endEvent] = await Promise.all([
    db.event.findUnique({ where: { id: startEventId, userId }, select: { id: true, title: true } }),
    db.event.findUnique({ where: { id: endEventId, userId }, select: { id: true, title: true } }),
  ]);
  
  return { startEvent, endEvent };
}
