"use client";

import { useState, useEffect, useRef } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { generateUsername } from "@/lib/username-generator";
import { MessageCircle, Users, Sparkles, Star, Heart, Zap } from "lucide-react";

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

export function ChatContainer({
  roomName = "anonymous-anime-universe",
  username,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers] = useState(Math.floor(Math.random() * 50) + 10);
  const [isConnected, setIsConnected] = useState(true);
  const [currentUsername, setCurrentUsername] = useState(username || "");
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

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const moods: Array<"happy" | "excited" | "cool" | "mysterious"> = [
      "happy",
      "excited",
      "cool",
      "mysterious",
    ];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];

    const newMessage: Message = {
      id: `local-${Date.now()}`,
      text,
      username: currentUsername,
      timestamp: new Date().toISOString(),
      isOwn: true,
      mood: randomMood,
    };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate receiving anime-style responses
    setTimeout(() => {
      const animeResponses = [
        { text: "Sugoi! That's amazing! ✨", mood: "excited" as const },
        { text: "Kawaii desu ne~ 🌸", mood: "happy" as const },
        { text: "Nani?! Really?! 😱", mood: "excited" as const },
        { text: "Sou desu ka... interesting 🤔", mood: "cool" as const },
        { text: "Arigatou gozaimasu! 🙏", mood: "happy" as const },
        { text: "Yabai! That's crazy! 🔥", mood: "excited" as const },
        {
          text: "Mysterious... like a shadow in the moonlight 🌙",
          mood: "mysterious" as const,
        },
        { text: "Ganbatte! You can do it! 💪", mood: "excited" as const },
        { text: "Oishii! Sounds delicious! 🍜", mood: "happy" as const },
        { text: "Kakkoii! So cool! ⚡", mood: "cool" as const },
      ];

      const randomResponse =
        animeResponses[Math.floor(Math.random() * animeResponses.length)];
      const responseMessage: Message = {
        id: `response-${Date.now()}`,
        text: randomResponse.text,
        username: generateUsername(),
        timestamp: new Date().toISOString(),
        isOwn: false,
        mood: randomResponse.mood,
      };
      setMessages((prev) => [...prev, responseMessage]);
    }, 1000 + Math.random() * 3000);
  };

  return (
    <div className="relative">
      {/* Glassmorphism Container */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden h-[620px] flex flex-col relative">
        {/* Animated Border */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 animate-pulse"></div>

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
          className="flex-1 overflow-y-auto px-6 py-4 relative"
          style={{
            background:
              "linear-gradient(180deg, rgba(139,92,246,0.05) 0%, rgba(236,72,153,0.05) 50%, rgba(6,182,212,0.05) 100%)",
          }}
        >
          {/* Floating Elements */}
          <div className="absolute top-10 right-10 text-purple-300/30 animate-float">
            <Star className="w-4 h-4" />
          </div>
          <div className="absolute bottom-20 left-10 text-pink-300/30 animate-float-delayed">
            <Heart className="w-3 h-3" />
          </div>

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center relative">
              {/* Welcome Animation */}
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-bounce-slow">
                  <Sparkles className="w-12 h-12 text-white animate-spin-slow" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full blur opacity-30 animate-pulse"></div>

                {/* Orbiting Elements */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full animate-orbit opacity-80">
                  <Star className="w-4 h-4 text-white m-1" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-orbit-reverse opacity-80">
                  <Heart className="w-4 h-4 text-white m-1" />
                </div>
              </div>

              <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-gradient">
                Welcome to the Anime Dimension! ✨
              </h3>

              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 max-w-md shadow-xl">
                <p className="text-white/90 leading-relaxed mb-4">
                  Konnichiwa! You're chatting as{" "}
                  <span className="font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                    {currentUsername}
                  </span>
                </p>
                <p className="text-purple-200 text-sm">
                  Enter the magical world of anonymous anime chat! Share your
                  thoughts with fellow otakus! 🌸
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
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
          disabled={false}
          placeholder="Type your message to the anime dimension... ✨"
          username={currentUsername}
        />
      </div>
    </div>
  );
}
