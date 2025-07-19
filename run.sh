#!/bin/bash

# Kafka Playground - One Command Runner
# This script builds and runs the entire Kafka playground with Python

echo "🚀 Starting Kafka Playground with Python..."

# Build and start all services
echo "📦 Building and starting services..."
docker compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 60

# Show status
echo "🔍 Service status:"
docker compose ps

echo ""
echo "📊 Access Points:"
echo "🌐 Confluent Control Center: http://localhost:9021"
echo "📡 Kafka Broker: localhost:9092"
echo "🦒 Zookeeper: localhost:2181"
echo ""

echo "✅ Kafka Playground is running!"
echo ""
echo "📤 Producer Server: Continuously producing messages every 2 seconds"
echo "📥 Consumer Server: Continuously consuming messages"
echo ""
echo "📋 View logs:"
echo "  docker compose logs -f producer-server"
echo "  docker compose logs -f consumer-server"
echo ""
echo "🔧 Run additional examples:"
echo "  docker exec -it kafka-producer-server python examples/stream_processor.py"
echo "  # Use Control Center at http://localhost:9021 for topic management"
echo ""
echo "🛑 To stop: docker compose down" 