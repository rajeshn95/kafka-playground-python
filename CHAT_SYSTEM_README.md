# Anonymous Anime Universe Chat System

A real-time anonymous chat system built with Kafka, WebSockets, and Next.js for the anime community! 🌸✨

## 🎯 Features

- **Real-time messaging** using Kafka and WebSockets
- **Anonymous chat** with auto-generated usernames
- **Beautiful anime-themed UI** with glassmorphism design
- **Kafka integration** for message persistence and scalability
- **WebSocket-based** real-time communication
- **Docker containerized** for easy deployment

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Chat Service  │    │     Kafka       │
│   (Next.js)     │◄──►│   (WebSocket)   │◄──►│   (Topic:       │
│   Port: 3000    │    │   Port: 8003    │    │   anonymous-    │
└─────────────────┘    └─────────────────┘    │   anime-        │
                                              │   universe)     │
                                              └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### 1. Start the Chat System

```bash
# Make the start script executable (if not already)
chmod +x start-chat.sh

# Start all services
./start-chat.sh
```

### 2. Access the Chat

Open your browser and navigate to: **http://localhost:3000**

## 📊 Service Endpoints

| Service                  | URL                   | Description            |
| ------------------------ | --------------------- | ---------------------- |
| **Chat App**             | http://localhost:3000 | Main chat interface    |
| **Chat Service**         | http://localhost:8003 | WebSocket chat service |
| **Kafka Control Center** | http://localhost:9021 | Kafka management UI    |
| **Producer Server**      | http://localhost:8001 | Kafka producer API     |
| **Consumer Server**      | http://localhost:8002 | Kafka consumer API     |

## 🔧 Development

### Project Structure

```
kafka-playground-python/
├── anonymous-chat/          # Next.js frontend
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   └── lib/                 # Utilities and services
├── chat-service/            # WebSocket chat service
│   ├── chat_service.py      # Main chat service
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile          # Chat service container
├── producers/               # Kafka producer server
├── consumers/               # Kafka consumer server
├── docker-compose.yml       # Service orchestration
└── start-chat.sh           # Startup script
```

### Local Development

#### Frontend (Next.js)

```bash
cd anonymous-chat
npm install
npm run dev
```

#### Chat Service (Python)

```bash
cd chat-service
pip install -r requirements.txt
python chat_service.py
```

### Environment Variables

The system uses these environment variables:

- `KAFKA_BOOTSTRAP_SERVERS`: Kafka broker addresses (default: localhost:9092)
- `NEXT_PUBLIC_CHAT_SERVICE_URL`: Chat service URL for frontend (default: http://localhost:8003)

## 🎨 Chat Features

### Username Generation

- Automatic generation of anime-themed usernames
- Unique usernames for each session

### Message Types

- **Chat Messages**: Regular text messages
- **System Messages**: Connection status, errors, etc.

### Real-time Features

- **Live messaging**: Instant message delivery
- **Connection status**: Visual indicators for connection state
- **Auto-reconnection**: Automatic reconnection on disconnection
- **Message persistence**: Messages stored in Kafka topic

## 🔍 Monitoring

### Kafka Control Center

Access http://localhost:9021 to:

- Monitor Kafka topics
- View message flow
- Check consumer groups
- Analyze message content

### Logs

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f chat-service
docker-compose logs -f anonymous-chat
```

## 🛠️ Troubleshooting

### Common Issues

1. **Chat service not connecting**

   - Check if Kafka is running: `docker-compose ps`
   - Verify chat service logs: `docker-compose logs chat-service`

2. **Messages not appearing**

   - Check WebSocket connection in browser console
   - Verify Kafka topic exists: `anonymous-anime-universe`

3. **Docker issues**
   - Ensure Docker is running
   - Try restarting: `docker-compose down && docker-compose up -d`

### Debug Commands

```bash
# Check service status
docker-compose ps

# View real-time logs
docker-compose logs -f

# Restart specific service
docker-compose restart chat-service

# Access Kafka container
docker exec -it kafka bash

# List Kafka topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092
```

## 📝 API Reference

### Chat Service Endpoints

#### WebSocket

- `ws://localhost:8003/ws/chat` - WebSocket connection for real-time chat

#### HTTP Endpoints

- `GET /` - Service status
- `GET /health` - Health check
- `POST /chat/send` - Send chat message

### Message Format

```json
{
  "username": "string",
  "text": "string",
  "room": "anonymous-anime-universe"
}
```

## 🎯 Kafka Topic

- **Topic Name**: `anonymous-anime-universe`
- **Partitions**: Auto-created
- **Replication**: 1 (single broker setup)
- **Message Format**: JSON with chat message data

## 🔒 Security Notes

- This is a development setup with minimal security
- For production, consider:
  - Authentication and authorization
  - HTTPS/WSS encryption
  - Input validation and sanitization
  - Rate limiting
  - Message encryption

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy chatting in the Anime Universe! 🌸✨**
