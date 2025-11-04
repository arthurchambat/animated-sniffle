import type { CoachConfig, SessionContext, Turn } from "../base-coach.service";

export interface FeedbackContext {
  transcript: Turn[];
  session: SessionContext;
  config: CoachConfig;
}

export interface FeedbackStrategy {
  generate(context: FeedbackContext): Promise<unknown>;
}

/**
 * Default feedback strategy that can be extended for specific coaches.
 * The base implementation simply returns null which callers can handle
 * as "no automated feedback available".
 */
export class BaseFeedbackService implements FeedbackStrategy {
  async generate(): Promise<null> {
    return null;
  }
}
