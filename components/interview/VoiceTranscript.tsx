"use client";

import { cn } from "@/lib/cn";
import type { VoiceAgentMessage } from "@/lib/hooks/useVoiceAgent";
import { User, Bot } from "lucide-react";

interface VoiceTranscriptProps {
  messages: VoiceAgentMessage[];
  className?: string;
}

export function VoiceTranscript({ messages, className }: VoiceTranscriptProps) {
  if (messages.length === 0) {
    return (
      <div className={cn("p-4 text-center text-sm text-slate-400", className)}>
        Transcript will appear here once the conversation starts...
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {messages.map((message) => {
        const isAgent = message.role === "agent";
        const Icon = isAgent ? Bot : User;
        
        return (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 p-3 rounded-lg",
              isAgent 
                ? "bg-blue-500/10 border border-blue-400/20" 
                : "bg-slate-800/50 border border-slate-700/50"
            )}
          >
            <div className={cn(
              "shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
              isAgent ? "bg-blue-500/20" : "bg-emerald-500/20"
            )}>
              <Icon className={cn(
                "h-4 w-4",
                isAgent ? "text-blue-400" : "text-emerald-400"
              )} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className={cn(
                  "text-xs font-medium",
                  isAgent ? "text-blue-300" : "text-emerald-300"
                )}>
                  {isAgent ? "Agent" : "You"}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {message.text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
