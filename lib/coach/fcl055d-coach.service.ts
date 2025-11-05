import {
  BaseCoachService,
  type CoachConfig,
  type CoachHooks,
  type SessionContext
} from "./base-coach.service";
import { fcl055dCoachPrompt } from "./config/prompts/fcl055d-coach";
import { Fcl055dFeedbackService } from "./feedback/fcl055d-feedback.service";

type CoachOutbound = (payload: any) => void;

class Fcl055dHooks implements CoachHooks {
  private readonly relayEvents = new Set([
    "session.created",
    "session.updated",
    "conversation.item.created",
    "response.done",
    "error"
  ]);

  private sequenceCounter = 0;

  constructor(private readonly send: CoachOutbound) {}

  private emit(payload: any) {
    try {
      this.send(payload);
    } catch (err) {
      console.error("Fcl055dHooks emit error:", err);
    }
  }

  private shouldRelay(type: string): boolean {
    return this.relayEvents.has(type);
  }

  private sortTranscriptBySequence(ctx: SessionContext): void {
    ctx.transcript.sort((a: any, b: any) => (a.sequence ?? 0) - (b.sequence ?? 0));
    console.log("🔄 Sorted transcript by sequence, now has", ctx.transcript.length, "items");
  }

  private addTranscriptItem(
    ctx: SessionContext,
    role: "user" | "coach",
    text: string,
    timestamp: Date
  ): void {
    const sequence = ++this.sequenceCounter;
    ctx.transcript.push({ role, text, timestamp, sequence } as any);
    console.log(`📝 Added ${role} transcript (seq: ${sequence}):`, text);
    this.sortTranscriptBySequence(ctx);
  }

  shouldEnd(ctx: SessionContext): boolean {
    const userTurns = ctx.transcript.filter((t) => t.role === "user").length;
    const coachTurns = ctx.transcript.filter((t) => t.role === "coach").length;
    const last = ctx.transcript.at(-1);

    const explicitStop =
      last?.role === "user" &&
      /(stop|enough|finish|terminate|end (the )?session|thank you so much|thanks for your time|good\s?bye)/i.test(
        last.text ?? ""
      );

    const reachedTurnBudget = userTurns >= 12 && coachTurns >= 12;

    const shouldEnd = explicitStop || reachedTurnBudget;

    console.log("🔍 shouldEnd check:", {
      userTurns,
      coachTurns,
      lastRole: last?.role,
      lastText: last?.text,
      explicitStop,
      reachedTurnBudget,
      shouldEnd
    });

    return shouldEnd;
  }

  async onUserText(text: string, ctx: SessionContext): Promise<void> {
    this.addTranscriptItem(ctx, "user", text, new Date());

    if (this.shouldEnd(ctx)) {
      console.log("🛑 Session should end - triggering automatic session end");
      this.emit({ type: "session.end" });
    }
  }

  async onOAIRawEvent(evt: any, ctx: SessionContext): Promise<void> {
    const type = evt?.type;

    if (type && this.shouldRelay(type)) {
      this.emit({ type: "openai.event", event: evt });
    }

    if (type === "response.audio.delta" || type === "response.output_audio.delta") {
      const audio = evt?.delta;
      if (typeof audio === "string" && audio.length > 0) {
        this.emit({ type: "audio.delta", audio });
      }
    }

    if (type === "response.audio.done" || type === "response.output_audio.done") {
      this.emit({ type: "audio.done" });
    }

    if (type === "conversation.item.input_audio_transcription.completed") {
      const text = evt?.transcript;
      if (typeof text === "string" && text.length > 0) {
        const timestamp = evt?.created_at ? new Date(evt.created_at * 1000) : new Date();
        this.addTranscriptItem(ctx, "user", text, timestamp);
        this.emit({
          type: "transcript",
          role: "user",
          text,
          timestamp: timestamp.toISOString()
        });

        if (this.shouldEnd(ctx)) {
          console.log(
            "🛑 Session should end after audio transcription - triggering automatic session end"
          );
          this.emit({ type: "session.end" });
        }
      }
    }

    if (type === "response.audio_transcript.done" || type === "response.output_text.done") {
      const text = evt?.transcript ?? evt?.output_text?.[0]?.text;
      if (typeof text === "string" && text.length > 0) {
        const timestamp = evt?.created_at ? new Date(evt.created_at * 1000) : new Date();
        this.addTranscriptItem(ctx, "coach", text, timestamp);
        this.emit({
          type: "transcript",
          role: "coach",
          text,
          timestamp: timestamp.toISOString()
        });
      }
    }

    if (type === "input_audio_buffer.speech_started") {
      console.log("🎤 Speech started");
      this.emit({ type: "speech.started" });
    }

    if (type === "input_audio_buffer.speech_stopped") {
      console.log("🎤 Speech stopped");
      this.emit({ type: "speech.stopped" });
    }

    if (type === "response.created") {
      const items = evt?.response?.output ?? [];
      for (const item of items) {
        const text = this.extractFirstText?.(item);
        if (text) {
          this.addTranscriptItem(ctx, "coach", text, new Date());
          this.emit({
            type: "transcript",
            role: "coach",
            text,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }
}

export class Fcl055dCoachService extends BaseCoachService {
  protected readonly hooks: Fcl055dHooks;

  constructor(apiKey: string, sessionId: string, send: CoachOutbound) {
    const hooks = new Fcl055dHooks(send);

    const cfg: CoachConfig = {
      role: "voice-coach",
      systemPrompt: fcl055dCoachPrompt,
      greeting:
        "Let's dive into your finance background. Start by walking me through a recent deal, trade, or portfolio decision you're proud of—highlight the rationale, data you used, and the outcome.",
      model: "gpt-4o-realtime-preview-2024-10-01",
      voice: "alloy",
      temperature: 0.6,
      audioProcessing: {
        commitIntervalFrames: 4800,
        silenceFlushFrames: 4,
        silenceDelayMs: 750
      }
    };

    super(apiKey, sessionId, cfg, hooks, new Fcl055dFeedbackService());

    this.hooks = hooks;
  }
}
