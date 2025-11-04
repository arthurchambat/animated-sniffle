import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

export const runtime = "nodejs";

interface SuggestBody {
  domain: string;
  role: string;
  level: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<SuggestBody>;
  const { domain = "market_finance", role = "sales_trading", level = "analyst" } = body;

  const openai = await getOpenAIClient();

  if (!openai) {
    return NextResponse.json(
      {
        suggestion: `Session recommandée : ${domain} - ${role} - ${level}. Focus sur latence, précision chiffrée et storytelling exemples chiffrés.`,
        note: "OPENAI_API_KEY manquant : réponse stub."
      },
      { status: 200 }
    );
  }

  const completion = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content:
          "Tu es un coach d'entretien finance. Propose un plan court (3 bullet points) pour une session mock."
      },
      {
        role: "user",
        content: `Prépare une suggestion pour un candidat niveau ${level} en ${role} (${domain}).`
      }
    ]
  });

  const textOutput =
    completion.output
      ?.map((item) => ("content" in item ? item.content.map((c) => ("text" in c ? c.text : "")).join(" ") : ""))
      .join("\n")
      .trim() ?? "Session recommandée prête.";

  return NextResponse.json(
    {
      suggestion: textOutput
    },
    { status: 200 }
  );
}
