import { NextResponse } from "next/server";
import { destroyFcl055dSession, getFcl055dSession } from "@/lib/coach/session-registry";

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

  const result = await entry.service.end();
  destroyFcl055dSession(sessionId);

  return NextResponse.json({ ok: true, sessionId, result }, { status: 200 });
}
