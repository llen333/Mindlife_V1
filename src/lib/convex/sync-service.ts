/**
 * Service de Synchronisation SQLite <-> Convex
 * Cerveau central pour la coordination des données
 */

import { db } from '@/lib/db';

// Types pour la synchronisation
interface SyncItem {
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  userId: string;
}

// Convex client (initialisé si CONVEX_URL est disponible)
let convexClient: any = null;

async function getConvexClient() {
  if (convexClient) return convexClient;

  const convexUrl = process.env.CONVEX_URL;
  if (!convexUrl) {
    console.log('[Convex] CONVEX_URL non configuré - mode local uniquement');
    return null;
  }

  try {
    const { ConvexHttpClient } = await import('convex/browser');
    convexClient = new ConvexHttpClient(convexUrl);
    return convexClient;
  } catch (error) {
    console.error('[Convex] Erreur initialisation client:', error);
    return null;
  }
}

// ============================================
// SYNCHRONISATION SQLITE -> CONVEX
// ============================================

/**
 * Synchroniser une recette vers Convex
 */
export async function syncRecipeToConvex(recipeId: string): Promise<boolean> {
  const client = await getConvexClient();
  if (!client) return false;

  try {
    const recipe = await db.scrapedRecipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) return false;

    // Appeler la mutation Convex (dynamique pour éviter les erreurs de build)
    // Note: En production, utiliser les types générés par Convex
    await client.mutation('rag:indexRecipe', {
      recipeId: recipe.id,
      name: recipe.name,
      description: recipe.description || undefined,
      ingredients: JSON.parse(recipe.ingredients || '[]'),
      category: recipe.category || undefined,
      tags: recipe.tags ? JSON.parse(recipe.tags) : undefined,
      calories: recipe.calories || undefined,
      protein: recipe.protein || undefined,
      sourceUrl: recipe.sourceUrl,
      userId: recipe.userId || undefined,
    });

    console.log(`[Convex] Recette ${recipeId} synchronisée`);
    return true;
  } catch (error) {
    console.error(`[Convex] Erreur sync recette ${recipeId}:`, error);
    return false;
  }
}

/**
 * Synchroniser toutes les recettes vers Convex
 */
export async function syncAllRecipesToConvex(): Promise<{
  total: number;
  synced: number;
  errors: number;
}> {
  const client = await getConvexClient();
  if (!client) {
    return { total: 0, synced: 0, errors: 0 };
  }

  try {
    const recipes = await db.scrapedRecipe.findMany({
      where: { isActive: true },
      take: 100,
    });

    let synced = 0;
    let errors = 0;

    for (const recipe of recipes) {
      const success = await syncRecipeToConvex(recipe.id);
      if (success) {
        synced++;
      } else {
        errors++;
      }
    }

    console.log(`[Convex] Sync recettes: ${synced}/${recipes.length}`);
    return { total: recipes.length, synced, errors };
  } catch (error) {
    console.error('[Convex] Erreur sync toutes recettes:', error);
    return { total: 0, synced: 0, errors: 0 };
  }
}

/**
 * Synchroniser une préférence utilisateur vers Convex
 */
export async function syncPreferenceToConvex(
  userId: string,
  category: string,
  preference: string,
  value: string,
  confidence: number = 0.5,
  source: string = 'explicit'
): Promise<boolean> {
  const client = await getConvexClient();
  if (!client) return false;

  try {
    await client.mutation('rag:updateEnrichedPreference', {
      userId,
      category,
      preference,
      value,
      confidence,
      source,
    });

    return true;
  } catch (error) {
    console.error('[Convex] Erreur sync préférence:', error);
    return false;
  }
}

// ============================================
// BROADCAST AUX AGENTS
// ============================================

/**
 * Broadcaster un message à tous les agents
 */
export async function broadcastToAgents(
  fromAgent: string,
  type: string,
  payload: any
): Promise<boolean> {
  const client = await getConvexClient();
  if (!client) {
    // Fallback: stocker dans SQLite
    try {
      await db.agentMessage.create({
        data: {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fromAgent,
          toAgent: null,
          messageType: type,
          payload: JSON.stringify(payload),
          processed: false,
        },
      });
      return true;
    } catch (error) {
      console.error('[Sync] Erreur broadcast SQLite:', error);
      return false;
    }
  }

  try {
    await client.mutation('agents:broadcastMessage', {
      fromAgent,
      type,
      payload,
    });
    return true;
  } catch (error) {
    console.error('[Convex] Erreur broadcast:', error);
    return false;
  }
}

/**
 * Mettre à jour l'état d'un agent
 */
export async function updateAgentState(
  agentId: string,
  type: string,
  status: 'idle' | 'working' | 'error',
  currentTask?: string,
  data?: any
): Promise<boolean> {
  const client = await getConvexClient();

  // Toujours mettre à jour SQLite
  try {
    await db.agentState.upsert({
      where: { agentId },
      update: {
        status,
        lastActivity: new Date(),
        currentTask,
        metadata: data ? JSON.stringify(data) : undefined,
        updatedAt: new Date(),
      },
      create: {
        id: `agent-state-${agentId}`,
        agentId,
        agentType: type,
        status,
        currentTask,
        metadata: data ? JSON.stringify(data) : undefined,
      },
    });
  } catch (error) {
    console.error('[SQLite] Erreur update agent state:', error);
  }

  // Si Convex disponible, synchroniser
  if (client) {
    try {
      await client.mutation('agents:updateAgentState', {
        agentId,
        type,
        status,
        currentTask,
        data,
      });
    } catch (error) {
      console.error('[Convex] Erreur update agent state:', error);
    }
  }

  return true;
}

// ============================================
// RAG - RECHERCHE CONTEXTUELLE
// ============================================

/**
 * Rechercher des recettes dans Convex (RAG)
 */
export async function searchRecipesInConvex(
  query: string,
  category?: string,
  userId?: string,
  limit: number = 10
): Promise<any[]> {
  const client = await getConvexClient();
  if (!client) {
    // Fallback: recherche dans SQLite
    const recipes = await db.scrapedRecipe.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
        ...(category && { category }),
      },
      take: limit,
    });
    return recipes.map((r) => ({
      ...r,
      ingredients: JSON.parse(r.ingredients || '[]'),
    }));
  }

  try {
    const results = await client.query('rag:searchRecipes', {
      query,
      category,
      userId,
      limit,
    });
    return results;
  } catch (error) {
    console.error('[Convex] Erreur recherche recettes:', error);
    return [];
  }
}

/**
 * Suggérer des recettes basées sur les ingrédients disponibles
 */
export async function suggestRecipesByIngredients(
  ingredients: string[],
  limit: number = 5
): Promise<any[]> {
  const client = await getConvexClient();
  if (!client) {
    // Fallback simple
    const recipes = await db.scrapedRecipe.findMany({
      where: { isActive: true },
      take: 20,
    });

    return recipes
      .map((r) => ({
        ...r,
        ingredients: JSON.parse(r.ingredients || '[]') as string[],
        matchScore: 0.5,
      }))
      .slice(0, limit);
  }

  try {
    return await client.query('rag:suggestRecipesByIngredients', {
      ingredients,
      limit,
    });
  } catch (error) {
    console.error('[Convex] Erreur suggestion recettes:', error);
    return [];
  }
}

/**
 * Obtenir le contexte utilisateur pour RAG
 */
export async function getUserContextForRAG(userId: string): Promise<any> {
  const client = await getConvexClient();
  if (!client) {
    // Fallback: récupérer depuis SQLite
    const preferences = await db.userPreference.findMany({
      where: { userId },
    });

    return {
      userId,
      preferences: preferences.reduce((acc, p) => {
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push({
          preference: p.preference,
          value: p.value,
          confidence: p.confidence,
        });
        return acc;
      }, {} as Record<string, any[]>),
    };
  }

  try {
    return await client.query('rag:getUserContextForRAG', { userId });
  } catch (error) {
    console.error('[Convex] Erreur get user context:', error);
    return { userId, preferences: {} };
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Créer une notification
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: any
): Promise<boolean> {
  const client = await getConvexClient();

  if (client) {
    try {
      await client.mutation('agents:createNotification', {
        userId,
        type,
        title,
        message,
        data,
      });
    } catch (error) {
      console.error('[Convex] Erreur création notification:', error);
    }
  }

  // Aussi stocker localement pour référence
  console.log(`[Notification] ${title}: ${message}`);
  return true;
}

// ============================================
// INITIALISATION
// ============================================

/**
 * Vérifier si Convex est disponible
 */
export async function checkConvexStatus(): Promise<{
  available: boolean;
  message: string;
}> {
  const convexUrl = process.env.CONVEX_URL;

  if (!convexUrl) {
    return {
      available: false,
      message: 'CONVEX_URL non configuré. Mode local uniquement.',
    };
  }

  try {
    const client = await getConvexClient();
    if (!client) {
      return {
        available: false,
        message: 'Client Convex non initialisable.',
      };
    }

    // Test simple
    await client.query('agents:getAllAgentStates');

    return {
      available: true,
      message: 'Convex connecté et fonctionnel.',
    };
  } catch (error) {
    return {
      available: false,
      message: `Erreur connexion Convex: ${error instanceof Error ? error.message : 'Unknown'}`,
    };
  }
}
