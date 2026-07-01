#!/bin/bash

# Backup script for DesaMart
set -e

BACKUP_DIR="/opt/backups/desamart"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📦 Starting backup at $TIMESTAMP..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
echo "🗄️ Backing up database..."
docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/desamart_$TIMESTAMP.sql

# Backup uploads
echo "📁 Backing up uploads..."
tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz /opt/desamart/uploads

# Compress database backup
gzip $BACKUP_DIR/desamart_$TIMESTAMP.sql

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +30 -delete
find $BACKUP_DIR -type f -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup completed successfully!"