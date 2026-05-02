import type { LiuYaoFormData, LiuYaoResult, DailyGuidance } from "@/types";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://destiny-bridge-production.up.railway.app";

export async function castHexagram(data: LiuYaoFormData, lang?: "en" | "zh"): Promise<LiuYaoResult> {
  const res = await fetch(`${BASE_URL}/api/liuyao`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, lang: lang || "en" }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface VentReply {
  emotionalNote: string;
  emotionalNoteEn: string;
  elementReframe: string;
  elementReframeEn: string;
  suggestion: string;
  suggestionEn: string;
}

export async function chatWithClara(
  message: string,
  profile: Record<string, unknown>,
  lang?: "en" | "zh"
): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/vent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, profile }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const data: VentReply = await res.json();

  // Format the structured response into a readable message
  if (lang === "zh") {
    return `${data.emotionalNote}\n\n${data.elementReframe}\n\n${data.suggestion}`;
  }
  return `${data.emotionalNoteEn}\n\n${data.elementReframeEn}\n\n${data.suggestionEn}`;
}

export async function sendFeedback(message: string, category?: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, category, source: "mobile" }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getDailyGuidance(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  gender: string,
  birthplaceCity?: string,
  lang?: "en" | "zh"
): Promise<DailyGuidance> {
  const res = await fetch(`${BASE_URL}/api/daily`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      birthYear,
      birthMonth,
      birthDay,
      birthHour,
      gender,
      birthplaceCity,
      lang: lang || "en",
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const json = await res.json();
  if (json.dailyGuidance) return json.dailyGuidance;
  if (json.error) throw new Error(json.error);
  throw new Error("Daily guidance not available");
}
