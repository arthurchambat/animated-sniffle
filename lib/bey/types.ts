"use strict";

export interface BeyondPresenceSessionRequest {
  sessionId?: string;
  agentProfileId?: string;
  persona?: string;
  streamUrl?: string;
  locale?: string;
}

export interface BeyondPresenceLiveKitDetails {
  url: string;
  token: string;
  identity: string;
  expiresAt?: string;
}

export interface BeyondPresenceSessionResponse {
  sessionId: string;
  roomName: string;
  livekit?: BeyondPresenceLiveKitDetails;
  persona?: string;
  locale?: string;
  expiresAt?: string;
  stub?: boolean;
  agentDispatched?: boolean;
  agentName?: string;
}
