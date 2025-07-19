# Kafka Playground with Python

A comprehensive learning environment for Apache Kafka using Python and Confluent Kafka client. This playground includes Docker setup with separate producer and consumer services, monitoring tools, and a real-time Anonymous Chat application.

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
3. Start a **Producer Server** (HTTP API for producing messages)
4. Start a **Consumer Server** (HTTP API + WebSocket for consuming messages)
5. Start an **Anonymous Chat Application** (real-time chat with Kafka)

## 📊 Services

| Service                  | Port | Description                       |
| ------------------------ | ---- | --------------------------------- |
| Kafka Broker             | 9092 | Main Kafka broker                 |
| Zookeeper                | 2181 | Kafka coordination service        |
| Confluent Control Center | 9021 | Web UI for monitoring             |
| JMX                      | 9101 | Metrics and monitoring            |
| Producer Server          | 8001 | HTTP API for producing messages   |
| Consumer Server          | 8002 | HTTP API + WebSocket for messages |
| Anonymous Chat App       | 3000 | Real-time chat application        |

## 🏗️ Architecture

```
┌─────────────────┐    HTTP POST    ┌─────────────────┐
│ Anonymous Chat  │ ──────────────► │  Producer API   │
│  (Next.js)      │                 │   (FastAPI)     │
│  Port: 3000     │                 │   Port: 8001    │
│                 │                 │                 │
│  WebSocket      │ ◄────────────── │  Consumer API   │
│  Connection     │   Real-time     │   (FastAPI)     │
└─────────────────┘    Messages     └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Apache Kafka  │
                    │   (Message      │
                    │    Broker)      │
                    │  Port: 9092     │
                    └─────────────────┘
                              │
                    ┌─────────────────┐
                    │    Zookeeper    │
                    │   Port: 2181    │
                    └─────────────────┘
```

## 📁 Project Structure

```
kafka-playground-python/
├── docker-compose.yml          # All services configuration
├── run.sh                      # One-command runner
├── README.md                   # This file
├── docs/                       # 📚 Detailed documentation
│   ├── ANONYMOUS_CHAT_GUIDE.md
│   ├── PRODUCER_SERVER_GUIDE.md
│   ├── CONSUMER_SERVER_GUIDE.md
│   ├── WEB_INTERFACES_GUIDE.md
│   └── TROUBLESHOOTING_GUIDE.md
├── producers/                  # Producer applications
│   ├── Dockerfile             # Producer-specific container
│   ├── requirements.txt       # Producer dependencies
│   ├── producer_server.py     # HTTP API producer server
│   └── templates/             # Web interface templates
├── consumers/                  # Consumer applications
│   ├── Dockerfile             # Consumer-specific container
│   ├── requirements.txt       # Consumer dependencies
│   ├── consumer_server.py     # HTTP API + WebSocket consumer
│   └── templates/             # Web interface templates
└── anonymous-chat/            # Real-time chat application
    ├── Dockerfile             # Next.js container
    ├── package.json           # Frontend dependencies
    ├── app/                   # Next.js app directory
    ├── components/            # React components
    └── lib/                   # Utility libraries
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

- **Real-time message production** via HTTP API
- **Real-time message consumption** via WebSocket
- **Live data flow** in Confluent Control Center
- **Real-time chat** with multiple users

### 3. HTTP API Access

Both producer and consumer services expose HTTP APIs:

- **Producer API**: `http://localhost:8001` - Send messages via HTTP
- **Consumer API**: `http://localhost:8002` - Retrieve messages via HTTP
- **API Documentation**: Available at `/docs` endpoints

### 4. Real-time Chat Application

- **Anonymous Chat**: `http://localhost:3000` - Real-time chat with Kafka
- **WebSocket Connection**: Real-time message delivery
- **Modern UI**: Built with Next.js, TypeScript, and shadcn/ui

### 5. Advanced Topics

- **Topic Management**: Use Confluent Control Center web UI
- **Monitoring**: Real-time monitoring via Control Center
- **Error Handling**: Handle failures gracefully
- **Performance Tuning**: Optimize for throughput/latency
- **WebSocket Integration**: Real-time bidirectional communication

## 🔧 Usage

### Start Everything

```bash
./run.sh
```

### Access Applications

- **Anonymous Chat**: http://localhost:3000
- **Confluent Control Center**: http://localhost:9021
- **Producer API**: http://localhost:8001
- **Consumer API**: http://localhost:8002

### View Real-time Logs

```bash
# Producer server logs
docker-compose logs -f producer-server

# Consumer server logs
docker-compose logs -f consumer-server

# Anonymous chat logs
docker-compose logs -f anonymous-chat

# All logs
docker-compose logs -f
```

### Quick API Test

```bash
# Test producer health
curl http://localhost:8001/health

# Test consumer health
curl http://localhost:8002/health

# Send a chat message
curl -X POST http://localhost:8001/chat/send \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "text": "Hello World", "room": "anonymous-anime-universe"}'

# Consume messages
curl -X POST http://localhost:8002/consume \
  -H "Content-Type: application/json" \
  -d '{"topic": "anonymous-anime-universe", "max_messages": 5}'
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

### Real-time Chat

Access the chat application at http://localhost:3000 to:

- Chat anonymously with auto-generated usernames
- See real-time message delivery
- Experience WebSocket-based communication
- Monitor connection status

### Real-time Logs

Watch the data flow in real-time:

```bash
# Terminal 1: Watch producer
docker-compose logs -f producer-server

# Terminal 2: Watch consumer
docker-compose logs -f consumer-server

# Terminal 3: Watch chat app
docker-compose logs -f anonymous-chat
```

## 📚 Documentation

For detailed documentation, see the `docs/` folder:

- **[Anonymous Chat Guide](docs/ANONYMOUS_CHAT_GUIDE.md)** - Complete guide to the real-time chat application
- **[Producer Server Guide](docs/PRODUCER_SERVER_GUIDE.md)** - Complete API reference, examples, and best practices
- **[Consumer Server Guide](docs/CONSUMER_SERVER_GUIDE.md)** - Complete API reference, examples, and best practices
- **[Web Interfaces Guide](docs/WEB_INTERFACES_GUIDE.md)** - Guide to web interfaces and monitoring
- **[Troubleshooting Guide](docs/TROUBLESHOOTING_GUIDE.md)** - Common issues and solutions

## 🐛 Troubleshooting

### Quick Health Check

```bash
# Check if all services are running
docker compose ps

# Check service health
curl http://localhost:8001/health  # Producer API
curl http://localhost:8002/health  # Consumer API

# Check Kafka Control Center
open http://localhost:9021
```

### Common Issues

1. **Port Already in Use**

   - Check if ports 3000, 8001, 8002, 9092, 9021 are available
   - Stop conflicting services

2. **Services Not Starting**

   - Check Docker logs: `docker-compose logs`
   - Ensure Docker has enough resources

3. **WebSocket Connection Issues**

   - Check CORS configuration
   - Verify environment variables
   - Check consumer server logs

4. **React Errors**
   - Clear browser cache
   - Check browser console for errors
   - Restart the chat application

For detailed troubleshooting, see the **[Troubleshooting Guide](docs/TROUBLESHOOTING_GUIDE.md)**.

## 🎯 Use Cases

### Learning Kafka

- Understand producer-consumer patterns
- Learn topic management
- Experience real-time data streaming

### Web Development

- Modern React patterns with TypeScript
- WebSocket integration
- Real-time application development

### System Architecture

- Microservices communication
- Event-driven architecture
- Message queuing patterns

### DevOps

- Docker containerization
- Service orchestration
- Monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Enjoy exploring Kafka with real-time chat!** 🎉
