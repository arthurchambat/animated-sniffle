"use client";

import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LiveControlsProps {
  onEndInterview: () => void;
  onHelpRequest: () => void;
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: (muted: boolean) => void;
  onToggleVideo: (videoOff: boolean) => void;
}

export function LiveControls({
  onEndInterview,
  onHelpRequest,
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
}: LiveControlsProps) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-xl">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full h-12 w-12 transition-all ${
                isMuted 
                  ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30' 
                  : 'bg-slate-800/50 text-slate-200 hover:bg-slate-700 hover:text-white'
              }`}
              onClick={() => onToggleMute(!isMuted)}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMuted ? "Unmute" : "Mute"}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full h-12 w-12 transition-all ${
                isVideoOff 
                  ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30' 
                  : 'bg-slate-800/50 text-slate-200 hover:bg-slate-700 hover:text-white'
              }`}
              onClick={() => onToggleVideo(!isVideoOff)}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isVideoOff ? "Turn Camera On" : "Turn Camera Off"}</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-px h-8 bg-white/10 mx-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-12 w-12 bg-slate-800/50 text-slate-200 hover:bg-slate-700 hover:text-white"
              onClick={onHelpRequest}
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Get Help</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full h-12 w-12 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/20"
              onClick={onEndInterview}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>End Interview</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
