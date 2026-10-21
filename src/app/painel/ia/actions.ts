"use server";

import { currentSession } from "@/lib/session";

export type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM = "Você é um assistente útil, simpático e objetivo. Responda em português do Brasil, a menos que o usuário peça outro idioma.";
const GEMINI_MODELS = [process.env.GEMINI_MODEL, "gemini-flash-latest", "gemini-flash-lite-latest"].filter(Boolean) as string[];

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function askGemini(messages: Msg[], key: string) {
  let lastError: unknown;
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        }),
        signal: AbortSignal.timeout(60000),
      });
      const data = await res.json();
      if (!res.ok) throw new HttpError(res.status, data?.error?.message || `Gemini HTTP ${res.status}`);
      return (data.candidates?.[0]?.content?.parts ?? [])
        .filter((p: { thought?: boolean }) => !p.thought)
        .map((p: { text?: string }) => p.text ?? "")
        .join("");
    } catch (e) {
      lastError = e;
      if (!(e instanceof HttpError && e.status === 404)) break;
    }
  }
  throw lastError;
}

async function askGroq(messages: Msg[], key: string) {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages: [{ role: "system", content: SYSTEM }, ...messages] }),
    signal: AbortSignal.timeout(60000),
  });
  const data = await res.json();
  if (!res.ok) throw new HttpError(res.status, data?.error?.message || `Groq HTTP ${res.status}`);
  return data.choices?.[0]?.message?.content ?? "";
}

export async function chat(input: Msg[]): Promise<{ reply: string } | { error: string }> {
  if (!(await currentSession())) return { error: "Sessão expirada. Faça login de novo." };

  const messages = (Array.isArray(input) ? input : [])
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (messages.length === 0) return { error: "Mensagem vazia." };

  const gemini = process.env.GEMINI_API_KEY;
  const groq = process.env.GROQ_API_KEY;
  if (!gemini && !groq) {
    return { error: "IA não configurada. Defina GEMINI_API_KEY ou GROQ_API_KEY nas variáveis de ambiente." };
  }

  try {
    const reply = gemini ? await askGemini(messages, gemini) : await askGroq(messages, groq!);
    return { reply: reply || "(sem resposta)" };
  } catch (e) {
    console.error("Erro na IA:", e);
    if (e instanceof HttpError && (e.status === 400 || e.status === 401 || e.status === 403)) {
      return { error: "A chave da IA foi recusada. Confira a variável GEMINI_API_KEY/GROQ_API_KEY." };
    }
    if (e instanceof HttpError && e.status === 429) {
      return { error: "Limite gratuito da IA atingido. Espere um pouco e tente de novo." };
    }
    return { error: "A IA não respondeu agora. Tente de novo em instantes." };
  }
}
