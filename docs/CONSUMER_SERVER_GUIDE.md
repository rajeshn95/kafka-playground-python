# Consumer Server Guide

## Overview

The Consumer Server is a FastAPI-based service that provides HTTP endpoints for consuming messages from Kafka topics. It runs on port 8002 and offers message consumption, topic listing, and message retrieval capabilities.

## 🚀 Quick Start

### Start the Consumer Server

```bash
# Start all services including consumer
./run.sh

# Or start just the consumer service
docker-compose up consumer-server
```

### Access the Consumer API

- **Base URL**: `http://localhost:8002`
- **API Documentation**: `http://localhost:8002/docs`
- **Health Check**: `http://localhost:8002/health`

## 📋 API Endpoints

### 1. Root Endpoint

**GET** `/`

Returns basic API information and available endpoints.

```bash
curl http://localhost:8002/
```

**Response:**

```json
{
  "message": "Kafka Consumer API Server",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "consume": "/consume",
    "topics": "/topics",
    "docs": "/docs"
  }
}
```

### 2. Health Check

**GET** `/health`

Checks the health status of the consumer server and Kafka connection.

```bash
curl http://localhost:8002/health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.123456",
  "kafka_connected": true
}
```

### 3. Consume Messages

**POST** `/consume`

Consumes messages from a Kafka topic with configurable parameters.

```bash
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "test-topic",
    "group_id": "my-consumer-group",
    "max_messages": 10,
    "timeout": 5.0
  }'
```

**Request Body:**

```json
{
  "topic": "test-topic", // Required: Topic name
  "group_id": "my-consumer-group", // Optional: Consumer group ID
  "max_messages": 10, // Optional: Max messages to consume (default: 10)
  "timeout": 5.0 // Optional: Poll timeout in seconds (default: 5.0)
}
```

**Response:**

```json
{
  "success": true,
  "messages": [
    {
      "topic": "test-topic",
      "partition": 0,
      "offset": 0,
      "key": "message-1",
      "value": {
        "user_id": 123,
        "action": "login",
        "data": "Hello from API!",
        "timestamp": "2024-01-15T10:30:00.123456",
        "source": "python-producer-api",
        "server_time": 1705312200.123456
      },
      "timestamp": "2024-01-15T10:30:00.123456"
    }
  ],
  "count": 1,
  "topic": "test-topic",
  "group_id": "my-consumer-group"
}
```

### 4. List Topics

**GET** `/topics`

Lists all available Kafka topics with their partition information.

```bash
curl http://localhost:8002/topics
```

**Response:**

```json
[
  {
    "topic": "test-topic",
    "partitions": 1,
    "group_id": "python-consumer-api-group"
  },
  {
    "topic": "user-events",
    "partitions": 3,
    "group_id": "python-consumer-api-group"
  }
]
```

### 5. Get Messages from Topic

**GET** `/messages/{topic}`

Retrieves recent messages from a specific topic with optional limit parameter.

```bash
# Get up to 10 messages from test-topic
curl http://localhost:8002/messages/test-topic

# Get up to 5 messages from test-topic
curl http://localhost:8002/messages/test-topic?limit=5
```

**Response:**

```json
[
  {
    "topic": "test-topic",
    "partition": 0,
    "offset": 0,
    "key": "message-1",
    "value": {
      "user_id": 123,
      "action": "login",
      "data": "Hello from API!"
    },
    "timestamp": "2024-01-15T10:30:00.123456"
  },
  {
    "topic": "test-topic",
    "partition": 0,
    "offset": 1,
    "key": "message-2",
    "value": {
      "user_id": 456,
      "action": "logout",
      "data": "Goodbye from API!"
    },
    "timestamp": "2024-01-15T10:30:01.123456"
  }
]
```

## 🔧 Configuration

### Environment Variables

The consumer server uses the following environment variables:

```bash
KAFKA_BOOTSTRAP_SERVERS=kafka:29092  # Kafka broker addresses
PYTHONPATH=/app                      # Python path
```

### Kafka Consumer Configuration

The consumer is configured with the following settings:

```python
config = {
    'bootstrap.servers': bootstrap_servers,
    'group.id': group_id,
    'auto.offset.reset': 'earliest',        # Start from beginning
    'enable.auto.commit': True,             # Auto-commit offsets
    'auto.commit.interval.ms': 1000,        # Commit every second
    'session.timeout.ms': 6000,             # Session timeout
    'heartbeat.interval.ms': 2000,          # Heartbeat interval
}
```

## 📊 Message Processing

### Message Structure

Each consumed message contains:

```json
{
  "topic": "test-topic", // Topic name
  "partition": 0, // Partition number
  "offset": 0, // Message offset
  "key": "message-1", // Message key (if any)
  "value": {
    // Message content
    "user_id": 123,
    "action": "login",
    "data": "Hello from API!",
    "timestamp": "2024-01-15T10:30:00.123456",
    "source": "python-producer-api",
    "server_time": 1705312200.123456
  },
  "timestamp": "2024-01-15T10:30:00.123456" // Processing timestamp
}
```

### Consumer Groups

Consumer groups allow multiple consumers to share the work:

```bash
# Consumer 1 in group "my-group"
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "test-topic", "group_id": "my-group", "max_messages": 5}'

# Consumer 2 in same group (shares partitions)
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "test-topic", "group_id": "my-group", "max_messages": 5}'
```

## 🐛 Error Handling

### Common Error Responses

#### 1. Consumer Not Initialized

```json
{
  "detail": "Consumer not initialized"
}
```

#### 2. Topic Not Found

```json
{
  "detail": "Failed to consume messages: Topic not found"
}
```

#### 3. Kafka Connection Issues

```json
{
  "detail": "Failed to consume messages: Connection timeout"
}
```

#### 4. Invalid JSON Messages

```json
{
  "detail": "Failed to decode JSON message"
}
```

### Error Handling Best Practices

1. **Always check health endpoint** before consuming messages
2. **Handle empty responses** when no messages are available
3. **Use appropriate timeouts** for different scenarios
4. **Validate message format** before processing
5. **Handle partition EOF** gracefully

## 📈 Performance Tips

### 1. Batch Consumption

Use appropriate `max_messages` for efficient processing:

```bash
# Good: Consume multiple messages in one request
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "test-topic", "max_messages": 100}'

# Avoid: Consume one message at a time
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "test-topic", "max_messages": 1}'
```

### 2. Consumer Groups

Use meaningful group IDs for different use cases:

```bash
# Analytics consumer group
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "user-events", "group_id": "analytics-processor"}'

# Notification consumer group
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "user-events", "group_id": "notification-service"}'
```

### 3. Timeout Configuration

Adjust timeouts based on your use case:

```bash
# Real-time processing (short timeout)
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "real-time-events", "timeout": 1.0}'

# Batch processing (longer timeout)
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "batch-data", "timeout": 30.0}'
```

## 🔍 Monitoring

### 1. Health Monitoring

```bash
# Check consumer health
curl http://localhost:8002/health

# Monitor in a loop
watch -n 5 'curl -s http://localhost:8002/health | jq'
```

### 2. Log Monitoring

```bash
# View consumer logs
docker-compose logs -f consumer-server

# Filter for errors
docker-compose logs consumer-server | grep ERROR

# Filter for consumed messages
docker-compose logs consumer-server | grep "Received message"
```

### 3. Kafka Monitoring

Use Confluent Control Center at `http://localhost:9021` to:

- Monitor consumer groups
- View lag metrics
- Check partition assignments
- Analyze consumption patterns

### 4. Topic Monitoring

```bash
# List all topics
curl http://localhost:8002/topics | jq

# Monitor specific topic
curl http://localhost:8002/messages/test-topic?limit=5 | jq
```

## 🧪 Testing

### 1. Basic Functionality Test

```bash
# Test health endpoint
curl http://localhost:8002/health

# List available topics
curl http://localhost:8002/topics

# Consume messages
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "test-topic", "max_messages": 5}'

# Get messages from specific topic
curl http://localhost:8002/messages/test-topic?limit=3
```

### 2. Consumer Group Testing

```bash
# Create multiple consumers in same group
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "test-topic", "group_id": "test-group-1", "max_messages": 3}' &

curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "test-topic", "group_id": "test-group-1", "max_messages": 3}' &

wait
```

### 3. Error Testing

```bash
# Test with non-existent topic
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "non-existent-topic"}'

# Test with invalid JSON
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"invalid": "json"'

# Test with missing required fields
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 4. Load Testing

```bash
# Consume many messages
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "test-topic", "max_messages": 1000, "timeout": 30.0}'
```

## 🔄 Integration Examples

### 1. Producer-Consumer Workflow

```bash
# Step 1: Send messages via producer
curl -X POST http://localhost:8001/produce \
  -H "Content-Type: application/json" \
  -d '{"topic": "workflow-topic", "message": {"step": 1, "data": "Hello"}}'

curl -X POST http://localhost:8001/produce \
  -H "Content-Type: application/json" \
  -d '{"topic": "workflow-topic", "message": {"step": 2, "data": "World"}}'

# Step 2: Consume messages via consumer
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "workflow-topic", "max_messages": 10}'
```

### 2. Real-time Processing

```bash
# Monitor topic in real-time
while true; do
  curl -s -X POST http://localhost:8002/consume \
    -H "Content-Type: application/json" \
    -d '{"topic": "real-time-events", "max_messages": 5, "timeout": 1.0}' | jq
  sleep 2
done
```

### 3. Topic Analysis

```bash
# Analyze topic content
curl http://localhost:8002/messages/user-events?limit=100 | \
  jq '.[] | .value.event_type' | sort | uniq -c
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Confluent Kafka Python Client](https://github.com/confluentinc/confluent-kafka-python)
- [Apache Kafka Consumer Guide](https://kafka.apache.org/documentation/#consumerapi)
- [Kafka Consumer Groups](https://docs.confluent.io/platform/current/kafka/consumer-groups.html)
- [Kafka Best Practices](https://docs.confluent.io/platform/current/kafka/deployment.html)

---

For more information, see the main [README.md](../README.md) or the [Producer Server Guide](./PRODUCER_SERVER_GUIDE.md).
