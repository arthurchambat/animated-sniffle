"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mic, MicOff, Video as VideoIcon, VideoOff } from "lucide-react";
import { BentoCard } from "@/components/ui/bento-card";
import { cn } from "@/lib/cn";

interface InterviewPlayerProps {
  userName: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

export function InterviewPlayer({ userName, isMuted = false, isVideoOff = false }: InterviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermissions, setHasPermissions] = useState(false);

  useEffect(() => {
    // Demander les permissions (version fake pour UX)
    const requestPermissions = async () => {
      try {
        // Dans une vraie version, on ferait:
        // const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // videoRef.current.srcObject = stream;
        setHasPermissions(true);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setHasPermissions(false);
      }
    };

    requestPermissions();

    return () => {
      // Cleanup: arrêter le stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Vignette interviewer (IA) */}
      <BentoCard padding="none" className="relative aspect-video lg:aspect-auto overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-900/20 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="h-20 w-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center mx-auto mb-3">
              <User className="h-10 w-10 text-emerald-200" />
            </div>
            <p className="text-lg font-semibold text-emerald-100">Finance Bro AI</p>
            <p className="text-xs text-emerald-200/70 mt-1">Interviewer</p>
          </div>
        </div>

        {/* Indicateur micro */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white font-medium">Active</span>
        </div>
      </BentoCard>

      {/* Vignette utilisateur */}
      <BentoCard padding="none" className="relative aspect-video lg:aspect-auto overflow-hidden">
        {isVideoOff ? (
          <div className="absolute inset-0 bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <User className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-100">{userName}</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-slate-400">
                <VideoOff className="h-4 w-4" />
                <span className="text-xs">Caméra désactivée</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Version fake: placeholder vidéo */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover bg-slate-900"
            />
            
            {/* Placeholder si pas de stream */}
            {!hasPermissions && (
              <div className="absolute inset-0 bg-linear-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
                    <VideoIcon className="h-10 w-10 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-400">En attente de la caméra...</p>
                </div>
              </div>
            )}
          </>
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
