#!/bin/bash

echo "🚀 Starting Anonymous Anime Universe Chat System..."
echo "=================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker compose down

# Start the services
echo "🔧 Starting services..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Checking service status..."
docker compose ps

echo ""
echo "✅ Chat system is starting up!"
echo ""
echo "🌐 Services:"
echo "   - Kafka Control Center: http://localhost:9021"
echo "   - Producer Server: http://localhost:8001"
echo "   - Consumer Server: http://localhost:8002"
echo "   - Anonymous Chat App: http://localhost:3000"
echo ""
echo "🎯 Main Chat Interface: http://localhost:3000"
echo ""
echo "📝 Topic: anonymous-anime-universe"
echo ""
echo "🔍 To view logs: docker compose logs -f"
echo "🛑 To stop: docker compose down" 