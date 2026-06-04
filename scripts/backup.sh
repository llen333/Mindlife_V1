#!/usr/bin/env bash
set -euo pipefail
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

# ═══════════════════════════════════════════════════════════════
# Mindlife — Backup & Restore PostgreSQL
# ═══════════════════════════════════════════════════════════════
# Usage:
#   ./scripts/backup.sh            → crée un backup dans backups/
#   ./scripts/backup.sh restore    → restaure le dernier backup
#   ./scripts/backup.sh list       → liste les backups disponibles
# ═══════════════════════════════════════════════════════════════

BACKUP_DIR="$(cd "$(dirname "$0")/.." && pwd)/backups"
DB_NAME="mindlife"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
KEEP_DAYS=30

mkdir -p "$BACKUP_DIR"

case "${1:-backup}" in
  backup)
    FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"
    echo "📦 Backup → $FILE"
    pg_dump "$DB_NAME" | gzip > "$FILE"
    echo "✅ $(du -sh "$FILE" | cut -f1)  $(date)"

    # Purge les backups de plus de 30 jours
    find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$KEEP_DAYS -delete
    ;;

  restore)
    LATEST=$(ls -t "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null | head -1)
    if [ -z "$LATEST" ]; then
      echo "❌ Aucun backup trouvé dans $BACKUP_DIR"
      exit 1
    fi
    echo "⚠️  Restauration de $LATEST"
    echo "   La base '$DB_NAME' va être écrasée."
    echo -n "   Continuer ? (o/N) "
    read -r CONFIRM
    if [ "$CONFIRM" != "o" ]; then
      echo "Annulé."
      exit 0
    fi
    gunzip -c "$LATEST" | psql "$DB_NAME"
    echo "✅ Restauré : $(basename "$LATEST")"
    ;;

  list)
    echo "📋 Backups disponibles :"
    ls -lhS "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null || echo "   (aucun)"
    ;;

  *)
    echo "Usage: $0 {backup|restore|list}"
    exit 1
    ;;
esac
