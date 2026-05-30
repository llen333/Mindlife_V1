/**
 * MindLife Socket.IO Hook
 * Connexion au serveur temps réel sur port 3003
 */

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_PORT = 3003;
const SOCKET_URL = typeof window !== 'undefined' ? `/?XTransformPort=${SOCKET_PORT}` : '';

let socketInstance: Socket | null = null;

export function useSocket(userId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      socketInstance.on('connect', () => {
        console.log('🔌 Socket connecté:', socketInstance?.id);
        setIsConnected(true);
        if (userId) {
          socketInstance?.emit('identify', userId);
        }
      });

      socketInstance.on('disconnect', () => {
        console.log('🔌 Socket déconnecté');
        setIsConnected(false);
      });

      setSocket(socketInstance);
    } else {
      setSocket(socketInstance);
      setIsConnected(socketInstance.connected);
      if (userId && socketInstance.connected) {
        socketInstance.emit('identify', userId);
      }
    }

    return () => {
      // On ne ferme pas la connexion ici pour la réutiliser
    };
  }, [userId]);

  // ==================== ÉCOUTEURS ====================

  const onTaskCreated = useCallback((callback: (task: any) => void) => {
    socket?.on('task:created', callback);
    return () => socket?.off('task:created', callback);
  }, [socket]);

  const onTaskUpdated = useCallback((callback: (task: any) => void) => {
    socket?.on('task:updated', callback);
    return () => socket?.off('task:updated', callback);
  }, [socket]);

  const onTaskDeleted = useCallback((callback: (taskId: string) => void) => {
    socket?.on('task:deleted', callback);
    return () => socket?.off('task:deleted', callback);
  }, [socket]);

  const onGoalCreated = useCallback((callback: (goal: any) => void) => {
    socket?.on('goal:created', callback);
    return () => socket?.off('goal:created', callback);
  }, [socket]);

  const onGoalUpdated = useCallback((callback: (goal: any) => void) => {
    socket?.on('goal:updated', callback);
    return () => socket?.off('goal:updated', callback);
  }, [socket]);

  const onGoalDeleted = useCallback((callback: (goalId: string) => void) => {
    socket?.on('goal:deleted', callback);
    return () => socket?.off('goal:deleted', callback);
  }, [socket]);

  const onHabitLogged = useCallback((callback: (data: any) => void) => {
    socket?.on('habit:logged', callback);
    return () => socket?.off('habit:logged', callback);
  }, [socket]);

  const onEventCreated = useCallback((callback: (event: any) => void) => {
    socket?.on('event:created', callback);
    return () => socket?.off('event:created', callback);
  }, [socket]);

  const onEventUpdated = useCallback((callback: (event: any) => void) => {
    socket?.on('event:updated', callback);
    return () => socket?.off('event:updated', callback);
  }, [socket]);

  const onEventDeleted = useCallback((callback: (eventId: string) => void) => {
    socket?.on('event:deleted', callback);
    return () => socket?.off('event:deleted', callback);
  }, [socket]);

  // ==================== ÉMETTEURS ====================

  const emitTaskCreate = useCallback((task: any) => {
    socket?.emit('task:create', task);
  }, [socket]);

  const emitTaskUpdate = useCallback((task: any) => {
    socket?.emit('task:update', task);
  }, [socket]);

  const emitTaskDelete = useCallback((taskId: string) => {
    socket?.emit('task:delete', taskId);
  }, [socket]);

  const emitGoalCreate = useCallback((goal: any) => {
    socket?.emit('goal:create', goal);
  }, [socket]);

  const emitGoalUpdate = useCallback((goal: any) => {
    socket?.emit('goal:update', goal);
  }, [socket]);

  const emitGoalDelete = useCallback((goalId: string) => {
    socket?.emit('goal:delete', goalId);
  }, [socket]);

  const emitHabitLog = useCallback((data: any) => {
    socket?.emit('habit:log', data);
  }, [socket]);

  const emitEventCreate = useCallback((event: any) => {
    socket?.emit('event:create', event);
  }, [socket]);

  const emitEventUpdate = useCallback((event: any) => {
    socket?.emit('event:update', event);
  }, [socket]);

  const emitEventDelete = useCallback((eventId: string) => {
    socket?.emit('event:delete', eventId);
  }, [socket]);

  return {
    socket,
    isConnected,
    // Listeners
    onTaskCreated,
    onTaskUpdated,
    onTaskDeleted,
    onGoalCreated,
    onGoalUpdated,
    onGoalDeleted,
    onHabitLogged,
    onEventCreated,
    onEventUpdated,
    onEventDeleted,
    // Emitters
    emitTaskCreate,
    emitTaskUpdate,
    emitTaskDelete,
    emitGoalCreate,
    emitGoalUpdate,
    emitGoalDelete,
    emitHabitLog,
    emitEventCreate,
    emitEventUpdate,
    emitEventDelete,
  };
}

export default useSocket;
