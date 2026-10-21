"use client";

import { useEffect, useRef, useState } from "react";
import { chat, type Msg } from "./actions";

export default function Ia() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const data = await chat(next);
      if ("error" in data) throw new Error(data.error);
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError((err as Error).message || "Erro ao falar com a IA.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">🤖 Assistente IA</h1>
        {messages.length > 0 && (
          <button className="text-sm text-slate-400 hover:text-white" onClick={() => setMessages([])}>Limpar conversa</button>
        )}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && <p className="text-slate-500">Pergunte qualquer coisa: uma receita, uma dúvida de código, um resumo...</p>}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 ${m.role === "user" ? "bg-indigo-600" : "bg-slate-800"}`}>{m.content}</div>
          </div>
        ))}
        {loading && <div className="text-sm text-slate-400">A IA está pensando...</div>}
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="mt-4 flex gap-2">
        <input className="input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Digite sua mensagem..." />
        <button className="btn" disabled={loading || !input.trim()}>Enviar</button>
      </form>
    </div>
  );
}
