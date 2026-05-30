import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Fichier requis' }, { status: 400 });
    }

    const content = await file.text();
    let importData;

    try {
      importData = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: 'Format JSON invalide' }, { status: 400 });
    }

    if (!importData.data) {
      return NextResponse.json({ error: 'Format de fichier invalide - données manquantes' }, { status: 400 });
    }

    const { data } = importData;
    const results = {
      users: 0,
      categories: 0,
      tasks: 0,
      goals: 0,
      notes: 0,
      events: 0,
      habits: 0,
      habitLogs: 0,
      journalEntries: 0,
      voiceMemos: 0,
      chatMessages: 0,
      errors: [] as string[]
    };

    // Importer les utilisateurs (upsert)
    if (data.users && Array.isArray(data.users)) {
      for (const user of data.users) {
        try {
          await db.user.upsert({
            where: { id: user.id },
            update: user,
            create: user
          });
          results.users++;
        } catch (e) {
          results.errors.push(`User ${user.id}: ${e instanceof Error ? e.message : 'Erreur'}`);
        }
      }
    }

    // Importer les catégories
    if (data.categories && Array.isArray(data.categories)) {
      for (const category of data.categories) {
        try {
          await db.category.upsert({
            where: { id: category.id },
            update: category,
            create: category
          });
          results.categories++;
        } catch (e) {
          results.errors.push(`Category ${category.id}: ${e instanceof Error ? e.message : 'Erreur'}`);
        }
      }
    }

    // Importer les tâches
    if (data.tasks && Array.isArray(data.tasks)) {
      for (const task of data.tasks) {
        try {
          await db.task.upsert({
            where: { id: task.id },
            update: task,
            create: task
          });
          results.tasks++;
        } catch (e) {
          results.errors.push(`Task ${task.id}: ${e instanceof Error ? e.message : 'Erreur'}`);
        }
      }
    }

    // Importer les objectifs
    if (data.goals && Array.isArray(data.goals)) {
      for (const goal of data.goals) {
        try {
          await db.goal.upsert({
            where: { id: goal.id },
            update: goal,
            create: goal
          });
          results.goals++;
        } catch (e) {
          results.errors.push(`Goal ${goal.id}: ${e instanceof Error ? e.message : 'Erreur'}`);
        }
      }
    }

    // Importer les notes
    if (data.notes && Array.isArray(data.notes)) {
      for (const note of data.notes) {
        try {
          await db.note.upsert({
            where: { id: note.id },
            update: note,
            create: note
          });
          results.notes++;
        } catch (e) {
          results.errors.push(`Note ${note.id}: ${e instanceof Error ? e.message : 'Erreur'}`);
        }
      }
    }

    // Importer les événements
    if (data.events && Array.isArray(data.events)) {
      for (const event of data.events) {
        try {
          await db.event.upsert({
            where: { id: event.id },
            update: event,
            create: event
          });
          results.events++;
        } catch (e) {
          results.errors.push(`Event ${event.id}: ${e instanceof Error ? e.message : 'Erreur'}`);
        }
      }
    }

    // Importer les habitudes
    if (data.habits && Array.isArray(data.habits)) {
      for (const habit of data.habits) {
        try {
          await db.habit.upsert({
            where: { id: habit.id },
            update: habit,
            create: habit
          });
          results.habits++;
        } catch (e) {
          results.errors.push(`Habit ${habit.id}: ${e instanceof Error ? e.message : 'Erreur'}`);
        }
      }
    }

    // Importer les logs d'habitudes
    if (data.habitLogs && Array.isArray(data.habitLogs)) {
      for (const log of data.habitLogs) {
        try {
          await db.habitLog.upsert({
            where: { id: log.id },
            update: log,
            create: log
          });
          results.habitLogs++;
        } catch (e) {
          results.errors.push(`HabitLog ${log.id}: ${e instanceof Error ? e.message : 'Erreur'}`);
        }
      }
    }

    // Importer les entrées de journal
    if (data.journalEntries && Array.isArray(data.journalEntries)) {
      for (const entry of data.journalEntries) {
        try {
          await db.journalEntry.upsert({
            where: { id: entry.id },
            update: entry,
            create: entry
          });
          results.journalEntries++;
        } catch (e) {
          results.errors.push(`JournalEntry ${entry.id}: ${e instanceof Error ? e.message : 'Erreur'}`);
        }
      }
    }

    // Importer les voice memos
    if (data.voiceMemos && Array.isArray(data.voiceMemos)) {
      for (const memo of data.voiceMemos) {
        try {
          await db.voiceMemo.upsert({
            where: { id: memo.id },
            update: memo,
            create: memo
          });
          results.voiceMemos++;
        } catch (e) {
          results.errors.push(`VoiceMemo ${memo.id}: ${e instanceof Error ? e.message : 'Erreur'}`);
        }
      }
    }

    // Importer les messages de chat
    if (data.chatMessages && Array.isArray(data.chatMessages)) {
      for (const msg of data.chatMessages) {
        try {
          await db.chatMessage.upsert({
            where: { id: msg.id },
            update: msg,
            create: msg
          });
          results.chatMessages++;
        } catch (e) {
          results.errors.push(`ChatMessage ${msg.id}: ${e instanceof Error ? e.message : 'Erreur'}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Import terminé',
      imported: results,
      totalImported: 
        results.users + results.categories + results.tasks + results.goals + 
        results.notes + results.events + results.habits + results.habitLogs + 
        results.journalEntries + results.voiceMemos + results.chatMessages,
      errorCount: results.errors.length,
      errors: results.errors.slice(0, 10) // Limiter les erreurs affichées
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de l\'import' },
      { status: 500 }
    );
  }
}
