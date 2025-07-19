#!/usr/bin/env python3
"""
Kafka Consumer API Server
FastAPI server that provides HTTP endpoints for consuming messages from Kafka
and a WebSocket endpoint for real-time chat.
"""

import os
import time
import json
import logging
import asyncio
import contextlib
from datetime import datetime
from typing import Dict, Any, List, Optional, Set

import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from confluent_kafka import Consumer, KafkaError

# ─── Logging ───────────────────────────────────────────────────────────────────
logger = logging.getLogger("uvicorn.error")

# ─── Pydantic models ───────────────────────────────────────────────────────────
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

# ─── Kafka setup ────────────────────────────────────────────────────────────────
def create_consumer(group_id: str) -> Consumer:
    return Consumer({
        'bootstrap.servers': os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092'),
        'group.id': group_id,
        'auto.offset.reset': 'earliest',
        'enable.auto.commit': True,
        'session.timeout.ms': 6000,
        'heartbeat.interval.ms': 2000,
    })

# A dedicated consumer just for health checks
health_consumer = create_consumer("health-check-group")

def check_kafka_connection() -> bool:
    try:
        health_consumer.list_topics(timeout=5)
        return True
    except Exception as e:
        logger.error(f"Kafka health check failed: {e}")
        return False

# ─── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Kafka Consumer API",
    description="HTTP API for consuming messages from Kafka topics + WebSocket chat",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # tighten for prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="consumers/templates")

# ─── WebSocket manager ────────────────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.lock = asyncio.Lock()
        self.consumer: Optional[Consumer] = None
        self.is_consuming = False
        self.keepalive_tasks: Dict[WebSocket, asyncio.Task] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        async with self.lock:
            self.active_connections.add(websocket)
        # start a keepalive "ping"
        task = asyncio.create_task(self._keepalive(websocket))
        self.keepalive_tasks[websocket] = task
        logger.info(f"Client connected ({len(self.active_connections)} total)")

    async def _keepalive(self, websocket: WebSocket):
        """Send an application‐level heartbeat every 15 s so the WS stays open."""
        try:
            while True:
                await asyncio.sleep(15)
                await websocket.send_text(json.dumps({"type": "heartbeat"}))
        except Exception:
            # if send fails, assume disconnected
            await self.disconnect(websocket)

    async def disconnect(self, websocket: WebSocket):
        """Remove client and cancel its keepalive task."""
        async with self.lock:
            self.active_connections.discard(websocket)
        task = self.keepalive_tasks.pop(websocket, None)
        if task:
            task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await task
        logger.info(f"Client disconnected ({len(self.active_connections)} total)")

    async def broadcast(self, message: str):
        """Send a JSON‐string message to all active connections."""
        async with self.lock:
            conns = list(self.active_connections)
        for conn in conns:
            try:
                await conn.send_text(message)
            except Exception:
                await self.disconnect(conn)

    async def start_kafka_consumption(self):
        """Background task: poll Kafka and broadcast chat_message events."""
        if self.is_consuming or not self.consumer:
            return
        self.is_consuming = True
        self.consumer.subscribe(['anonymous-anime-universe'])
        loop = asyncio.get_event_loop()
        logger.info("🔄 Starting background Kafka consumption for WS clients…")

        while self.is_consuming:
            # offload the blocking .poll() into a thread
            msg = await loop.run_in_executor(None, self.consumer.poll, 1.0)
            if not msg:
                continue
            if msg.error():
                if msg.error().code() != KafkaError._PARTITION_EOF:
                    logger.error(f"Kafka error: {msg.error()}")
                continue

            try:
                payload = json.loads(msg.value().decode('utf-8'))
            except json.JSONDecodeError:
                continue

            if payload.get("type") == "chat_message":
                payload["active_connections"] = len(self.active_connections)
                text = json.dumps(payload)
                await self.broadcast(text)
                logger.info(
                    f"📡 Broadcasted: {payload.get('username')}: {payload.get('text')} "
                    f"({len(self.active_connections)} conns)"
                )

    def set_consumer(self, consumer: Consumer):
        self.consumer = consumer

manager = ConnectionManager()

# ─── Startup / Shutdown ──────────────────────────────────────────────────────
@app.on_event("startup")
async def on_startup():
    # set up the background consumer
    manager.set_consumer(create_consumer("ws-chat-group"))
    asyncio.create_task(manager.start_kafka_consumption())
    logger.info("✅ Background Kafka WS consumer started")

@app.on_event("shutdown")
async def on_shutdown():
    health_consumer.close()
    if manager.consumer:
        manager.consumer.close()
    logger.info("🔚 Kafka consumers closed")

# ─── HTTP endpoints ───────────────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("consumer.html", {"request": request})

@app.get("/api")
async def api_info():
    return {
        "message": "Kafka Consumer API Server",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "consume": "/consume",
            "topics": "/topics",
            "messages": "/messages/{topic}",
            "chat": "/chat/messages",
            "ws": "/ws/chat",
            "docs": "/docs"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    ok = check_kafka_connection()
    return HealthResponse(
        status="healthy" if ok else "unhealthy",
        timestamp=datetime.utcnow().isoformat(),
        kafka_connected=ok
    )

@app.post("/consume", response_model=ConsumeResponse)
async def consume_messages(req: ConsumeRequest):
    consumer = create_consumer(req.group_id)
    consumer.subscribe([req.topic])

    msgs: List[MessageInfo] = []
    for _ in range(req.max_messages):
        msg = consumer.poll(req.timeout)
        if msg is None or msg.error():
            if msg and msg.error().code() != KafkaError._PARTITION_EOF:
                raise HTTPException(500, f"Kafka error: {msg.error()}")
            break
        try:
            data = json.loads(msg.value().decode())
            msgs.append(MessageInfo(
                topic=msg.topic(),
                partition=msg.partition(),
                offset=msg.offset(),
                key=msg.key().decode() if msg.key() else None,
                value=data,
                timestamp=datetime.utcnow().isoformat()
            ))
        except Exception:
            continue

    consumer.close()
    return ConsumeResponse(
        success=True,
        messages=msgs,
        count=len(msgs),
        topic=req.topic,
        group_id=req.group_id
    )

@app.get("/topics", response_model=List[TopicInfo])
async def list_topics():
    try:
        md = health_consumer.list_topics(timeout=5)
        out = []
        for name, meta in md.topics.items():
            if name.startswith("__"):
                continue
            out.append(TopicInfo(topic=name, partitions=len(meta.partitions), group_id="—"))
        return out
    except Exception as e:
        raise HTTPException(500, f"Failed to list topics: {e}")

@app.post("/chat/messages")
async def get_chat_messages(req: ChatMessageRequest):
    consumer = create_consumer(req.group_id)
    consumer.subscribe([req.topic])
    out: List[MessageInfo] = []

    for _ in range(50):
        msg = consumer.poll(1.0)
        if msg is None or msg.error():
            break
        try:
            payload = json.loads(msg.value().decode())
            if payload.get("type") == "chat_message":
                out.append(MessageInfo(
                    topic=msg.topic(),
                    partition=msg.partition(),
                    offset=msg.offset(),
                    key=msg.key().decode() if msg.key() else None,
                    value=payload,
                    timestamp=datetime.utcnow().isoformat()
                ))
        except Exception:
            continue

    consumer.close()
    return {"success": True, "messages": out, "count": len(out), "topic": req.topic}

# ─── WebSocket endpoint ───────────────────────────────────────────────────────
@app.websocket("/ws/chat")
async def ws_chat(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Block here until client disconnects; receive_text() will raise on close
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(websocket)

# ─── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "consumer_server:app",
        host="0.0.0.0",
        port=8002,
        reload=False,   # turn off in prod
        log_level="info"
    )
