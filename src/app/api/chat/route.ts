/**
 * API Chat - MindLife
 * SANS LLM, SANS CLOUD
 * Utilise le web scraping et les données locales
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  searchRecipes, 
  storeTempRecipe, 
  formatRecipeForChat,
  checkAppointmentAvailability,
  createAppointment,
  scrapeExercises
} from '@/lib/services/scraper';

// Types
type RequestType = 'recipe' | 'appointment' | 'exercise' | 'task' | 'goal' | 'question' | 'general';

interface ParsedAppointment {
  title?: string;
  date?: Date;
  time?: string;
  duration?: number;
}

/**
 * Détecter le type de demande
 */
function detectRequestType(message: string): { type: RequestType; confidence: number } {
  const lower = message.toLowerCase();
  
  // Recette
  if (/recette|recipe|cuisine|cuisiner|plat|repas|ingrédient|préparation|manger|déjeuner|dîner|petit-déjeuner|crêpe|gâteau|tarte|salade|soupe/i.test(lower)) {
    return { type: 'recipe', confidence: 0.9 };
  }
  
  // Rendez-vous
  if (/rendez-vous|rdv|réunion|meeting|planifier|organiser|calendrier|schedule|créer.*événement|prendre.*rendez|fixer.*rendez|réserver|voir.*mardi|voir.*lundi|voir.*mercredi|voir.*jeudi|voir.*vendredi|voir.*samedi|voir.*dimanche/i.test(lower)) {
    return { type: 'appointment', confidence: 0.95 };
  }
  
  // Exercice / Sport
  if (/exercice|muscle|muscu|fitness|squat|pompes|musculation|entraînement|training|workout|abdos|dos|jambes|pectoraux|biceps|triceps/i.test(lower)) {
    return { type: 'exercise', confidence: 0.9 };
  }
  
  // Tâche
  if (/tâche|task|à faire|todo|action|faire|compléter|finir|terminer/i.test(lower)) {
    return { type: 'task', confidence: 0.8 };
  }
  
  // Objectif
  if (/objectif|goal|but|atteindre|accomplir|résolution|ambition/i.test(lower)) {
    return { type: 'goal', confidence: 0.8 };
  }
  
  return { type: 'general', confidence: 0.5 };
}

/**
 * Extraire le sujet d'une recette
 */
function extractRecipeQuery(message: string): string {
  const lower = message.toLowerCase();
  
  // Patterns communs
  const patterns = [
    /recette (de |d')?([a-zàâäéèêëïîôùûü\s]+)/i,
    /recette (pour |au |à la |aux )?([a-zàâäéèêëïîôùûü\s]+)/i,
    /je veux (une |des )?recette[s]? (de |d')?([a-zàâäéèêëïîôùûü\s]+)/i,
    /comment (faire|préparer|cuisiner) (du |de la |des )?([a-zàâäéèêëïîôùûü\s]+)/i,
    /([a-zàâäéèêëïîôùûü\s]+) recette/i,
  ];
  
  for (const pattern of patterns) {
    const match = lower.match(pattern);
    if (match) {
      const query = match[match.length - 1].trim();
      // Nettoyer les mots vides
      return query
        .replace(/^(de |du |de la |des |pour |une |un |les |la |le )/i, '')
        .replace(/\?/g, '')
        .trim();
    }
  }
  
  // Si pas de pattern, prendre les mots clés
  const keywords = message
    .replace(/recette|cuisine|cuisiner|préparer|faire|je veux|donne|trouve|cherche/gi, '')
    .trim();
  
  return keywords || message;
}

/**
 * Parser une demande de rendez-vous
 */
function parseAppointment(message: string): ParsedAppointment {
  const result: ParsedAppointment = {};
  const lower = message.toLowerCase();
  
  // Extraire le titre
  const titlePatterns = [
    /rendez[- ]?vous (pour|avec|de) ([a-zàâäéèêëïîôùûü\s]+)/i,
    /réunion (pour|de|avec) ([a-zàâäéèêëïîôùûü\s]+)/i,
    /meeting (pour|de|avec) ([a-zàâäéèêëïîôùûü\s]+)/i,
  ];
  
  for (const pattern of titlePatterns) {
    const match = lower.match(pattern);
    if (match) {
      result.title = match[2].trim();
      break;
    }
  }
  
  // Extraire la date
  const now = new Date();
  
  // Mots clés de date
  if (/aujourd'hui/i.test(lower)) {
    result.date = new Date(now);
  } else if (/demain/i.test(lower)) {
    result.date = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  } else if (/après[- ]?demain/i.test(lower)) {
    result.date = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  }
  
  // Jours de la semaine
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  for (let i = 0; i < days.length; i++) {
    const regex = new RegExp(days[i], 'i');
    if (regex.test(lower)) {
      const today = now.getDay();
      let diff = i - today;
      if (diff <= 0) diff += 7; // Prochaine semaine
      result.date = new Date(now.getTime() + diff * 24 * 60 * 60 * 1000);
      break;
    }
  }
  
  // Date numérique (ex: "23 avril", "15/04")
  const dateMatch = lower.match(/(\d{1,2})\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|\/\d{1,2})/i);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const monthText = dateMatch[2].toLowerCase();
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    let month = months.indexOf(monthText);
    if (month === -1 && dateMatch[2].includes('/')) {
      month = parseInt(dateMatch[2].replace('/', '')) - 1;
    }
    
    if (month >= 0 && month < 12) {
      result.date = new Date(now.getFullYear(), month, day);
      // Si la date est passée, prendre l'année suivante
      if (result.date < now) {
        result.date.setFullYear(now.getFullYear() + 1);
      }
    }
  }
  
  // Extraire l'heure
  const timeMatch = lower.match(/(\d{1,2})[h:](\d{0,2})?/);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    result.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // Titre par défaut
  if (!result.title) {
    result.title = 'Rendez-vous';
  }
  
  return result;
}

/**
 * Handler principal
 */
export async function POST(req: NextRequest) {
  try {
    const { messages, persona = 'assistant', userId = 'default-user' } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages requis' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    const { type: requestType } = detectRequestType(lastMessage);

    console.log(`[CHAT] Type détecté: ${requestType}, Message: "${lastMessage.substring(0, 50)}..."`);

    // ============================================
    // RECETTE - Web Scraping
    // ============================================
    if (requestType === 'recipe') {
      const query = extractRecipeQuery(lastMessage);
      
      console.log(`[CHAT] Recherche recette: "${query}"`);
      
      // Lancer le scraping
      const recipes = await searchRecipes(query);
      
      if (recipes.length === 0) {
        return NextResponse.json({
          success: true,
          response: `🍽️ Je n'ai pas trouvé de recette pour "${query}".

Essaie avec d'autres termes, ou dis-moi :
• Ce que tu as dans ton frigo
• Le temps que tu as pour cuisiner
• Le type de plat souhaité`,
          requestType,
          source: 'scraper',
        });
      }
      
      // Stocker temporairement et formater
      const formattedRecipes = [];
      for (const recipe of recipes.slice(0, 3)) {
        const tempId = await storeTempRecipe(recipe, userId);
        formattedRecipes.push({
          tempId,
          name: recipe.name,
          source: recipe.sourceName,
          prepTime: recipe.prepTime,
          imageUrl: recipe.imageUrl,
          formatted: formatRecipeForChat(recipe),
        });
      }
      
      let response = `🍽️ **J'ai trouvé ${recipes.length} recettes pour "${query}" !**\n\n`;
      
      formattedRecipes.forEach((recipe, index) => {
        response += `**${index + 1}. ${recipe.name}**\n`;
        response += `📍 ${recipe.source}`;
        if (recipe.prepTime) response += ` | ⏱️ ${recipe.prepTime}min`;
        response += `\n\n`;
      });
      
      response += `\n---\n\n**Tape "valider 1", "valider 2" ou "valider 3"** pour sauvegarder une recette dans ton carnet ! 📒`;
      
      return NextResponse.json({
        success: true,
        response,
        requestType,
        source: 'scraper',
        recipes: formattedRecipes,
        requiresValidation: true,
      });
    }
    
    // ============================================
    // RENDEZ-VOUS - Vérification disponibilité
    // ============================================
    if (requestType === 'appointment') {
      const parsed = parseAppointment(lastMessage);
      
      if (!parsed.date) {
        return NextResponse.json({
          success: true,
          response: `📅 **Je peux t'aider à planifier ce rendez-vous !**

Dis-moi :
• **La date** souhaitée (ex: "demain", "mardi 23", "15 avril")
• **L'heure** (ex: "14h", "9h30")
• **Le sujet** de ce rendez-vous

Exemple : "Rendez-vous chez le dentiste mardi à 15h"`,
          requestType,
          source: 'appointment',
        });
      }
      
      // Définir l'heure par défaut
      if (!parsed.time) {
        parsed.time = '09:00';
      }
      
      // Créer la date complète
      const appointmentDate = parsed.date;
      const [hours, minutes] = parsed.time.split(':').map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      // Vérifier la disponibilité
      const availability = await checkAppointmentAvailability(userId, appointmentDate);
      
      if (availability.available) {
        // Créer le rendez-vous
        const eventId = await createAppointment(
          userId,
          parsed.title || 'Rendez-vous',
          appointmentDate
        );
        
        const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit',
        });
        
        return NextResponse.json({
          success: true,
          response: `✅ **Rendez-vous créé !**

📅 **${parsed.title}**
🗓️ ${formattedDate}

Ajouté à ton calendrier MindLife !`,
          requestType,
          source: 'appointment',
          eventId,
          appointmentDate: appointmentDate.toISOString(),
        });
      }
      
      // Créneau non disponible - proposer des alternatives
      let response = `❌ **Ce créneau est déjà pris !**\n\n`;
      
      if (availability.conflicts.length > 0) {
        response += `Conflit avec :\n`;
        availability.conflicts.forEach(c => {
          response += `• "${c.title}" à ${c.startAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}\n`;
        });
        response += `\n`;
      }
      
      if (availability.alternatives.length > 0) {
        response += `**Créneaux disponibles proches :**\n\n`;
        availability.alternatives.slice(0, 5).forEach((alt, index) => {
          const formatted = alt.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          });
          response += `${index + 1}. ${formatted}\n`;
        });
        
        response += `\nTape le numéro du créneau souhaité (1-5) pour le réserver.`;
      }
      
      return NextResponse.json({
        success: true,
        response,
        requestType,
        source: 'appointment',
        alternatives: availability.alternatives,
        requiresSelection: true,
      });
    }
    
    // ============================================
    // EXERCICE - Fitness
    // ============================================
    if (requestType === 'exercise') {
      const lower = lastMessage.toLowerCase();
      
      // Détecter le groupe musculaire
      let muscleGroup = 'general';
      if (/pectoraux|peck|poitrine|développé|pompes/i.test(lower)) muscleGroup = 'pectoraux';
      else if (/dos|dorsaux|tirage|traction|row/i.test(lower)) muscleGroup = 'dos';
      else if (/jambes|squats|leg|cuisses|mollets/i.test(lower)) muscleGroup = 'jambes';
      else if (/abdos|abdominaux|gainage|core/i.test(lower)) muscleGroup = 'abdos';
      else if (/biceps|curl/i.test(lower)) muscleGroup = 'biceps';
      else if (/triceps|extension/i.test(lower)) muscleGroup = 'triceps';
      else if (/épaules|shoulder|développé militaire/i.test(lower)) muscleGroup = 'épaules';
      
      const exercises = await scrapeExercises(muscleGroup);
      
      if (exercises.length === 0) {
        return NextResponse.json({
          success: true,
          response: `🏋️ **Exercices pour ${muscleGroup}**

Dis-moi quel groupe musculaire tu veux travailler :
• Pectoraux
• Dos
• Jambes
• Abdos
• Biceps / Triceps
• Épaules`,
          requestType,
          source: 'exercise',
        });
      }
      
      let response = `🏋️ **Exercices pour ${muscleGroup}**\n\n`;
      
      exercises.forEach((ex, index) => {
        response += `**${index + 1}. ${ex.name}**`;
        if (ex.difficulty) {
          const diffEmoji = ex.difficulty === 'beginner' ? '🟢' : ex.difficulty === 'intermediate' ? '🟡' : '🔴';
          response += ` ${diffEmoji}`;
        }
        response += `\n`;
        if (ex.description) response += `_${ex.description}_\n`;
        response += `\n`;
        
        if (ex.instructions && ex.instructions.length > 0) {
          response += `📝 **Comment faire :**\n`;
          ex.instructions.forEach((step, i) => {
            response += `${i + 1}. ${step}\n`;
          });
          response += `\n`;
        }
        
        if (ex.equipment && ex.equipment.length > 0) {
          response += `🔧 Équipement: ${ex.equipment.join(', ')}\n`;
        }
        response += `---\n\n`;
      });
      
      return NextResponse.json({
        success: true,
        response,
        requestType,
        source: 'exercise',
        exercises,
      });
    }
    
    // ============================================
    // TÂCHE
    // ============================================
    if (requestType === 'task') {
      // Extraire le titre de la tâche
      const taskTitle = lastMessage
        .replace(/créer|ajouter|nouvelle|tâche|task|à faire|todo/gi, '')
        .trim();
      
      if (taskTitle.length < 3) {
        return NextResponse.json({
          success: true,
          response: `📝 **Nouvelle tâche**

Dis-moi le nom de la tâche et je l'ajouterai à ta liste !

Exemple : "Ajouter tâche Faire les courses"`,
          requestType,
          source: 'task',
        });
      }
      
      // Créer la tâche
      const { v4: uuidv4 } = await import('uuid');
      const taskId = uuidv4();
      
      await db.task.create({
        data: {
          id: taskId,
          title: taskTitle,
          userId,
          status: 'pending',
          priority: 'medium',
        },
      });
      
      return NextResponse.json({
        success: true,
        response: `✅ **Tâche créée !**

📋 "${taskTitle}"

Ajoutée à ta liste de tâches !`,
        requestType,
        source: 'task',
        taskId,
      });
    }
    
    // ============================================
    // OBJECTIF
    // ============================================
    if (requestType === 'goal') {
      const goalTitle = lastMessage
        .replace(/objectif|goal|but|je veux|je voudrais|j'aimerais/gi, '')
        .replace(/^(de |d'|atteindre |accomplir )/i, '')
        .trim();
      
      return NextResponse.json({
        success: true,
        response: `🎯 **Objectif détecté : "${goalTitle}"**

Pour t'aider à l'atteindre, dis-moi :

1. **Dans combien de temps** veux-tu l'atteindre ?
2. **Quelle est la première étape** possible ?
3. **Quels obstacles** potentiels vois-tu ?

On va créer un plan d'action ensemble ! 💪`,
        requestType,
        source: 'goal',
      });
    }
    
    // ============================================
    // FALLBACK GÉNÉRAL
    // ============================================
    return NextResponse.json({
      success: true,
      response: `Je t'écoute ! 😊

Dis-moi ce que tu veux faire :
• 🍽️ **"Recette de crêpes"** - Chercher une recette
• 📅 **"Rendez-vous demain à 14h"** - Planifier
• 🏋️ **"Exercices pectoraux"** - Programme sport
• 📝 **"Tâche Acheter du lait"** - Créer une tâche
• 🎯 **"Objectif Perdre 5kg"** - Définir un but

Comment puis-je t'aider ?`,
      requestType,
      source: 'fallback',
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    return NextResponse.json({
      success: true,
      response: `Oups, une erreur s'est produite. 😅

Réessaie ou dis-moi ce que tu veux faire :
• 🍽️ Chercher une recette
• 📅 Planifier un rendez-vous
• 🏋️ Exercices fitness
• 📝 Créer une tâche`,
      source: 'error',
    });
  }
}
