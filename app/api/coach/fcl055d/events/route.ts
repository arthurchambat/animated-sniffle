import { NextResponse } from "next/server";
import {
  getFcl055dSession,
  subscribeToFcl055dSession
} from "@/lib/coach/session-registry";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return new NextResponse("sessionId requis", { status: 400 });
  }

  if (!getFcl055dSession(sessionId)) {
    return new NextResponse("Session inconnue", { status: 404 });
  }

  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(`data: ${JSON.stringify(event)}\n\n`);
      };

      const unsubscribe = subscribeToFcl055dSession(sessionId, send);
      if (!unsubscribe) {
        controller.error(new Error("Session inconnue"));
        return;
      }
      const keepAlive = setInterval(() => {
        controller.enqueue(`: keep-alive ${Date.now()}\n\n`);
      }, 15000);

      send({ type: "connected", sessionId });

      cleanup = () => {
        unsubscribe();
        clearInterval(keepAlive);
      };
    },
    cancel() {
      cleanup?.();
      cleanup = null;
    }
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
