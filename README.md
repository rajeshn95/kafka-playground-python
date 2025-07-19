# Kafka Playground with Python

A comprehensive learning environment for Apache Kafka using Python and Confluent Kafka client. This playground includes Docker setup with separate producer and consumer services, and monitoring tools.

## 🚀 Quick Start (One Command)

### Prerequisites

- Docker and Docker Compose

### Run Everything with One Command

```bash
./run.sh
```

This will:

1. Build separate Python Docker images for producer and consumer
2. Start Kafka, Zookeeper, and Confluent Control Center
3. Start a **Producer Server** (continuously produces messages every 2 seconds)
4. Start a **Consumer Server** (continuously consumes messages)

## 📊 Services

| Service                  | Port | Description                     |
| ------------------------ | ---- | ------------------------------- |
| Kafka Broker             | 9092 | Main Kafka broker               |
| Zookeeper                | 2181 | Kafka coordination service      |
| Confluent Control Center | 9021 | Web UI for monitoring           |
| JMX                      | 9101 | Metrics and monitoring          |
| Producer Server          | 8001 | HTTP API for producing messages |
| Consumer Server          | 8002 | HTTP API for consuming messages |

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│ Producer Server │    │ Consumer Server │
│   Port: 8001    │    │   Port: 8002    │
│   (HTTP API)    │    │   (HTTP API)    │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Kafka Broker         │
                    │     (localhost:9092)      │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      Zookeeper           │
                    │     (localhost:2181)      │
                    └───────────────────────────┘
```

## 📁 Project Structure

```
kafka-playground-python/
├── docker-compose.yml          # All services configuration
├── run.sh                      # One-command runner
├── README.md                   # This file
├── docs/                       # 📚 Detailed documentation
│   ├── PRODUCER_SERVER_GUIDE.md
│   └── CONSUMER_SERVER_GUIDE.md
├── producers/                  # Producer applications
│   ├── Dockerfile             # Producer-specific container
│   ├── requirements.txt       # Producer dependencies
│   └── producer_server.py     # Continuous producer server
└── consumers/                  # Consumer applications
    ├── Dockerfile             # Consumer-specific container
    ├── requirements.txt       # Consumer dependencies
    └── consumer_server.py     # Continuous consumer server
```

## 🎯 Learning Path

### 1. Basic Concepts

- **Topics**: Logical channels for messages
- **Partitions**: Parallel units within topics
- **Producers**: Applications that send messages
- **Consumers**: Applications that read messages
- **Consumer Groups**: Groups of consumers sharing work

### 2. Real-time Data Flow

With the producer and consumer servers running, you can see:

- **Real-time message production** every 2 seconds
- **Real-time message consumption** as messages arrive
- **Live data flow** in Confluent Control Center

### 3. HTTP API Access

Both producer and consumer services expose HTTP APIs:

- **Producer API**: `http://localhost:8001` - Send messages via HTTP
- **Consumer API**: `http://localhost:8002` - Retrieve messages via HTTP
- **API Documentation**: Available at `/docs` endpoints

### 4. Advanced Topics

- **Topic Management**: Use Confluent Control Center web UI
- **Monitoring**: Real-time monitoring via Control Center
- **Error Handling**: Handle failures gracefully
- **Performance Tuning**: Optimize for throughput/latency

## 🔧 Usage

### Start Everything

```bash
./run.sh
```

### View Real-time Logs

```bash
# Producer server logs
docker-compose logs -f producer-server

# Consumer server logs
docker-compose logs -f consumer-server

# All logs
docker-compose logs -f
```

### Access Services

- **Confluent Control Center**: http://localhost:9021
- **Producer API**: http://localhost:8001
- **Consumer API**: http://localhost:8002
- **Kafka Broker**: localhost:9092
- **Zookeeper**: localhost:2181

### Quick API Test

```bash
# Test producer health
curl http://localhost:8001/health

# Test consumer health
curl http://localhost:8002/health

# Send a test message
curl -X POST http://localhost:8001/produce \
  -H "Content-Type: application/json" \
  -d '{"topic": "test-topic", "message": {"text": "Hello World"}}'

# Consume messages
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "test-topic", "max_messages": 5}'
```

### Stop Everything

```bash
docker-compose down
```

## 📈 Monitoring

### Confluent Control Center

Access the web UI at http://localhost:9021 to:

- Monitor topics and partitions
- View consumer groups
- Analyze message flow in real-time
- Configure topics
- Manage topic settings

### Real-time Logs

Watch the data flow in real-time:

```bash
# Terminal 1: Watch producer
docker-compose logs -f producer-server

# Terminal 2: Watch consumer
docker-compose logs -f consumer-server
```

## 📚 Documentation

For detailed documentation, see the `docs/` folder:

- **[Producer Server Guide](docs/PRODUCER_SERVER_GUIDE.md)** - Complete API reference, examples, and best practices
- **[Consumer Server Guide](docs/CONSUMER_SERVER_GUIDE.md)** - Complete API reference, examples, and best practices

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Check what's using the ports
   lsof -i :9092
   lsof -i :9021
   lsof -i :8001
   lsof -i :8002

   # Stop conflicting services
   docker-compose down
   ```

2. **Container Build Issues**

   ```bash
   # Rebuild without cache
   docker-compose build --no-cache
   ```

3. **Services Not Starting**

   ```bash
   # Check service status
   docker-compose ps

   # Check logs
   docker-compose logs producer-server
   docker-compose logs consumer-server
   ```

### Useful Commands

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f kafka
docker-compose logs -f producer-server
docker-compose logs -f consumer-server

# Execute commands in containers
docker exec -it kafka-producer-server bash
docker exec -it kafka-consumer-server bash

# Check Kafka topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Restart specific services
docker-compose restart producer-server
docker-compose restart consumer-server

# Test HTTP APIs
curl http://localhost:8001/health
curl http://localhost:8002/health
```

## 📚 Additional Resources

### Documentation

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Confluent Kafka Python Client](https://github.com/confluentinc/confluent-kafka-python)
- [Confluent Platform Documentation](https://docs.confluent.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Deploy the Confluent Platform](https://docs.confluent.io/platform/current/tutorials/cp-demo/on-prem.html#cp-demo-on-prem-tutorial)

## 🤝 Contributing

Feel free to contribute by:

- Adding new examples
- Improving documentation
- Fixing bugs
- Adding new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review Docker logs: `docker-compose logs`
3. Test HTTP APIs: `curl http://localhost:8001/health`
4. Check the detailed guides in the `docs/` folder
5. Open an issue on GitHub
6. Check the [Confluent Community](https://community.confluent.io/)

---

Happy learning! 🎉
