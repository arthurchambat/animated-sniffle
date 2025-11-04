import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST() {
  const openai = await getOpenAIClient();

  if (!openai) {
    return NextResponse.json(
      {
        token: "stub-ephemeral-token",
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        warning: "OPENAI_API_KEY manquant : token simulé."
      },
      { status: 200 }
    );
  }

  try {
    const session = await openai.realtime.sessions.create({
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "alloy",
      expires_in: 55,
      modalities: ["audio", "text"]
    });

    return NextResponse.json(
      {
        token: session.client_secret.value,
        expiresAt: session.expires_at
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Realtime token error", error);
    return NextResponse.json(
      { error: "Impossible de créer un token Realtime." },
      { status: 500 }
    );
  }
}
