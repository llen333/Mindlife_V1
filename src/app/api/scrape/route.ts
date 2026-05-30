/**
 * API de Web Scraping - MindLife
 * Endpoint pour récupérer des données du web
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  searchRecipes, 
  scrapeExercises, 
  checkAppointmentAvailability,
  createAppointment,
  storeTempRecipe,
  getTempRecipes,
  validateTempRecipe,
  formatRecipeForChat
} from '@/lib/services/scraper';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, query, userId = 'default-user', data } = body;

    switch (action) {
      case 'searchRecipes': {
        if (!query) {
          return NextResponse.json({ error: 'Query requise' }, { status: 400 });
        }
        
        const recipes = await searchRecipes(query);
        
        // Stocker temporairement les recettes
        const tempIds: string[] = [];
        for (const recipe of recipes.slice(0, 3)) {
          const tempId = await storeTempRecipe(recipe, userId);
          tempIds.push(tempId);
        }
        
        // Formater pour le chat
        const formattedRecipes = recipes.slice(0, 3).map((recipe, index) => ({
          tempId: tempIds[index],
          ...recipe,
          formatted: formatRecipeForChat(recipe),
        }));
        
        return NextResponse.json({
          success: true,
          recipes: formattedRecipes,
          count: recipes.length,
          message: recipes.length > 0 
            ? `J'ai trouvé ${recipes.length} recettes pour "${query}" !`
            : `Aucune recette trouvée pour "${query}"`,
        });
      }
      
      case 'validateRecipe': {
        const { tempId } = data || {};
        if (!tempId) {
          return NextResponse.json({ error: 'tempId requis' }, { status: 400 });
        }
        
        const success = await validateTempRecipe(tempId, userId);
        
        return NextResponse.json({
          success,
          message: success 
            ? 'Recette sauvegardée ! 🎉'
            : 'Erreur lors de la sauvegarde',
        });
      }
      
      case 'getTempRecipes': {
        const recipes = await getTempRecipes(userId);
        
        return NextResponse.json({
          success: true,
          recipes,
        });
      }
      
      case 'searchExercises': {
        if (!query) {
          return NextResponse.json({ error: 'Query requise' }, { status: 400 });
        }
        
        const exercises = await scrapeExercises(query);
        
        return NextResponse.json({
          success: true,
          exercises,
          count: exercises.length,
          message: exercises.length > 0
            ? `Voici des exercices pour "${query}" !`
            : `Aucun exercice trouvé pour "${query}"`,
        });
      }
      
      case 'checkAppointment': {
        const { date, time, duration } = data || {};
        if (!date) {
          return NextResponse.json({ error: 'Date requise' }, { status: 400 });
        }
        
        const appointmentDate = new Date(date);
        if (time) {
          const [hours, minutes] = time.split(':').map(Number);
          appointmentDate.setHours(hours, minutes, 0, 0);
        }
        
        const result = await checkAppointmentAvailability(
          userId, 
          appointmentDate, 
          duration || 60
        );
        
        return NextResponse.json({
          success: true,
          available: result.available,
          conflicts: result.conflicts,
          alternatives: result.alternatives.map(d => ({
            date: d.toISOString(),
            formatted: d.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            }),
          })),
          message: result.available 
            ? `✅ Le créneau est disponible !`
            : `❌ Ce créneau est pris. Voici des alternatives :`,
        });
      }
      
      case 'createAppointment': {
        const { title, date, time, duration, description, location } = data || {};
        if (!title || !date) {
          return NextResponse.json({ error: 'Titre et date requis' }, { status: 400 });
        }
        
        const appointmentDate = new Date(date);
        if (time) {
          const [hours, minutes] = time.split(':').map(Number);
          appointmentDate.setHours(hours, minutes, 0, 0);
        }
        
        // Vérifier d'abord la disponibilité
        const availability = await checkAppointmentAvailability(
          userId,
          appointmentDate,
          duration || 60
        );
        
        if (!availability.available) {
          return NextResponse.json({
            success: false,
            available: false,
            conflicts: availability.conflicts,
            alternatives: availability.alternatives.map(d => ({
              date: d.toISOString(),
              formatted: d.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              }),
            })),
            message: `❌ Ce créneau est déjà pris !`,
          });
        }
        
        const eventId = await createAppointment(
          userId,
          title,
          appointmentDate,
          duration || 60,
          description,
          location
        );
        
        return NextResponse.json({
          success: true,
          eventId,
          message: `✅ Rendez-vous "${title}" créé le ${appointmentDate.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
          })}`,
        });
      }
      
      default:
        return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
    }
  } catch (error) {
    console.error('Scrape API Error:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors du traitement',
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const query = searchParams.get('query');
  const userId = searchParams.get('userId') || 'default-user';
  
  if (action === 'recipes') {
    const savedRecipes = await db.scrapedRecipe.findMany({
      where: { userId },
      take: 20,
      orderBy: { scrapedAt: 'desc' },
    });
    
    return NextResponse.json({
      success: true,
      recipes: savedRecipes,
    });
  }
  
  return NextResponse.json({ error: 'Action requise' }, { status: 400 });
}
