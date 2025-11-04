"use client";

import { Mic, MicOff, Video, VideoOff, PhoneOff, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface LiveControlsProps {
  onEndInterview: () => void;
  onHelpRequest?: () => void;
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: (nextState: boolean) => void;
  onToggleVideo: (nextState: boolean) => void;
}

export function LiveControls({
  onEndInterview,
  onHelpRequest,
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo
}: LiveControlsProps) {
  const handleEndInterview = () => {
    if (confirm("Êtes-vous sûr de vouloir terminer l'interview ? Cette action est irréversible.")) {
      onEndInterview();
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        type="button"
        onClick={() => onToggleMute(!isMuted)}
        variant="secondary"
        size="md"
        className={cn(
          "h-14 w-14 rounded-full p-0 border border-white/15 bg-white/10 text-slate-100 shadow-none",
          "hover:bg-white/20 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
          isMuted && "bg-rose-500/30 text-rose-50 hover:bg-rose-500/40 border-rose-400/30"
        )}
        aria-label={isMuted ? "Activer le micro" : "Couper le micro"}
        aria-pressed={isMuted}
      >
        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>

      <Button
        type="button"
        onClick={() => onToggleVideo(!isVideoOff)}
        variant="secondary"
        size="md"
        className={cn(
          "h-14 w-14 rounded-full p-0 border border-white/15 bg-white/10 text-slate-100 shadow-none",
          "hover:bg-white/20 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
          isVideoOff && "bg-rose-500/30 text-rose-50 hover:bg-rose-500/40 border-rose-400/30"
        )}
        aria-label={isVideoOff ? "Activer la caméra" : "Couper la caméra"}
        aria-pressed={isVideoOff}
      >
        {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
      </Button>

      <Button
        type="button"
        onClick={handleEndInterview}
        size="md"
        className="h-14 w-14 rounded-full p-0 bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-500/90 focus-visible:ring-rose-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        aria-label="Terminer l'interview"
      >
        <PhoneOff className="h-5 w-5" />
      </Button>

      {onHelpRequest && (
        <Button
          type="button"
          onClick={onHelpRequest}
          variant="ghost"
          size="md"
          className="h-14 w-14 rounded-full p-0 hover:bg-white/10"
          aria-label="Aide"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
