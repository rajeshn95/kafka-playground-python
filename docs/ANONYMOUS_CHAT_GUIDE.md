# Anonymous Chat Application Guide

## 🎯 Overview

The Anonymous Chat application is a real-time messaging platform built with Next.js, TypeScript, and shadcn/ui, powered by Apache Kafka for message streaming. It demonstrates how to build a modern, scalable chat application using event-driven architecture with WebSocket connections for real-time communication.

## 🚀 Features

### Core Features

- **Real-time Messaging**: Instant message delivery using Kafka streams and WebSocket connections
- **Anonymous Users**: Chat without revealing your identity with auto-generated usernames
- **Modern UI**: Beautiful interface built with shadcn/ui components
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Auto-scroll**: Messages automatically scroll to the latest
- **User Avatars**: Colorful avatars with user initials and mood indicators
- **Message Timestamps**: Real-time message timestamps
- **Online Users**: Display number of online users
- **Connection Status**: Real-time connection status indicators

### Technical Features

- **TypeScript**: Full type safety
- **Next.js 14**: App router with server-side rendering
- **shadcn/ui**: Modern, accessible UI components
- **Tailwind CSS**: Utility-first styling
- **Docker**: Containerized deployment
- **Kafka Integration**: Real-time message streaming
- **WebSocket**: Real-time bidirectional communication
- **CORS Support**: Cross-origin resource sharing enabled

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    HTTP POST    ┌─────────────────┐
│   Frontend      │ ──────────────► │  Producer API   │
│  (Next.js)      │                 │   (FastAPI)     │
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
                    └─────────────────┘
```

### Frontend Architecture

```
anonymous-chat/
├── app/
│   ├── page.tsx              # Main page component
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── chat/                 # Chat-specific components
│       ├── ChatContainer.tsx # Main chat container
│       ├── ChatHeader.tsx    # Chat header with stats
│       ├── ChatInput.tsx     # Message input component
│       └── ChatMessage.tsx   # Individual message component
└── lib/
    ├── simple-chat-service.ts # WebSocket chat service
    └── username-generator.ts  # Username generation utility
```

### Component Hierarchy

```
Page
└── ChatContainer
    ├── ChatHeader
    ├── ScrollArea (Messages)
    │   └── ChatMessage[]
    └── ChatInput
```

### Data Flow

1. **User Input**: User types message in ChatInput
2. **Message Send**: Message sent to Producer API via HTTP POST
3. **Kafka Storage**: Message stored in `anonymous-anime-universe` topic
4. **Real-time Delivery**: Consumer API broadcasts messages via WebSocket
5. **UI Update**: Messages displayed in real-time in frontend

## 🛠️ Technology Stack

### Frontend

- **Next.js 14**: React framework with app router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **Lucide React**: Beautiful icons

### Backend Integration

- **Kafka Producer API**: Message production (port 8001)
- **Kafka Consumer API**: Message consumption and WebSocket (port 8002)
- **Apache Kafka**: Message streaming platform
- **FastAPI**: Modern Python web framework
- **WebSocket**: Real-time bidirectional communication

### Deployment

- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Node.js 18**: Runtime environment

## 📦 Installation & Setup

### Prerequisites

- Docker and Docker Compose
- Kafka Playground running (see main README)

### Quick Start

```bash
# Start all services including anonymous chat
docker compose up -d

# Access the application
open http://localhost:3000
```

### Development Setup

```bash
# Navigate to anonymous chat directory
cd anonymous-chat

# Install dependencies
npm install

# Start development server
npm run dev

# Access development server
open http://localhost:3000
```

### Production Build

```bash
# Build Docker image
docker compose build anonymous-chat

# Run in production
docker compose up -d anonymous-chat
```

## 🎨 UI Components

### ChatContainer

The main orchestrator component that:

- Manages WebSocket connection lifecycle
- Handles message state and real-time updates
- Provides connection status management
- Manages user sessions and username generation

**Key Features:**

- WebSocket connection management with auto-reconnect
- Real-time message updates via WebSocket
- Connection status indicators
- Optimistic UI updates
- Component lifecycle management

### ChatHeader

Displays chat room information:

- Room name and description
- Online user count
- Total message count
- Real-time connection status
- Visual connection indicators

### ChatMessage

Renders individual messages with:

- User avatar with colored initials
- Message content with proper formatting
- Timestamp display
- Own vs other user styling
- Mood indicators (happy, excited, cool, mysterious)
- Responsive layout

### ChatInput

Handles message composition:

- Multi-line textarea
- Send button with icon
- Enter key support (Shift+Enter for new line)
- Disabled state when disconnected
- Auto-resize functionality
- Character count display

## 🔄 Message Flow

### Message Production

1. User types message in ChatInput
2. Message data structured:
   ```json
   {
     "username": "Anonymous_abc123",
     "text": "Hello world!",
     "room": "anonymous-anime-universe"
   }
   ```
3. Data sent to producer API via HTTP POST
4. Message stored in Kafka topic `anonymous-anime-universe`

### Message Consumption & Broadcasting

1. Consumer API continuously polls Kafka for new messages
2. Messages retrieved from Kafka topic
3. Messages broadcasted to all connected WebSocket clients
4. Frontend receives messages via WebSocket
5. UI updated with new messages in real-time

### Real-time Updates

- **WebSocket Connection**: Persistent bidirectional connection
- **Auto-reconnect**: Automatic reconnection on connection loss
- **Message Broadcasting**: Real-time message delivery to all clients
- **Connection Status**: Real-time connection status updates
- **Optimistic Updates**: Local message display before confirmation

## 🔧 Configuration

### Environment Variables

```bash
# Frontend Configuration
NEXT_PUBLIC_PRODUCER_URL=http://localhost:8001
NEXT_PUBLIC_CONSUMER_URL=http://localhost:8002
NEXT_PUBLIC_TOPIC_NAME=anonymous-anime-universe

# Backend Configuration
KAFKA_BOOTSTRAP_SERVERS=kafka:29092
```

### Kafka Topic Configuration

- **Topic Name**: `anonymous-anime-universe`
- **Partitions**: 1 (default)
- **Replication Factor**: 1 (development)
- **Retention**: Default Kafka retention

### API Endpoints

#### Producer API

```http
POST /chat/send
Content-Type: application/json

{
  "username": "Anonymous_abc123",
  "text": "Hello world!",
  "room": "anonymous-anime-universe"
}
```

#### Consumer API

```http
# WebSocket endpoint for real-time messages
WS /ws/chat

# Health check
GET /health

# Consume messages (for debugging)
POST /consume
```

## 🔒 Security & Best Practices

### Frontend Security

- No sensitive data in messages
- Username generation without personal info
- XSS protection via React
- Content sanitization

### API Security

- CORS configuration for development
- Input validation via Pydantic models
- Error handling and logging
- Rate limiting considerations

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations

- Touch-friendly interface
- Optimized input areas
- Responsive message layout
- Mobile-first design

### Desktop Features

- Full-featured experience
- Keyboard shortcuts
- Hover effects
- Larger chat area

## 🎯 Use Cases

### Learning Kafka

- Real-time message streaming
- Producer-consumer patterns
- Topic management
- Message persistence
- Event-driven architecture

### Development Practice

- Modern React patterns
- TypeScript best practices
- Component architecture
- API integration
- State management
- WebSocket implementation

### Demonstrations

- Real-time applications
- Kafka capabilities
- Modern web development
- Docker deployment
- Microservices communication

## 🚀 Performance

### Optimizations

- **Next.js Standalone**: Optimized production build
- **Code Splitting**: Automatic code splitting
- **Image Optimization**: Next.js image optimization
- **Caching**: Built-in caching strategies
- **Bundle Analysis**: Webpack bundle analysis

### Monitoring

- **Build Performance**: Build time optimization
- **Runtime Performance**: React performance monitoring
- **Network Performance**: API response times
- **User Experience**: Loading states and feedback

## 🔧 Troubleshooting

### Common Issues

#### Build Errors

```bash
# TypeScript errors
npm run build

# Fix linting issues
npm run lint --fix

# Clear cache
rm -rf .next node_modules
npm install
```

#### Docker Issues

```bash
# Rebuild image
docker compose build --no-cache anonymous-chat

# Check logs
docker compose logs anonymous-chat

# Restart service
docker compose restart anonymous-chat
```

#### API Connection Issues

```bash
# Check producer API
curl http://localhost:8001/health

# Check consumer API
curl http://localhost:8002/health

# Check Kafka connection
docker compose logs kafka
```

#### WebSocket Issues

```bash
# Check WebSocket connection
# Open browser dev tools and look for WebSocket in Network tab

# Check consumer logs for WebSocket activity
docker compose logs consumer-server | grep -E "(WebSocket|connection)"
```

### Debugging

#### Frontend Debugging

1. Open browser developer tools
2. Check Console for error messages
3. Check Network tab for WebSocket connections
4. Verify environment variables are set correctly

#### Backend Debugging

1. Check service logs:

   ```bash
   docker compose logs producer-server
   docker compose logs consumer-server
   ```

2. Test API endpoints:

   ```bash
   curl http://localhost:8001/health
   curl http://localhost:8002/health
   ```

3. Check Kafka topics:
   ```bash
   # Access Kafka Control Center
   open http://localhost:9021
   ```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [WebSocket API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
