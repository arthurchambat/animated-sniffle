"use client";

import { useState, useEffect, useCallback } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface LiveControlsProps {
  onEndInterview: () => void;
  onHelpRequest?: () => void;
}

export function LiveControls({ onEndInterview, onHelpRequest }: LiveControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleEndInterview = () => {
    if (confirm("Êtes-vous sûr de vouloir terminer l'interview ? Cette action est irréversible.")) {
      onEndInterview();
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        type="button"
        onClick={() => setIsMuted(!isMuted)}
        variant="secondary"
        size="lg"
        className={cn(
          "rounded-full h-14 w-14",
          isMuted && "bg-rose-500/20 hover:bg-rose-500/30"
        )}
        aria-label={isMuted ? "Activer le micro" : "Couper le micro"}
      >
        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>

      <Button
        type="button"
        onClick={() => setIsVideoOff(!isVideoOff)}
        variant="secondary"
        size="lg"
        className={cn(
          "rounded-full h-14 w-14",
          isVideoOff && "bg-rose-500/20 hover:bg-rose-500/30"
        )}
        aria-label={isVideoOff ? "Activer la caméra" : "Couper la caméra"}
      >
        {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
      </Button>

      <Button
        type="button"
        onClick={handleEndInterview}
        size="lg"
        className="rounded-full h-14 w-14 bg-rose-500 hover:bg-rose-600 text-white"
        aria-label="Terminer l'interview"
      >
        <PhoneOff className="h-5 w-5" />
      </Button>

      {onHelpRequest && (
        <Button
          type="button"
          onClick={onHelpRequest}
          variant="ghost"
          size="lg"
          className="rounded-full h-14 w-14"
          aria-label="Aide"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
