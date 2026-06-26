import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Map short category IDs to DB category IDs
// Helper: extrait le time "HH:mm" depuis un Date, ou depuis le champ `time` stocké
const timeFromDate = (date: Date | null | undefined, storedTime?: string | null): string | undefined => {
  if (storedTime) return storedTime;
  if (date) return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  return undefined;
};

function mapCategoryId(categoryId: string | undefined): string | undefined {
  if (!categoryId) return undefined;
  
  // Si déjà un ID DB (commence par 'cat-'), le garder
  if (categoryId.startsWith('cat-')) return categoryId;
  
  // Mapper les IDs courts vers les IDs DB
  const categoryMap: Record<string, string> = {
    'sport': 'cat-sport',
    'education': 'cat-education',
    'personal': 'cat-personal',
    'spirituality': 'cat-spirituality',
    'professional': 'cat-professional',
  };
  
  return categoryMap[categoryId] || categoryId;
}

// GET - List tasks with filters + timeframe
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const categoryId = searchParams.get('categoryId');
    const timeframe = searchParams.get('timeframe'); // day | week | month
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const userId = searchParams.get('userId') || 'mindlife-user';

    const where: Record<string, unknown> = {
      userId,
    };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Timeframe filter for Timeline (jour/semaine/mois)
    const dateFilter: Record<string, Date> = {};
    const now = new Date();

    if (timeframe === 'day') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      dateFilter.gte = start;
      dateFilter.lt = end;
    } else if (timeframe === 'week') {
      const start = new Date(now);
      start.setDate(start.getDate() - start.getDay()); // dimanche = début semaine
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      dateFilter.gte = start;
      dateFilter.lt = end;
    } else if (timeframe === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      dateFilter.gte = start;
      dateFilter.lt = end;
    }

    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    if (Object.keys(dateFilter).length > 0) {
      where.dueDate = dateFilter;
    }

    const tasks = await db.task.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      include: {
        Category: true,
        Subtask: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Mapper vers le format Timeline de Nico
    const mapped = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      date: t.dueDate?.toISOString() || t.startDate?.toISOString() || now.toISOString(),
      time: timeFromDate(t.startDate || t.dueDate, t.time),
      durationMinutes: t.durationMinutes || 60,
      status: t.status === 'completed' ? 'done' : (t.status as string),
      priority: t.priority,
      category: t.category || t.Category?.name || 'Général',
      subtasks: (t.Subtask || []).map((s) => ({
        id: s.id,
        title: s.title,
        completed: s.completed,
      })),
    }));

    return NextResponse.json({ tasks: mapped });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST - Create task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, description, status, priority, dueDate, tags, categoryId,
      startDate, durationMinutes, time, category, progress, chapters, observations, 
      addToCalendar, createdBy, subtasks,
      userId: bodyUserId
    } = body;
    const userId = bodyUserId || 'mindlife-user';

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Mapper l'ID de catégorie
    const mappedCategoryId = mapCategoryId(categoryId);

    // Create task first
    const task = await db.task.create({
      data: {
        id: body.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        description,
        status: status === 'done' ? 'completed' : (status || 'pending'),
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        durationMinutes: durationMinutes || undefined,
        time: time || undefined,
        category: category || undefined,
        chapters: chapters ? (typeof chapters === 'string' ? chapters : JSON.stringify(chapters)) : undefined,
        observations,
        addToCalendar: addToCalendar || false,
        createdBy: createdBy || 'user',
        tags,
        categoryId: mappedCategoryId,
        userId,
      },
      include: {
        Category: true,
      },
    });

    if (subtasks && Array.isArray(subtasks) && subtasks.length > 0) {
      await db.subtask.createMany({
        data: subtasks.map((s: { title: string }) => ({
          id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: s.title,
          completed: false,
          taskId: task.id,
        })),
      });
    }

    // If addToCalendar is true, create an event linked to this task
    if (addToCalendar && startDate) {
      // Validate category exists before using it
      let eventCategoryId = mappedCategoryId || null;
      if (eventCategoryId) {
        const categoryExists = await db.category.findFirst({
          where: { id: eventCategoryId, userId }
        });
        if (!categoryExists) {
          eventCategoryId = null;
        }
      }

      const event = await db.event.create({
        data: {
          id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: task.title,
          description: task.description,
          startAt: new Date(startDate),
          endAt: dueDate ? new Date(dueDate) : new Date(startDate),
          isAllDay: true,
          color: 'emerald',
          categoryId: eventCategoryId,
          userId,
        },
      });

      // Link event to task and get updated task
      const updatedTask = await db.task.update({
        where: { id: task.id },
        data: { eventId: event.id },
        include: {
          Category: true,
        },
      });

      const updatedWithSubtasks = await db.task.findUnique({
      where: { id: task.id },
      include: { Category: true, Subtask: { orderBy: { createdAt: 'asc' } } },
    });
    return NextResponse.json({
      task: updatedWithSubtasks ? {
        id: updatedWithSubtasks.id,
        title: updatedWithSubtasks.title,
        description: updatedWithSubtasks.description || '',
        date: updatedWithSubtasks.dueDate?.toISOString() || updatedWithSubtasks.startDate?.toISOString() || new Date().toISOString(),
        time: timeFromDate(updatedWithSubtasks.startDate || updatedWithSubtasks.dueDate, updatedWithSubtasks.time),
        durationMinutes: updatedWithSubtasks.durationMinutes || 60,
        status: updatedWithSubtasks.status === 'completed' ? 'done' : updatedWithSubtasks.status,
        priority: updatedWithSubtasks.priority,
        category: updatedWithSubtasks.category || updatedWithSubtasks.Category?.name || 'Général',
        subtasks: (updatedWithSubtasks.Subtask || []).map((s) => ({
          id: s.id,
          title: s.title,
          completed: s.completed,
        })),
      } : task,
    }, { status: 201 });
    }

    const freshTask = await db.task.findUnique({
      where: { id: task.id },
      include: { Category: true, Subtask: { orderBy: { createdAt: 'asc' } } },
    });
    return NextResponse.json({
      task: freshTask ? {
        id: freshTask.id,
        title: freshTask.title,
        description: freshTask.description || '',
        date: freshTask.dueDate?.toISOString() || freshTask.startDate?.toISOString() || new Date().toISOString(),
        time: timeFromDate(freshTask.startDate || freshTask.dueDate, freshTask.time),
        durationMinutes: freshTask.durationMinutes || 60,
        status: freshTask.status === 'completed' ? 'done' : freshTask.status,
        priority: freshTask.priority,
        category: freshTask.category || freshTask.Category?.name || 'Général',
        subtasks: (freshTask.Subtask || []).map((s) => ({
          id: s.id,
          title: s.title,
          completed: s.completed,
        })),
      } : task,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// PUT - Update task
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id, title, description, status, priority, dueDate, tags, categoryId,
      startDate, durationMinutes, time, category, progress, chapters, observations, 
      addToCalendar, subtasks,
      userId: bodyUserId
    } = body;
    const userId = bodyUserId || 'mindlife-user';

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Mapper l'ID de catégorie
    const mappedCategoryId = mapCategoryId(categoryId);

    // Vérifier que la tâche existe
    const existingTask = await db.task.findFirst({
      where: { id, userId },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date();
        updateData.progress = 100;
      }
    }
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (durationMinutes !== undefined) updateData.durationMinutes = durationMinutes;
    if (time !== undefined) updateData.time = time;
    if (category !== undefined) updateData.category = category;
    if (progress !== undefined) updateData.progress = progress;
    if (chapters !== undefined) updateData.chapters = chapters ? (typeof chapters === 'string' ? chapters : JSON.stringify(chapters)) : null;
    if (observations !== undefined) updateData.observations = observations;
    if (addToCalendar !== undefined) updateData.addToCalendar = addToCalendar;
    if (tags !== undefined) updateData.tags = tags;
    if (categoryId !== undefined) updateData.categoryId = mappedCategoryId;

    if (subtasks && Array.isArray(subtasks)) {
      await db.subtask.deleteMany({ where: { taskId: id } });
      if (subtasks.length > 0) {
        await db.subtask.createMany({
          data: subtasks.map((s: { title: string; completed?: boolean }) => ({
            id: `subtask-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: s.title,
            completed: s.completed || false,
            taskId: id,
          })),
        });
      }
    }

    const task = await db.task.update({
      where: { id },
      data: updateData,
      include: {
        Category: true,
        Event: true,
        Subtask: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Handle calendar sync updates
    if (addToCalendar && startDate && !task.eventId) {
      const event = await db.event.create({
        data: {
          id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: task.title,
          description: task.description || undefined,
          startAt: new Date(startDate),
          endAt: dueDate ? new Date(dueDate) : new Date(startDate),
          isAllDay: true,
          color: 'emerald',
          categoryId: mappedCategoryId || task.categoryId || undefined,
          userId,
        },
      });
      
      await db.task.update({
        where: { id: task.id },
        data: { eventId: event.id },
      });
    }

    const mappedTask = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      date: task.dueDate?.toISOString() || task.startDate?.toISOString() || new Date().toISOString(),
      time: timeFromDate(task.startDate || task.dueDate, task.time),
      durationMinutes: task.durationMinutes || 60,
      status: task.status === 'completed' ? 'done' : task.status,
      priority: task.priority,
      category: task.category || task.Category?.name || 'Général',
      subtasks: (task.Subtask || []).map((s) => ({
        id: s.id,
        title: s.title,
        completed: s.completed,
      })),
    };

    return NextResponse.json({ task: mappedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE - Delete task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || 'mindlife-user';

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    await db.task.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
