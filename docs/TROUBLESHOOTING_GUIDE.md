# Troubleshooting Guide

## 🚨 Common Issues and Solutions

This guide covers the most common issues you might encounter when running the Kafka Playground with the Anonymous Chat application.

## 📋 Quick Health Check

Before diving into specific issues, run this quick health check:

```bash
# Check if all services are running
docker compose ps

# Check service health
curl http://localhost:8001/health  # Producer API
curl http://localhost:8002/health  # Consumer API

# Check Kafka Control Center
open http://localhost:9021
```

## 🔧 Frontend Issues

### React Error #418

**Symptoms:**

- Browser console shows "Uncaught Error: Minified React error #418"
- Frontend doesn't load properly
- WebSocket connections fail

**Cause:**
State updates on unmounted components or stale closures in useEffect hooks.

**Solution:**

```typescript
// Add isMounted flag to prevent state updates on unmounted components
useEffect(() => {
  let isMounted = true;

  const config = {
    onConnect: () => {
      if (!isMounted) return;
      setIsConnected(true);
    },
    onMessage: (message) => {
      if (!isMounted) return;
      setMessages((prev) => [...prev, message]);
    },
  };

  return () => {
    isMounted = false;
  };
}, []);
```

### WebSocket Connection Not Visible in Network Tab

**Symptoms:**

- No WebSocket connections in browser Network tab
- Messages not being received
- Connection status shows disconnected

**Causes:**

1. CORS issues
2. Incorrect WebSocket URL
3. Consumer server not running
4. Environment variables not set

**Solutions:**

1. **Check CORS Configuration:**

```python
# In producer_server.py and consumer_server.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. **Verify Environment Variables:**

```bash
# Check docker-compose.yml
environment:
  - NEXT_PUBLIC_PRODUCER_URL=http://localhost:8001
  - NEXT_PUBLIC_CONSUMER_URL=http://localhost:8002
```

3. **Check WebSocket URL Construction:**

```typescript
// In simple-chat-service.ts
const wsUrl = this.config.consumerUrl!.replace("http", "ws") + "/ws/chat";
console.log("🔗 WebSocket URL:", wsUrl);
```

### Messages Not Sending

**Symptoms:**

- Clicking send button does nothing
- No network requests in browser
- Console shows errors

**Solutions:**

1. **Check Button Click Handler:**

```typescript
// In ChatInput.tsx
const handleSend = () => {
  if (message.trim() && !disabled) {
    onSendMessage(message.trim());
    setMessage("");
  }
};
```

2. **Verify API Endpoint:**

```bash
# Test producer API directly
curl -X POST http://localhost:8001/chat/send \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "text": "hello", "room": "anonymous-anime-universe"}'
```

3. **Check CORS Headers:**

```bash
# Test CORS preflight
curl -X OPTIONS http://localhost:8001/chat/send \
  -H "Origin: http://localhost:3000"
```

## 🔧 Backend Issues

### Consumer Server Not Starting

**Symptoms:**

- Consumer server stuck in "Waiting for Kafka to be ready..."
- Health check returns connection reset
- WebSocket connections fail

**Causes:**

1. Kafka not ready
2. Incorrect bootstrap servers configuration
3. Startup script issues

**Solutions:**

1. **Check Kafka Status:**

```bash
docker compose logs kafka | tail -10
```

2. **Verify Bootstrap Servers:**

```yaml
# In docker-compose.yml
environment:
  KAFKA_BOOTSTRAP_SERVERS: kafka:29092 # Not localhost:9092
```

3. **Increase Startup Delay:**

```yaml
command: >
  sh -c "
    echo 'Waiting for Kafka to be ready...' &&
    sleep 35 &&  # Increase from 30 to 35 seconds
    echo 'Starting consumer API server...' &&
    python consumers/consumer_server.py
  "
```

### Kafka Connection Issues

**Symptoms:**

- "KafkaError{code=TOPIC_EXCEPTION,val=17,str="Broker: Invalid topic"}"
- Messages not being delivered
- Consumer not receiving messages

**Solutions:**

1. **Check Topic Exists:**

```bash
# Access Kafka Control Center
open http://localhost:9021
# Navigate to Topics and verify 'anonymous-anime-universe' exists
```

2. **Create Topic Manually:**

```bash
# Connect to Kafka container
docker exec -it kafka kafka-topics --create \
  --topic anonymous-anime-universe \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1
```

3. **Verify Topic Configuration:**

```bash
# List topics
docker exec -it kafka kafka-topics --list \
  --bootstrap-server localhost:9092
```

### WebSocket Connection Issues

**Symptoms:**

- WebSocket connections established but immediately closed
- No messages being broadcasted
- Consumer logs show connection open/close cycles

**Causes:**

1. WebSocket endpoint expecting client messages
2. Kafka consumption loop blocking
3. Connection manager issues

**Solutions:**

1. **Fix WebSocket Endpoint:**

```python
@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            try:
                # Wait for any message with timeout
                await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
            except asyncio.TimeoutError:
                # Send ping to keep connection alive
                await websocket.ping()
            except WebSocketDisconnect:
                break
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket)
```

2. **Fix Kafka Consumption Loop:**

```python
async def start_kafka_consumption(self):
    while self.is_consuming:
        try:
            # Use shorter poll timeout to prevent blocking
            msg = self.consumer.poll(0.1)

            if msg is None:
                # Give other tasks a chance to run
                await asyncio.sleep(0.1)
                continue
            # ... rest of the logic
```

### Producer API Issues

**Symptoms:**

- 500 Internal Server Error on message send
- Messages not being delivered to Kafka
- CORS errors

**Solutions:**

1. **Check Producer Configuration:**

```python
# In producer_server.py
def create_producer():
    config = {
        'bootstrap.servers': os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'kafka:29092'),
        'client.id': 'python-producer-api',
        'acks': 'all',
        'retries': 3,
    }
    return Producer(config)
```

2. **Add CORS Middleware:**

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🔧 Docker Issues

### Container Startup Failures

**Symptoms:**

- Containers exit immediately
- "No such service" errors
- Port conflicts

**Solutions:**

1. **Check Docker Compose File:**

```bash
# Validate docker-compose.yml
docker compose config
```

2. **Clean and Rebuild:**

```bash
# Stop all containers
docker compose down

# Remove volumes (optional)
docker compose down -v

# Rebuild images
docker compose build --no-cache

# Start services
docker compose up -d
```

3. **Check Port Conflicts:**

```bash
# Check if ports are in use
lsof -i :3000  # Frontend
lsof -i :8001  # Producer
lsof -i :8002  # Consumer
lsof -i :9092  # Kafka
```

### Volume Mount Issues

**Symptoms:**

- Code changes not reflected
- File permission errors
- Missing files in containers

**Solutions:**

1. **Check Volume Mounts:**

```yaml
# In docker-compose.yml
volumes:
  - ./producers:/app/producers
  - ./consumers:/app/consumers
```

2. **Fix Permissions:**

```bash
# Fix file permissions
chmod -R 755 producers/
chmod -R 755 consumers/
```

3. **Rebuild with Context:**

```bash
docker compose build --no-cache producer-server consumer-server
```

## 🔧 Environment Issues

### Environment Variables Not Set

**Symptoms:**

- Frontend can't connect to APIs
- Wrong URLs being used
- Default values being used instead of configured ones

**Solutions:**

1. **Check Environment Variables:**

```bash
# Check container environment
docker exec -it anonymous-chat-app env | grep NEXT_PUBLIC
```

2. **Verify docker-compose.yml:**

```yaml
environment:
  - NEXT_PUBLIC_PRODUCER_URL=http://localhost:8001
  - NEXT_PUBLIC_CONSUMER_URL=http://localhost:8002
  - NEXT_PUBLIC_TOPIC_NAME=anonymous-anime-universe
```

3. **Restart Services:**

```bash
docker compose restart anonymous-chat producer-server consumer-server
```

### Network Connectivity Issues

**Symptoms:**

- Services can't communicate
- Connection refused errors
- Timeout errors

**Solutions:**

1. **Check Docker Network:**

```bash
# List networks
docker network ls

# Inspect network
docker network inspect kafka-playground-python_default
```

2. **Test Inter-Service Communication:**

```bash
# Test from consumer to producer
docker exec -it kafka-consumer-server curl http://producer-server:8001/health

# Test from producer to consumer
docker exec -it kafka-producer-server curl http://consumer-server:8002/health
```

## 🔍 Debugging Commands

### Frontend Debugging

```bash
# Check frontend logs
docker compose logs anonymous-chat

# Access frontend container
docker exec -it anonymous-chat-app sh

# Check environment variables
docker exec -it anonymous-chat-app env
```

### Backend Debugging

```bash
# Check producer logs
docker compose logs producer-server

# Check consumer logs
docker compose logs consumer-server

# Check Kafka logs
docker compose logs kafka

# Test producer API
curl -X POST http://localhost:8001/chat/send \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "text": "debug message", "room": "anonymous-anime-universe"}'

# Test consumer API
curl http://localhost:8002/health
```

### Kafka Debugging

```bash
# Access Kafka container
docker exec -it kafka bash

# List topics
kafka-topics --list --bootstrap-server localhost:9092

# Check topic details
kafka-topics --describe --topic anonymous-anime-universe --bootstrap-server localhost:9092

# Consume messages manually
kafka-console-consumer --topic anonymous-anime-universe --bootstrap-server localhost:9092 --from-beginning
```

## 🚀 Performance Issues

### Slow Message Delivery

**Symptoms:**

- Messages take several seconds to appear
- High latency in chat
- Consumer lag

**Solutions:**

1. **Optimize Kafka Configuration:**

```yaml
# In docker-compose.yml for Kafka
environment:
  KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
  KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
```

2. **Optimize Consumer Polling:**

```python
# Use shorter poll timeouts
msg = self.consumer.poll(0.1)  # Instead of 1.0
```

3. **Check Resource Usage:**

```bash
# Monitor container resources
docker stats
```

### Memory Issues

**Symptoms:**

- Containers running out of memory
- Slow performance
- Container crashes

**Solutions:**

1. **Limit Container Resources:**

```yaml
# In docker-compose.yml
services:
  anonymous-chat:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

2. **Monitor Memory Usage:**

```bash
# Check memory usage
docker stats --no-stream
```

## 📞 Getting Help

### Before Asking for Help

1. **Run the Quick Health Check** (see beginning of guide)
2. **Check the logs** for all services
3. **Verify your environment** matches the requirements
4. **Try the solutions** in this guide

### Useful Information to Include

When reporting issues, include:

1. **Environment Details:**

   - Operating System
   - Docker version
   - Docker Compose version

2. **Error Messages:**

   - Full error logs
   - Console output
   - Network tab information

3. **Steps to Reproduce:**
   - Exact commands run
   - Order of operations
   - Expected vs actual behavior

### Additional Resources

- [Main README](../README.md)
- [Anonymous Chat Guide](./ANONYMOUS_CHAT_GUIDE.md)
- [Producer Server Guide](./PRODUCER_SERVER_GUIDE.md)
- [Consumer Server Guide](./CONSUMER_SERVER_GUIDE.md)
- [Web Interfaces Guide](./WEB_INTERFACES_GUIDE.md)

---

**Remember:** Most issues can be resolved by restarting services and checking the logs. When in doubt, start with `docker compose down && docker compose up -d` and check the logs for each service.
