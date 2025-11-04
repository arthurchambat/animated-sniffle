import { getOpenAIClient } from "@/lib/openai";
import { BaseFeedbackService, type FeedbackContext } from "./base-feedback.service";

interface Fcl055dFeedback {
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  raw?: string;
}

export class Fcl055dFeedbackService extends BaseFeedbackService {
  async generate(context: FeedbackContext): Promise<Fcl055dFeedback | null> {
    const openai = await getOpenAIClient();

    if (!openai) {
      return {
        summary:
          "Aucun feedback automatisé disponible (clé OpenAI manquante). Pensez à renseigner OPENAI_API_KEY pour activer l'analyse.",
        strengths: [],
        improvements: [],
        recommendations: []
      };
    }

    if (!context.transcript.length) {
      return {
        summary: "La session n'a pas produit de transcript. Impossible de générer un feedback.",
        strengths: [],
        improvements: [],
        recommendations: []
      };
    }

    const transcriptText = context.transcript
      .map((turn) => {
        const rawTimestamp =
          turn.timestamp instanceof Date ? turn.timestamp : new Date(turn.timestamp);
        const timestamp = rawTimestamp.toISOString();
        const speaker = turn.role === "coach" ? "COACH" : "CANDIDATE";
        return `[${timestamp}] ${speaker}: ${turn.text}`;
      })
      .join("\n");

    const prompt = [
      {
        role: "system" as const,
        content:
          "You are FCL-055d, an aviation English examiner. Produce structured feedback in JSON with the keys: summary (string), strengths (array of strings), improvements (array of strings), recommendations (array of strings)."
      },
      {
        role: "user" as const,
        content: `Analyse the following transcript of a coaching session and provide targeted feedback for the pilot preparing the FCL.055d exam.

Transcript:
${transcriptText}

Return JSON respecting the schema described earlier.`
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages: prompt
    });

    const content = completion.choices[0]?.message?.content ?? "";

    try {
      const parsed = JSON.parse(content) as Fcl055dFeedback;
      return parsed;
    } catch {
      return {
        summary: content || "Feedback généré, mais impossible de parser la sortie en JSON.",
        strengths: [],
        improvements: [],
        recommendations: [],
        raw: content
      };
    }
  }
}
