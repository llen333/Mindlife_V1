/**
 * Convex Functions - RAG (Retrieval-Augmented Generation)
 * Cerveau central pour la recherche et l'analyse contextuelle
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// BASE DE CONNAISSANCES
// ============================================

/**
 * Ajouter une connaissance à la base
 */
export const addKnowledge = mutation({
  args: {
    type: v.string(), // "recipe", "exercise", "pattern", "preference", "insight"
    content: v.string(),
    metadata: v.optional(v.any()),
    source: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("knowledgeBase", {
      type: args.type,
      content: args.content,
      metadata: args.metadata,
      source: args.source,
      userId: args.userId,
      timestamp: Date.now(),
      active: true,
    });
  },
});

/**
 * Rechercher dans la base de connaissances
 */
export const searchKnowledge = query({
  args: {
    type: v.optional(v.string()),
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("knowledgeBase")
      .filter((q) => q.eq(q.field("active"), true));

    if (args.type) {
      query = ctx.db
        .query("knowledgeBase")
        .withIndex("by_type", (q) => q.eq("type", args.type))
        .filter((q) => q.eq(q.field("active"), true));
    }

    let items = await query.collect();

    // Filtrer par userId si spécifié
    if (args.userId) {
      items = items.filter(
        (item) => item.userId === args.userId || item.userId === undefined
      );
    }

    return args.limit ? items.slice(0, args.limit) : items;
  },
});

/**
 * Supprimer une connaissance
 */
export const deactivateKnowledge = mutation({
  args: { knowledgeId: v.id("knowledgeBase") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.knowledgeId, { active: false });
  },
});

// ============================================
// RECETTES POUR RAG
// ============================================

/**
 * Indexer une recette pour RAG
 */
export const indexRecipe = mutation({
  args: {
    recipeId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    ingredients: v.array(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    calories: v.optional(v.float64()),
    protein: v.optional(v.float64()),
    sourceUrl: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier si existe déjà
    const existing = await ctx.db
      .query("ragRecipes")
      .withIndex("by_recipeId", (q) => q.eq("recipeId", args.recipeId))
      .first();

    const data = {
      recipeId: args.recipeId,
      name: args.name,
      description: args.description,
      ingredients: args.ingredients,
      category: args.category,
      tags: args.tags,
      calories: args.calories,
      protein: args.protein,
      sourceUrl: args.sourceUrl,
      userId: args.userId,
      timestamp: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("ragRecipes", data);
    }
  },
});

/**
 * Rechercher des recettes par nom (full-text search)
 */
export const searchRecipes = query({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Utiliser la recherche full-text
    let searchBuilder = ctx.db
      .query("ragRecipes")
      .withSearchIndex("search_name", (q) => q.search("name", args.query));

    if (args.category) {
      searchBuilder = ctx.db
        .query("ragRecipes")
        .withSearchIndex("search_name", (q) =>
          q.search("name", args.query).eq("category", args.category)
        );
    }

    let results = await searchBuilder.collect();

    // Filtrer par userId si spécifié
    if (args.userId) {
      results = results.filter(
        (r) => r.userId === args.userId || r.userId === undefined
      );
    }

    return args.limit ? results.slice(0, args.limit) : results;
  },
});

/**
 * Obtenir les recettes par catégorie
 */
export const getRecipesByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("ragRecipes")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();

    return args.limit ? results.slice(0, args.limit) : results;
  },
});

/**
 * Suggérer des recettes basées sur les ingrédients
 */
export const suggestRecipesByIngredients = query({
  args: {
    ingredients: v.array(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allRecipes = await ctx.db.query("ragRecipes").collect();

    // Calculer le score de correspondance pour chaque recette
    const scored = allRecipes.map((recipe) => {
      const recipeIngredients = recipe.ingredients.map((i) =>
        i.toLowerCase()
      );
      const searchIngredients = args.ingredients.map((i) =>
        i.toLowerCase()
      );

      let matchCount = 0;
      for (const search of searchIngredients) {
        if (
          recipeIngredients.some((ri) =>
            ri.includes(search) || search.includes(ri)
          )
        ) {
          matchCount++;
        }
      }

      return {
        ...recipe,
        matchScore: matchCount / searchIngredients.length,
      };
    });

    // Filtrer et trier par score
    const filtered = scored
      .filter((r) => r.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    return args.limit ? filtered.slice(0, args.limit) : filtered;
  },
});

// ============================================
// PRÉFÉRENCES ENRICHIES
// ============================================

/**
 * Mettre à jour une préférence enrichie
 */
export const updateEnrichedPreference = mutation({
  args: {
    userId: v.string(),
    category: v.string(),
    preference: v.string(),
    value: v.string(),
    confidence: v.float64(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("enrichedPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("category"), args.category),
          q.eq(q.field("preference"), args.preference)
        )
      )
      .first();

    const now = Date.now();

    if (existing) {
      // Augmenter la confiance si la préférence est confirmée
      const newConfidence = Math.min(
        1,
        existing.confidence + args.confidence * 0.1
      );

      await ctx.db.patch(existing._id, {
        value: args.value,
        confidence: newConfidence,
        source: args.source,
        interactions: existing.interactions + 1,
        lastUpdated: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("enrichedPreferences", {
        userId: args.userId,
        category: args.category,
        preference: args.preference,
        value: args.value,
        confidence: args.confidence,
        source: args.source,
        interactions: 1,
        lastUpdated: now,
      });
    }
  },
});

/**
 * Obtenir les préférences d'un utilisateur
 */
export const getUserPreferences = query({
  args: {
    userId: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const prefs = await ctx.db
      .query("enrichedPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    if (args.category) {
      return prefs.filter((p) => p.category === args.category);
    }

    return prefs;
  },
});

/**
 * Obtenir le profil utilisateur complet pour contexte RAG
 */
export const getUserContextForRAG = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Récupérer toutes les préférences
    const preferences = await ctx.db
      .query("enrichedPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Grouper par catégorie
    const byCategory: Record<string, { preference: string; value: string; confidence: number }[]> = {};

    for (const pref of preferences) {
      if (!byCategory[pref.category]) {
        byCategory[pref.category] = [];
      }
      byCategory[pref.category].push({
        preference: pref.preference,
        value: pref.value,
        confidence: pref.confidence,
      });
    }

    return {
      userId: args.userId,
      preferences: byCategory,
      lastUpdated: preferences.length > 0
        ? Math.max(...preferences.map((p) => p.lastUpdated))
        : null,
    };
  },
});

// ============================================
// ANALYSE ET INSIGHTS
// ============================================

/**
 * Générer des insights basés sur les données
 */
export const generateInsights = query({
  args: {
    userId: v.string(),
    type: v.string(), // "nutrition", "sport", "productivity"
  },
  handler: async (ctx, args) => {
    // Récupérer les préférences et connaissances
    const preferences = await ctx.db
      .query("enrichedPreferences")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("category"), args.type))
      .collect();

    const knowledge = await ctx.db
      .query("knowledgeBase")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .collect();

    // Calculer des insights simples
    const insights: string[] = [];

    if (args.type === "nutrition") {
      const proteinPrefs = preferences.filter((p) =>
        p.preference.includes("protein") || p.preference.includes("protéine")
      );
      if (proteinPrefs.length > 0) {
        insights.push(
          `Tu montres un intérêt pour les protéines avec ${proteinPrefs[0].value}`
        );
      }
    }

    if (args.type === "sport") {
      const sportPrefs = preferences.filter((p) =>
        p.preference.includes("sport") || p.preference.includes("exercice")
      );
      if (sportPrefs.length > 0) {
        insights.push(`Ton activité principale: ${sportPrefs[0].value}`);
      }
    }

    return {
      type: args.type,
      insights,
      preferencesCount: preferences.length,
      knowledgeCount: knowledge.length,
    };
  },
});
