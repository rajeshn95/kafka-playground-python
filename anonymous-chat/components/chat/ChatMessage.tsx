"use client";

import { generateColorFromUsername } from "@/lib/username-generator";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    username: string;
    timestamp: string;
    isOwn: boolean;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getInitials = (username: string) => {
    // Remove emoji and get first two characters
    const cleanName = username.replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
      ""
    );
    return cleanName.slice(0, 2).toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const colorClass = generateColorFromUsername(message.username);

  return (
    <div
      className={`flex gap-4 mb-6 animate-fade-in group ${
        message.isOwn ? "flex-row-reverse" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <Avatar
        className={`w-12 h-12 transition-all duration-300 ${
          isHovered ? "scale-110" : ""
        }`}
      >
        <AvatarFallback
          className={`${colorClass} text-white font-bold text-sm`}
        >
          {getInitials(message.username)}
        </AvatarFallback>
      </Avatar>

      {/* Message Container */}
      <div
        className={`flex flex-col ${
          message.isOwn ? "items-end" : "items-start"
        } max-w-[80%] flex-1`}
      >
        {/* Username and Time */}
        <div
          className={`flex items-center gap-3 mb-2 ${
            message.isOwn ? "flex-row-reverse" : ""
          }`}
        >
          <Badge variant="secondary" className="gap-2">
            {message.username}
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Message Bubble */}
        <Card
          className={`relative group/message transition-all duration-300 hover:shadow-lg ${
            message.isOwn
              ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0"
              : "bg-card text-card-foreground"
          } rounded-2xl px-6 py-4 ${
            message.isOwn
              ? "hover:from-blue-600 hover:to-purple-700"
              : "hover:bg-muted/50"
          }`}
        >
          {/* Message Text */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
            {message.text}
          </p>

          {/* Message Tail */}
          <div
            className={`absolute top-4 w-0 h-0 ${
              message.isOwn
                ? "right-0 transform translate-x-full border-l-[12px] border-l-blue-500 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
                : "left-0 transform -translate-x-full border-r-[12px] border-r-card border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
            }`}
          ></div>

          {/* Hover Effect */}
          <div
            className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
              message.isOwn
                ? "bg-gradient-to-br from-blue-400/20 to-purple-500/20"
                : "bg-muted/20"
            } opacity-0 group-hover/message:opacity-100`}
          ></div>
        </Card>

        {/* Message Status (for own messages) */}
        {message.isOwn && (
          <div className="flex items-center gap-1 mt-2 opacity-60">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground">Delivered</span>
          </div>
        )}
      </div>
    </div>
  );
}
