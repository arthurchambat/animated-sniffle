import { NextResponse } from "next/server";
import { createFcl055dSession } from "@/lib/coach/session-registry";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { sessionId } = (await request.json().catch(() => ({}))) as {
    sessionId?: string;
  };

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId requis" }, { status: 400 });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const hasValidKey =
      typeof apiKey === "string" &&
      (apiKey.startsWith("sk-") || apiKey.startsWith("sk_pro") || apiKey.startsWith("sk-proj-"));

    if (!hasValidKey) {
      return NextResponse.json(
        {
          ok: false,
          sessionId,
          created: false,
          warning:
            "Clé OpenAI absente ou invalide. Le coach basculera en mode texte. Renseignez une clé commençant par sk- pour activer l'audio."
        },
        { status: 200 }
      );
    }

    const { entry, created } = createFcl055dSession(apiKey, sessionId);
    if (created) {
      await entry.service.start();
    }

    const audioProcessing = entry.service.getAudioProcessingConfig();

    return NextResponse.json(
      {
        ok: true,
        sessionId,
        created,
        audioProcessing
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("FCL055d start error", error);
    return NextResponse.json(
      { error: "Impossible de démarrer la session FCL055d." },
      { status: 500 }
    );
  }
}
