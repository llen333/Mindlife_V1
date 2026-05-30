import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db', 'custom.db');
const BACKUP_DIR = path.join(process.cwd(), 'backups');

export async function POST(req: NextRequest) {
  try {
    const { backupName } = await req.json();

    if (!backupName) {
      return NextResponse.json({ error: 'Nom du backup requis' }, { status: 400 });
    }

    const backupPath = path.join(BACKUP_DIR, backupName);

    // Vérifier que le backup existe
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ error: 'Backup non trouvé' }, { status: 404 });
    }

    // Créer un backup de la DB actuelle avant restauration
    if (fs.existsSync(DB_PATH)) {
      const preRestoreBackup = `pre-restore-${Date.now()}.db`;
      const preRestorePath = path.join(BACKUP_DIR, preRestoreBackup);
      
      // S'assurer que le dossier existe
      if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
      }
      
      fs.copyFileSync(DB_PATH, preRestorePath);
    }

    // Restaurer le backup
    fs.copyFileSync(backupPath, DB_PATH);

    return NextResponse.json({
      success: true,
      message: 'Base de données restaurée avec succès',
      restoredFrom: backupName,
      restoredAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors de la restauration' },
      { status: 500 }
    );
  }
}
