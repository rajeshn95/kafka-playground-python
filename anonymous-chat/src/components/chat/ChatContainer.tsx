"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  isOwn: boolean;
}

interface ChatContainerProps {
  roomName?: string;
  username?: string;
}

export function ChatContainer({
  roomName = "Anonymous Chat",
  username,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers] = useState(1);
  const [isConnected] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Generate a random username if not provided
  const currentUsername =
    username || `Anonymous_${Math.random().toString(36).substr(2, 6)}`;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Poll for new messages from Kafka consumer API
  useEffect(() => {
    const pollMessages = async () => {
      try {
        const response = await fetch("http://localhost:8002/consume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: "anonymous-chat",
            max_messages: 50,
            timeout: 2.0,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.messages) {
            const newMessages = result.messages.map(
              (msg: {
                topic: string;
                partition: number;
                offset: number;
                value: {
                  text?: string;
                  message?: string;
                  username?: string;
                  timestamp?: string;
                };
                timestamp?: string;
              }) => ({
                id: `${msg.topic}-${msg.partition}-${msg.offset}`,
                text: msg.value.text || msg.value.message || "Unknown message",
                username: msg.value.username || "Anonymous",
                timestamp: msg.value.timestamp || msg.timestamp,
                isOwn: msg.value.username === currentUsername,
              })
            );

            setMessages((prev) => {
              const existingIds = new Set(prev.map((m: Message) => m.id));
              const uniqueNewMessages = newMessages.filter(
                (m: Message) => !existingIds.has(m.id)
              );
              return [...prev, ...uniqueNewMessages];
            });
          }
        }
      } catch (error) {
        console.error("Error polling messages:", error);
      }
    };

    const interval = setInterval(pollMessages, 2000);
    return () => clearInterval(interval);
  }, [currentUsername]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    try {
      const formData = new FormData();
      formData.append("topic", "anonymous-chat");
      formData.append("key", currentUsername);
      formData.append(
        "message",
        JSON.stringify({
          text,
          username: currentUsername,
          timestamp: new Date().toISOString(),
          room: roomName,
        })
      );

      const response = await fetch("http://localhost:8001/produce-simple", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Add message to local state immediately for better UX
        const newMessage: Message = {
          id: `local-${Date.now()}`,
          text,
          username: currentUsername,
          timestamp: new Date().toISOString(),
          isOwn: true,
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <ChatHeader
        roomName={roomName}
        onlineUsers={onlineUsers}
        totalMessages={messages.length}
      />

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
        </div>
      </ScrollArea>

      <ChatInput
        onSendMessage={sendMessage}
        disabled={!isConnected}
        placeholder="Type your message..."
      />
    </Card>
  );
}
