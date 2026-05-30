/**
 * MindLife Socket.IO Server
 * Port 3003 - Serveur de synchronisation temps réel
 */

import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = 3003;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000', 
      'http://127.0.0.1:3000',
      'http://localhost:3070',
      'http://127.0.0.1:3070'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Stockage en mémoire pour les données temporaires
const connectedUsers = new Map<string, string>();

io.on('connection', (socket) => {
  console.log(`✅ Client connecté: ${socket.id}`);

  // Identification utilisateur
  socket.on('identify', (userId: string) => {
    connectedUsers.set(socket.id, userId);
    console.log(`👤 Utilisateur identifié: ${userId}`);
    socket.join(`user:${userId}`);
  });

  // ==================== TÂCHES ====================
  socket.on('task:create', (task) => {
    console.log('📋 Tâche créée:', task.id);
    io.emit('task:created', task);
  });

  socket.on('task:update', (task) => {
    console.log('📋 Tâche mise à jour:', task.id);
    io.emit('task:updated', task);
  });

  socket.on('task:delete', (taskId) => {
    console.log('📋 Tâche supprimée:', taskId);
    io.emit('task:deleted', taskId);
  });

  // ==================== OBJECTIFS ====================
  socket.on('goal:create', (goal) => {
    console.log('🎯 Objectif créé:', goal.id);
    io.emit('goal:created', goal);
  });

  socket.on('goal:update', (goal) => {
    console.log('🎯 Objectif mis à jour:', goal.id);
    io.emit('goal:updated', goal);
  });

  socket.on('goal:delete', (goalId) => {
    console.log('🎯 Objectif supprimé:', goalId);
    io.emit('goal:deleted', goalId);
  });

  // ==================== HABITUDES ====================
  socket.on('habit:log', (data) => {
    console.log('🔄 Habitude loggée:', data.habitId);
    io.emit('habit:logged', data);
  });

  socket.on('habit:update', (habit) => {
    console.log('🔄 Habitude mise à jour:', habit.id);
    io.emit('habit:updated', habit);
  });

  // ==================== ÉVÉNEMENTS ====================
  socket.on('event:create', (event) => {
    console.log('📅 Événement créé:', event.id);
    io.emit('event:created', event);
  });

  socket.on('event:update', (event) => {
    console.log('📅 Événement mis à jour:', event.id);
    io.emit('event:updated', event);
  });

  socket.on('event:delete', (eventId) => {
    console.log('📅 Événement supprimé:', eventId);
    io.emit('event:deleted', eventId);
  });

  // ==================== NOTES ====================
  socket.on('note:create', (note) => {
    console.log('📝 Note créée:', note.id);
    io.emit('note:created', note);
  });

  socket.on('note:update', (note) => {
    console.log('📝 Note mise à jour:', note.id);
    io.emit('note:updated', note);
  });

  socket.on('note:delete', (noteId) => {
    console.log('📝 Note supprimée:', noteId);
    io.emit('note:deleted', noteId);
  });

  // ==================== JOURNAL ====================
  socket.on('journal:create', (entry) => {
    console.log('📔 Entrée journal créée:', entry.id);
    io.emit('journal:created', entry);
  });

  socket.on('journal:update', (entry) => {
    console.log('📔 Entrée journal mise à jour:', entry.id);
    io.emit('journal:updated', entry);
  });

  // ==================== CHAT / SPIRIT ====================
  socket.on('spirit:message', (data) => {
    console.log('👻 Message spirit:', data.conversationId);
    socket.broadcast.emit('spirit:message', data);
  });

  // ==================== SYNC GLOBALE ====================
  socket.on('sync:request', (userId) => {
    console.log('🔄 Demande de sync pour:', userId);
    socket.emit('sync:complete', { timestamp: Date.now() });
  });

  // ==================== DÉCONNEXION ====================
  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    console.log(`❌ Client déconnecté: ${socket.id} (${userId || 'anonyme'})`);
    connectedUsers.delete(socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🚀 MindLife Socket.IO Server running on port ${PORT}`);
  console.log('═══════════════════════════════════════════════════════');
});
