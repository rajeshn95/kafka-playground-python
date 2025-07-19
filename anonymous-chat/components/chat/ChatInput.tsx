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
    <div className="relative p-6 border-t border-white/10 backdrop-blur-xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-cyan-500/5 animate-gradient-x"></div>

      <div className="relative">
        <div className="flex items-end gap-4">
          {/* Input Container */}
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[60px] max-h-[120px] resize-none backdrop-blur-xl bg-white/10 border-white/20 text-white placeholder:text-white/60 rounded-2xl px-6 py-4 pr-16 focus:bg-white/15 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300"
              rows={1}
            />

            {/* Floating Elements */}
            {isTyping && (
              <>
                <div className="absolute top-2 right-16 text-purple-300/50 animate-float">
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="absolute bottom-2 right-20 text-pink-300/50 animate-float-delayed">
                  <Heart className="w-2 h-2" />
                </div>
              </>
            )}

            {/* Character Count */}
            {isTyping && (
              <div className="absolute bottom-3 right-16 text-xs text-white/50 backdrop-blur-sm bg-black/20 px-2 py-1 rounded-full">
                {message.length}/500
              </div>
            )}
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            size="icon"
            className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 text-white shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:scale-100 animate-glow"
          >
            <Send className="w-5 h-5" />
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl blur opacity-30 animate-pulse"></div>
          </Button>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="mt-4 flex items-center gap-3 text-sm text-red-300 animate-fade-in">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="font-medium">Connecting to chat service...</span>
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && isConnected && (
          <div className="mt-4 flex items-center gap-3 text-sm text-purple-300 animate-fade-in">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <span className="font-medium">
              Channeling your message to the anime dimension...
            </span>
            <Star className="w-4 h-4 animate-spin-slow" />
          </div>
        )}
      </div>
    </div>
  );
}
