import { NextResponse } from "next/server";
import { getFcl055dSession } from "@/lib/coach/session-registry";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { sessionId, text } = (await request.json().catch(() => ({}))) as {
    sessionId?: string;
    text?: string;
  };

  if (!sessionId || !text) {
    return NextResponse.json({ error: "sessionId et text requis" }, { status: 400 });
  }

  const entry = getFcl055dSession(sessionId);
  if (!entry) {
    return NextResponse.json({ error: "Session inconnue." }, { status: 404 });
  }

  await entry.service.sendUserText(text);

  return NextResponse.json({ ok: true }, { status: 200 });
}
