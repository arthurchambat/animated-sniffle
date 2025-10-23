import questionsSeed from "../seeds/questions.json";

export type QuestionType = "technical" | "marche" | "fit" | "brainteaser";

export interface SeedQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  difficulty: "starter" | "intermediate" | "advanced";
  tags: string[];
}

type SeedBundle = {
  generated_at: string;
  questions: Record<string, Record<string, Record<string, SeedQuestion[]>>>;
};

const data = questionsSeed as SeedBundle;

export function listDomains() {
  return Object.keys(data.questions);
}

export function listRoles(domain: string) {
  return Object.keys(data.questions[domain] ?? {});
}

export function listLevels(domain: string, role: string) {
  return Object.keys(data.questions[domain]?.[role] ?? {});
}

export function getQuestions(domain: string, role: string, level: string): SeedQuestion[] {
  return data.questions[domain]?.[role]?.[level] ?? [];
}
