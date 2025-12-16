"use client";

import { Mic, MicOff, Radio, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { VoiceAgentStatus } from "@/lib/hooks/useVoiceAgent";

interface VoiceAgentControlsProps {
  status: VoiceAgentStatus;
  isSpeaking: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRetry?: () => void;
  error?: Error | null;
}

const statusConfig: Record<VoiceAgentStatus, {
  icon: React.ElementType;
  label: string;
  color: string;
  pulseColor?: string;
}> = {
  idle: {
    icon: Mic,
    label: "Voice Mode (Beta)",
    color: "text-slate-400",
  },
  connecting: {
    icon: Loader2,
    label: "Connecting...",
    color: "text-blue-400",
  },
  connected: {
    icon: Radio,
    label: "Connected",
    color: "text-emerald-400",
    pulseColor: "bg-emerald-400",
  },
  listening: {
    icon: Mic,
    label: "Listening",
    color: "text-emerald-400",
    pulseColor: "bg-emerald-400",
  },
  speaking: {
    icon: Radio,
    label: "Agent Speaking",
    color: "text-blue-400",
    pulseColor: "bg-blue-400",
  },
  error: {
    icon: AlertCircle,
    label: "Error",
    color: "text-rose-400",
  },
  disconnected: {
    icon: MicOff,
    label: "Disconnected",
    color: "text-slate-400",
  },
};

export function VoiceAgentControls({
  status,
  isSpeaking,
  onConnect,
  onDisconnect,
  onRetry,
  error,
}: VoiceAgentControlsProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isActive = status === "listening" || status === "speaking" || status === "connected";
  const isConnecting = status === "connecting";
  const hasError = status === "error";

  return (
    <div className="flex flex-col gap-3">
      {/* Main toggle button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={isActive ? onDisconnect : onConnect}
          disabled={isConnecting}
          variant={isActive ? "outline" : "primary"}
          className={cn(
            "relative flex items-center gap-2 transition-all",
            isActive && "border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20",
            hasError && "border-rose-400/50 bg-rose-500/10"
          )}
        >
          <Icon className={cn("h-4 w-4", config.color, isConnecting && "animate-spin")} />
          <span className="text-sm font-medium">
            {isActive ? "Stop Voice" : config.label}
          </span>
          
          {/* Pulse indicator */}
          {config.pulseColor && (
            <span className="relative flex h-2 w-2">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                  config.pulseColor
                )}
              />
              <span
                className={cn(
                  "relative inline-flex h-2 w-2 rounded-full",
                  config.pulseColor
                )}
              />
            </span>
          )}
        </Button>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className={cn("text-xs font-medium", config.color)}>
            {config.label}
          </div>
        </div>
      </div>

      {/* Helper text */}
      {status === "idle" && (
        <p className="text-xs text-slate-400 pl-1">
          Audio is processed for this session only.
        </p>
      )}

      {/* Error message with retry */}
      {hasError && error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-400/30">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-rose-300 mb-2">
              {error.message || "Failed to connect to voice agent"}
            </p>
            {onRetry && (
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                className="h-7 text-xs border-rose-400/50 hover:bg-rose-500/20"
              >
                Retry Connection
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Active session info */}
      {isActive && (
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "h-1.5 w-1.5 rounded-full",
                isSpeaking ? "bg-blue-400 animate-pulse" : "bg-emerald-400"
              )} />
              <span className="font-medium">
                {isSpeaking ? "Agent is speaking" : "Waiting for your response"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
