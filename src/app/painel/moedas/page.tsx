"use client";

import { useEffect, useMemo, useState } from "react";
import { getRates, type Rate } from "./actions";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: v < 1 ? 4 : 2 });

export default function Moedas() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("BRL");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getRates();
      if ("error" in data) throw new Error(data.error);
      setRates(data.rates);
      setSource(data.source);
    } catch (e) {
      setError((e as Error).message || "Erro ao carregar cotações");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const toBrl = useMemo(() => {
    const m: Record<string, number> = { BRL: 1 };
    rates.forEach((r) => (m[r.code] = r.bid));
    return m;
  }, [rates]);

  const value = Number(amount.replace(",", "."));
  const converted = toBrl[from] && toBrl[to] && !Number.isNaN(value) ? (value * toBrl[from]) / toBrl[to] : null;
  const codes = Object.keys(toBrl);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">💵 Cotação e conversor</h1>
        <button onClick={load} className="btn" disabled={loading}>{loading ? "Atualizando..." : "Atualizar"}</button>
      </div>
      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-red-400">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rates.map((r) => (
          <div key={r.code} className="card">
            <div className="text-sm text-slate-400">{r.name} ({r.code})</div>
            <div className="mt-1 text-2xl font-bold">{brl(r.bid)}</div>
            {r.pctChange !== null && (
              <div className={`text-sm ${r.pctChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {r.pctChange >= 0 ? "▲" : "▼"} {r.pctChange.toFixed(2)}% hoje
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Converter</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_1fr] sm:items-end">
          <div>
            <label className="label">Valor</label>
            <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
          </div>
          <div>
            <label className="label">De</label>
            <select className="input" value={from} onChange={(e) => setFrom(e.target.value)}>
              {codes.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="rounded-lg px-3 py-2 hover:bg-slate-800" onClick={() => { setFrom(to); setTo(from); }} title="Inverter">⇄</button>
          <div>
            <label className="label">Para</label>
            <select className="input" value={to} onChange={(e) => setTo(e.target.value)}>
              {codes.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 text-3xl font-bold text-indigo-300" data-testid="conversion">
          {converted !== null
            ? `${converted.toLocaleString("pt-BR", { maximumFractionDigits: converted < 1 ? 8 : 2 })} ${to}`
            : "—"}
        </div>
        {rates[0] && <p className="mt-2 text-xs text-slate-500">Fonte: {source} · atualizado em {rates[0].updatedAt}</p>}
      </div>
    </div>
  );
}
