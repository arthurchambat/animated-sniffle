import { NextResponse } from "next/server";
import { getFcl055dSession } from "@/lib/coach/session-registry";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { sessionId, audio } = (await request.json().catch(() => ({}))) as {
    sessionId?: string;
    audio?: string;
  };

  if (!sessionId || !audio) {
    return NextResponse.json({ error: "sessionId et audio requis" }, { status: 400 });
  }

  const entry = getFcl055dSession(sessionId);
  if (!entry) {
    return NextResponse.json({ error: "Session inconnue." }, { status: 404 });
  }

  try {
    await entry.service.sendAudio(audio);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("FCL055d audio error", error);
    return NextResponse.json(
      { error: "Impossible d'envoyer l'audio (coach non connecté)." },
      { status: 500 }
    );
  }
}
