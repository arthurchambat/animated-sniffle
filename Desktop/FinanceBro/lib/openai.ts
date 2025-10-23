"use server";

import OpenAI from "openai";

let openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  if (openai) {
    return openai;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  openai = new OpenAI({ apiKey });
  return openai;
}
