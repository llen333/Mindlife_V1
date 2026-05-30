/**
 * Convex Client - Cerveau Central de MindLife
 * Utilisé pour le temps réel, la synchronisation et le RAG
 *
 * Configuration:
 * 1. Ajouter CONVEX_URL dans .env (optionnel - fonctionne sans en mode local)
 * 2. Pour activer: npx convex dev (dans un terminal séparé)
 */

// ============================================
// EXPORT STATUS
// ============================================

export const convexConfig = {
  enabled: typeof process !== 'undefined' && !!process.env?.CONVEX_URL,
  message: "Convex peut être activé en ajoutant CONVEX_URL dans .env",
};

// ============================================
// TYPES
// ============================================

export interface ConvexAgentState {
  agentId: string;
  type: string;
  status: 'idle' | 'working' | 'error';
  lastActivity: number;
  currentTask?: string;
  data?: any;
}

export interface ConvexMessage {
  fromAgent: string;
  toAgent?: string;
  type: string;
  payload: any;
  timestamp: number;
  processed: boolean;
}

export interface ConvexNotification {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  timestamp: number;
}

export interface RAGRecipe {
  recipeId: string;
  name: string;
  description?: string;
  ingredients: string[];
  category?: string;
  tags?: string[];
  calories?: number;
  protein?: number;
  sourceUrl?: string;
  userId?: string;
  timestamp: number;
}

export interface EnrichedPreference {
  userId: string;
  category: string;
  preference: string;
  value: string;
  confidence: number;
  source: string;
  interactions: number;
  lastUpdated: number;
}

// ============================================
// CONVEX URL TEMPLATE (pour installation locale)
// ============================================

/**
 * Pour configurer Convex localement:
 *
 * 1. Créer un compte sur https://convex.dev
 * 2. Créer un nouveau projet
 * 3. Copier l'URL du dashboard dans .env:
 *    CONVEX_URL=https://your-project.convex.cloud
 *
 * 4. Initialiser Convex:
 *    npx convex dev
 *
 * 5. Le schéma sera automatiquement déployé depuis convex/schema.ts
 */

// ============================================
// UTILITAIRES
// ============================================

/**
 * Formater une date pour Convex (timestamp en ms)
 */
export function toConvexTimestamp(date: Date): number {
  return date.getTime();
}

/**
 * Convertir un timestamp Convex en Date
 */
export function fromConvexTimestamp(timestamp: number): Date {
  return new Date(timestamp);
}

// ============================================
// EXPORT PLACEHOLDER FUNCTIONS
// ============================================

/**
 * Ces fonctions sont implémentées dans sync-service.ts
 * Ce fichier sert de référence pour les types et la configuration
 */

export const convexApiTemplate = {
  // Agents
  updateAgentState: 'agents:updateAgentState',
  getAllAgentStates: 'agents:getAllAgentStates',
  getAgentState: 'agents:getAgentState',
  broadcastMessage: 'agents:broadcastMessage',
  sendMessage: 'agents:sendMessage',
  getUnprocessedMessages: 'agents:getUnprocessedMessages',

  // Sync
  addToSyncQueue: 'agents:addToSyncQueue',
  getUnsyncedItems: 'agents:getUnsyncedItems',

  // Presence
  updatePresence: 'agents:updatePresence',
  getOnlineUsers: 'agents:getOnlineUsers',

  // Notifications
  createNotification: 'agents:createNotification',
  getNotifications: 'agents:getNotifications',

  // RAG
  addKnowledge: 'rag:addKnowledge',
  searchKnowledge: 'rag:searchKnowledge',
  indexRecipe: 'rag:indexRecipe',
  searchRecipes: 'rag:searchRecipes',
  suggestRecipesByIngredients: 'rag:suggestRecipesByIngredients',
  updateEnrichedPreference: 'rag:updateEnrichedPreference',
  getUserContextForRAG: 'rag:getUserContextForRAG',
};

console.log('[Convex] Module chargé - Mode:', convexConfig.enabled ? 'Connecté' : 'Local');
