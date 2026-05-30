import { PrismaClient } from '@prisma/client'

// Force new client after schema changes - version 2
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Always create new client in development to pick up schema changes
const forceNewClient = process.env.NODE_ENV !== 'production';

export const db = forceNewClient 
  ? new PrismaClient({ log: ['query'] })
  : (globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] }))

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Log available models for debugging
console.log('📊 Prisma models:', Object.keys(db).filter(k => typeof (db as any)[k]?.findMany === 'function'))