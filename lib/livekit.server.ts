import { randomUUID } from "crypto";
import {
  AccessToken,
  AgentDispatchClient
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
  expiresAt?: string | undefined;
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

export async function createLiveKitViewerAccess(options: LiveKitViewerOptions): Promise<LiveKitViewerAccess | null> {
  const { roomName, name, metadata, ttlSeconds } = options;
  const { wsUrl, apiKey, apiSecret } = getLiveKitEnv();

  if (!wsUrl || !apiKey || !apiSecret) {
    return null;
  }

  const identity = `financebro-viewer-${randomUUID()}`;
  
  // Set TTL - default to 1 hour if not specified
  const ttl = ttlSeconds && Number.isFinite(ttlSeconds) 
    ? Math.max(60, Math.min(ttlSeconds, 6 * 60 * 60)) 
    : 3600; // 1 hour default
  
  const accessToken = new AccessToken(apiKey, apiSecret, {
    identity,
    ttl, // TTL in seconds from now
    ...(name && { name }),
    ...(metadata && { metadata })
  });

  accessToken.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true
  });

  const token = await accessToken.toJwt();
  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();

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
    await client.createDispatch(roomName, agentName, metadata ? { metadata } : {});
    return true;
  } catch (error) {
    console.error("LiveKit agent dispatch error", error);
    return false;
  }
}
