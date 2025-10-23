"use server";

export interface BeyondPresenceSessionRequest {
  agentProfileId?: string;
  persona?: string;
  streamUrl?: string;
  locale?: string;
}

export interface BeyondPresenceSessionResponse {
  sessionId: string;
  sdp?: string;
  streamUrl?: string;
  expiresAt?: string;
  stub?: boolean;
}

const API_BASE =
  process.env.BEYOND_PRESENCE_API_BASE ?? "https://api.beyondpresence.ai/v1";

export async function createBeyondPresenceSession(
  payload: BeyondPresenceSessionRequest
): Promise<BeyondPresenceSessionResponse> {
  const apiKey = process.env.BEYOND_PRESENCE_API_KEY;

  if (!apiKey) {
    return {
      sessionId: "stub-bey-session",
      streamUrl: "https://example.com/placeholder-stream",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      stub: true
    };
  }

  const response = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Beyond Presence session error: ${response.statusText}`);
  }

  const data = (await response.json()) as BeyondPresenceSessionResponse;
  return data;
}
