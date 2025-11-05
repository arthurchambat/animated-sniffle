"use server";

import { randomUUID } from "crypto";
import {
  createLiveKitViewerAccess,
  dispatchAgentToRoom,
  isLiveKitConfigured
} from "@/lib/livekit.server";
import type {
  BeyondPresenceSessionRequest,
  BeyondPresenceSessionResponse
} from "./bey/types";

const DEFAULT_ROOM_PREFIX = process.env.BEYOND_PRESENCE_ROOM_PREFIX ?? "financebro-bey";
const DEFAULT_AGENT_NAME = process.env.LIVEKIT_AGENT_NAME ?? "finance-coach-avatar";

function resolveSessionId(candidate?: string): string {
  if (candidate && typeof candidate === "string" && candidate.trim().length > 0) {
    return candidate;
  }
  return randomUUID();
}

export function isBeyondPresenceReady(): boolean {
  const hasApiKey = Boolean(process.env.BEYOND_PRESENCE_API_KEY);
  return hasApiKey && isLiveKitConfigured();
}

export async function createBeyondPresenceSession(
  payload: BeyondPresenceSessionRequest
): Promise<BeyondPresenceSessionResponse> {
  const ready = isBeyondPresenceReady();
  const sessionId = resolveSessionId(payload.sessionId);
  const roomName = `${DEFAULT_ROOM_PREFIX}-${sessionId}`;

  if (!ready) {
    return {
      sessionId,
      roomName,
      stub: true,
      persona: payload.persona,
      locale: payload.locale,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      agentDispatched: false,
      agentName: DEFAULT_AGENT_NAME
    };
  }

  const metadataPayload = {
    sessionId,
    persona: payload.persona,
    locale: payload.locale
  };

  const metadata = JSON.stringify(metadataPayload);

  const livekit = createLiveKitViewerAccess({
    roomName,
    name: "FinanceBro Candidate",
    metadata,
    ttlSeconds: 60 * 60
  });

  if (!livekit) {
    return {
      sessionId,
      roomName,
      stub: true,
      persona: payload.persona,
      locale: payload.locale,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      agentDispatched: false,
      agentName: DEFAULT_AGENT_NAME
    };
  }

  const dispatched = await dispatchAgentToRoom(roomName, DEFAULT_AGENT_NAME, metadata);

  return {
    sessionId,
    roomName,
    livekit,
    persona: payload.persona,
    locale: payload.locale,
    expiresAt: livekit.expiresAt,
    agentDispatched: dispatched,
    agentName: DEFAULT_AGENT_NAME
  };
}
