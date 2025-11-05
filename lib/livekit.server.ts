"use server";

import { randomUUID } from "crypto";
import {
  AccessToken,
  AgentDispatchClient,
  RoomJoinPermission
} from "livekit-server-sdk";

export interface LiveKitViewerOptions {
  roomName: string;
  name?: string;
  metadata?: string;
  ttlSeconds?: number;
}

export interface LiveKitViewerAccess {
  url: string;
  token: string;
  identity: string;
  expiresAt?: string;
}

function getLiveKitEnv() {
  const wsUrl = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const restOverride = process.env.LIVEKIT_REST_URL;

  const restUrl = restOverride ?? deriveRestUrl(wsUrl);

  return { wsUrl, restUrl, apiKey, apiSecret };
}

export function isLiveKitConfigured(): boolean {
  const { wsUrl, apiKey, apiSecret } = getLiveKitEnv();
  return Boolean(wsUrl && apiKey && apiSecret);
}

function deriveRestUrl(wsUrl?: string | null): string | undefined {
  if (!wsUrl) return undefined;
  if (wsUrl.startsWith("wss://")) {
    return `https://${wsUrl.slice(6)}`;
  }
  if (wsUrl.startsWith("ws://")) {
    return `http://${wsUrl.slice(5)}`;
  }
  return wsUrl;
}

export function createLiveKitViewerAccess(options: LiveKitViewerOptions): LiveKitViewerAccess | null {
  const { roomName, name, metadata, ttlSeconds } = options;
  const { wsUrl, apiKey, apiSecret } = getLiveKitEnv();

  if (!wsUrl || !apiKey || !apiSecret) {
    return null;
  }

  const identity = `financebro-viewer-${randomUUID()}`;
  const accessToken = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    metadata
  });

  const grant: RoomJoinPermission = {
    room: roomName,
    roomJoin: true,
    canPublish: false,
    canPublishData: false,
    canSubscribe: true
  };

  accessToken.addGrant(grant);

  if (ttlSeconds && Number.isFinite(ttlSeconds)) {
    accessToken.ttl = Math.max(60, Math.min(ttlSeconds, 6 * 60 * 60)); // cap 6h
  }

  const token = accessToken.toJwt();
  const expiresAt =
    ttlSeconds && Number.isFinite(ttlSeconds)
      ? new Date(Date.now() + ttlSeconds * 1000).toISOString()
      : undefined;

  return {
    url: wsUrl,
    token,
    identity,
    expiresAt
  };
}

export async function dispatchAgentToRoom(
  roomName: string,
  agentName: string,
  metadata?: string
): Promise<boolean> {
  const { restUrl, apiKey, apiSecret } = getLiveKitEnv();

  if (!restUrl || !apiKey || !apiSecret || !agentName) {
    return false;
  }

  try {
    const client = new AgentDispatchClient(restUrl, apiKey, apiSecret);
    await client.createDispatch(roomName, agentName, { metadata });
    return true;
  } catch (error) {
    console.error("LiveKit agent dispatch error", error);
    return false;
  }
}
