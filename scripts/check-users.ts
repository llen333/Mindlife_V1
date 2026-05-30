import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, role: true } });
  console.log('\n👥 Users:');
  for (const u of users) {
    const tasks = await prisma.task.count({ where: { userId: u.id } });
    const events = await prisma.event.count({ where: { userId: u.id } });
    const goals = await prisma.goal.count({ where: { userId: u.id } });
    console.log(`  ${u.id} (${u.name}) - role: ${u.role} | tasks: ${tasks}, events: ${events}, goals: ${goals}`);
  }
}

main().finally(() => prisma.$disconnect());
