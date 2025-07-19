#!/usr/bin/env python3
"""
Kafka Producer API Server
FastAPI server that provides HTTP endpoints for producing messages to Kafka.
"""

import json
import os
import time
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from confluent_kafka import Producer
import uvicorn


# Pydantic models for request/response
class MessageRequest(BaseModel):
    topic: str = "test-topic"
    key: Optional[str] = None
    message: Dict[str, Any]
    partition: Optional[int] = None


class MessageResponse(BaseModel):
    success: bool
    message: str
    topic: str
    partition: int
    offset: int
    timestamp: str


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    kafka_connected: bool


# Global producer instance
producer: Optional[Producer] = None


def delivery_report(err, msg):
    """Delivery report callback for produced messages."""
    if err is not None:
        print(f'❌ Message delivery failed: {err}')
    else:
        print(f'✅ Message delivered to {msg.topic()} [{msg.partition()}] at offset {msg.offset()}')


def create_producer():
    """Create and return a Kafka producer."""
    bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
    
    config = {
        'bootstrap.servers': bootstrap_servers,
        'client.id': 'python-producer-api',
        'acks': 'all',
        'retries': 3,
        'batch.size': 16384,
        'linger.ms': 1,
    }
    return Producer(config)


def check_kafka_connection():
    """Check if Kafka is accessible."""
    try:
        if producer:
            # Try to get metadata to check connection
            metadata = producer.list_topics(timeout=5)
            return True
    except Exception as e:
        print(f"Kafka connection check failed: {e}")
    return False


# Create FastAPI app
app = FastAPI(
    title="Kafka Producer API",
    description="HTTP API for producing messages to Kafka topics",
    version="1.0.0"
)

# Templates for HTML pages
templates = Jinja2Templates(directory="producers/templates")


@app.on_event("startup")
async def startup_event():
    """Initialize the Kafka producer on startup."""
    global producer
    print("🚀 Starting Kafka Producer API Server...")
    producer = create_producer()
    print("✅ Producer initialized")


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up the Kafka producer on shutdown."""
    global producer
    if producer:
        producer.flush()
        print("🔚 Producer API Server shutdown")


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    """Serve the producer web interface."""
    return templates.TemplateResponse("producer.html", {"request": request})


@app.get("/api", response_model=Dict[str, str])
async def api_info():
    """API information endpoint."""
    return {
        "message": "Kafka Producer API Server",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "produce": "/produce",
            "produce in batch": "/produce/batch",
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


@app.post("/produce", response_model=MessageResponse)
async def produce_message(request: MessageRequest):
    """Produce a message to Kafka topic."""
    global producer
    
    if not producer:
        raise HTTPException(status_code=500, detail="Producer not initialized")
    
    try:
        # Add metadata to the message
        enhanced_message = {
            **request.message,
            "timestamp": datetime.now().isoformat(),
            "source": "python-producer-api",
            "server_time": time.time()
        }
        
        # Convert to JSON string
        message_str = json.dumps(enhanced_message)
        
        # Produce the message
        producer.produce(
            topic=request.topic,
            key=request.key.encode('utf-8') if request.key else None,
            value=message_str.encode('utf-8'),
            callback=delivery_report,
            partition=request.partition
        )
        
        # Flush to ensure message is sent
        producer.flush()
        
        # For demo purposes, we'll return a mock response
        # In a real implementation, you'd track the actual delivery
        return MessageResponse(
            success=True,
            message="Message sent successfully",
            topic=request.topic,
            partition=request.partition or 0,
            offset=0,  # Would be actual offset in real implementation
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to produce message: {str(e)}")


@app.post("/produce/batch")
async def produce_batch_messages(messages: list[MessageRequest]):
    """Produce multiple messages in batch."""
    global producer
    
    if not producer:
        raise HTTPException(status_code=500, detail="Producer not initialized")
    
    results = []
    
    try:
        for request in messages:
            enhanced_message = {
                **request.message,
                "timestamp": datetime.now().isoformat(),
                "source": "python-producer-api",
                "server_time": time.time()
            }
            
            message_str = json.dumps(enhanced_message)
            
            producer.produce(
                topic=request.topic,
                key=request.key.encode('utf-8') if request.key else None,
                value=message_str.encode('utf-8'),
                callback=delivery_report,
                partition=request.partition
            )
            
            results.append({
                "success": True,
                "topic": request.topic,
                "message": "Queued for delivery"
            })
        
        # Flush all messages
        producer.flush()
        
        return {
            "success": True,
            "messages_sent": len(results),
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to produce batch messages: {str(e)}")


@app.post("/produce-simple")
async def produce_simple_message(request: Request):
    """Simple endpoint for web form submissions."""
    global producer
    
    if not producer:
        raise HTTPException(status_code=500, detail="Producer not initialized")
    
    try:
        form_data = await request.form()
        topic = form_data.get("topic", "test-topic")
        key = form_data.get("key", "")
        message_text = form_data.get("message", "")
        
        # Create a structured message
        message = {
            "text": message_text,
            "timestamp": datetime.now().isoformat(),
            "source": "web-interface",
            "user_input": True
        }
        
        message_str = json.dumps(message)
        
        # Produce the message
        producer.produce(
            topic=topic,
            key=key.encode('utf-8') if key else None,
            value=message_str.encode('utf-8'),
            callback=delivery_report
        )
        
        # Flush to ensure message is sent
        producer.flush()
        
        return {"success": True, "message": "Message sent successfully!"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    uvicorn.run(
        "producer_server:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    ) 