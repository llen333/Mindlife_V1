import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing user data...');
  
  // Get existing tasks from mindlife-user
  const tasks = await prisma.task.findMany({ where: { userId: 'mindlife-user' } });
  console.log(`Found ${tasks.length} tasks for mindlife-user`);
  
  // Copy tasks to user-admin
  for (const t of tasks) {
    try {
      await prisma.task.create({
        data: {
          id: `admin-${t.id}`,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          dueDate: t.dueDate,
          userId: 'user-admin',
          categoryId: t.categoryId,
        }
      });
    } catch (e) {}
  }
  
  // Get existing events from mindlife-user
  const events = await prisma.event.findMany({ where: { userId: 'mindlife-user' } });
  console.log(`Found ${events.length} events for mindlife-user`);
  
  for (const e of events) {
    try {
      await prisma.event.create({
        data: {
          id: `admin-${e.id}`,
          title: e.title,
          description: e.description,
          startAt: e.startAt,
          endAt: e.endAt,
          isAllDay: e.isAllDay,
          userId: 'user-admin',
          categoryId: e.categoryId,
        }
      });
    } catch (err) {}
  }
  
  // Get existing goals from mindlife-user
  const goals = await prisma.goal.findMany({ where: { userId: 'mindlife-user' } });
  console.log(`Found ${goals.length} goals for mindlife-user`);
  
  for (const g of goals) {
    try {
      await prisma.goal.create({
        data: {
          id: `admin-${g.id}`,
          title: g.title,
          description: g.description,
          status: g.status,
          priority: g.priority,
          startDate: g.startDate,
          userId: 'user-admin',
          categoryId: g.categoryId,
        }
      });
    } catch (err) {}
  }
  
  // Get existing habits from mindlife-user
  const habits = await prisma.habit.findMany({ where: { userId: 'mindlife-user' } });
  console.log(`Found ${habits.length} habits for mindlife-user`);
  
  for (const h of habits) {
    try {
      await prisma.habit.create({
        data: {
          id: `admin-${h.id}`,
          name: h.name,
          description: h.description,
          frequency: h.frequency,
          userId: 'user-admin',
          categoryId: h.categoryId,
        }
      });
    } catch (err) {}
  }
  
  // Create categories for user-admin
  const categories = await prisma.category.findMany({ where: { userId: 'mindlife-user' } });
  for (const c of categories) {
    try {
      await prisma.category.create({
        data: {
          id: `admin-${c.id}`,
          name: c.name,
          icon: c.icon,
          color: c.color,
          type: c.type,
          userId: 'user-admin',
        }
      });
    } catch (err) {}
  }
  
  // Update user-admin name
  await prisma.user.update({
    where: { id: 'user-admin' },
    data: { name: 'Admin Test' }
  });
  
  // Update user-bob name
  await prisma.user.update({
    where: { id: 'user-bob' },
    data: { name: 'Bob Test' }
  });
  
  console.log('✅ Done! Data copied to user-admin');
  
  // Verify
  const adminTasks = await prisma.task.count({ where: { userId: 'user-admin' } });
  const adminEvents = await prisma.event.count({ where: { userId: 'user-admin' } });
  const adminGoals = await prisma.goal.count({ where: { userId: 'user-admin' } });
  const adminHabits = await prisma.habit.count({ where: { userId: 'user-admin' } });
  const adminCategories = await prisma.category.count({ where: { userId: 'user-admin' } });
  
  console.log(`\n📊 user-admin now has:`);
  console.log(`  Tasks: ${adminTasks}`);
  console.log(`  Events: ${adminEvents}`);
  console.log(`  Goals: ${adminGoals}`);
  console.log(`  Habits: ${adminHabits}`);
  console.log(`  Categories: ${adminCategories}`);
}

main().finally(() => prisma.$disconnect());
