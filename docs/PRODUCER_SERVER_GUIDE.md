# Producer Server Guide

## Overview

The Producer Server is a FastAPI-based service that provides HTTP endpoints for producing messages to Kafka topics. It runs on port 8001 and offers both single message and batch message production capabilities.

## 🚀 Quick Start

### Start the Producer Server

```bash
# Start all services including producer
./run.sh

# Or start just the producer service
docker-compose up producer-server
```

### Access the Producer API

- **Base URL**: `http://localhost:8001`
- **API Documentation**: `http://localhost:8001/docs`
- **Health Check**: `http://localhost:8001/health`

## 📋 API Endpoints

### 1. Root Endpoint

**GET** `/`

Returns basic API information and available endpoints.

```bash
curl http://localhost:8001/
```

**Response:**

```json
{
  "message": "Kafka Producer API Server",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "produce": "/produce",
    "docs": "/docs"
  }
}
```

### 2. Health Check

**GET** `/health`

Checks the health status of the producer server and Kafka connection.

```bash
curl http://localhost:8001/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.123456",
  "kafka_connected": true
}
```

### 3. Produce Single Message

**POST** `/produce`

Produces a single message to a Kafka topic.

```bash
curl -X POST http://localhost:8001/produce \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "test-topic",
    "key": "message-1",
    "message": {
      "user_id": 123,
      "action": "login",
      "data": "Hello from API!"
    },
    "partition": 0
  }'
```

**Request Body:**

```json
{
  "topic": "test-topic", // Required: Topic name
  "key": "message-1", // Optional: Message key
  "message": {
    // Required: Message content
    "user_id": 123,
    "action": "login",
    "data": "Hello from API!"
  },
  "partition": 0 // Optional: Specific partition
}
```

**Response:**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "topic": "test-topic",
  "partition": 0,
  "offset": 0,
  "timestamp": "2024-01-15T10:30:00.123456"
}
```

### 4. Produce Batch Messages

**POST** `/produce/batch`

Produces multiple messages in a single request.

```bash
curl -X POST http://localhost:8001/produce/batch \
  -H "Content-Type: application/json" \
  -d '[
    {
      "topic": "test-topic",
      "key": "msg-1",
      "message": {"text": "First message"}
    },
    {
      "topic": "test-topic",
      "key": "msg-2",
      "message": {"text": "Second message"}
    }
  ]'
```

**Request Body:**

```json
[
  {
    "topic": "test-topic",
    "key": "msg-1",
    "message": { "text": "First message" }
  },
  {
    "topic": "test-topic",
    "key": "msg-2",
    "message": { "text": "Second message" }
  }
]
```

**Response:**

```json
{
  "success": true,
  "messages_sent": 2,
  "results": [
    {
      "success": true,
      "topic": "test-topic",
      "message": "Queued for delivery"
    },
    {
      "success": true,
      "topic": "test-topic",
      "message": "Queued for delivery"
    }
  ]
}
```

## 🔧 Configuration

### Environment Variables

The producer server uses the following environment variables:

```bash
KAFKA_BOOTSTRAP_SERVERS=kafka:29092  # Kafka broker addresses
PYTHONPATH=/app                      # Python path
```

### Kafka Producer Configuration

The producer is configured with the following settings:

```python
config = {
    'bootstrap.servers': bootstrap_servers,
    'client.id': 'python-producer-api',
    'acks': 'all',                    # Wait for all replicas
    'retries': 3,                     # Retry failed sends
    'batch.size': 16384,              # Batch size in bytes
    'linger.ms': 1,                   # Wait time for batching
    'buffer.memory': 33554432,        # Buffer memory in bytes
}
```

## 📊 Message Format

### Enhanced Message Structure

When you send a message, the producer automatically adds metadata:

```json
{
  "user_id": 123, // Your original message
  "action": "login",
  "data": "Hello from API!",
  "timestamp": "2024-01-15T10:30:00.123456", // Auto-added
  "source": "python-producer-api", // Auto-added
  "server_time": 1705312200.123456 // Auto-added
}
```

### Message Types

#### 1. User Events

```json
{
  "topic": "user-events",
  "key": "user-123",
  "message": {
    "user_id": 123,
    "event_type": "login",
    "timestamp": "2024-01-15T10:30:00Z",
    "ip_address": "192.168.1.1"
  }
}
```

#### 2. System Logs

```json
{
  "topic": "system-logs",
  "key": "app-server-1",
  "message": {
    "level": "INFO",
    "message": "Application started",
    "service": "api-server",
    "version": "1.0.0"
  }
}
```

#### 3. Business Data

```json
{
  "topic": "orders",
  "key": "order-456",
  "message": {
    "order_id": 456,
    "customer_id": 789,
    "amount": 99.99,
    "items": ["item1", "item2"],
    "status": "pending"
  }
}
```

## 🐛 Error Handling

### Common Error Responses

#### 1. Producer Not Initialized

```json
{
  "detail": "Producer not initialized"
}
```

#### 2. Invalid Message Format

```json
{
  "detail": "Failed to produce message: Invalid message format"
}
```

#### 3. Kafka Connection Issues

```json
{
  "detail": "Failed to produce message: Connection timeout"
}
```

### Error Handling Best Practices

1. **Always check health endpoint** before sending messages
2. **Handle timeouts** for large batch operations
3. **Validate message format** before sending
4. **Use appropriate retry logic** for failed sends

## 📈 Performance Tips

### 1. Batch Operations

Use the `/produce/batch` endpoint for multiple messages:

```bash
# Good: Send multiple messages in one request
curl -X POST http://localhost:8001/produce/batch \
  -H "Content-Type: application/json" \
  -d '[{"topic": "test", "message": {"id": 1}}, {"topic": "test", "message": {"id": 2}}]'

# Avoid: Multiple single requests
curl -X POST http://localhost:8001/produce -d '{"topic": "test", "message": {"id": 1}}'
curl -X POST http://localhost:8001/produce -d '{"topic": "test", "message": {"id": 2}}'
```

### 2. Message Keys

Use meaningful keys for better partitioning:

```json
{
  "topic": "user-events",
  "key": "user-123", // Good: Consistent key for user
  "message": { "action": "login" }
}
```

### 3. Topic Naming

Use descriptive topic names:

```bash
# Good topic names
"user-events"
"order-updates"
"system-logs"
"payment-transactions"

# Avoid generic names
"topic1"
"data"
"messages"
```

## 🔍 Monitoring

### 1. Health Monitoring

```bash
# Check producer health
curl http://localhost:8001/health

# Monitor in a loop
watch -n 5 'curl -s http://localhost:8001/health | jq'
```

### 2. Log Monitoring

```bash
# View producer logs
docker-compose logs -f producer-server

# Filter for errors
docker-compose logs producer-server | grep ERROR
```

### 3. Kafka Monitoring

Use Confluent Control Center at `http://localhost:9021` to:

- Monitor topic message rates
- View producer metrics
- Check partition distribution
- Analyze message flow

## 🧪 Testing

### 1. Basic Functionality Test

```bash
# Test health endpoint
curl http://localhost:8001/health

# Test single message
curl -X POST http://localhost:8001/produce \
  -H "Content-Type: application/json" \
  -d '{"topic": "test-topic", "message": {"test": "Hello World"}}'

# Test batch messages
curl -X POST http://localhost:8001/produce/batch \
  -H "Content-Type: application/json" \
  -d '[{"topic": "test-topic", "message": {"id": 1}}, {"topic": "test-topic", "message": {"id": 2}}]'
```

### 2. Load Testing

```bash
# Send 100 messages
for i in {1..100}; do
  curl -X POST http://localhost:8001/produce \
    -H "Content-Type: application/json" \
    -d "{\"topic\": \"load-test\", \"message\": {\"id\": $i, \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}}"
done
```

### 3. Error Testing

```bash
# Test with invalid JSON
curl -X POST http://localhost:8001/produce \
  -H "Content-Type: application/json" \
  -d '{"invalid": "json"'

# Test with missing required fields
curl -X POST http://localhost:8001/produce \
  -H "Content-Type: application/json" \
  -d '{"topic": "test-topic"}'
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Confluent Kafka Python Client](https://github.com/confluentinc/confluent-kafka-python)
- [Apache Kafka Producer Guide](https://kafka.apache.org/documentation/#producerapi)
- [Kafka Best Practices](https://docs.confluent.io/platform/current/kafka/deployment.html)

---

For more information, see the main [README.md](../README.md) or the [Consumer Server Guide](./CONSUMER_SERVER_GUIDE.md).
