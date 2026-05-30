// ============================================================
// TASKS STORE - Gestion des tâches
// ============================================================

import { create } from 'zustand';
import { Task } from './types';
import { mapDBTaskToStore } from './mappers';

interface TasksState {
  tasks: Task[];
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  loadTasks: (userId: string) => Promise<void>;
  addTask: (task: Task, userId: string) => Promise<Task | null>;
  updateTask: (id: string, updates: Partial<Task>, userId: string) => Promise<void>;
  deleteTask: (id: string, userId: string) => Promise<void>;
}

export const useTasksStore = create<TasksState>()((set, get) => ({
  tasks: [],
  
  setTasks: (tasks) => set({ tasks }),
  
  loadTasks: async (userId) => {
    try {
      const res = await fetch(`/api/tasks?userId=${userId}`);
      const data = await res.json();
      set({ tasks: (data.tasks || []).map(mapDBTaskToStore) });
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  },
  
  addTask: async (task, userId) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          userId,
          chapters: task.chapters ? JSON.stringify(task.chapters) : undefined,
        }),
      });
      const data = await res.json();
      if (data.task) {
        const mappedTask = mapDBTaskToStore(data.task);
        set((state) => ({ tasks: [...state.tasks, mappedTask] }));
        return mappedTask;
      }
      return null;
    } catch (error) {
      console.error('Error adding task:', error);
      return null;
    }
  },
  
  updateTask: async (id, updates, userId) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...updates,
          userId,
          chapters: updates.chapters ? JSON.stringify(updates.chapters) : undefined,
        }),
      });
      const data = await res.json();
      if (data.task) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? mapDBTaskToStore(data.task) : t)),
        }));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  },
  
  deleteTask: async (id, userId) => {
    try {
      await fetch(`/api/tasks?id=${id}&userId=${userId}`, { method: 'DELETE' });
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  },
}));

// Sélecteurs optimisés
export const useTasks = () => useTasksStore((state) => state.tasks);
export const useTaskById = (id: string) => useTasksStore((state) => 
  state.tasks.find(t => t.id === id)
);
export const useTasksByStatus = (status: string) => useTasksStore((state) => 
  state.tasks.filter(t => t.status === status)
);
export const useTasksStats = () => useTasksStore((state) => ({
  total: state.tasks.length,
  completed: state.tasks.filter(t => t.status === 'completed').length,
  inProgress: state.tasks.filter(t => t.status === 'in_progress').length,
  pending: state.tasks.filter(t => t.status === 'pending').length,
  highPriority: state.tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
}));
