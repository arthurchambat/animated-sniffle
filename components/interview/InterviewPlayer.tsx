"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mic, MicOff, Video as VideoIcon, VideoOff } from "lucide-react";
import { BentoCard } from "@/components/ui/bento-card";
import { cn } from "@/lib/cn";
import { useTracks, VideoTrack } from "@livekit/components-react";
import { Track } from "livekit-client";

interface InterviewPlayerProps {
  userName: string;
}

export function InterviewPlayer({ userName }: InterviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  // Get all video tracks
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare]);
  
  // Find the agent's track (remote) - BeyondPresence avatar will be a remote participant
  const agentTrack = tracks.find(t => 
    t.participant.identity !== userName && 
    t.source === Track.Source.Camera &&
    !t.participant.isLocal
  );
  
  // Find the user's track (local)
  const userTrack = tracks.find(t => 
    t.participant.identity === userName || 
    t.participant.isLocal
  );

  useEffect(() => {
    // Request permissions
    const requestPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasPermissions(true);
        console.log("✅ Camera and microphone permissions granted");
      } catch (error) {
        console.error("❌ Error accessing media devices:", error);
        setHasPermissions(false);
      }
    };

    requestPermissions();
  }, []);

  // Better logic: Only mark as off if we explicitly know it's disabled
  const isMuted = userTrack ? userTrack.participant.isMicrophoneEnabled === false : false;
  const isVideoOff = userTrack ? userTrack.participant.isCameraEnabled === false : false;
  const hasUserVideo = !!userTrack && !isVideoOff;
  
  console.log("📹 Video state:", { 
    hasUserTrack: !!userTrack, 
    isVideoOff, 
    hasUserVideo,
    cameraEnabled: userTrack?.participant.isCameraEnabled 
  });
  const isAgentConnected = !!agentTrack;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Vignette interviewer (IA avec avatar BeyondPresence) */}
      <BentoCard padding="none" className="relative aspect-video lg:aspect-auto overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950">
        {agentTrack ? (
          <VideoTrack trackRef={agentTrack} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-slate-900 flex items-center justify-center">
            <div className="text-center max-w-xs px-4">
              <div className="h-20 w-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center mx-auto mb-3 animate-pulse">
                <User className="h-10 w-10 text-emerald-200" />
              </div>
              <p className="text-lg font-semibold text-emerald-100">Finance Bro AI</p>
              <p className="text-xs text-emerald-200/70 mt-1">
                {isAgentConnected ? "Audio actif - Avatar à venir" : "Écoute et analyse vos réponses..."}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                L'avatar visuel sera disponible prochainement
              </p>
            </div>
          </div>
        )}

        {/* Indicateur d'activité de l'agent */}
        {isAgentConnected && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white font-medium">Avatar Active</span>
          </div>
        )}
      </BentoCard>

      {/* Vignette utilisateur */}
      <BentoCard padding="none" className="relative aspect-video lg:aspect-auto overflow-hidden">
        {hasUserVideo ? (
           <VideoTrack trackRef={userTrack} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <User className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-100">{userName}</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-slate-400">
                {userTrack ? (
                  <>
                    <VideoOff className="h-4 w-4" />
                    <span className="text-xs">Caméra désactivée</span>
                  </>
                ) : (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full" />
                    <span className="text-xs">Connexion en cours...</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Badge nom */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
          <span className="text-xs text-white font-medium">{userName}</span>
        </div>

        {/* Indicateurs */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center",
            isMuted ? "bg-rose-500/80" : "bg-emerald-500/80"
          )}>
            {isMuted ? (
              <MicOff className="h-4 w-4 text-white" />
            ) : (
              <Mic className="h-4 w-4 text-white" />
            )}
          </div>
          
          {isVideoOff && (
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-rose-500/80">
              <VideoOff className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
      </BentoCard>
    </div>
  );
}
