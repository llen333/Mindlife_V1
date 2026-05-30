import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const tasks = await prisma.task.count();
  const events = await prisma.event.count();
  const goals = await prisma.goal.count();
  const habits = await prisma.habit.count();
  const notes = await prisma.note.count();
  const meals = await prisma.meal.count();
  const categories = await prisma.category.count();
  
  console.log('📊 Database Status:');
  console.log(`  Users: ${users}`);
  console.log(`  Tasks: ${tasks}`);
  console.log(`  Events: ${events}`);
  console.log(`  Goals: ${goals}`);
  console.log(`  Habits: ${habits}`);
  console.log(`  Notes: ${notes}`);
  console.log(`  Meals: ${meals}`);
  console.log(`  Categories: ${categories}`);
}

main().finally(() => prisma.$disconnect());
