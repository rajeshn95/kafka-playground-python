#!/usr/bin/env python3
"""
Kafka Consumer API Server
FastAPI server that provides HTTP endpoints for consuming messages from Kafka.
"""

import json
import os
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from confluent_kafka import Consumer, KafkaError
import uvicorn
import asyncio
import json
from typing import Set


# Pydantic models for request/response
class ConsumeRequest(BaseModel):
    topic: str = "test-topic"
    group_id: str = "python-consumer-api-group"
    max_messages: int = 10
    timeout: float = 5.0


class ChatMessageRequest(BaseModel):
    topic: str = "anonymous-anime-universe"
    group_id: str = "chat-consumer-group"
    last_message_id: Optional[str] = None


class MessageInfo(BaseModel):
    topic: str
    partition: int
    offset: int
    key: Optional[str]
    value: Dict[str, Any]
    timestamp: str


class ConsumeResponse(BaseModel):
    success: bool
    messages: List[MessageInfo]
    count: int
    topic: str
    group_id: str


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    kafka_connected: bool


class TopicInfo(BaseModel):
    topic: str
    partitions: int
    group_id: str


# Global consumer instance
consumer: Optional[Consumer] = None


def create_consumer(group_id: str = 'python-consumer-api-group'):
    """Create and return a Kafka consumer."""
    bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
    
    config = {
        'bootstrap.servers': bootstrap_servers,
        'group.id': group_id,
        'auto.offset.reset': 'earliest',
        'enable.auto.commit': True,
        'auto.commit.interval.ms': 1000,
        'session.timeout.ms': 6000,
        'heartbeat.interval.ms': 2000,
    }
    return Consumer(config)


def check_kafka_connection():
    """Check if Kafka is accessible."""
    try:
        if consumer:
            # Try to get metadata to check connection
            metadata = consumer.list_topics(timeout=5)
            return True
    except Exception as e:
        print(f"Kafka connection check failed: {e}")
    return False


# Create FastAPI app
app = FastAPI(
    title="Kafka Consumer API",
    description="HTTP API for consuming messages from Kafka topics",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Templates for HTML pages
templates = Jinja2Templates(directory="consumers/templates")

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.consumer: Optional[Consumer] = None
        self.is_consuming = False

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"Client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        if self.active_connections:
            await asyncio.gather(
                *[connection.send_text(message) for connection in self.active_connections]
            )

    def set_consumer(self, consumer: Consumer):
        self.consumer = consumer

    async def start_kafka_consumption(self):
        """Start consuming messages from Kafka and broadcasting to WebSocket clients."""
        if not self.consumer or self.is_consuming:
            return
        
        self.is_consuming = True
        print("🔄 Starting Kafka message consumption for WebSocket clients...")
        
        # Subscribe to the chat topic
        self.consumer.subscribe(['anonymous-anime-universe'])
        
        while self.is_consuming and self.active_connections:
            try:
                msg = self.consumer.poll(1.0)
                
                if msg is None:
                    continue
                
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        continue
                    else:
                        print(f"❌ Kafka error: {msg.error()}")
                        continue
                
                # Process the message
                try:
                    message_str = msg.value().decode('utf-8')
                    message_data = json.loads(message_str)
                    
                    # Filter for chat messages
                    if message_data.get("type") == "chat_message":
                        # Broadcast to all connected WebSocket clients
                        await self.broadcast(message_str)
                        print(f"📡 Broadcasted message: {message_data['username']}: {message_data['text']}")
                
                except json.JSONDecodeError:
                    print(f"❌ Failed to decode JSON message: {msg.value()}")
                except Exception as e:
                    print(f"❌ Error processing message: {e}")
                    
            except Exception as e:
                print(f"❌ Error in Kafka consumption: {e}")
                await asyncio.sleep(1)

manager = ConnectionManager()


@app.on_event("startup")
async def startup_event():
    """Initialize the Kafka consumer on startup."""
    global consumer
    print("👂 Starting Kafka Consumer API Server...")
    consumer = create_consumer()
    print("✅ Consumer initialized")
    
    # Set consumer in connection manager
    manager.set_consumer(consumer)
    
    # Start Kafka consumption for WebSocket clients
    asyncio.create_task(manager.start_kafka_consumption())


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up the Kafka consumer on shutdown."""
    global consumer
    if consumer:
        consumer.close()
        print("🔚 Consumer API Server shutdown")


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """Serve the consumer web interface."""
    return templates.TemplateResponse("consumer.html", {"request": request})


@app.get("/api", response_model=Dict[str, str])
async def api_info():
    """API information endpoint."""
    return {
        "message": "Kafka Consumer API Server",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "consume": "/consume",
            "topics": "/topics",
            "messages": "/messages/{topic}",
            "docs": "/docs"
        }
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    kafka_connected = check_kafka_connection()
    return HealthResponse(
        status="healthy" if kafka_connected else "unhealthy",
        timestamp=datetime.now().isoformat(),
        kafka_connected=kafka_connected
    )


@app.post("/consume", response_model=ConsumeResponse)
async def consume_messages(request: ConsumeRequest):
    """Consume messages from Kafka topic."""
    global consumer
    
    if not consumer:
        raise HTTPException(status_code=500, detail="Consumer not initialized")
    
    try:
        # Subscribe to the topic
        consumer.subscribe([request.topic])
        
        messages = []
        message_count = 0
        
        # Poll for messages
        while message_count < request.max_messages:
            msg = consumer.poll(request.timeout)
            
            if msg is None:
                break
            
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    # End of partition event
                    break
                else:
                    raise HTTPException(status_code=500, detail=f"Kafka error: {msg.error()}")
            
            # Process the message
            try:
                # Decode the message
                message_str = msg.value().decode('utf-8')
                message_data = json.loads(message_str)
                
                message_info = MessageInfo(
                    topic=msg.topic(),
                    partition=msg.partition(),
                    offset=msg.offset(),
                    key=msg.key().decode('utf-8') if msg.key() else None,
                    value=message_data,
                    timestamp=datetime.now().isoformat()
                )
                
                messages.append(message_info)
                message_count += 1
                
            except json.JSONDecodeError:
                print(f"Failed to decode JSON message: {msg.value()}")
            except Exception as e:
                print(f"Error processing message: {e}")
        
        return ConsumeResponse(
            success=True,
            messages=messages,
            count=len(messages),
            topic=request.topic,
            group_id=request.group_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to consume messages: {str(e)}")


@app.get("/topics", response_model=List[TopicInfo])
async def list_topics():
    """List available topics."""
    global consumer
    
    if not consumer:
        raise HTTPException(status_code=500, detail="Consumer not initialized")
    
    try:
        metadata = consumer.list_topics(timeout=5)
        topics = []
        
        for topic_name, topic_metadata in metadata.topics.items():
            if not topic_name.startswith('__'):  # Skip internal topics
                topics.append(TopicInfo(
                    topic=topic_name,
                    partitions=len(topic_metadata.partitions),
                    group_id="python-consumer-api-group"
                ))
        
        return topics
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list topics: {str(e)}")


@app.post("/chat/messages")
async def get_chat_messages(request: ChatMessageRequest):
    """Get chat messages from the anonymous-anime-universe topic."""
    global consumer
    
    if not consumer:
        raise HTTPException(status_code=500, detail="Consumer not initialized")
    
    try:
        # Subscribe to the chat topic
        consumer.subscribe([request.topic])
        
        messages = []
        message_count = 0
        max_messages = 50  # Get more messages for chat
        
        # Poll for messages
        while message_count < max_messages:
            msg = consumer.poll(1.0)  # Short timeout for real-time feel
            
            if msg is None:
                break
            
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    break
                else:
                    raise HTTPException(status_code=500, detail=f"Kafka error: {msg.error()}")
            
            # Process the message
            try:
                # Decode the message
                message_str = msg.value().decode('utf-8')
                message_data = json.loads(message_str)
                
                # Filter for chat messages only
                if message_data.get("type") == "chat_message":
                    message_info = MessageInfo(
                        topic=msg.topic(),
                        partition=msg.partition(),
                        offset=msg.offset(),
                        key=msg.key().decode('utf-8') if msg.key() else None,
                        value=message_data,
                        timestamp=datetime.now().isoformat()
                    )
                    
                    messages.append(message_info)
                    message_count += 1
                
            except json.JSONDecodeError:
                print(f"Failed to decode JSON message: {msg.value()}")
            except Exception as e:
                print(f"Error processing message: {e}")
        
        return {
            "success": True,
            "messages": messages,
            "count": len(messages),
            "topic": request.topic
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chat messages: {str(e)}")


@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time chat messages."""
    await manager.connect(websocket)
    
    try:
        while True:
            # Keep the connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/messages/{topic}", response_model=List[MessageInfo])
async def get_messages_from_topic(topic: str, limit: int = 10):
    """Get recent messages from a specific topic."""
    global consumer
    
    if not consumer:
        raise HTTPException(status_code=500, detail="Consumer not initialized")
    
    try:
        # Create a temporary consumer for this request
        temp_consumer = create_consumer(f"temp-consumer-{int(time.time())}")
        temp_consumer.subscribe([topic])
        
        messages = []
        message_count = 0
        
        # Poll for messages
        while message_count < limit:
            msg = temp_consumer.poll(2.0)
            
            if msg is None:
                break
            
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    break
                else:
                    continue
            
            try:
                message_str = msg.value().decode('utf-8')
                message_data = json.loads(message_str)
                
                message_info = MessageInfo(
                    topic=msg.topic(),
                    partition=msg.partition(),
                    offset=msg.offset(),
                    key=msg.key().decode('utf-8') if msg.key() else None,
                    value=message_data,
                    timestamp=datetime.now().isoformat()
                )
                
                messages.append(message_info)
                message_count += 1
                
            except (json.JSONDecodeError, Exception):
                continue
        
        temp_consumer.close()
        return messages
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get messages: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(
        "consumer_server:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        log_level="info"
    ) 