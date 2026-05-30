import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';

    // Récupérer toutes les données
    const [
      users,
      categories,
      tasks,
      goals,
      notes,
      events,
      habits,
      habitLogs,
      journalEntries,
      voiceMemos,
      chatMessages
    ] = await Promise.all([
      db.user.findMany(),
      db.category.findMany(),
      db.task.findMany(),
      db.goal.findMany(),
      db.note.findMany(),
      db.event.findMany(),
      db.habit.findMany(),
      db.habitLog.findMany(),
      db.journalEntry.findMany(),
      db.voiceMemo.findMany(),
      db.chatMessage.findMany(),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {
        users,
        categories,
        tasks,
        goals,
        notes,
        events,
        habits,
        habitLogs,
        journalEntries,
        voiceMemos,
        chatMessages
      },
      stats: {
        totalUsers: users.length,
        totalCategories: categories.length,
        totalTasks: tasks.length,
        totalGoals: goals.length,
        totalNotes: notes.length,
        totalEvents: events.length,
        totalHabits: habits.length,
        totalHabitLogs: habitLogs.length,
        totalJournalEntries: journalEntries.length,
        totalVoiceMemos: voiceMemos.length,
        totalChatMessages: chatMessages.length
      }
    };

    if (format === 'csv') {
      // Générer CSV pour les tâches principalement
      const csvRows = [
        'ID,Titre,Description,Statut,Priorité,Date limite,Tags,Créé le',
        ...tasks.map(t => 
          `"${t.id}","${t.title}","${t.description || ''}","${t.status}","${t.priority}","${t.dueDate || ''}","${t.tags || ''}","${t.createdAt.toISOString()}"`
        )
      ];
      
      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="mindlife-export-${Date.now()}.csv"`
        }
      });
    }

    // Format JSON par défaut
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="mindlife-export-${Date.now()}.json"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}
