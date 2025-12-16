"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Room, 
  RoomEvent, 
  Track,
  type Participant,
  type TrackPublication,
  type RemoteTrack,
  type RemoteParticipant
} from "livekit-client";

export type VoiceAgentStatus = 
  | "idle" 
  | "connecting" 
  | "connected" 
  | "listening" 
  | "speaking" 
  | "error" 
  | "disconnected";

export interface VoiceAgentMessage {
  id: string;
  text: string;
  role: "user" | "agent";
  timestamp: number;
}

export interface VoiceAgentConfig {
  sessionId: string;
  userName?: string;
  onError?: (error: Error) => void;
  onStatusChange?: (status: VoiceAgentStatus) => void;
  onMessage?: (message: VoiceAgentMessage) => void;
  onInterviewComplete?: (data: { questionCount: number; conversationLog: any[] }) => void;
}

export interface VoiceAgentReturn {
  status: VoiceAgentStatus;
  isConnected: boolean;
  isSpeaking: boolean;
  messages: VoiceAgentMessage[];
  lastMessage: VoiceAgentMessage | null;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  retry: () => Promise<void>;
}

export function useVoiceAgent(config: VoiceAgentConfig): VoiceAgentReturn {
  const { sessionId, userName, onError, onStatusChange, onMessage, onInterviewComplete } = config;

  const [status, setStatus] = useState<VoiceAgentStatus>("idle");
  const [messages, setMessages] = useState<VoiceAgentMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageIdCounterRef = useRef(0);

  const updateStatus = useCallback((newStatus: VoiceAgentStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  }, [onStatusChange]);

  const addMessage = useCallback((text: string, role: "user" | "agent") => {
    const message: VoiceAgentMessage = {
      id: `msg-${++messageIdCounterRef.current}`,
      text,
      role,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, message]);
    onMessage?.(message);
    return message;
  }, [onMessage]);

  const handleError = useCallback((err: Error) => {
    console.error("[VoiceAgent] Error:", err);
    setError(err);
    updateStatus("error");
    onError?.(err);
  }, [onError, updateStatus]);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (roomRef.current) {
      try {
        roomRef.current.disconnect();
      } catch (err) {
        console.warn("[VoiceAgent] Error during cleanup:", err);
      }
      roomRef.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      updateStatus("connecting");
      setError(null);

      // Fetch LiveKit token and room details from backend
      const response = await fetch("/api/bey/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          persona: "finance-interviewer",
          locale: "en-US",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`);
      }

      const data = await response.json();

      // Check if we got a valid LiveKit session
      if (data.stub || !data.livekit) {
        throw new Error("LiveKit is not configured. Please check environment variables.");
      }

      const { livekit, roomName } = data;

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create and connect to LiveKit room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      roomRef.current = room;

      // Set up room event handlers
      room.on(RoomEvent.Connected, () => {
        console.log("[VoiceAgent] Connected to room:", roomName);
        updateStatus("connected");
      });

      room.on(RoomEvent.Disconnected, () => {
        console.log("[VoiceAgent] Disconnected from room");
        updateStatus("disconnected");
      });

      room.on(RoomEvent.Reconnecting, () => {
        console.log("[VoiceAgent] Reconnecting...");
        updateStatus("connecting");
      });

      room.on(RoomEvent.Reconnected, () => {
        console.log("[VoiceAgent] Reconnected");
        updateStatus("connected");
      });

      room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        console.log("[VoiceAgent] Participant joined:", participant.identity);
      });

      room.on(RoomEvent.TrackSubscribed, (
        track: RemoteTrack,
        publication: TrackPublication,
        participant: RemoteParticipant
      ) => {
        if (track.kind === Track.Kind.Audio && participant.identity.includes("agent")) {
          console.log("[VoiceAgent] Agent audio track subscribed");
          
          // Attach agent audio to DOM
          const audioElement = track.attach();
          audioElement.play();
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (
        track: RemoteTrack,
        publication: TrackPublication,
        participant: RemoteParticipant
      ) => {
        if (track.kind === Track.Kind.Audio) {
          console.log("[VoiceAgent] Audio track unsubscribed");
          track.detach();
        }
      });

      room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
        const agentSpeaking = speakers.some((s: Participant) => 
          s.identity.includes("agent") || s.identity.includes("finance-coach")
        );
        setIsSpeaking(agentSpeaking);
        
        if (agentSpeaking) {
          updateStatus("speaking");
        } else if (status === "speaking") {
          updateStatus("listening");
        }
      });

      room.on(RoomEvent.DataReceived, (
        payload: Uint8Array,
        participant?: RemoteParticipant
      ) => {
        try {
          const text = new TextDecoder().decode(payload);
          const data = JSON.parse(text);
          
          // Handle interview completion signal from agent
          if (data.type === "interview_complete") {
            console.log("[VoiceAgent] Interview completed - 5 questions answered");
            if (onInterviewComplete) {
              onInterviewComplete({
                questionCount: data.questionCount || 5,
                conversationLog: data.conversationLog || [],
              });
            }
          }
          
          // Handle transcript messages
          if (data.type === "transcript" && data.text) {
            const role = participant?.identity.includes("agent") ? "agent" : "user";
            addMessage(data.text, role);
          }
        } catch (err) {
          console.warn("[VoiceAgent] Failed to parse data:", err);
        }
      });

      // Connect to room
      await room.connect(livekit.url, livekit.token);

      // Enable microphone
      await room.localParticipant.setMicrophoneEnabled(true);
      
      updateStatus("listening");

      console.log("[VoiceAgent] Voice agent ready");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      handleError(error);
      cleanup();
    }
  }, [sessionId, updateStatus, handleError, cleanup, addMessage, status, onInterviewComplete]);

  const disconnect = useCallback(() => {
    console.log("[VoiceAgent] Disconnecting...");
    cleanup();
    updateStatus("idle");
    setMessages([]);
    setError(null);
    setIsSpeaking(false);
  }, [cleanup, updateStatus]);

  const retry = useCallback(async () => {
    console.log("[VoiceAgent] Retrying connection...");
    disconnect();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await connect();
  }, [disconnect, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const isConnected = status === "connected" || status === "listening" || status === "speaking";
  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  return {
    status,
    isConnected,
    isSpeaking,
    messages,
    lastMessage: lastMessage ?? null,
    error,
    connect,
    disconnect,
    retry,
  };
}
