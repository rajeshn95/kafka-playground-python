import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageCircle } from "lucide-react";

interface ChatHeaderProps {
  roomName: string;
  onlineUsers: number;
  totalMessages: number;
}

export function ChatHeader({
  roomName,
  onlineUsers,
  totalMessages,
}: ChatHeaderProps) {
  return (
    <Card className="border-b rounded-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">{roomName}</h2>
              <p className="text-sm text-muted-foreground">
                Anonymous Chat Room
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Badge variant="outline">{onlineUsers} online</Badge>
            </div>

            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary">{totalMessages} messages</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
