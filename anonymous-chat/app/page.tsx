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
          <div className="text-center flex-1">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-slow">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-foreground via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Anonymous Chat
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Powered by Apache Kafka
                </p>
              </div>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              Experience real-time anonymous messaging with beautiful design.
              Connect with people around the world without revealing your
              identity. Every message is encrypted and ephemeral.
            </p>
          </div>
          <div className="ml-6">
            <ThemeToggle />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="group hover:shadow-2xl transition-all duration-500 animate-slide-in">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Real-time Messaging</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Instant message delivery powered by Kafka streams with
                sub-second latency and beautiful animations
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className="group hover:shadow-2xl transition-all duration-500 animate-slide-in"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">100% Anonymous</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Chat without revealing your identity. No registration, no
                tracking, no worries. Your privacy is our priority
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className="group hover:shadow-2xl transition-all duration-500 animate-slide-in"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Global Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                Connect with people worldwide. Share thoughts, ideas, and
                experiences in a safe, anonymous environment
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Chat Container */}
        <div
          className="mb-16 animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <ChatContainer roomName="Global Anonymous Chat" />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-foreground mb-2">∞</div>
              <div className="text-muted-foreground text-sm">Active Users</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-foreground mb-2">⚡</div>
              <div className="text-muted-foreground text-sm">Real-time</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-foreground mb-2">🔒</div>
              <div className="text-muted-foreground text-sm">Secure</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-foreground mb-2">🌍</div>
              <div className="text-muted-foreground text-sm">Global</div>
            </CardContent>
          </Card>
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
              Built for learning Apache Kafka with real-time messaging
            </p>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <Rocket className="w-5 h-5 text-blue-500" />
            <p className="text-base text-foreground">
              Experience the future of anonymous communication
            </p>
            <Rocket className="w-5 h-5 text-blue-500" />
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
