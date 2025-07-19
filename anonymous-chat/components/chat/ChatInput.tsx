"use client";

import type React from "react";

import { useState, type KeyboardEvent } from "react";
import { Send, Sparkles, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isConnected?: boolean;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  isConnected = true,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  return (
    <div className="relative p-3 sm:p-6 border-t border-white/10 backdrop-blur-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-cyan-500/5 animate-gradient-x"></div>

      <div className="relative">
        <div className="flex items-end gap-2 sm:gap-4">
          {/* Input Container */}
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[50px] sm:min-h-[60px] max-h-[120px] resize-none backdrop-blur-xl bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-xl sm:rounded-2xl px-3 sm:px-6 py-3 sm:py-4 pr-12 sm:pr-16 focus:bg-white/15 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 text-sm sm:text-base"
              rows={1}
            />

            {/* Floating Elements - Hidden on mobile */}
            {isTyping && (
              <>
                <div className="absolute top-2 right-12 sm:right-16 text-purple-300/50 animate-float hidden sm:block">
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="absolute bottom-2 right-16 sm:right-20 text-pink-300/50 animate-float-delayed hidden sm:block">
                  <Heart className="w-2 h-2" />
                </div>
              </>
            )}

            {/* Character Count */}
            {isTyping && (
              <div className="absolute bottom-2 sm:bottom-3 right-12 sm:right-16 text-xs text-white/50 backdrop-blur-sm bg-black/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                {message.length}/500
              </div>
            )}
          </div>
          {/* Send Button - Now properly separated and visible */}
          <div className="relative flex-shrink-0">
            <Button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              className="h-16 w-16 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 text-white shadow-2xl shadow-purple-500/60 transition-all duration-300 hover:scale-110 disabled:opacity-30 disabled:scale-100 border-2 border-white/30 hover:border-white/50 relative z-10"
            >
              <Send className="w-7 h-7" />
            </Button>

            {/* Glowing Effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-2xl blur-lg opacity-50 animate-pulse -z-10"></div>

            {/* Pulsing Ring */}
            <div className="absolute -inset-1 border-2 border-white/20 rounded-2xl animate-ping opacity-75"></div>
          </div>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-red-300 animate-fade-in">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="font-medium">Connecting to chat service...</span>
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && isConnected && (
          <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-purple-300 animate-fade-in">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <span className="font-medium hidden sm:inline">
              Channeling your message to the anime dimension...
            </span>
            <span className="font-medium sm:hidden">Typing...</span>
            <Star className="w-3 h-3 sm:w-4 sm:h-4 animate-spin-slow" />
          </div>
        )}
      </div>
    </div>
  );
}
