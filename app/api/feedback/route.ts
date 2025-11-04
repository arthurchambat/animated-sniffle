import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

interface TranscriptTurn {
  speaker: "candidate" | "avatar";
  text: string;
  latency_ms?: number;
  tags?: Record<string, unknown>;
}

interface FeedbackRequest {
  sessionId: string;
  transcript: TranscriptTurn[];
  metrics?: Record<string, unknown>;
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as FeedbackRequest;
  const { sessionId, transcript = [], metrics = {} } = payload;

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId requis" }, { status: 400 });
  }

  const openai = await getOpenAIClient();
  const supabase = getSupabaseAdminClient();

  const transcriptText = transcript
    .map((turn) => `${turn.speaker.toUpperCase()}: ${turn.text}`)
    .join("\n");

  let report =
    `## Résumé exécutif\n- Session ${sessionId}\n\n` +
    "## Forces\n- Clarté d'exposition\n\n## Priorités\n- Approfondir les chiffres clés";

  if (openai) {
    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Tu es un coach d'entretien finance. Structure le feedback avec les sections demandées (Résumé exécutif, Forces, Travailler en priorité, Erreurs techniques, Questions/Meilleures réponses, Plan 7 jours). Réponds en Markdown."
        },
        {
          role: "user",
          content: `Transcript:\n${transcriptText}\n\nMetrics:${JSON.stringify(metrics)}`
        }
      ]
    });

    report =
      completion.output
        ?.map((chunk) =>
          "content" in chunk
            ? chunk.content.map((piece) => ("text" in piece ? piece.text : "")).join("")
            : ""
        )
        .join("")
        .trim() ?? report;
  }

  if (supabase) {
    await supabase
      .from("feedbacks")
      .upsert(
        {
          session_id: sessionId,
          md_text: report,
          summary: metrics?.summary ?? null,
          strengths: metrics?.strengths ?? null,
          priorities: metrics?.priorities ?? null,
          resources: metrics?.resources ?? null
        },
        { onConflict: "session_id" }
      )
      .throwOnError();
  }

  return NextResponse.json({ report }, { status: 200 });
}
