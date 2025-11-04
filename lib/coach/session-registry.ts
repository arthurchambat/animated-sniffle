import { EventEmitter } from "events";
import { Fcl055dCoachService } from "./fcl055d-coach.service";

type CoachEvent = Record<string, unknown>;

class CoachSessionChannel {
  private readonly emitter = new EventEmitter();

  send(event: CoachEvent) {
    this.emitter.emit("event", event);
  }

  subscribe(handler: (event: CoachEvent) => void) {
    this.emitter.on("event", handler);
    return () => {
      this.emitter.off("event", handler);
    };
  }

  dispose() {
    this.emitter.removeAllListeners();
  }
}

interface FclSessionEntry {
  service: Fcl055dCoachService;
  channel: CoachSessionChannel;
}

const sessions = new Map<string, FclSessionEntry>();

export function createFcl055dSession(apiKey: string, sessionId: string) {
  let entry = sessions.get(sessionId);
  let created = false;

  if (!entry) {
    const channel = new CoachSessionChannel();
    const service = new Fcl055dCoachService(apiKey, sessionId, (payload) => {
      channel.send(payload as CoachEvent);
    });
    entry = { service, channel };
    sessions.set(sessionId, entry);
    created = true;
  }

  return { entry, created };
}

export function getFcl055dSession(sessionId: string): FclSessionEntry | undefined {
  return sessions.get(sessionId);
}

export function subscribeToFcl055dSession(
  sessionId: string,
  handler: (event: CoachEvent) => void
): (() => void) | null {
  const entry = sessions.get(sessionId);
  if (!entry) return null;
  return entry.channel.subscribe(handler);
}

export function destroyFcl055dSession(sessionId: string) {
  const entry = sessions.get(sessionId);
  if (!entry) return;

  entry.service.disconnect();
  entry.channel.dispose();
  sessions.delete(sessionId);
}

export function listFcl055dSessions(): string[] {
  return Array.from(sessions.keys());
}
