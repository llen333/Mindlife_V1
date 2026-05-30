/**
 * MindLife - Status Constants
 * Centralise tous les statuts utilisés dans l'application
 */

// Statuts des tâches
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Statuts des objectifs
export const GOAL_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

// Statuts des événements
export const EVENT_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Statuts des habitudes
export const HABIT_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  ARCHIVED: 'archived',
} as const;

// ID utilisateur par défaut
export const DEFAULT_USER_ID = 'mindlife-user';

// Types dérivés
export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];
export type GoalStatus = typeof GOAL_STATUS[keyof typeof GOAL_STATUS];
export type EventStatus = typeof EVENT_STATUS[keyof typeof EVENT_STATUS];
export type HabitStatus = typeof HABIT_STATUS[keyof typeof HABIT_STATUS];

// Helpers pour les statuts
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    in_progress: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé',
    active: 'Actif',
    paused: 'En pause',
    archived: 'Archivé',
    scheduled: 'Planifié',
  };
  return labels[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'amber',
    in_progress: 'cyan',
    completed: 'emerald',
    cancelled: 'rose',
    active: 'emerald',
    paused: 'amber',
    archived: 'slate',
    scheduled: 'blue',
  };
  return colors[status] || 'slate';
};
