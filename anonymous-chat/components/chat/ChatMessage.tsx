"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Star, Zap, Sparkles } from "lucide-react";

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    username: string;
    timestamp: string;
    isOwn: boolean;
    mood?: "happy" | "excited" | "cool" | "mysterious";
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const getInitials = (username: string) => {
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

  const getAvatarGradient = (username: string) => {
    const gradients = [
      "from-red-400 via-pink-500 to-purple-600",
      "from-blue-400 via-cyan-500 to-teal-600",
      "from-green-400 via-emerald-500 to-cyan-600",
      "from-yellow-400 via-orange-500 to-red-600",
      "from-purple-400 via-violet-500 to-indigo-600",
      "from-pink-400 via-rose-500 to-red-600",
      "from-indigo-400 via-purple-500 to-pink-600",
      "from-teal-400 via-cyan-500 to-blue-600",
    ];

    const hash = username.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    return gradients[Math.abs(hash) % gradients.length];
  };

  const getMoodIcon = (mood?: string) => {
    switch (mood) {
      case "happy":
        return <Heart className="w-3 h-3 text-pink-400 animate-pulse" />;
      case "excited":
        return <Zap className="w-3 h-3 text-yellow-400 animate-bounce" />;
      case "cool":
        return <Star className="w-3 h-3 text-cyan-400 animate-spin-slow" />;
      case "mysterious":
        return <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />;
      default:
        return null;
    }
  };

  const getMoodGradient = (mood?: string) => {
    switch (mood) {
      case "happy":
        return "from-pink-500/20 to-rose-500/20";
      case "excited":
        return "from-yellow-500/20 to-orange-500/20";
      case "cool":
        return "from-cyan-500/20 to-blue-500/20";
      case "mysterious":
        return "from-purple-500/20 to-indigo-500/20";
      default:
        return "from-slate-500/20 to-gray-500/20";
    }
  };

  return (
    <div
      className={`flex gap-4 group hover:scale-[1.02] transition-all duration-300 ${
        message.isOwn ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar className="w-12 h-12 border-2 border-white/20 shadow-lg hover:scale-110 transition-transform duration-300">
          <AvatarFallback
            className={`bg-gradient-to-r ${getAvatarGradient(
              message.username
            )} text-white text-sm font-bold animate-glow`}
          >
            {getInitials(message.username)}
          </AvatarFallback>
        </Avatar>

        {/* Mood Indicator */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
          {getMoodIcon(message.mood)}
        </div>

        {/* Avatar Glow */}
        <div
          className={`absolute -inset-1 bg-gradient-to-r ${getAvatarGradient(
            message.username
          )} rounded-full blur opacity-30 animate-pulse`}
        ></div>
      </div>

      {/* Message Content */}
      <div
        className={`flex flex-col ${
          message.isOwn ? "items-end" : "items-start"
        } max-w-[70%] flex-1`}
      >
        {/* Username and Time */}
        <div
          className={`flex items-center gap-3 mb-2 ${
            message.isOwn ? "flex-row-reverse" : ""
          }`}
        >
          <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            {message.username}
          </span>
          <span className="text-xs text-white/60 backdrop-blur-sm bg-white/5 px-2 py-1 rounded-full">
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Message Bubble */}
        <div className="relative group/bubble">
          <div
            className={`relative px-6 py-4 rounded-2xl backdrop-blur-xl border shadow-xl transition-all duration-300 hover:scale-105 ${
              message.isOwn
                ? "bg-gradient-to-r from-purple-500/80 via-pink-500/80 to-cyan-500/80 text-white border-white/20 rounded-br-md shadow-purple-500/30"
                : "bg-white/10 text-white border-white/20 rounded-bl-md shadow-black/20"
            }`}
          >
            {/* Message Text */}
            <p className="text-sm leading-relaxed font-medium relative z-10">
              {message.text}
            </p>

            {/* Animated Background */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${getMoodGradient(
                message.mood
              )} opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-300`}
            ></div>

            {/* Glow Effect */}
            <div
              className={`absolute -inset-1 rounded-2xl blur opacity-0 group-hover/bubble:opacity-30 transition-opacity duration-300 ${
                message.isOwn
                  ? "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"
                  : "bg-gradient-to-r from-white/20 to-white/10"
              }`}
            ></div>
          </div>

          {/* Message Tail with Glow */}
          <div
            className={`absolute top-4 w-0 h-0 ${
              message.isOwn
                ? "right-0 transform translate-x-full border-l-[12px] border-l-purple-500/80 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
                : "left-0 transform -translate-x-full border-r-[12px] border-r-white/10 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
            }`}
          ></div>
        </div>

        {/* Message Status */}
        {message.isOwn && (
          <div className="flex items-center gap-2 mt-2 opacity-70">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse">
              <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-xs text-green-300 font-medium">
              Delivered to the anime dimension
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
