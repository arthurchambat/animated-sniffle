"use server";

import OpenAI from "openai";

let openai: OpenAI | null = null;

export async function getOpenAIClient(): Promise<OpenAI | null> {
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
