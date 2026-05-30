/**
 * API Agent IA - CORRIGÉ V2
 * Détecte les intentions et appelle les actions concrètes
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  generateResponse,
  seedDefaultPatterns,
  rateInteraction,
  learnFromInteraction,
  getLearningStats,
  PersonaType,
} from '@/lib/patterns/learning-system';
import {
  searchRecipe,
  handleAppointment,
  searchGeneral,
  validateAndSave,
  searchWeb,
} from '@/lib/agent-actions';

const DEFAULT_USER_ID = 'mindlife-user';

// ============================================
// DÉTECTION D'INTENTION
// ============================================

type IntentType = 'recipe' | 'appointment' | 'validation' | 'web_search' | 'general';

function detectIntent(message: string): { intent: IntentType; data?: any } {
  const lower = message.toLowerCase();
  
  // Validation (oui/non après une proposition)
  if (lower === 'oui' || lower === 'oui !' || lower === 'ok' || lower === 'd\'accord') {
    return { intent: 'validation', data: { confirmed: true } };
  }
  if (lower === 'non' || lower === 'non merci' || lower === 'pas maintenant') {
    return { intent: 'validation', data: { confirmed: false } };
  }
  
  // Recette
  const recipeKeywords = ['recette', 'cuisine', 'plat', 'préparer', 'cuisiner', 'manger', 'repas', 'déjeuner', 'dîner', 'petit-déj'];
  if (recipeKeywords.some(kw => lower.includes(kw)) && 
      (lower.includes('trouve') || lower.includes('cherche') || lower.includes('propose') || lower.includes('donne') || lower.includes('une recette'))) {
    const query = message.replace(/(?:trouve|cherche|propose|donne|une?|recette|de|pour|moi)/gi, '').trim();
    return { intent: 'recipe', data: { query: query || 'facile' } };
  }
  
  // Rendez-vous
  const appointmentKeywords = ['rendez-vous', 'rdv', 'réunion', 'rencontre', 'rendez', 'rdv'];
  const timeKeywords = ['demain', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche', 
                        'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 
                        'septembre', 'octobre', 'novembre', 'décembre', 'à', 'heure'];
  
  if (appointmentKeywords.some(kw => lower.includes(kw)) || 
      (timeKeywords.some(kw => lower.includes(kw)) && lower.includes('planifier') || lower.includes('ajouter'))) {
    return { intent: 'appointment', data: { query: message } };
  }
  
  // Recherche web
  if (lower.includes('recherche') || lower.includes('cherche sur') || lower.includes('trouve sur')) {
    const query = message.replace(/(?:recherche|cherche|trouve|sur|le|la|les|web|internet)/gi, '').trim();
    return { intent: 'web_search', data: { query } };
  }
  
  return { intent: 'general' };
}

// Stocker les données temporaires pour validation (en mémoire pour la session)
const pendingValidations = new Map<string, any>();

// ============================================
// GET - Statistiques et seed
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('userId') || DEFAULT_USER_ID;

  if (action === 'seed') {
    const count = await seedDefaultPatterns();
    return NextResponse.json({
      success: true,
      message: `${count} nouveaux patterns ajoutés`,
    });
  }

  if (action === 'stats') {
    const stats = await getLearningStats(userId);
    return NextResponse.json({
      success: true,
      stats,
    });
  }

  return NextResponse.json({
    personas: [
      { id: 'assistant', name: 'Assistant', description: 'Aide générale' },
      { id: 'coach', name: 'Coach Sport', description: 'Entraînements et fitness' },
      { id: 'nutrition', name: 'Nutrition', description: 'Conseils alimentaires' },
      { id: 'productivity', name: 'Productivité', description: 'Organisation et temps' },
      { id: 'wellness', name: 'Bien-être', description: 'Équilibre et santé mentale' },
    ],
  });
}

// ============================================
// POST - Chat avec le persona
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      persona = 'assistant', 
      userId = DEFAULT_USER_ID, 
      action, 
      interactionId, 
      rating,
      tempId, // Pour validation explicite
    } = body;

    // Action: Noter une interaction
    if (action === 'rate' && interactionId && rating) {
      await rateInteraction(interactionId, rating);
      if (rating >= 4) {
        await learnFromInteraction(interactionId, userId);
      }
      return NextResponse.json({
        success: true,
        message: 'Interaction notée avec succès',
      });
    }

    // Validation explicite (via bouton ou tempId)
    if (tempId || action === 'validate') {
      const id = tempId || body.data?.tempId;
      if (id) {
        const result = await validateAndSave(id, userId);
        return NextResponse.json({
          success: result.success,
          response: result.message,
          needsValidation: false,
          data: result.data,
        });
      }
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      );
    }

    // Valider le persona
    const validPersonas: PersonaType[] = ['assistant', 'coach', 'nutrition', 'productivity', 'wellness'];
    const selectedPersona = validPersonas.includes(persona) ? persona : 'assistant';

    // Détecter l'intention
    const { intent, data } = detectIntent(message);
    console.log(`[AI-AGENT] Intent détecté: ${intent}`, data);

    // ============================================
    // TRAITEMENT PAR INTENTION
    // ============================================

    // VALIDATION (après une proposition)
    if (intent === 'validation') {
      const pendingKey = `pending-${userId}`;
      const pendingData = pendingValidations.get(pendingKey);
      
      if (pendingData && data?.confirmed) {
        // Utilisateur confirme -> sauvegarder
        const result = await validateAndSave(pendingData.tempId, userId);
        pendingValidations.delete(pendingKey);
        
        return NextResponse.json({
          success: result.success,
          response: result.message,
          needsValidation: false,
        });
      } else if (pendingData) {
        // Utilisateur refuse
        pendingValidations.delete(pendingKey);
        return NextResponse.json({
          success: true,
          response: "D'accord, je ne sauvegarde pas. Autre chose que je peux faire pour toi ?",
          needsValidation: false,
        });
      }
    }

    // RECETTE
    if (intent === 'recipe' && (selectedPersona === 'nutrition' || selectedPersona === 'assistant')) {
      const result = await searchRecipe(data?.query || message.replace(/recette|de|pour/gi, '').trim());
      
      if (result.needsValidation && result.validationData) {
        // Stocker pour validation ultérieure
        pendingValidations.set(`pending-${userId}`, result.validationData);
      }
      
      return NextResponse.json({
        success: result.success,
        response: result.message,
        needsValidation: result.needsValidation || false,
        validationData: result.validationData,
        source: 'action:recipe',
      });
    }

    // RENDEZ-VOUS
    if (intent === 'appointment' && (selectedPersona === 'assistant' || selectedPersona === 'productivity')) {
      const result = await handleAppointment(data?.query || message, userId);
      
      if (result.needsValidation && result.validationData) {
        pendingValidations.set(`pending-${userId}`, result.validationData);
      }
      
      return NextResponse.json({
        success: result.success,
        response: result.message,
        needsValidation: result.needsValidation || false,
        validationData: result.validationData,
        source: 'action:appointment',
      });
    }

    // RECHERCHE WEB
    if (intent === 'web_search') {
      const result = await searchGeneral(data?.query || message);
      
      return NextResponse.json({
        success: result.success,
        response: result.message,
        needsValidation: false,
        source: 'action:web_search',
      });
    }

    // ============================================
    // FALLBACK: SYSTÈME DE PATTERNS
    // ============================================

    // Récupérer le contexte utilisateur
    let context = {
      userName: null as string | null,
      mainGoal: null as string | null,
      tasksCount: 0,
      goalsCount: 0,
      habitsCount: 0,
      eventsCount: 0,
    };

    try {
      const [tasks, goals, habits, events, user] = await Promise.all([
        db.task.count({ where: { userId } }).catch(() => 0),
        db.goal.count({ where: { userId } }).catch(() => 0),
        db.habit.count({ where: { userId } }).catch(() => 0),
        db.event.count({ where: { userId } }).catch(() => 0),
        db.user.findUnique({ where: { id: userId }, select: { name: true, mainGoal: true } }).catch(() => null),
      ]);

      context = {
        userName: user?.name || null,
        mainGoal: user?.mainGoal || null,
        tasksCount: typeof tasks === 'number' ? tasks : 0,
        goalsCount: typeof goals === 'number' ? goals : 0,
        habitsCount: typeof habits === 'number' ? habits : 0,
        eventsCount: typeof events === 'number' ? events : 0,
      };
    } catch (ctxError) {
      console.error('Context error:', ctxError);
    }

    // Générer la réponse via patterns
    const result = await generateResponse(message, selectedPersona as PersonaType, userId, context);

    const personaNames: Record<string, string> = {
      assistant: 'Assistant MindLife',
      coach: 'Coach Sportif',
      nutrition: 'Nutritionniste',
      productivity: 'Coach Productivité',
      wellness: 'Coach Bien-être',
    };

    return NextResponse.json({
      success: true,
      response: result.response,
      persona: selectedPersona,
      personaName: personaNames[selectedPersona],
      source: result.source,
      patternId: result.pattern?.id,
      context: {
        tasksCount: context.tasksCount,
        goalsCount: context.goalsCount,
        habitsCount: context.habitsCount,
        eventsCount: context.eventsCount,
      },
    });
  } catch (error) {
    console.error('AI Agent error:', error);

    return NextResponse.json({
      success: false,
      error: 'Erreur de traitement',
      response: "Je suis désolé, je n'ai pas pu traiter ta demande. Peux-tu réessayer ?",
    });
  }
}
