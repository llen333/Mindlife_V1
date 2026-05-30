/**
 * API Route - Convex Synchronisation
 * Gère la synchronisation entre SQLite et Convex
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  syncAllRecipesToConvex,
  syncRecipeToConvex,
  syncPreferenceToConvex,
  broadcastToAgents,
  updateAgentState,
  searchRecipesInConvex,
  suggestRecipesByIngredients,
  getUserContextForRAG,
  checkConvexStatus,
  createNotification,
} from '@/lib/convex/sync-service';

const DEFAULT_USER_ID = 'mindlife-user';

// ============================================
// GET - Status et requêtes
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('userId') || DEFAULT_USER_ID;

  // Vérifier le status de Convex
  if (action === 'status') {
    const status = await checkConvexStatus();
    return NextResponse.json(status);
  }

  // Rechercher des recettes (RAG)
  if (action === 'search-recipes') {
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || undefined;

    const results = await searchRecipesInConvex(query, category, userId);
    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      results,
    });
  }

  // Suggérer des recettes par ingrédients
  if (action === 'suggest-recipes') {
    const ingredientsParam = searchParams.get('ingredients');
    const ingredients = ingredientsParam ? ingredientsParam.split(',') : [];

    const results = await suggestRecipesByIngredients(ingredients);
    return NextResponse.json({
      success: true,
      ingredients,
      count: results.length,
      suggestions: results,
    });
  }

  // Obtenir le contexte utilisateur pour RAG
  if (action === 'user-context') {
    const context = await getUserContextForRAG(userId);
    return NextResponse.json({
      success: true,
      context,
    });
  }

  // Documentation de l'API
  return NextResponse.json({
    message: 'Convex Sync API',
    status: await checkConvexStatus(),
    endpoints: {
      'GET ?action=status': 'Vérifier le statut Convex',
      'GET ?action=search-recipes&query=...': 'Rechercher des recettes',
      'GET ?action=suggest-recipes&ingredients=a,b,c': 'Suggérer des recettes',
      'GET ?action=user-context': 'Contexte utilisateur pour RAG',
      'POST { action: "sync-recipes" }': 'Synchroniser toutes les recettes',
      'POST { action: "broadcast", ... }': 'Broadcaster un message',
      'POST { action: "update-agent", ... }': 'Mettre à jour un agent',
      'POST { action: "preference", ... }': 'Synchroniser une préférence',
    },
  });
}

// ============================================
// POST - Actions
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId = DEFAULT_USER_ID } = body;

    // Synchroniser toutes les recettes
    if (action === 'sync-recipes') {
      const result = await syncAllRecipesToConvex();
      return NextResponse.json({
        success: true,
        message: `${result.synced}/${result.total} recettes synchronisées`,
        ...result,
      });
    }

    // Synchroniser une recette spécifique
    if (action === 'sync-recipe') {
      const { recipeId } = body;
      if (!recipeId) {
        return NextResponse.json(
          { error: 'recipeId requis' },
          { status: 400 }
        );
      }

      const success = await syncRecipeToConvex(recipeId);
      return NextResponse.json({
        success,
        recipeId,
      });
    }

    // Broadcaster un message
    if (action === 'broadcast') {
      const { fromAgent, type, payload } = body;
      if (!fromAgent || !type) {
        return NextResponse.json(
          { error: 'fromAgent et type requis' },
          { status: 400 }
        );
      }

      const success = await broadcastToAgents(fromAgent, type, payload);
      return NextResponse.json({ success });
    }

    // Mettre à jour un agent
    if (action === 'update-agent') {
      const { agentId, type, status, currentTask, data } = body;
      if (!agentId || !type || !status) {
        return NextResponse.json(
          { error: 'agentId, type et status requis' },
          { status: 400 }
        );
      }

      const success = await updateAgentState(agentId, type, status, currentTask, data);
      return NextResponse.json({ success });
    }

    // Synchroniser une préférence
    if (action === 'preference') {
      const { category, preference, value, confidence, source } = body;
      if (!category || !preference || !value) {
        return NextResponse.json(
          { error: 'category, preference et value requis' },
          { status: 400 }
        );
      }

      const success = await syncPreferenceToConvex(
        userId,
        category,
        preference,
        value,
        confidence || 0.5,
        source || 'explicit'
      );
      return NextResponse.json({ success });
    }

    // Créer une notification
    if (action === 'notify') {
      const { type, title, message, data } = body;
      if (!type || !title || !message) {
        return NextResponse.json(
          { error: 'type, title et message requis' },
          { status: 400 }
        );
      }

      const success = await createNotification(userId, type, title, message, data);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('Convex API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
}
