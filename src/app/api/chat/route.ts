import { NextResponse } from "next/server";

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM = "Você é um assistente útil, simpático e objetivo. Responda em português do Brasil, a menos que o usuário peça outro idioma.";

async function askGemini(messages: Msg[], key: string) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Gemini HTTP ${res.status}`);
  return (data.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");
}

async function askGroq(messages: Msg[], key: string) {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages: [{ role: "system", content: SYSTEM }, ...messages] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Groq HTTP ${res.status}`);
  return data.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const messages: Msg[] = Array.isArray(body?.messages)
    ? body.messages
        .filter((m: Msg) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .slice(-20)
        .map((m: Msg) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    : [];
  if (messages.length === 0) return NextResponse.json({ error: "Mensagem vazia." }, { status: 400 });

  const gemini = process.env.GEMINI_API_KEY;
  const groq = process.env.GROQ_API_KEY;
  if (!gemini && !groq) {
    return NextResponse.json(
      { error: "IA não configurada. Defina GEMINI_API_KEY ou GROQ_API_KEY nas variáveis de ambiente." },
      { status: 503 },
    );
  }

  try {
    const reply = gemini ? await askGemini(messages, gemini) : await askGroq(messages, groq!);
    return NextResponse.json({ reply: reply || "(sem resposta)" });
  } catch (e) {
    console.error("Erro na IA:", e);
    return NextResponse.json({ error: "A IA não respondeu agora. Tente de novo em instantes." }, { status: 502 });
  }
}
