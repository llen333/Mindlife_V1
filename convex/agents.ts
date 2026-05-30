/**
 * Convex Functions - Agents & Synchronisation
 * Cerveau central pour la communication entre agents
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// ÉTAT DES AGENTS
// ============================================

/**
 * Mettre à jour l'état d'un agent
 */
export const updateAgentState = mutation({
  args: {
    agentId: v.string(),
    type: v.string(),
    status: v.string(),
    currentTask: v.optional(v.string()),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agentStates")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        lastActivity: now,
        currentTask: args.currentTask,
        data: args.data,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("agentStates", {
        agentId: args.agentId,
        type: args.type,
        status: args.status,
        lastActivity: now,
        currentTask: args.currentTask,
        data: args.data,
      });
    }
  },
});

/**
 * Obtenir l'état de tous les agents
 */
export const getAllAgentStates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agentStates").collect();
  },
});

/**
 * Obtenir l'état d'un agent spécifique
 */
export const getAgentState = query({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agentStates")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();
  },
});

// ============================================
// MESSAGES ENTRE AGENTS
// ============================================

/**
 * Broadcaster un message à tous les agents
 */
export const broadcastMessage = mutation({
  args: {
    fromAgent: v.string(),
    type: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agentMessages", {
      fromAgent: args.fromAgent,
      toAgent: null, // null = broadcast
      type: args.type,
      payload: args.payload,
      timestamp: Date.now(),
      processed: false,
    });
  },
});

/**
 * Envoyer un message à un agent spécifique
 */
export const sendMessage = mutation({
  args: {
    fromAgent: v.string(),
    toAgent: v.string(),
    type: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agentMessages", {
      fromAgent: args.fromAgent,
      toAgent: args.toAgent,
      type: args.type,
      payload: args.payload,
      timestamp: Date.now(),
      processed: false,
    });
  },
});

/**
 * Récupérer les messages non traités (pour un agent)
 */
export const getUnprocessedMessages = query({
  args: {
    toAgent: v.optional(v.string()),
    since: v.number(),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("agentMessages")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", args.since))
      .filter((q) => q.eq(q.field("processed"), false));

    return await query.collect();
  },
});

/**
 * Marquer un message comme traité
 */
export const markMessageProcessed = mutation({
  args: { messageId: v.id("agentMessages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { processed: true });
  },
});

// ============================================
// SYNCHRONISATION SQLITE -> CONVEX
// ============================================

/**
 * Ajouter un élément à la queue de synchronisation
 */
export const addToSyncQueue = mutation({
  args: {
    entityType: v.string(),
    entityId: v.string(),
    action: v.string(),
    data: v.any(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("syncQueue", {
      entityType: args.entityType,
      entityId: args.entityId,
      action: args.action,
      data: args.data,
      userId: args.userId,
      timestamp: Date.now(),
      synced: false,
    });
  },
});

/**
 * Récupérer les éléments non synchronisés
 */
export const getUnsyncedItems = query({
  args: {
    entityType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("syncQueue")
      .withIndex("by_synced", (q) => q.eq("synced", false));

    if (args.entityType) {
      query = ctx.db
        .query("syncQueue")
        .withIndex("by_entityType", (q) => q.eq("entityType", args.entityType))
        .filter((q) => q.eq(q.field("synced"), false));
    }

    const items = await query.collect();
    return args.limit ? items.slice(0, args.limit) : items;
  },
});

/**
 * Marquer un élément comme synchronisé
 */
export const markSynced = mutation({
  args: { syncId: v.id("syncQueue") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.syncId, { synced: true });
  },
});

// ============================================
// PRÉSENCE UTILISATEURS
// ============================================

/**
 * Mettre à jour la présence utilisateur
 */
export const updatePresence = mutation({
  args: {
    userId: v.string(),
    sessionId: v.string(),
    currentPage: v.optional(v.string()),
    device: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastSeen: now,
        currentPage: args.currentPage,
        device: args.device,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("presence", {
        userId: args.userId,
        sessionId: args.sessionId,
        lastSeen: now,
        currentPage: args.currentPage,
        device: args.device,
      });
    }
  },
});

/**
 * Obtenir les utilisateurs en ligne
 */
export const getOnlineUsers = query({
  args: {},
  handler: async (ctx) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return await ctx.db
      .query("presence")
      .filter((q) => q.gte(q.field("lastSeen"), fiveMinutesAgo))
      .collect();
  },
});

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Créer une notification
 */
export const createNotification = mutation({
  args: {
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      data: args.data,
      read: false,
      timestamp: Date.now(),
    });
  },
});

/**
 * Obtenir les notifications d'un utilisateur
 */
export const getNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

/**
 * Marquer une notification comme lue
 */
export const markNotificationRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { read: true });
  },
});
