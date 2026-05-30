// ============================================================
// USE TASK WITH EVENT - Hook composite pour synchronisation tâche-événement
// ============================================================

import { useCallback } from 'react';
import { Task, Event } from '../../stores/types';
import { useTasksStore, useTasks } from '../../stores/tasksStore';
import { useEventsStore, useEvents } from '../../stores/eventsStore';
import { useCurrentUserId } from '../../stores/userStore';
import { mapDBTaskToStore } from '../../stores/mappers';

interface EventData {
  startTime: string;
  endTime: string;
  color: string;
}

export function useTaskWithEvent() {
  const userId = useCurrentUserId();
  const addTaskToStore = useTasksStore((s) => s.addTask);
  const addEventToStore = useEventsStore((s) => s.addEvent);
  const updateTaskInStore = useTasksStore((s) => s.updateTask);
  
  const addTaskWithEvent = useCallback(async (
    task: Task, 
    eventData?: EventData
  ): Promise<{ task: Task | null; event: Event | null }> => {
    try {
      // 1. Créer la tâche
      const taskRes = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          userId,
          chapters: task.chapters ? JSON.stringify(task.chapters) : undefined,
        }),
      });
      const taskData = await taskRes.json();
      
      if (!taskData.task) {
        return { task: null, event: null };
      }
      
      const createdTask = mapDBTaskToStore(taskData.task);
      let createdEvent: Event | null = null;
      
      // 2. Créer l'événement si demandé
      if (eventData && task.startDate) {
        const startDateStr = new Date(task.startDate).toISOString().split('T')[0];
        const eventRes = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `📋 ${task.title}`,
            description: task.description,
            startAt: `${startDateStr}T${eventData.startTime}:00`,
            endAt: `${startDateStr}T${eventData.endTime}:00`,
            isAllDay: false,
            categoryId: task.categoryId || 'cat-professional',
            color: eventData.color,
            userId,
          }),
        });
        const eventDataRes = await eventRes.json();
        
        if (eventDataRes.event?.id) {
          const eventId = eventDataRes.event.id;
          
          // 3. Mettre à jour la tâche avec l'eventId
          await fetch('/api/tasks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: createdTask.id,
              eventId,
              userId,
            }),
          });
          
          // Créer l'objet event pour le store
          createdEvent = {
            id: eventId,
            title: `📋 ${task.title}`,
            description: task.description,
            date: startDateStr,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            isAllDay: false,
            categoryId: task.categoryId || 'cat-professional',
            color: eventData.color,
            createdAt: new Date().toISOString(),
          };
        }
      }
      
      // 4. MISE À JOUR D'ÉTAT UNIQUE - batch tout ensemble
      useTasksStore.setState((state) => ({
        tasks: [...state.tasks, { ...createdTask, eventId: createdEvent?.id }],
      }));
      
      if (createdEvent) {
        useEventsStore.setState((state) => ({
          events: [...state.events, createdEvent!],
        }));
      }
      
      return { task: { ...createdTask, eventId: createdEvent?.id }, event: createdEvent };
    } catch (error) {
      console.error('Error adding task with event:', error);
      return { task: null, event: null };
    }
  }, [userId]);
  
  return { addTaskWithEvent };
}
