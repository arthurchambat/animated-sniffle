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
  expiresAt?: string | undefined;
}

export interface BeyondPresenceSessionResponse {
  sessionId: string;
  roomName: string;
  livekit?: BeyondPresenceLiveKitDetails;
  persona?: string | undefined;
  locale?: string | undefined;
  expiresAt?: string | undefined;
  stub?: boolean;
  agentDispatched?: boolean;
  agentName?: string;
}
