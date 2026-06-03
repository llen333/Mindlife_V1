import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Map short category IDs to DB category IDs
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

// GET - List tasks with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const categoryId = searchParams.get('categoryId');
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

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) {
        (where.dueDate as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.dueDate as Record<string, Date>).lte = new Date(endDate);
      }
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
      },
    });

    return NextResponse.json({ tasks });
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
      startDate, progress, chapters, observations, addToCalendar, createdBy,
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
        status: status || 'pending',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
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

      return NextResponse.json({ task: updatedTask }, { status: 201 });
    }

    return NextResponse.json({ task }, { status: 201 });
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
      startDate, progress, chapters, observations, addToCalendar,
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
    if (progress !== undefined) updateData.progress = progress;
    if (chapters !== undefined) updateData.chapters = chapters ? (typeof chapters === 'string' ? chapters : JSON.stringify(chapters)) : null;
    if (observations !== undefined) updateData.observations = observations;
    if (addToCalendar !== undefined) updateData.addToCalendar = addToCalendar;
    if (tags !== undefined) updateData.tags = tags;
    if (categoryId !== undefined) updateData.categoryId = mappedCategoryId;

    const task = await db.task.update({
      where: { id },
      data: updateData,
      include: {
        Category: true,
        Event: true,
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

    return NextResponse.json({ task });
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
