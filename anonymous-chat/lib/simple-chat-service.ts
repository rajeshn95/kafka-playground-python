export interface ChatMessage {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  room: string;
  type: string;
  message_id?: string;
}

export interface SimpleChatServiceConfig {
  producerUrl?: string;
  consumerUrl?: string;
  onMessage?: (message: ChatMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
}

export class SimpleChatService {
  public config: SimpleChatServiceConfig;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(config: SimpleChatServiceConfig = {}) {
    this.config = {
      producerUrl:
        process.env.NEXT_PUBLIC_PRODUCER_URL || "http://localhost:8001",
      consumerUrl:
        process.env.NEXT_PUBLIC_CONSUMER_URL || "http://localhost:8002",
      ...config,
    };
  }

  async connect(): Promise<void> {
    console.log("🔄 Connecting to chat service...");
    console.log("📡 Consumer URL:", this.config.consumerUrl);

    try {
      // Connect to WebSocket for real-time messages
      const wsUrl = this.config.consumerUrl!.replace("http", "ws") + "/ws/chat";
      console.log("🔗 WebSocket URL:", wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("✅ Connected to WebSocket");
        this.reconnectAttempts = 0;
        this.config.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "chat_message") {
            // Convert to chat message format
            const message: ChatMessage = {
              id: data.message_id || `msg_${Date.now()}`,
              username: data.username,
              text: data.text,
              timestamp: data.timestamp,
              room: data.room,
              type: data.type,
            };
            this.config.onMessage?.(message);
          }
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("🔌 Disconnected from WebSocket");
        this.config.onDisconnect?.();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        this.config.onError?.("WebSocket connection error");
      };
    } catch (error) {
      console.error("❌ Failed to create WebSocket connection:", error);
      this.config.onError?.(`Failed to connect: ${error}`);
      throw error;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );

      setTimeout(() => {
        this.connect().catch(() => {
          this.attemptReconnect();
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("❌ Max reconnection attempts reached");
      this.config.onError?.("Failed to reconnect to chat service");
    }
  }

  async sendMessage(
    username: string,
    text: string,
    room: string = "anonymous-anime-universe"
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.producerUrl}/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          text,
          room,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Message sent:", result);
        return true;
      } else {
        console.error("❌ Failed to send message:", response.statusText);
        this.config.onError?.(`Failed to send message: ${response.statusText}`);
        return false;
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
      this.config.onError?.(`Error sending message: ${error}`);
      return false;
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  async getHealth(): Promise<{ producer: boolean; consumer: boolean }> {
    const health = { producer: false, consumer: false };

    try {
      const producerResponse = await fetch(`${this.config.producerUrl}/health`);
      health.producer = producerResponse.ok;
    } catch (error) {
      console.error("❌ Producer health check failed:", error);
    }

    try {
      const consumerResponse = await fetch(`${this.config.consumerUrl}/health`);
      health.consumer = consumerResponse.ok;
    } catch (error) {
      console.error("❌ Consumer health check failed:", error);
    }

    return health;
  }
}

// Singleton instance
let simpleChatServiceInstance: SimpleChatService | null = null;

export function getSimpleChatService(
  config?: SimpleChatServiceConfig
): SimpleChatService {
  if (!simpleChatServiceInstance) {
    simpleChatServiceInstance = new SimpleChatService(config);
  }
  return simpleChatServiceInstance;
}
