import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Ensure backup directory exists
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

// GET - Get backup info
export async function GET() {
  try {
    ensureBackupDir();
    
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.db'))
      .map(f => {
        const filePath = path.join(BACKUP_DIR, f);
        const stats = fs.statSync(filePath);
        return {
          name: f,
          date: stats.mtime,
          size: stats.size,
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    const lastBackup = files.length > 0 ? files[0].date : null;
    const backupCount = files.length;
    
    return NextResponse.json({
      success: true,
      lastBackup,
      backupCount,
      backups: files.slice(0, 5), // Last 5 backups
    });
  } catch (error) {
    console.error('Error getting backup info:', error);
    return NextResponse.json({ success: false, error: 'Failed to get backup info' }, { status: 500 });
  }
}

// POST - Create backup
export async function POST() {
  try {
    ensureBackupDir();
    
    // Get current user count and data
    const userCount = await db.user.count();
    const users = await db.user.findMany({
      select: { id: true, name: true, email: true }
    });
    
    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    
    // Copy database file
    const dbPath = path.join(process.cwd(), 'db', 'custom.db');
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
    } else {
      throw new Error('Database file not found');
    }
    
    // Keep only last 10 backups
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.db'))
      .sort()
      .reverse();
    
    if (files.length > 10) {
      files.slice(10).forEach(f => {
        fs.unlinkSync(path.join(BACKUP_DIR, f));
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Backup created successfully',
      backup: {
        name: backupFileName,
        date: new Date(),
        userCount,
        users: users.map(u => ({ id: u.id, name: u.name })),
      }
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create backup' 
    }, { status: 500 });
  }
}
