import { NextResponse } from "next/server";
import {
  createBeyondPresenceSession
} from "@/lib/bey";
import type { BeyondPresenceSessionRequest } from "@/lib/bey/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as BeyondPresenceSessionRequest;

  try {
    console.log("[API] Creating Beyond Presence session with:", body);
    const session = await createBeyondPresenceSession(body);
    console.log("[API] Session created:", {
      sessionId: session.sessionId,
      roomName: session.roomName,
      agentDispatched: session.agentDispatched,
      agentName: session.agentName
    });
    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Beyond Presence init error", error);
    return NextResponse.json({ error: "Impossible de créer la session Beyond Presence." }, { status: 500 });
  }
}
