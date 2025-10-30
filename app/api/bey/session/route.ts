import { NextResponse } from "next/server";
import {
  createBeyondPresenceSession,
  type BeyondPresenceSessionRequest
} from "@/lib/bey";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as BeyondPresenceSessionRequest;

  try {
    const session = await createBeyondPresenceSession(body);
    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Beyond Presence init error", error);
    return NextResponse.json({ error: "Impossible de créer la session Beyond Presence." }, { status: 500 });
  }
}
