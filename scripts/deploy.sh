#!/bin/bash

# Deployment script for DesaMart
set -e

echo "🚀 Starting deployment..."

# Load environment variables
source .env.production

# Pull latest images
echo "📦 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Health check
echo "🏥 Checking health..."
sleep 10
if curl -s http://localhost:80/health | grep -q "OK"; then
    echo "✅ Application is healthy"
else
    echo "❌ Application is not healthy"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# Clean up old images
echo "🧹 Cleaning up..."
docker system prune -f

echo "✅ Deployment completed successfully!"