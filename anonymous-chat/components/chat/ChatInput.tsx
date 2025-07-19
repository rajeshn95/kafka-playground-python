"use client";

import { useState, KeyboardEvent } from "react";
import { Send, Smile, Paperclip, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  username?: string;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  username,
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
    <Card className="rounded-none border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-6">
        {/* Username Display */}
        {username && (
          <div className="mb-4 flex items-center gap-2">
            <Badge variant="outline" className="gap-2">
              <User className="w-3 h-3" />
              Chatting as: {username}
            </Badge>
          </div>
        )}

        <div className="flex items-end gap-3">
          {/* Input Container */}
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[60px] max-h-[120px] resize-none pr-20"
              rows={1}
            />

            {/* Character Count */}
            {isTyping && (
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                {message.length}/500
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Emoji Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              disabled={disabled}
            >
              <Smile className="w-4 h-4" />
            </Button>

            {/* Attachment Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              disabled={disabled}
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              size="icon"
              className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Typing Indicator */}
        {isTyping && (
          <div className="mt-3 text-xs text-muted-foreground animate-pulse flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
              <div
                className="w-1 h-1 bg-current rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-1 h-1 bg-current rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            Typing...
          </div>
        )}
      </div>
    </Card>
  );
}
