"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { generateUsername } from "@/lib/username-generator";
import {
  getSimpleChatService,
  ChatMessage as ChatMessageType,
} from "@/lib/simple-chat-service";
import { Sparkles, Star, Heart } from "lucide-react";

interface Message {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  isOwn: boolean;
  mood?: "happy" | "excited" | "cool" | "mysterious";
}

interface ChatContainerProps {
  roomName?: string;
  username?: string;
}

export function ChatContainer({ roomName, username }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(username || "");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatServiceRef = useRef(getSimpleChatService());

  // Generate username on component mount
  useEffect(() => {
    if (!currentUsername) {
      const newUsername = generateUsername();
      setCurrentUsername(newUsername);
    }
  }, []); // Only run once on mount

  // Initialize chat service
  useEffect(() => {
    if (!currentUsername) return; // Don't connect until username is set

    const chatService = chatServiceRef.current;
    console.log("🔄 Setting up chat service for username:", currentUsername);

    // Track if component is mounted to prevent state updates on unmounted component
    let isMounted = true;

    // Configure chat service callbacks
    const config = {
      producerUrl: process.env.NEXT_PUBLIC_PRODUCER_URL || "",
      consumerUrl: process.env.NEXT_PUBLIC_CONSUMER_URL || "",
      onConnect: () => {
        if (!isMounted) return;
        console.log("✅ Connected to chat service");
        setIsConnected(true);
        setOnlineUsers((prev) => prev + 1);
      },
      onDisconnect: () => {
        if (!isMounted) return;
        console.log("🔌 Disconnected from chat service");
        setIsConnected(false);
        setOnlineUsers((prev) => Math.max(prev - 1, 0));
      },
      onMessage: (chatMessage: ChatMessageType) => {
        if (!isMounted) return;
        if (chatMessage.type !== "heartbeat") {
          console.log("📨 Received message:", chatMessage);
        }

        // Update online users count FIRST (before filtering own messages)
        if (chatMessage.active_connections !== undefined) {
          setOnlineUsers(chatMessage.active_connections);
        }

        // Filter out messages from the current user (they already see their own message)
        if (chatMessage.username === currentUsername) {
          console.log("🚫 Ignoring own message from WebSocket");
          return;
        }

        // Convert chat service message to local message format
        const message: Message = {
          id: chatMessage.id,
          text: chatMessage.text,
          username: chatMessage.username,
          timestamp: chatMessage.timestamp,
          isOwn: false, // This is always false since we filtered out own messages
          mood: getRandomMood(),
        };

        setMessages((prev) => [...prev, message]);
      },
      onError: (error: string) => {
        if (!isMounted) return;
        console.error("❌ Chat service error:", error);
        setIsConnected(false);
      },
    };

    // Set the config
    chatService.config = config;

    // Connect to chat service
    console.log("🔄 Attempting to connect to WebSocket...");
    chatService.connect().catch((error) => {
      if (!isMounted) return;
      console.error("❌ Failed to connect to chat service:", error);
      setIsConnected(false);
    });

    // Cleanup on unmount
    return () => {
      console.log("🔌 Cleaning up chat service connection");
      isMounted = false;
      chatService.disconnect();
    };
  }, [currentUsername]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getRandomMood = (): "happy" | "excited" | "cool" | "mysterious" => {
    const moods: Array<"happy" | "excited" | "cool" | "mysterious"> = [
      "happy",
      "excited",
      "cool",
      "mysterious",
    ];
    return moods[Math.floor(Math.random() * moods.length)];
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    console.log("🚀 Sending message:", {
      text,
      username: currentUsername,
      room: roomName,
    });

    // Send message through chat service
    const chatService = chatServiceRef.current;
    const success = await chatService.sendMessage(
      currentUsername,
      text,
      roomName
    );

    if (success) {
      console.log("✅ Message sent successfully");
      // Add message to local state immediately for optimistic UI
      const newMessage: Message = {
        id: `local-${Date.now()}`,
        text,
        username: currentUsername,
        timestamp: new Date().toISOString(),
        isOwn: true,
        mood: getRandomMood(),
      };
      setMessages((prev) => [...prev, newMessage]);
    } else {
      console.error("❌ Failed to send message");
      // You could show a toast notification here
    }
  };

  return (
    <div className="relative w-full">
      {/* Glassmorphism Container */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden h-[556px] md:h-[600px] lg:h-[620px] flex flex-col relative w-full">
        {/* Animated Border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl blur opacity-20 animate-pulse"></div>

        {/* Header */}
        <ChatHeader
          onlineUsers={onlineUsers}
          totalMessages={messages.length}
          isConnected={isConnected}
        />

        {/* Messages Area */}
        <div
          ref={scrollAreaRef}
          className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 relative"
          style={{
            background:
              "linear-gradient(180deg, rgba(139,92,246,0.05) 0%, rgba(236,72,153,0.05) 50%, rgba(6,182,212,0.05) 100%)",
          }}
        >
          {/* Floating Elements - Hidden on mobile */}
          <div className="absolute top-10 right-10 text-purple-300/30 animate-float hidden sm:block">
            <Star className="w-4 h-4" />
          </div>
          <div className="absolute bottom-20 left-10 text-pink-300/30 animate-float-delayed hidden sm:block">
            <Heart className="w-3 h-3" />
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center relative px-4">
              {/* Welcome Animation */}
              <div className="relative mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-bounce-slow">
                  <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-white animate-spin-slow" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full blur opacity-30 animate-pulse"></div>

                {/* Orbiting Elements - Hidden on mobile */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full animate-orbit opacity-80 hidden sm:block">
                  <Star className="w-4 h-4 text-white m-1" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-orbit-reverse opacity-80 hidden sm:block">
                  <Heart className="w-4 h-4 text-white m-1" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 sm:mb-4 animate-gradient px-2">
                Welcome to the Anime Dimension! ✨
              </h3>

              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-sm sm:max-w-md shadow-xl w-full">
                <p className="text-white/90 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                  Konnichiwa! You&apos;re chatting as{" "}
                  <span className="font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                    {currentUsername}
                  </span>
                </p>
                <p className="text-purple-200 text-xs sm:text-sm">
                  Enter the magical world of anonymous anime chat! Share your
                  thoughts with fellow otakus! 🌸
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className="animate-message-enter"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ChatMessage message={message} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput
          onSendMessage={sendMessage}
          disabled={!isConnected}
          placeholder={
            isConnected
              ? "Type your message to the anime dimension... ✨"
              : "Connecting to chat service..."
          }
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}
