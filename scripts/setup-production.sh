#!/bin/bash

# Production setup script
set -e

echo "🔧 Setting up production environment..."

# Create directories
mkdir -p /opt/desamart/uploads
mkdir -p /opt/desamart/nginx/ssl
mkdir -p /opt/desamart/nginx/logs
mkdir -p /opt/desamart/monitoring

# Copy files
cp -r . /opt/desamart/

# Generate SSL certificates (Let's Encrypt)
echo "🔒 Setting up SSL..."
if [ ! -f "/opt/desamart/nginx/ssl/fullchain.pem" ]; then
    docker run -it --rm \
        -v /opt/desamart/nginx/ssl:/etc/letsencrypt \
        certbot/certbot certonly --standalone \
        -d your-domain.com \
        --email your-email@domain.com \
        --non-interactive --agree-tos
fi

# Setup environment
echo "📝 Setting up environment..."
cp .env.production /opt/desamart/.env

# Set permissions
chmod +x /opt/desamart/scripts/*.sh

# Run initial deployment
echo "🚀 Running initial deployment..."
cd /opt/desamart
./scripts/deploy.sh

echo "✅ Production setup completed!"
echo "🌐 Visit: https://your-domain.com"