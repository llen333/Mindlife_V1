// Sync API - Restore data from localStorage to DB
// This is called when the app detects that DB data is missing but localStorage has data
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Sync/restore data from client localStorage to DB
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { users, categories } = body;

    const results = {
      usersRestored: 0,
      categoriesRestored: 0,
      errors: [] as string[],
    };

    // Restore users if provided
    if (users && Array.isArray(users) && users.length > 0) {
      for (const user of users) {
        try {
          // Check if user exists
          const existing = await db.user.findUnique({
            where: { id: user.id },
          });

          if (!existing && user.id && user.email) {
            // Create user from localStorage data
            await db.user.create({
              data: {
                id: user.id,
                email: user.email,
                name: user.name || 'Utilisateur',
                avatar: user.avatar,
                role: user.role || 'member',
                timezone: 'Europe/Paris',
              },
            });
            results.usersRestored++;
          }
        } catch (err) {
          results.errors.push(`User ${user.id}: ${err}`);
        }
      }
    }

    // Restore categories if provided
    if (categories && Array.isArray(categories) && categories.length > 0) {
      for (const cat of categories) {
        try {
          // Check if category exists
          const existing = await db.category.findUnique({
            where: { id: cat.id },
          });

          if (!existing && cat.id && cat.name) {
            // Find a valid userId
            const anyUser = await db.user.findFirst();
            if (anyUser) {
              await db.category.create({
                data: {
                  id: cat.id,
                  name: cat.name,
                  icon: cat.icon || '📋',
                  color: cat.color || 'slate',
                  type: 'task',
                  userId: anyUser.id,
                },
              });
              results.categoriesRestored++;
            }
          }
        } catch (err) {
          results.errors.push(`Category ${cat.id}: ${err}`);
        }
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error syncing data:', error);
    return NextResponse.json(
      { error: 'Failed to sync data', details: String(error) },
      { status: 500 }
    );
  }
}

// GET - Check DB status
export async function GET() {
  try {
    const users = await db.user.count();
    const categories = await db.category.count();
    const tasks = await db.task.count();
    const goals = await db.goal.count();
    const events = await db.event.count();
    const habits = await db.habit.count();
    const notes = await db.note.count();
    const journalEntries = await db.journalEntry.count();
    const meals = await db.meal.count();

    return NextResponse.json({
      dbStatus: {
        users,
        categories,
        tasks,
        goals,
        events,
        habits,
        notes,
        journalEntries,
        meals,
        isEmpty: users === 0 && categories === 0,
      },
    });
  } catch (error) {
    console.error('Error checking DB status:', error);
    return NextResponse.json(
      { error: 'Failed to check DB status' },
      { status: 500 }
    );
  }
}
