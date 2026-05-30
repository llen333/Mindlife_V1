// ============================================================
// EVENTS STORE - Gestion des événements calendrier
// ============================================================

import { create } from 'zustand';
import { Event } from './types';
import { mapDBEventToStore } from './mappers';

interface EventsState {
  events: Event[];
  
  // Actions
  setEvents: (events: Event[]) => void;
  loadEvents: (userId: string) => Promise<void>;
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>, userId: string) => Promise<Event | null>;
  updateEvent: (id: string, updates: Partial<Event>, userId: string) => Promise<void>;
  deleteEvent: (id: string, userId: string) => Promise<void>;
}

export const useEventsStore = create<EventsState>()((set, get) => ({
  events: [],
  
  setEvents: (events) => set({ events }),
  
  loadEvents: async (userId) => {
    try {
      const res = await fetch(`/api/events?userId=${userId}`);
      const data = await res.json();
      set({ events: (data.events || []).map(mapDBEventToStore) });
    } catch (error) {
      console.error('Error loading events:', error);
    }
  },
  
  addEvent: async (event, userId) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: event.title,
          description: event.description,
          location: event.location,
          startAt: event.date ? `${event.date}T${event.startTime || '09:00'}:00` : new Date().toISOString(),
          endAt: event.date && event.endTime ? `${event.date}T${event.endTime}:00` : undefined,
          isAllDay: event.isAllDay,
          categoryId: event.categoryId,
          color: event.color,
          userId,
        }),
      });
      const data = await res.json();
      if (data.event) {
        const storeEvent = mapDBEventToStore(data.event);
        set((state) => ({ events: [...state.events, storeEvent] }));
        return storeEvent;
      }
      return null;
    } catch (error) {
      console.error('Error adding event:', error);
      return null;
    }
  },
  
  updateEvent: async (id, updates, userId) => {
    try {
      const res = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          title: updates.title,
          description: updates.description,
          location: updates.location,
          startAt: updates.date ? `${updates.date}T${updates.startTime || '09:00'}:00` : undefined,
          endAt: updates.date && updates.endTime ? `${updates.date}T${updates.endTime}:00` : undefined,
          isAllDay: updates.isAllDay,
          categoryId: updates.categoryId,
          color: updates.color,
          userId,
        }),
      });
      const data = await res.json();
      if (data.event) {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? mapDBEventToStore(data.event) : e)),
        }));
      }
    } catch (error) {
      console.error('Error updating event:', error);
    }
  },
  
  deleteEvent: async (id, userId) => {
    try {
      await fetch(`/api/events?id=${id}&userId=${userId}`, { method: 'DELETE' });
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  },
}));

// Sélecteurs optimisés
export const useEvents = () => useEventsStore((state) => state.events);
export const useEventById = (id: string) => useEventsStore((state) => 
  state.events.find(e => e.id === id)
);
export const useEventsByDate = (date: string) => useEventsStore((state) => 
  state.events.filter(e => e.date === date)
);
export const useEventsByDateRange = (startDate: string, endDate: string) => useEventsStore((state) => 
  state.events.filter(e => e.date >= startDate && e.date <= endDate)
);
