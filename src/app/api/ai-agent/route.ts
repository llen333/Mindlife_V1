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

type IntentType = 'recipe' | 'appointment' | 'validation' | 'web_search' | 'general' | 'task';

function parseTaskMessage(msg: string): { title: string; dueDate?: string; priority?: string } {
  const lower = msg.toLowerCase();
  let title = msg;
  let dueDate: string | undefined;
  let priority: string | undefined;

  if (lower.includes('urgent') || lower.includes('asap')) {
    priority = 'high';
    title = title.replace(/\b(urgent|asap)\b/gi, '').trim();
  }

  const now = new Date();

  // =================== DATES EXPLICITES (prioritaires) ===================

  const dateSlash = lower.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/);
  if (dateSlash) {
    const d = new Date(
      dateSlash[3] ? parseInt(dateSlash[3]) : now.getFullYear(),
      parseInt(dateSlash[2]) - 1,
      parseInt(dateSlash[1]),
      9, 0, 0, 0
    );
    if (!isNaN(d.getTime())) {
      dueDate = d.toISOString();
      title = title.replace(dateSlash[0], '').trim();
    }
  }

  if (!dueDate) {
    const dateIso = lower.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (dateIso) {
      const d = new Date(parseInt(dateIso[1]), parseInt(dateIso[2]) - 1, parseInt(dateIso[3]), 9, 0, 0, 0);
      if (!isNaN(d.getTime())) {
        dueDate = d.toISOString();
        title = title.replace(dateIso[0], '').trim();
      }
    }
  }

  if (!dueDate) {
    const mois: Record<string, number> = {
      'janvier': 0, 'février': 1, 'fevrier': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
      'juillet': 6, 'août': 7, 'aout': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11, 'decembre': 11
    };
    for (const [moisNom, moisIdx] of Object.entries(mois)) {
      const regex = new RegExp(`(\\d{1,2})\\s*${moisNom}\\s*(\\d{4})?`, 'i');
      const match = lower.match(regex);
      if (match) {
        const d = new Date(
          match[2] ? parseInt(match[2]) : now.getFullYear(),
          moisIdx,
          parseInt(match[1]),
          9, 0, 0, 0
        );
        if (!isNaN(d.getTime())) {
          dueDate = d.toISOString();
          title = title.replace(match[0], '').trim();
        }
        break;
      }
    }
  }

  // =================== DATES RELATIVES ===================

  const dans = lower.match(/dans\s+(\d+)\s*(heure|minute|mn|h)\b/i);
  if (dans) {
    const d = new Date(now);
    d.setMinutes(d.getMinutes() + parseInt(dans[1]) * (dans[2].startsWith('h') ? 60 : 1));
    dueDate = d.toISOString();
    title = title.replace(dans[0], '').trim();
  }

  if (!dueDate && /apr[èe]s[- ]demain/i.test(lower)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 2);
    d.setHours(9, 0, 0, 0);
    dueDate = d.toISOString();
    title = title.replace(/apr[èe]s[- ]demain/gi, '').trim();
  }

  if (!dueDate && lower.includes('demain')) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    dueDate = d.toISOString();
    title = title.replace(/demain/gi, '').trim();
  }

  if (!dueDate) {
    const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    for (const j of jours) {
      if (lower.includes(j)) {
        const idx = jours.indexOf(j);
        let diff = idx - now.getDay();
        if (diff <= 0) diff += 7;
        const d = new Date(now);
        d.setDate(d.getDate() + diff);
        d.setHours(9, 0, 0, 0);
        dueDate = d.toISOString();
        title = title.replace(new RegExp(j, 'gi'), '').trim();
        break;
      }
    }
  }

  const heure = lower.match(/(?:à\s*)?(\d{1,2})[h:](\d{2})?\b/);
  if (heure) {
    const h = parseInt(heure[1]), m = heure[2] ? parseInt(heure[2]) : 0;
    if (dueDate) {
      const d = new Date(dueDate);
      d.setHours(h, m, 0, 0);
      dueDate = d.toISOString();
    } else {
      const d = new Date(now);
      d.setHours(h, m, 0, 0);
      if (d < now) d.setDate(d.getDate() + 1);
      dueDate = d.toISOString();
    }
    title = title.replace(heure[0], '').trim();
  }

  title = title.replace(/\s+/g, ' ').trim();
  title = title.replace(/^(ajoute|cr[ée]e|planifie|programme|rajoute|note)\s+/i, '').trim();
  return { title: title || msg, dueDate, priority };
}

function detectIntent(message: string): { intent: IntentType; data?: any } {
  const lower = message.toLowerCase();
  
  // Validation (oui/non après une proposition)
  if (lower === 'oui' || lower === 'oui !' || lower === 'ok' || lower === 'd\'accord') {
    return { intent: 'validation', data: { confirmed: true } };
  }
  if (lower === 'non' || lower === 'non merci' || lower === 'pas maintenant') {
    return { intent: 'validation', data: { confirmed: false } };
  }
  
  // Tâche - détection large avec parsing date/heure
  const taskKeywords = ['ajoute', 'crée', 'crée une tâche', 'planifie', 'programme',
                        'rappelle-moi', 'rajoute', 'note', 'à faire', 'todo'];
  if (taskKeywords.some(kw => lower.includes(kw)) || lower.includes('aller faire les courses')) {
    const parsed = parseTaskMessage(message);
    return { intent: 'task', data: parsed };
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
    // TÂCHE
    // ============================================
    if (intent === 'task') {
      try {
        const taskData: any = {
          id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: data?.title || message,
          userId,
          status: 'pending',
          priority: data?.priority || 'medium',
        };
        if (data?.dueDate) {
          taskData.dueDate = new Date(data.dueDate);
        }

        const task = await db.task.create({ data: taskData });

        return NextResponse.json({
          success: true,
          response: `✅ J'ai ajouté la tâche « ${task.title} »${data?.dueDate ? ` (prévue le ${new Date(data.dueDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} pour ${new Date(data.dueDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})` : ''}.`,
          needsValidation: false,
          task,
          source: 'action:task',
        });
      } catch (taskError) {
        console.error('Task creation error:', taskError);
        return NextResponse.json({
          success: false,
          response: "❌ Impossible de créer la tâche. Réessaie.",
          needsValidation: false,
        });
      }
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
