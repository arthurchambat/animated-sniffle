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
  // LiveKit can work without BeyondPresence API
  return isLiveKitConfigured();
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

  const livekit = await createLiveKitViewerAccess({
    roomName,
    name: "FinanceBro Candidate",
    metadata,
    ttlSeconds: 60 * 60
  });

  if (!livekit) {
    console.warn("[BeyondPresence] Failed to create LiveKit viewer access");
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

  console.log("[BeyondPresence] Dispatching agent to room:", roomName, "Agent:", DEFAULT_AGENT_NAME);
  const dispatched = await dispatchAgentToRoom(roomName, DEFAULT_AGENT_NAME, metadata);
  console.log("[BeyondPresence] Agent dispatch result:", dispatched);

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
