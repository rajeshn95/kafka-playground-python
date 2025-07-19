"use client";

import { useState, useEffect, useRef } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { generateUsername } from "@/lib/username-generator";
import {
  MessageCircle,
  Users,
  Zap,
  Sparkles,
  Globe,
  Shield,
  Heart,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const [isConnected, setIsConnected] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(username || "");
  const [isLoading, setIsLoading] = useState(false); // Changed to false to show welcome screen
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Generate username on component mount
  useEffect(() => {
    if (!currentUsername) {
      const newUsername = generateUsername();
      setCurrentUsername(newUsername);
    }
  }, [currentUsername]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Poll for new messages from Kafka consumer API (only if backend is available)
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

            setIsConnected(true);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Error polling messages:", error);
        setIsConnected(false);
      }
    };

    // Only start polling if we want to connect to backend
    // For now, let's show the welcome screen
    // const interval = setInterval(pollMessages, 2000);
    // return () => clearInterval(interval);
  }, [currentUsername]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // For demo purposes, add message locally
    const newMessage: Message = {
      id: `local-${Date.now()}`,
      text,
      username: currentUsername,
      timestamp: new Date().toISOString(),
      isOwn: true,
    };
    setMessages((prev) => [...prev, newMessage]);

    // Try to send to backend if available
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
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Message was already added locally, so user can still see it
    }
  };

  return (
    <Card className="h-[800px] flex flex-col shadow-2xl overflow-hidden border">
      {/* Header */}
      <ChatHeader
        roomName={roomName}
        onlineUsers={onlineUsers}
        totalMessages={messages.length}
        isConnected={isConnected}
      />

      {/* Messages Area */}
      <div
        ref={scrollAreaRef}
        className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-gradient-to-b from-background to-muted/20"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                <div
                  className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-secondary rounded-full animate-spin mx-auto"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "1.5s",
                  }}
                ></div>
              </div>
              <p className="text-foreground font-medium">
                Connecting to anonymous chat...
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Establishing secure connection
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-slow">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-4">
              Welcome to Anonymous Chat! 🎉
            </h3>

            <Card className="p-6 mb-6 max-w-md">
              <p className="text-foreground leading-relaxed mb-4">
                You&apos;re chatting as{" "}
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                  {currentUsername}
                </span>
              </p>
              <p className="text-muted-foreground text-sm">
                Start the conversation by sending your first message! Your
                identity is completely anonymous.
              </p>
            </Card>

            <div className="grid grid-cols-3 gap-6 text-sm">
              <Card className="p-4 text-center">
                <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-foreground font-semibold">
                  {onlineUsers}
                </div>
                <div className="text-muted-foreground text-xs">Online</div>
              </Card>
              <Card className="p-4 text-center">
                <MessageCircle className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <div className="text-foreground font-semibold">
                  {messages.length}
                </div>
                <div className="text-muted-foreground text-xs">Messages</div>
              </Card>
              <Card className="p-4 text-center">
                <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-foreground font-semibold">Real-time</div>
                <div className="text-muted-foreground text-xs">Live</div>
              </Card>
            </div>

            <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <Shield className="w-3 h-3" />
                100% Anonymous
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Globe className="w-3 h-3" />
                Global
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Heart className="w-3 h-3" />
                Secure
              </Badge>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={sendMessage}
        disabled={false} // Allow sending messages even without backend
        placeholder="Type your anonymous message..."
        username={currentUsername}
      />
    </Card>
  );
}
