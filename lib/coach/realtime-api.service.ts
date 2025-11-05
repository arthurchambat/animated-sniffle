import WebSocket from "ws";

export interface RealtimeConfig {
  model: string;
  voice?: string;
  instructions?: string;
  modalities?: string[];
  temperature?: number;
}

type MessageHandler = (message: any) => void;

/**
 * Lightweight wrapper around the OpenAI Realtime WebSocket API.
 * Handles connection lifecycle, session priming and helper methods
 * for audio/text interactions.
 */
export class RealtimeAPIService {
  private socket: WebSocket | null = null;
  private readonly apiKey: string;
  private readonly config: RealtimeConfig;
  private readonly listeners: MessageHandler[] = [];
  private isConnected = false;

  constructor(apiKey: string, config: RealtimeConfig) {
    if (!apiKey) {
      throw new Error("RealtimeAPIService requires a valid OpenAI API key.");
    }

    this.apiKey = apiKey;
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(
      this.config.model
    )}`;

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "OpenAI-Beta": "realtime=v1"
        }
      });

      const handleOpen = () => {
        this.socket = ws;
        this.isConnected = true;
        this.sendSessionUpdate();
        resolve();
      };

      const handleError = (error: Error) => {
        if (!this.isConnected) {
          reject(error);
        }
        console.error("RealtimeAPIService socket error:", error);
      };

      const handleClose = () => {
        this.isConnected = false;
        this.socket = null;
      };

      const handleMessage = (raw: WebSocket.RawData) => {
        try {
          const text = typeof raw === "string" ? raw : raw.toString("utf-8");
          const payload = JSON.parse(text);
          this.listeners.forEach((listener) => listener(payload));
        } catch (err) {
          console.error("RealtimeAPIService failed to parse message:", err);
        }
      };

      ws.on("open", handleOpen);
      ws.on("error", handleError);
      ws.on("close", handleClose);
      ws.on("message", handleMessage);
    });
  }

  isReady(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  async ensureConnected(): Promise<void> {
    if (this.isReady()) {
      return;
    }
    await this.connect();
  }

  onMessage(handler: MessageHandler): void {
    this.listeners.push(handler);
  }

  send(payload: Record<string, unknown>): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Realtime socket is not connected.");
    }
    this.socket.send(JSON.stringify(payload));
  }

  sendAudio(audioBase64: string): void {
    if (!audioBase64) return;
    this.send({
      type: "input_audio_buffer.append",
      audio: audioBase64
    });
  }

  commitAudio(): void {
    this.send({ type: "input_audio_buffer.commit" });
  }

  async sendText(text: string): Promise<void> {
    if (!text) return;

    this.send({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text
          }
        ]
      }
    });
  }

  disconnect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    this.isConnected = false;
    this.socket = null;
  }

  private sendSessionUpdate(): void {
    const sessionConfig: Record<string, unknown> = {};

    if (this.config.instructions) sessionConfig.instructions = this.config.instructions;
    if (this.config.voice) sessionConfig.voice = this.config.voice;
    if (this.config.modalities) sessionConfig.modalities = this.config.modalities;
    if (typeof this.config.temperature === "number") {
      sessionConfig.temperature = this.config.temperature;
    }

    if (Object.keys(sessionConfig).length > 0) {
      this.send({
        type: "session.update",
        session: sessionConfig
      });
    }
  }
}
