#!/usr/bin/env tsx

/**
 * Migration Script: SQLite → PostgreSQL
 * 
 * This script migrates all data from SQLite to PostgreSQL while preserving
 * data integrity and maintaining API compatibility.
 * 
 * Usage:
 *   npm run migrate:postgres
 *   # or
 *   npx tsx scripts/migrate-sqlite-to-postgres.ts
 */

import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Determine current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize clients
const sqlitePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
});

const postgresPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgresql://mindlife:mindlife@localhost:5432/mindlife',
    },
  },
});

// Migration configuration
const MIGRATION_CONFIG = {
  batchSize: 1000,
  retryAttempts: 3,
  delayBetweenRetries: 1000, // 1 second
  enableVectorMigration: true,
  enableBackup: true,
  backupPath: path.join(__dirname, '../backups'),
};

// Tables to migrate (excluding system tables)
const TABLES_TO_MIGRATE = [
  'user',
  'agent',
  'agentState',
  'agentMessage',
  'agentSession',
  'agentChatMessage',
  'agentMemory',
  'biometricData',
  'category',
  'chatMessage',
  'dayExercise',
  'event',
  'goal',
  'habit',
  'habitLog',
  'journalEntry',
  'meal',
  'mealPlan',
  'note',
  'nutritionProfile',
  'programDay',
  'sessionExercise',
  'spiritConversation',
  'spiritMessage',
  'sportGoal',
  'sportProfile',
  'task',
  'tempData',
  'userPreference',
  'mediaItem',
  'sleepEntry',
  'transaction',
  'recurringBill',
  'shoppingList',
  'shoppingItem',
  'savingsGoal',
  'workoutSession',
  'personaPattern',
  'interactionHistory',
  'scrapedRecipe',
  'scrapedExercise',
];

// Backup data before migration
async function createBackup(): Promise<void> {
  if (!MIGRATION_CONFIG.enableBackup) return;
  
  console.log('📦 Creating backup...');
  
  try {
    await fs.mkdir(MIGRATION_CONFIG.backupPath, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(MIGRATION_CONFIG.backupPath, `migration-backup-${timestamp}.json`);
    
    const backupData = {
      timestamp: new Date().toISOString(),
      sqliteData: {},
    };
    
    // Backup key tables
    for (const table of ['user', 'agent', 'agentMemory', 'agentState']) {
      try {
        const data = await sqlitePrisma[table].findMany();
        backupData.sqliteData[table] = data;
        console.log(`  📄 Backed up ${table}: ${data.length} records`);
      } catch (error) {
        console.warn(`  ⚠️  Failed to backup ${table}:`, error);
      }
    }
    
    await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup created: ${backupFile}`);
    
  } catch (error) {
    console.error('❌ Failed to create backup:', error);
    throw error;
  }
}

// Execute SQL query with retry logic
async function executeWithRetry(
  query: string,
  params: any[] = [],
  client: PrismaClient,
  tableName: string
): Promise<void> {
  let attempts = 0;
  
  while (attempts < MIGRATION_CONFIG.retryAttempts) {
    try {
      if (client.$executeRaw) {
        await client.$executeRaw({ sql: query, params });
      } else {
        // Fallback for older Prisma versions
        await (client as any).$executeRawUnsafe(query, ...params);
      }
      return;
    } catch (error) {
      attempts++;
      if (attempts >= MIGRATION_CONFIG.retryAttempts) {
        console.error(`❌ Failed to execute query on ${tableName} after ${attempts} attempts:`, error);
        throw error;
      }
      
      console.warn(`⚠️  Attempt ${attempts} failed for ${tableName}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, MIGRATION_CONFIG.delayBetweenRetries));
    }
  }
}

// Migrate table data
async function migrateTable(tableName: string): Promise<void> {
  console.log(`🔄 Migrating table: ${tableName}`);
  
  try {
    // Get data from SQLite
    const sqliteData = await sqlitePrisma[tableName].findMany();
    
    if (sqliteData.length === 0) {
      console.log(`  ℹ️  No data to migrate for ${tableName}`);
      return;
    }
    
    console.log(`  📊 Found ${sqliteData.length} records in SQLite`);
    
    // Prepare data for PostgreSQL
    const postgresData = sqliteData.map(record => {
      // Convert date objects to ISO strings if needed
      const converted = { ...record };
      
      Object.keys(converted).forEach(key => {
        if (converted[key] instanceof Date) {
          converted[key] = converted[key].toISOString();
        }
        // Handle BigInt serialization
        if (typeof converted[key] === 'bigint') {
          converted[key] = Number(converted[key]);
        }
      });
      
      return converted;
    });
    
    // Batch insert into PostgreSQL
    const batchSize = MIGRATION_CONFIG.batchSize;
    let totalInserted = 0;
    
    for (let i = 0; i < postgresData.length; i += batchSize) {
      const batch = postgresData.slice(i, i + batchSize);
      
      try {
        // Use upsert to avoid duplicates
        for (const record of batch) {
          const id = record.id;
          if (id) {
            await postgresPrisma[tableName].upsert({
              where: { id },
              update: record,
              create: record,
            });
          } else {
            await postgresPrisma[tableName].create({ data: record });
          }
        }
        
        totalInserted += batch.length;
        
        if (totalInserted % (batchSize * 2) === 0 || totalInserted === postgresData.length) {
          console.log(`  ✅ Inserted ${totalInserted}/${postgresData.length} records`);
        }
        
      } catch (error) {
        console.error(`❌ Error inserting batch starting at ${i}:`, error);
        throw error;
      }
    }
    
    console.log(`✅ Successfully migrated ${tableName}: ${totalInserted} records`);
    
  } catch (error) {
    console.error(`❌ Failed to migrate table ${tableName}:`, error);
    throw error;
  }
}

// Migrate vector memories separately
async function migrateVectorMemories(): Promise<void> {
  if (!MIGRATION_CONFIG.enableVectorMigration) {
    console.log('⏭️  Vector memory migration disabled');
    return;
  }
  
  console.log('🧠 Migrating vector memories...');
  
  try {
    // Get existing memories from SQLite AgentMemory table
    const sqliteMemories = await sqlitePrisma.agentMemory.findMany({
      where: {
        type: {
          in: ['vector_memory', 'episodic_memory', 'semantic_memory'],
        },
      },
    });
    
    if (sqliteMemories.length === 0) {
      console.log('  ℹ️  No vector memories to migrate');
      return;
    }
    
    console.log(`  📊 Found ${sqliteMemories.length} vector memories in SQLite`);
    
    // Transform and insert into PostgreSQL vector_memories table
    const vectorMemories = sqliteMemories.map(memory => ({
      id: memory.id,
      agentId: memory.agentId,
      content: memory.value,
      embedding: memory.embedding ? JSON.parse(memory.embedding) : null,
      metadata: memory.metadata || {},
      importance: memory.importance || 3,
      memoryLevel: memory.memoryLevel || 'mtm',
      emotion: memory.emotion || 'neutral',
      created_at: memory.createdAt || new Date(),
      updated_at: memory.updatedAt || new Date(),
    }));
    
    // Insert into PostgreSQL
    const batchSize = MIGRATION_CONFIG.batchSize;
    let totalInserted = 0;
    
    for (let i = 0; i < vectorMemories.length; i += batchSize) {
      const batch = vectorMemories.slice(i, i + batchSize);
      
      for (const memory of batch) {
        try {
          await postgresPrisma.$executeRaw`
            INSERT INTO vector_memories (
              id, agent_id, content, embedding, metadata, 
              importance, memory_level, emotion, created_at, updated_at
            ) VALUES (
              ${memory.id}, ${memory.agentId}, ${memory.content}, 
              ${memory.embedding}, ${JSON.stringify(memory.metadata)}, 
              ${memory.importance}, ${memory.memoryLevel}, ${memory.emotion}, 
              ${memory.created_at}, ${memory.updated_at}
            )
            ON CONFLICT (id) DO UPDATE SET
              content = EXCLUDED.content,
              embedding = EXCLUDED.embedding,
              metadata = EXCLUDED.metadata,
              importance = EXCLUDED.importance,
              memory_level = EXCLUDED.memory_level,
              emotion = EXCLUDED.emotion,
              updated_at = EXCLUDED.updated_at
          `;
        } catch (error) {
          console.error(`❌ Error inserting vector memory ${memory.id}:`, error);
          throw error;
        }
      }
      
      totalInserted += batch.length;
      if (totalInserted % (batchSize * 2) === 0 || totalInserted === vectorMemories.length) {
        console.log(`  ✅ Inserted ${totalInserted}/${vectorMemories.length} vector memories`);
      }
    }
    
    console.log(`✅ Successfully migrated vector memories: ${totalInserted} records`);
    
  } catch (error) {
    console.error('❌ Failed to migrate vector memories:', error);
    throw error;
  }
}

// Update API routes to use PostgreSQL
async function updateAPIRoutes(): Promise<void> {
  console.log('🔄 Updating API routes for PostgreSQL...');
  
  try {
    // Update database URL to use PostgreSQL
    const envPath = path.join(__dirname, '../.env');
    let envContent = '';
    
    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch (error) {
      console.log('  ℹ️  .env file not found, creating new one');
    }
    
    // Update DATABASE_URL
    const postgresUrl = process.env.POSTGRES_URL || 'postgresql://mindlife:mindlife@localhost:5432/mindlife';
    envContent = envContent.replace(
      /DATABASE_URL=.*/,
      `DATABASE_URL=${postgresUrl}`
    );
    
    // Add PostgreSQL-specific settings
    envContent += `\n# PostgreSQL settings\n`;
    envContent += `POSTGRES_HOST=localhost\n`;
    envContent += `POSTGRES_PORT=5432\n`;
    envContent += `POSTGRES_USER=mindlife\n`;
    envContent += `POSTGRES_PASSWORD=mindlife\n`;
    envContent += `POSTGRES_DB=mindlife\n`;
    
    await fs.writeFile(envPath, envContent);
    console.log('✅ Updated .env file with PostgreSQL settings');
    
    // Update Prisma schema if needed
    const prismaSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
    let schemaContent = '';
    
    try {
      schemaContent = await fs.readFile(prismaSchemaPath, 'utf-8');
      
      // Update provider to PostgreSQL
      schemaContent = schemaContent.replace(
        /provider\s*=\s*"sqlite"/,
        'provider = "postgresql"'
      );
      
      await fs.writeFile(prismaSchemaPath, schemaContent);
      console.log('✅ Updated Prisma schema for PostgreSQL');
      
    } catch (error) {
      console.warn('⚠️  Could not update Prisma schema:', error);
    }
    
  } catch (error) {
    console.error('❌ Failed to update API routes:', error);
    throw error;
  }
}

// Validate migration
async function validateMigration(): Promise<void> {
  console.log('🔍 Validating migration...');
  
  const validationResults = {
    tables: {},
    vectorMemories: {},
    totalRecords: 0,
  };
  
  try {
    // Check each table
    for (const table of TABLES_TO_MIGRATE) {
      try {
        const sqliteCount = await sqlitePrisma[table].count();
        const postgresCount = await postgresPrisma[table].count();
        
        validationResults.tables[table] = {
          sqlite: sqliteCount,
          postgres: postgresCount,
          match: sqliteCount === postgresCount,
        };
        
        validationResults.totalRecords += postgresCount;
        
        if (sqliteCount === postgresCount) {
          console.log(`  ✅ ${table}: ${sqliteCount} records match`);
        } else {
          console.log(`  ⚠️  ${table}: SQLite=${sqliteCount}, PostgreSQL=${postgresCount}`);
        }
        
      } catch (error) {
        console.warn(`  ❌ Could not validate ${table}:`, error);
      }
    }
    
    // Check vector memories
    try {
      const sqliteVectorCount = await sqlitePrisma.agentMemory.count({
        where: {
          type: {
            in: ['vector_memory', 'episodic_memory', 'semantic_memory'],
          },
        },
      });
      
      const postgresVectorCount = await postgresPrisma.$queryRaw`
        SELECT COUNT(*) FROM vector_memories
      ` as Promise<number>;
      
      validationResults.vectorMemories = {
        sqlite: sqliteVectorCount,
        postgres: postgresVectorCount,
        match: sqliteVectorCount === postgresVectorCount,
      };
      
      if (sqliteVectorCount === postgresVectorCount) {
        console.log(`  ✅ Vector memories: ${sqliteVectorCount} records match`);
      } else {
        console.log(`  ⚠️  Vector memories: SQLite=${sqliteVectorCount}, PostgreSQL=${postgresVectorCount}`);
      }
      
    } catch (error) {
      console.warn('  ❌ Could not validate vector memories:', error);
    }
    
    console.log(`📊 Total migrated records: ${validationResults.totalRecords}`);
    
    // Check for any critical mismatches
    const mismatches = Object.entries(validationResults.tables)
      .filter(([_, data]) => !data.match);
    
    if (mismatches.length > 0) {
      console.warn(`⚠️  Found ${mismatches.length} table mismatches`);
      mismatches.forEach(([table, data]) => {
        console.warn(`    - ${table}: SQLite=${data.sqlite}, PostgreSQL=${data.postgres}`);
      });
    } else {
      console.log('✅ All table counts match!');
    }
    
    return validationResults;
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    throw error;
  }
}

// Main migration function
async function main(): Promise<void> {
  console.log('🚀 Starting SQLite → PostgreSQL migration...\n');
  
  try {
    // Test database connections
    console.log('🔌 Testing database connections...');
    await sqlitePrisma.$connect();
    await postgresPrisma.$connect();
    console.log('✅ Database connections established\n');
    
    // Create backup
    await createBackup();
    
    // Migrate tables
    for (const table of TABLES_TO_MIGRATE) {
      await migrateTable(table);
    }
    
    // Migrate vector memories
    await migrateVectorMemories();
    
    // Update API routes
    await updateAPIRoutes();
    
    // Validate migration
    const validation = await validateMigration();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log(`📊 Total records migrated: ${validation.totalRecords}`);
    
    // Generate migration report
    const report = {
      timestamp: new Date().toISOString(),
      config: MIGRATION_CONFIG,
      validation,
      summary: {
        totalTables: TABLES_TO_MIGRATE.length,
        totalRecords: validation.totalRecords,
        vectorMemories: validation.vectorMemories.postgres || 0,
        status: 'completed',
      },
    };
    
    const reportPath = path.join(MIGRATION_CONFIG.backupPath, `migration-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Migration report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    
    // Save error report
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
    };
    
    const errorReportPath = path.join(MIGRATION_CONFIG.backupPath, `migration-error-${Date.now()}.json`);
    await fs.writeFile(errorReportPath, JSON.stringify(errorReport, null, 2));
    console.log(`❌ Error report saved to: ${errorReportPath}`);
    
    process.exit(1);
  } finally {
    // Close database connections
    await sqlitePrisma.$disconnect();
    await postgresPrisma.$disconnect();
    console.log('🔌 Database connections closed');
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the migration
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main, migrateTable, migrateVectorMemories, validateMigration };