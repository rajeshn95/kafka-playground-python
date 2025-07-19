import { ChatContainer } from "@/components/chat/ChatContainer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Anonymous Chat
          </h1>
          <p className="text-lg text-gray-600">
            Real-time messaging powered by Apache Kafka
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="text-center">
              <MessageCircle className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <CardTitle className="text-lg">Real-time Messaging</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Instant message delivery powered by Kafka streams
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <CardTitle className="text-lg">Anonymous Users</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Chat without revealing your identity
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <CardTitle className="text-lg">High Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Built with Next.js and modern web technologies
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Chat Container */}
        <div className="mb-8">
          <ChatContainer roomName="General Chat" />
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Badge variant="outline">Kafka</Badge>
            <Badge variant="outline">Next.js</Badge>
            <Badge variant="outline">TypeScript</Badge>
            <Badge variant="outline">shadcn/ui</Badge>
          </div>
          <p className="text-sm">
            Built for learning Apache Kafka with real-time messaging
          </p>
        </div>
      </div>
    </div>
  );
}
