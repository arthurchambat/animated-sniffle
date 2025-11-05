import { NextResponse } from "next/server";
import { getFcl055dSession } from "@/lib/coach/session-registry";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { sessionId } = (await request.json().catch(() => ({}))) as {
    sessionId?: string;
  };

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId requis" }, { status: 400 });
  }

  const entry = getFcl055dSession(sessionId);
  if (!entry) {
    return NextResponse.json({ error: "Session inconnue." }, { status: 404 });
  }

  try {
    await entry.service.commitAudio();
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("FCL055d commit error", error);
    return NextResponse.json(
      { error: "Impossible de valider le buffer audio (coach déconnecté)." },
      { status: 500 }
    );
  }
}
