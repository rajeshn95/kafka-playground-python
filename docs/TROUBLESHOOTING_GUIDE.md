# Troubleshooting Guide

## Overview

This guide documents common issues encountered when setting up the Kafka Playground with Python and their solutions. It's based on real troubleshooting experiences and provides step-by-step solutions.

## 🚨 Common Issues and Solutions

### 1. Kafka CLUSTER_ID Error

**Problem:**

```
CLUSTER_ID is required.
Command [/usr/local/bin/dub ensure CLUSTER_ID] FAILED !
```

**Root Cause:**

- Latest versions of Confluent Kafka (7.4.0+) require a `CLUSTER_ID` environment variable
- The configuration was missing this required parameter

**Attempted Solutions:**

1. **Adding KAFKA_CLUSTER_ID** ❌

   ```yaml
   environment:
     KAFKA_CLUSTER_ID: "4L6g3nShT-eMCtK--X86sw"
   ```

2. **Adding CLUSTER_ID** ❌

   ```yaml
   environment:
     CLUSTER_ID: "4L6g3nShT-eMCtK--X86sw"
   ```

3. **Using Latest Versions** ❌
   - Latest versions have stricter requirements
   - Platform compatibility issues on some systems

**Final Solution:** ✅
Use **Confluent Platform version 7.2.15** which doesn't require CLUSTER_ID:

```yaml
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.2.15

  kafka:
    image: confluentinc/cp-kafka:7.2.15

  control-center:
    image: confluentinc/cp-enterprise-control-center:7.2.15
```

### 2. Control Center Platform Compatibility Issues

**Problem:**

```
Control Center: Not starting due to platform compatibility
```

**Root Cause:**

- Outdated local Docker images (some were 9 years old!)
- Architecture mismatch between host and container
- Latest versions have stricter platform requirements

**Symptoms:**

- Control Center container fails to start
- Platform compatibility warnings in logs
- Container exits immediately after startup

**Solution:**

1. **Use Compatible Version**: Switch to version 7.2.15
2. **Use Enterprise Control Center**: `cp-enterprise-control-center:7.2.15`
3. **Pull Fresh Images**: Ensure you have the correct version locally

### 3. Docker Image Version Conflicts

**Problem:**

- Local Docker images were outdated (some 9 years old)
- Latest tags pointing to incompatible versions
- Version mismatch between services

**Solution:**

1. **Check Local Images:**

   ```bash
   docker images | grep confluentinc
   ```

2. **Use Specific Working Versions:**

   ```yaml
   # Working configuration
   zookeeper:
     image: confluentinc/cp-zookeeper:7.2.15

   kafka:
     image: confluentinc/cp-kafka:7.2.15

   control-center:
     image: confluentinc/cp-enterprise-control-center:7.2.15
   ```

3. **Pull Fresh Images:**
   ```bash
   docker compose pull
   ```

### 4. Producer/Consumer Connection Issues

**Problem:**

```
Failed to connect to Kafka: Connection timeout
```

**Root Cause:**

- Kafka not running due to CLUSTER_ID issues
- Wrong bootstrap server configuration
- Network connectivity issues between containers

**Solution:**

1. **Ensure Kafka is Running:**

   ```bash
   docker compose logs kafka
   ```

2. **Check Bootstrap Server Configuration:**

   ```yaml
   environment:
     KAFKA_BOOTSTRAP_SERVERS: kafka:29092
   ```

3. **Verify Container Network:**
   ```bash
   docker compose ps
   docker network ls
   ```

## 🔧 Step-by-Step Troubleshooting Process

### Step 1: Check Service Status

```bash
# Check all services
docker compose ps

# Check specific service logs
docker compose logs kafka --tail=20
docker compose logs control-center --tail=20
docker compose logs producer-server --tail=20
docker compose logs consumer-server --tail=20
```

### Step 2: Verify Docker Images

```bash
# List all Confluent images
docker images | grep confluentinc

# Check image details
docker inspect confluentinc/cp-kafka:latest
```

### Step 3: Test Individual Services

```bash
# Test Kafka connectivity
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Test Producer API
curl http://localhost:8001/health

# Test Consumer API
curl http://localhost:8002/health
```

### Step 4: Restart Services

```bash
# Restart specific service
docker compose restart kafka

# Restart all services
docker compose restart

# Full rebuild
docker compose down
docker compose up --build -d
```

## 📋 Working Configuration

### Final Working docker-compose.yml

```yaml
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.2.15
    hostname: zookeeper
    container_name: zookeeper
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    volumes:
      - zookeeper-data:/var/lib/zookeeper/data
      - zookeeper-logs:/var/lib/zookeeper/log

  kafka:
    image: confluentinc/cp-kafka:7.2.15
    hostname: kafka
    container_name: kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
      - "9101:9101"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: "zookeeper:2181"
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_JMX_PORT: 9101
      KAFKA_JMX_HOSTNAME: localhost
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
      KAFKA_DELETE_TOPIC_ENABLE: "true"
    volumes:
      - kafka-data:/var/lib/kafka/data

  control-center:
    image: confluentinc/cp-enterprise-control-center:7.2.15
    hostname: control-center
    container_name: control-center
    depends_on:
      - kafka
    ports:
      - "9021:9021"
    environment:
      CONTROL_CENTER_BOOTSTRAP_SERVERS: "kafka:29092"
      CONTROL_CENTER_ZOOKEEPER_CONNECT: "zookeeper:2181"
      CONTROL_CENTER_REPLICATION_FACTOR: 1
      CONTROL_CENTER_INTERNAL_TOPICS_PARTITIONS: 1
      CONTROL_CENTER_MONITORING_INTERCEPTOR_TOPIC_PARTITIONS: 1
      CONFLUENT_METRICS_REPORTER_BOOTSTRAP_SERVERS: "kafka:29092"
      CONFLUENT_METRICS_REPORTER_ZOOKEEPER_CONNECT: "zookeeper:2181"
      CONFLUENT_METRICS_REPORTER_TOPIC_REPLICAS: 1
      CONFLUENT_METRICS_ENABLE: "true"
      CONFLUENT_SUPPORT_CUSTOMER_ID: "anonymous"

  producer-server:
    build:
      context: .
      dockerfile: producers/Dockerfile
    container_name: kafka-producer-server
    depends_on:
      - kafka
    ports:
      - "8001:8001"
    environment:
      KAFKA_BOOTSTRAP_SERVERS: kafka:29092
      PYTHONPATH: /app
    volumes:
      - ./producers:/app/producers
    working_dir: /app
    command: >
      sh -c "
        echo 'Waiting for Kafka to be ready...' &&
        sleep 30 &&
        echo 'Starting producer API server...' &&
        python producers/producer_server.py
      "
    restart: unless-stopped

  consumer-server:
    build:
      context: .
      dockerfile: consumers/Dockerfile
    container_name: kafka-consumer-server
    depends_on:
      - kafka
    ports:
      - "8002:8002"
    environment:
      KAFKA_BOOTSTRAP_SERVERS: kafka:29092
      PYTHONPATH: /app
    volumes:
      - ./consumers:/app/consumers
    working_dir: /app
    command: >
      sh -c "
        echo 'Waiting for Kafka to be ready...' &&
        sleep 35 &&
        echo 'Starting consumer API server...' &&
        python consumers/consumer_server.py
      "
    restart: unless-stopped

volumes:
  zookeeper-data:
    driver: local
  zookeeper-logs:
    driver: local
  kafka-data:
    driver: local
```

## 🚀 Quick Recovery Commands

### Reset Everything

```bash
# Stop all services
docker compose down

# Remove all volumes (WARNING: This deletes all data)
docker compose down -v

# Pull fresh images
docker compose pull

# Start with working configuration
docker compose up -d
```

### Check Health

```bash
# Check all services
docker compose ps

# Test APIs
curl http://localhost:8001/health
curl http://localhost:8002/health

# Check Kafka topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list
```

### View Logs

```bash
# All logs
docker compose logs -f

# Specific service logs
docker compose logs -f kafka
docker compose logs -f control-center
docker compose logs -f producer-server
docker compose logs -f consumer-server
```

## 🔍 Diagnostic Commands

### Check Docker Resources

```bash
# Check Docker disk usage
docker system df

# Check container resource usage
docker stats

# Check Docker networks
docker network ls
docker network inspect kafka-playground-python_default
```

### Check Kafka Health

```bash
# Check Kafka broker status
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# Check consumer groups
docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list

# Check topic details
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --describe --topic test-topic
```

### Check Python Dependencies

```bash
# Check producer dependencies
docker exec kafka-producer-server pip list

# Check consumer dependencies
docker exec kafka-consumer-server pip list

# Test confluent-kafka import
docker exec kafka-producer-server python -c "import confluent_kafka; print('OK')"
```

## 📚 Additional Resources

### Official Documentation

- [Confluent Platform Documentation](https://docs.confluent.io/platform/current/installation/docker/config-reference.html)
- [Confluent Docker Images](https://hub.docker.com/r/confluentinc/cp-kafka)
- [Kafka Docker Quickstart](https://docs.confluent.io/platform/current/quickstart/ce-docker-quickstart.html)

### Community Resources

- [Confluent Community](https://community.confluent.io/)
- [Kafka Troubleshooting Guide](https://kafka.apache.org/documentation/#troubleshooting)
- [Docker Compose Best Practices](https://docs.docker.com/compose/best-practices/)

## 🆘 Getting Help

If you encounter issues not covered in this guide:

1. **Check the logs first:**

   ```bash
   docker compose logs -f
   ```

2. **Search existing issues:**

   - Check GitHub issues for similar problems
   - Search Confluent Community forums

3. **Create a minimal reproduction:**

   - Isolate the problem to the smallest possible setup
   - Document exact steps to reproduce

4. **Include relevant information:**
   - Docker version: `docker --version`
   - Docker Compose version: `docker compose version`
   - OS and architecture: `uname -a`
   - Complete error logs
   - Working configuration that broke

## 📝 Version Compatibility Matrix

| Component       | Working Version | Notes                                       |
| --------------- | --------------- | ------------------------------------------- |
| Zookeeper       | 7.2.15          | Stable, no CLUSTER_ID required              |
| Kafka           | 7.2.15          | Stable, no CLUSTER_ID required              |
| Control Center  | 7.2.15          | Enterprise version for better compatibility |
| Python          | 3.11            | Compatible with confluent-kafka 2.3.0       |
| confluent-kafka | 2.3.0           | Latest stable Python client                 |

## 🎯 Success Indicators

When everything is working correctly, you should see:

✅ **All containers running:**

```bash
docker compose ps
# All services show "Up" status
```

✅ **Kafka logs show coordination:**

```bash
docker compose logs kafka
# Shows consumer group coordination logs
```

✅ **APIs respond:**

```bash
curl http://localhost:8001/health
# Returns: {"status": "healthy", "kafka_connected": true}

curl http://localhost:8002/health
# Returns: {"status": "healthy", "kafka_connected": true}
```

✅ **Control Center accessible:**

- http://localhost:9021 loads successfully
- Can view topics and consumer groups

✅ **Message flow working:**

- Producer can send messages
- Consumer can receive messages
- Messages appear in Control Center

---

**Remember:** The key to success is using compatible versions (7.2.15) and ensuring all services can communicate properly through the Docker network.
