// ============================================================
// MILESTONE CALENDAR SERVICE
// Service pour synchroniser les milestones avec le calendrier
// ============================================================

import { GoalMilestone } from '@/lib/stores/types';

export interface MilestoneEventData {
  goalId: string;
  milestoneId: string;
  title: string;
  date: string;           // YYYY-MM-DD
  time: string;           // HH:mm
  duration?: number;      // Durée en minutes
  color?: string;
  categoryId?: string;
  userId: string;
}

/**
 * Calcule les dates des milestones entre startDate et endDate
 * Distribue les milestones uniformément sur la période
 */
export function calculateMilestoneDates(
  startDate: string,
  endDate: string,
  milestoneCount: number
): string[] {
  if (!startDate || !endDate || milestoneCount <= 0) {
    return [];
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    // Si la date de début >= fin, utiliser le jour même
    return [startDate];
  }

  const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  if (milestoneCount === 1) {
    return [startDate];
  }

  const dates: string[] = [];
  
  // Calculer l'intervalle entre chaque milestone
  const interval = totalDays / (milestoneCount - 1);
  
  for (let i = 0; i < milestoneCount; i++) {
    const milestoneDate = new Date(start.getTime() + interval * i * 24 * 60 * 60 * 1000);
    dates.push(milestoneDate.toISOString().split('T')[0]);
  }

  return dates;
}

/**
 * Génère les données d'événements pour chaque milestone
 */
export function generateMilestoneEvents(
  goalId: string,
  goalTitle: string,
  milestones: GoalMilestone[],
  startDate: string,
  endDate: string,
  defaultTime: string,
  userId: string,
  categoryId?: string,
  color?: string
): MilestoneEventData[] {
  if (!startDate || !endDate || milestones.length === 0) {
    return [];
  }

  const dates = calculateMilestoneDates(startDate, endDate, milestones.length);
  
  return milestones.map((milestone, index) => ({
    goalId,
    milestoneId: milestone.id,
    title: `🎯 ${milestone.title}`,
    date: dates[index] || startDate,
    time: defaultTime,
    duration: milestone.estimatedTime || 60,
    color: color || 'violet',
    categoryId,
    userId,
  }));
}

/**
 * Crée un événement calendrier pour une milestone via l'API
 */
export async function createMilestoneEvent(data: MilestoneEventData): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const startAt = `${data.date}T${data.time}:00`;
    const endAt = data.duration 
      ? new Date(new Date(startAt).getTime() + data.duration * 60 * 1000).toISOString()
      : undefined;

    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        startAt,
        endAt,
        isAllDay: false,
        color: data.color,
        categoryId: data.categoryId,
        goalId: data.goalId,
        milestoneId: data.milestoneId,
        userId: data.userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API Error creating milestone event:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        requestData: data
      });
      throw new Error(`Failed to create event: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return { success: true, eventId: result.event?.id };
  } catch (error) {
    console.error('Error creating milestone event:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Met à jour un événement calendrier pour une milestone
 */
export async function updateMilestoneEvent(
  eventId: string,
  data: Partial<MilestoneEventData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const updatePayload: Record<string, unknown> = {
      id: eventId,
      userId: data.userId,
    };

    if (data.title) updatePayload.title = data.title;
    if (data.date && data.time) {
      updatePayload.startAt = `${data.date}T${data.time}:00`;
      if (data.duration) {
        updatePayload.endAt = new Date(
          new Date(updatePayload.startAt as string).getTime() + data.duration * 60 * 1000
        ).toISOString();
      }
    }
    if (data.color) updatePayload.color = data.color;
    if (data.categoryId !== undefined) updatePayload.categoryId = data.categoryId;

    const response = await fetch('/api/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      throw new Error('Failed to update event');
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating milestone event:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Supprime les événements calendrier d'un objectif
 */
export async function deleteGoalMilestoneEvents(goalId: string, userId: string): Promise<{ success: boolean }> {
  try {
    // Récupérer tous les événements liés à cet objectif
    const response = await fetch(`/api/events?userId=${userId}`);
    const data = await response.json();
    
    const goalEvents = (data.events || []).filter((e: any) => e.goalId === goalId);
    
    // Supprimer chaque événement
    for (const event of goalEvents) {
      await fetch(`/api/events?id=${event.id}&userId=${userId}`, {
        method: 'DELETE',
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting goal milestone events:', error);
    return { success: false };
  }
}

/**
 * Synchronise les milestones d'un objectif avec le calendrier
 * - Supprime les anciens événements
 * - Crée les nouveaux événements
 */
export async function syncMilestonesWithCalendar(
  goalId: string,
  goalTitle: string,
  milestones: GoalMilestone[],
  startDate: string,
  endDate: string,
  defaultTime: string,
  userId: string,
  categoryId?: string,
  color?: string
): Promise<{ success: boolean; eventsCreated: number; errors: string[] }> {
  const errors: string[] = [];
  let eventsCreated = 0;

  // 1. Supprimer les anciens événements de cet objectif
  await deleteGoalMilestoneEvents(goalId, userId);

  // 2. Créer les nouveaux événements pour chaque milestone
  const eventDataList = generateMilestoneEvents(
    goalId,
    goalTitle,
    milestones,
    startDate,
    endDate,
    defaultTime,
    userId,
    categoryId,
    color
  );

  for (const eventData of eventDataList) {
    const result = await createMilestoneEvent(eventData);
    if (result.success) {
      eventsCreated++;
    } else {
      errors.push(`Failed to create event for milestone: ${eventData.title}`);
    }
  }

  return { 
    success: errors.length === 0, 
    eventsCreated, 
    errors 
  };
}
