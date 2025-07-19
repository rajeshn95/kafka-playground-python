import { ChatContainer } from "@/components/chat/ChatContainer";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  MessageCircle,
  Zap,
  Shield,
  Sparkles,
  Globe,
  Rocket,
  Users,
  Heart,
  Star,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-muted/30 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-start mb-16">
          <div className="text-center flex-1"></div>
          <div className="ml-6">
            <ThemeToggle />
          </div>
        </div>

        {/* Chat Container */}
        <div
          className="mb-16 animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <ChatContainer roomName="Anonymous Chat" />
        </div>

        {/* Footer */}
        <div
          className="text-center text-muted-foreground animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="flex items-center justify-center gap-8 mb-6">
            <Badge variant="secondary" className="gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              Apache Kafka
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              Next.js 14
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              TypeScript
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
              shadcn/ui
            </Badge>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <p className="text-lg font-medium text-foreground">
              Built for learning Kafka with real-time messaging
            </p>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <p className="text-sm text-muted-foreground">
              Made with love for the developer community
            </p>
            <Heart className="w-4 h-4 text-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
