import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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
  const getInitials = (username: string) => {
    return username
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (username: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className={`flex gap-3 ${message.isOwn ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-8 w-8">
        <AvatarFallback
          className={`${getRandomColor(message.username)} text-white text-xs`}
        >
          {getInitials(message.username)}
        </AvatarFallback>
      </Avatar>

      <div
        className={`flex flex-col ${
          message.isOwn ? "items-end" : "items-start"
        } max-w-[70%]`}
      >
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-xs">
            {message.username}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>

        <Card
          className={`${
            message.isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          <CardContent className="p-3">
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.text}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
