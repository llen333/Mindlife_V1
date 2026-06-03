import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST || process.env.BUN_TEST;
const forceNewClient = process.env.NODE_ENV !== 'production';

export const db = forceNewClient 
  ? new PrismaClient({ log: isTest ? [] : ['query'] })
  : (globalForPrisma.prisma ?? new PrismaClient())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db