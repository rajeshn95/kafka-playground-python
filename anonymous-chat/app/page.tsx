import { ChatContainer } from "@/components/chat/ChatContainer";
import { Sparkles, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Floating Particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-pink-400 rounded-full animate-float-delayed opacity-80"></div>
        <div className="absolute bottom-32 left-16 w-3 h-3 bg-purple-400 rounded-full animate-float-slow opacity-40"></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-float opacity-70"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-pink-300 rounded-full animate-float-delayed opacity-50"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Main Chat Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 min-h-screen flex flex-col justify-center">
        <ChatContainer
          roomName={
            process.env.NEXT_PUBLIC_TOPIC_NAME || "anonymous-anime-universe"
          }
        />
      </div>

      <div
        className="text-center text-muted-foreground animate-fade-in pb-4 sm:pb-6 px-4"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 animate-spin-slow" />
          <p className="text-sm sm:text-lg font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            Built for learning Kafka with real-time messaging
          </p>
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 animate-spin-slow" />
        </div>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 animate-pulse" />
          <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            Made with love for the developer community
          </p>
          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
