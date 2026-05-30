/**
 * Convex Client - Backend
 * Client Convex pour les API routes
 * Utilise Convex quand disponible, fallback vers Prisma
 */

import { ConvexHttpClient } from 'convex/browser';

// Configuration
const CONVEX_URL = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;

// Singleton client
let convexClient: ConvexHttpClient | null = null;

/**
 * Obtenir le client Convex
 */
export function getConvexClient(): ConvexHttpClient | null {
  if (convexClient) return convexClient;

  if (!CONVEX_URL) {
    console.log('[Convex] Pas de CONVEX_URL configurée - utilisation de Prisma uniquement');
    return null;
  }

  try {
    convexClient = new ConvexHttpClient(CONVEX_URL);
    console.log('[Convex] Client initialisé:', CONVEX_URL);
    return convexClient;
  } catch (error) {
    console.error('[Convex] Erreur initialisation:', error);
    return null;
  }
}

/**
 * Vérifier si Convex est disponible
 */
export function isConvexAvailable(): boolean {
  return !!CONVEX_URL && !!getConvexClient();
}

/**
 * Helper pour exécuter une mutation Convex
 */
export async function convexMutation(name: string, args: any): Promise<any> {
  const client = getConvexClient();
  if (!client) {
    throw new Error('Convex non disponible');
  }
  return await client.mutation(name, args);
}

/**
 * Helper pour exécuter une query Convex
 */
export async function convexQuery(name: string, args: any): Promise<any> {
  const client = getConvexClient();
  if (!client) {
    throw new Error('Convex non disponible');
  }
  return await client.query(name, args);
}

// Export des noms de fonctions pour faciliter l'utilisation
export const CONVEX_FUNCTIONS = {
  // Tasks
  createTask: 'data:createTask',
  getTasks: 'data:getTasks',
  updateTask: 'data:updateTask',
  deleteTask: 'data:deleteTask',

  // Events
  createEvent: 'data:createEvent',
  getEvents: 'data:getEvents',
  updateEvent: 'data:updateEvent',
  deleteEvent: 'data:deleteEvent',

  // Goals
  createGoal: 'data:createGoal',
  getGoals: 'data:getGoals',
  updateGoal: 'data:updateGoal',
  deleteGoal: 'data:deleteGoal',

  // Notes
  createNote: 'data:createNote',
  getNotes: 'data:getNotes',

  // Habits
  createHabit: 'data:createHabit',
  getHabits: 'data:getHabits',
  logHabit: 'data:logHabit',

  // Journal
  createJournalEntry: 'data:createJournalEntry',
  getJournalEntries: 'data:getJournalEntries',

  // Recipes
  createRecipe: 'data:createRecipe',
  searchRecipes: 'data:searchRecipes',

  // Categories
  createCategory: 'data:createCategory',
  getCategories: 'data:getCategories',

  // TempData
  createTempData: 'data:createTempData',
  getTempData: 'data:getTempData',
  deleteTempData: 'data:deleteTempData',

  // User
  createUser: 'data:createUser',
  getUser: 'data:getUser',
  getUserById: 'data:getUserById',

  // Agents
  updateAgentState: 'agents:updateAgentState',
  broadcastMessage: 'agents:broadcastMessage',

  // RAG
  indexRecipe: 'rag:indexRecipe',
  searchRecipesRAG: 'rag:searchRecipes',
  suggestRecipesByIngredients: 'rag:suggestRecipesByIngredients',
};
