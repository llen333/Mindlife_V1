/**
 * Convex Schema - Base de données complète MindLife
 * SQLite + Convex = Synchronisation et stockage local
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // DONNÉES UTILISATEUR - STOCKAGE LOCAL
  // ============================================

  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    mainGoal: v.optional(v.string()),
    timezone: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  // ============================================
  // TÂCHES
  // ============================================

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // "pending", "in_progress", "completed"
    priority: v.string(), // "low", "medium", "high", "urgent"
    dueDate: v.optional(v.number()),
    startDate: v.optional(v.number()),
    progress: v.optional(v.number()),
    createdBy: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    userId: v.string(),
    categoryId: v.optional(v.string()),
    eventId: v.optional(v.id("events")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_dueDate", ["dueDate"]),

  // ============================================
  // ÉVÉNEMENTS (CALENDRIER)
  // ============================================

  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    startAt: v.number(),
    endAt: v.optional(v.number()),
    isAllDay: v.optional(v.boolean()),
    isRecurring: v.optional(v.boolean()),
    recurrence: v.optional(v.string()),
    reminder: v.optional(v.number()),
    color: v.optional(v.string()),
    userId: v.string(),
    categoryId: v.optional(v.string()),
    goalId: v.optional(v.id("goals")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_startAt", ["startAt"])
    .index("by_goalId", ["goalId"]),

  // ============================================
  // OBJECTIFS
  // ============================================

  goals: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    targetValue: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    unit: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    status: v.string(), // "active", "completed", "paused", "cancelled"
    priority: v.string(), // "a_planifier", "en_cours", "urgent"
    milestones: v.optional(v.string()),
    userId: v.string(),
    categoryId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_priority", ["priority"]),

  // ============================================
  // HABITUDES
  // ============================================

  habits: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    frequency: v.string(),
    targetDays: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.boolean(),
    userId: v.string(),
    categoryId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  habitLogs: defineTable({
    date: v.number(),
    completed: v.boolean(),
    note: v.optional(v.string()),
    habitId: v.id("habits"),
    userId: v.string(),
    createdAt: v.number(),
  }).index("by_habitId", ["habitId"])
    .index("by_date", ["date"]),

  // ============================================
  // NOTES
  // ============================================

  notes: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.string(),
    tags: v.optional(v.array(v.string())),
    isPinned: v.boolean(),
    isArchived: v.boolean(),
    userId: v.string(),
    categoryId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_isPinned", ["isPinned"]),

  // ============================================
  // CATÉGORIES
  // ============================================

  categories: defineTable({
    name: v.string(),
    icon: v.string(),
    color: v.string(),
    type: v.string(),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_name", ["name"]),

  // ============================================
  // JOURNAL
  // ============================================

  journalEntries: defineTable({
    title: v.optional(v.string()),
    content: v.string(),
    mood: v.optional(v.string()),
    gratitude: v.optional(v.string()),
    wins: v.optional(v.string()),
    challenges: v.optional(v.string()),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_createdAt", ["createdAt"]),

  // ============================================
  // RECETTES SCRAPÉES
  // ============================================

  scrapedRecipes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ingredients: v.array(v.string()),
    instructions: v.optional(v.string()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    servings: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    sourceUrl: v.string(),
    sourceName: v.string(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    calories: v.optional(v.number()),
    protein: v.optional(v.number()),
    carbs: v.optional(v.number()),
    fat: v.optional(v.number()),
    isActive: v.boolean(),
    userId: v.optional(v.string()),
    scrapedAt: v.number(),
  }).index("by_sourceName", ["sourceName"])
    .index("by_category", ["category"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["category", "userId"],
    }),

  // ============================================
  // DONNÉES TEMPORAIRES (VALIDATION)
  // ============================================

  tempData: defineTable({
    type: v.string(), // "recipe", "event", "task", "goal"
    data: v.string(), // JSON string
    userId: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  }).index("by_type", ["type"])
    .index("by_createdAt", ["createdAt"]),

  // ============================================
  // ÉTATS TEMPS RÉEL DES AGENTS
  // ============================================

  agentStates: defineTable({
    agentId: v.string(),
    type: v.string(),
    status: v.string(),
    lastActivity: v.number(),
    currentTask: v.optional(v.string()),
    data: v.optional(v.any()),
  }).index("by_agentId", ["agentId"])
    .index("by_type", ["type"]),

  // ============================================
  // MESSAGES ENTRE AGENTS
  // ============================================

  agentMessages: defineTable({
    fromAgent: v.string(),
    toAgent: v.optional(v.string()),
    type: v.string(),
    payload: v.any(),
    timestamp: v.number(),
    processed: v.boolean(),
  }).index("by_timestamp", ["timestamp"])
    .index("by_toAgent", ["toAgent"])
    .index("by_processed", ["processed"]),

  // ============================================
  // PRÉSENCE UTILISATEURS
  // ============================================

  presence: defineTable({
    userId: v.string(),
    sessionId: v.string(),
    lastSeen: v.number(),
    currentPage: v.optional(v.string()),
    device: v.optional(v.string()),
  }).index("by_userId", ["userId"])
    .index("by_sessionId", ["sessionId"]),

  // ============================================
  // NOTIFICATIONS
  // ============================================

  notifications: defineTable({
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    data: v.optional(v.any()),
    read: v.boolean(),
    timestamp: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_read", ["read"]),

  // ============================================
  // SYNC QUEUE
  // ============================================

  syncQueue: defineTable({
    entityType: v.string(),
    entityId: v.string(),
    action: v.string(),
    data: v.any(),
    userId: v.string(),
    timestamp: v.number(),
    synced: v.boolean(),
  }).index("by_entityType", ["entityType"])
    .index("by_userId", ["userId"])
    .index("by_synced", ["synced"]),

  // ============================================
  // BASE DE CONNAISSANCES (RAG)
  // ============================================

  knowledgeBase: defineTable({
    type: v.string(),
    content: v.string(),
    embedding: v.optional(v.array(v.float64())),
    metadata: v.optional(v.any()),
    source: v.string(),
    userId: v.optional(v.string()),
    timestamp: v.number(),
    active: v.boolean(),
  }).index("by_type", ["type"])
    .index("by_userId", ["userId"])
    .index("by_source", ["source"]),

  // ============================================
  // PRÉFÉRENCES UTILISATEUR
  // ============================================

  userPreferences: defineTable({
    userId: v.string(),
    category: v.string(),
    preference: v.string(),
    value: v.string(),
    confidence: v.number(),
    source: v.string(),
    interactions: v.number(),
    lastUpdated: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_category", ["category"]),
});
