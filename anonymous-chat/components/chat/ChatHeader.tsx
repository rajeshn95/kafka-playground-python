"use client";

import { Users, MessageCircle, Sparkles, Zap } from "lucide-react";

interface ChatHeaderProps {
  onlineUsers: number;
  totalMessages: number;
  isConnected?: boolean;
}

export function ChatHeader({
  onlineUsers,
  totalMessages,
  isConnected = true,
}: ChatHeaderProps) {
  return (
    <div className="relative px-3 sm:px-6 py-3 sm:py-4 border-b border-white/10 backdrop-blur-sm">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 animate-gradient-x"></div>

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        {/* Room Info */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-glow">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white animate-spin-slow" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg sm:rounded-xl blur opacity-30 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                ✨ Anime Chat Universe ✨
              </h1>
              <p className="text-purple-300 text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                <span className="hidden sm:inline">
                  Enter the digital realm
                </span>
                <span className="sm:hidden">Digital realm</span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 sm:gap-6 flex-wrap">
          {/* Connection Status */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse ${
                isConnected ? "bg-green-400" : "bg-red-400"
              }`}
            >
              <div
                className={`w-full h-full rounded-full animate-ping ${
                  isConnected ? "bg-green-400" : "bg-red-400"
                }`}
              ></div>
            </div>
            <span
              className={`text-xs sm:text-sm font-medium ${
                isConnected ? "text-green-300" : "text-red-300"
              }`}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* Online Users */}
          <div className="flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm bg-white/5 rounded-full px-2 sm:px-3 py-1 border border-white/10">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
            <span className="text-cyan-300 font-semibold text-xs sm:text-sm">
              {onlineUsers}
            </span>
          </div>

          {/* Message Count */}
          <div className="flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm bg-white/5 rounded-full px-2 sm:px-3 py-1 border border-white/10">
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 animate-pulse" />
            <span className="text-purple-300 font-semibold text-xs sm:text-sm">
              {totalMessages}
            </span>
          </div>

          {/* Live Indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm bg-white/5 rounded-full px-2 sm:px-3 py-1 border border-white/10">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400 animate-bounce" />
            <span className="text-pink-300 font-semibold text-xs sm:text-sm">
              LIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
