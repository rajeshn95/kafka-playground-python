"use client";

import {
  Users,
  MessageCircle,
  Wifi,
  WifiOff,
  Shield,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ChatHeaderProps {
  roomName: string;
  onlineUsers: number;
  totalMessages: number;
  isConnected?: boolean;
}

export function ChatHeader({
  roomName,
  onlineUsers,
  totalMessages,
  isConnected = true,
}: ChatHeaderProps) {
  return (
    <Card className="rounded-none border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-6">
        <div className="flex items-center justify-between">
          {/* Room Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{roomName}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Shield className="w-3 h-3" />
                Anonymous Chat Room
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <Badge
              variant={isConnected ? "default" : "destructive"}
              className="gap-2"
            >
              {isConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>

            {/* Online Users */}
            <Badge variant="secondary" className="gap-2">
              <Users className="w-3 h-3" />
              {onlineUsers} online
            </Badge>

            {/* Message Count */}
            <Badge variant="outline" className="gap-2">
              <MessageCircle className="w-3 h-3" />
              {totalMessages} messages
            </Badge>
          </div>
        </div>

        {/* Room Description */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Welcome to the anonymous chat! Share your thoughts without revealing
            your identity. Be respectful and enjoy the conversation! 🚀
          </p>
        </div>
      </div>
    </Card>
  );
}
