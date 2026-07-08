import OpenAI from "openai";

// AI Features v3.0 — satu API key untuk semua fitur AI (Best Shot, Story,
// Smart Gallery). Cuma dipakai di server (API Routes), TIDAK PERNAH di-expose
// ke client. Simpan OPENAI_API_KEY di Vercel Environment Variables.

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY belum diset di environment variables.");
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}
