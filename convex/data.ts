/**
 * Convex Functions - Tasks, Events, Goals
 * Fonctions CRUD pour les données principales
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// TÂCHES
// ============================================

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    userId: v.string(),
    categoryId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: args.status || "pending",
      priority: args.priority || "medium",
      dueDate: args.dueDate,
      userId: args.userId,
      categoryId: args.categoryId,
      progress: 0,
      createdBy: "user",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getTasks = query({
  args: {
    userId: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId));

    const tasks = await query.collect();

    if (args.status) {
      return tasks.filter((t) => t.status === args.status);
    }

    return tasks.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    progress: v.optional(v.number()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// ============================================
// ÉVÉNEMENTS
// ============================================

export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    startAt: v.number(),
    endAt: v.optional(v.number()),
    isAllDay: v.optional(v.boolean()),
    color: v.optional(v.string()),
    userId: v.string(),
    categoryId: v.optional(v.string()),
    goalId: v.optional(v.id("goals")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("events", {
      title: args.title,
      description: args.description,
      location: args.location,
      startAt: args.startAt,
      endAt: args.endAt,
      isAllDay: args.isAllDay || false,
      color: args.color || "#10B981",
      userId: args.userId,
      categoryId: args.categoryId,
      goalId: args.goalId,
      isRecurring: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getEvents = query({
  args: {
    userId: v.string(),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("events")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId));

    let events = await query.collect();

    // Filtrer par date si spécifié
    if (args.startDate) {
      events = events.filter((e) => e.startAt >= args.startDate!);
    }
    if (args.endDate) {
      events = events.filter((e) => e.startAt <= args.endDate!);
    }

    return events.sort((a, b) => a.startAt - b.startAt);
  },
});

export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    startAt: v.optional(v.number()),
    endAt: v.optional(v.number()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// ============================================
// OBJECTIFS
// ============================================

export const createGoal = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    targetValue: v.optional(v.number()),
    unit: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    userId: v.string(),
    categoryId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("goals", {
      title: args.title,
      description: args.description,
      targetValue: args.targetValue,
      currentValue: 0,
      unit: args.unit,
      startDate: args.startDate || now,
      endDate: args.endDate,
      status: args.status || "active",
      priority: args.priority || "a_planifier",
      userId: args.userId,
      categoryId: args.categoryId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getGoals = query({
  args: {
    userId: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("goals")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId));

    const goals = await query.collect();

    if (args.status) {
      return goals.filter((g) => g.status === args.status);
    }

    return goals.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const updateGoal = mutation({
  args: {
    id: v.id("goals"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    currentValue: v.optional(v.number()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const deleteGoal = mutation({
  args: { id: v.id("goals") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// ============================================
// DONNÉES TEMPORAIRES (pour validation)
// ============================================

export const createTempData = mutation({
  args: {
    type: v.string(),
    data: v.string(),
    userId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tempData", {
      type: args.type,
      data: args.data,
      userId: args.userId,
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
    });
  },
});

export const getTempData = query({
  args: { id: v.id("tempData") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const deleteTempData = mutation({
  args: { id: v.id("tempData") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// ============================================
// NOTES
// ============================================

export const createNote = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    userId: v.string(),
    categoryId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("notes", {
      title: args.title,
      content: args.content,
      type: args.type || "text",
      tags: args.tags,
      isPinned: false,
      isArchived: false,
      userId: args.userId,
      categoryId: args.categoryId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getNotes = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// ============================================
// HABITUDES
// ============================================

export const createHabit = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    frequency: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("habits", {
      name: args.name,
      description: args.description,
      frequency: args.frequency || "daily",
      color: args.color || "#10B981",
      icon: args.icon,
      isActive: true,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getHabits = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const logHabit = mutation({
  args: {
    habitId: v.id("habits"),
    userId: v.string(),
    date: v.number(),
    completed: v.boolean(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("habitLogs", {
      habitId: args.habitId,
      userId: args.userId,
      date: args.date,
      completed: args.completed,
      note: args.note,
      createdAt: Date.now(),
    });
  },
});

// ============================================
// JOURNAL
// ============================================

export const createJournalEntry = mutation({
  args: {
    title: v.optional(v.string()),
    content: v.string(),
    mood: v.optional(v.string()),
    gratitude: v.optional(v.string()),
    wins: v.optional(v.string()),
    challenges: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("journalEntries", {
      title: args.title,
      content: args.content,
      mood: args.mood,
      gratitude: args.gratitude,
      wins: args.wins,
      challenges: args.challenges,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getJournalEntries = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("journalEntries")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// ============================================
// RECETTES
// ============================================

export const createRecipe = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    ingredients: v.array(v.string()),
    instructions: v.optional(v.string()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    servings: v.optional(v.number()),
    sourceUrl: v.optional(v.string()),
    sourceName: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    calories: v.optional(v.number()),
    protein: v.optional(v.number()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scrapedRecipes", {
      name: args.name,
      description: args.description,
      ingredients: args.ingredients,
      instructions: args.instructions,
      prepTime: args.prepTime,
      cookTime: args.cookTime,
      servings: args.servings,
      sourceUrl: args.sourceUrl || "",
      sourceName: args.sourceName || "user",
      category: args.category,
      tags: args.tags,
      calories: args.calories,
      protein: args.protein,
      isActive: true,
      userId: args.userId,
      scrapedAt: Date.now(),
    });
  },
});

export const searchRecipes = query({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchBuilder = ctx.db
      .query("scrapedRecipes")
      .withSearchIndex("search_name", (q) => q.search("name", args.query));

    let results = await searchBuilder.collect();

    if (args.category) {
      results = results.filter((r) => r.category === args.category);
    }

    if (args.userId) {
      results = results.filter(
        (r) => r.userId === args.userId || r.userId === undefined
      );
    }

    return args.limit ? results.slice(0, args.limit) : results;
  },
});

// ============================================
// CATÉGORIES
// ============================================

export const createCategory = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
    color: v.string(),
    type: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("categories", {
      name: args.name,
      icon: args.icon,
      color: args.color,
      type: args.type,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getCategories = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// ============================================
// UTILISATEUR
// ============================================

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      timezone: args.timezone || "Europe/Paris",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
