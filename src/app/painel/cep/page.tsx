"use client";

import { useState } from "react";

type Endereco = { cep: string; logradouro: string; bairro: string; localidade: string; uf: string; ddd: string };

export default function Cep() {
  const [cep, setCep] = useState("");
  const [data, setData] = useState<Endereco | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    const digits = cep.replace(/\D/g, "");
    setData(null);
    setError("");
    if (digits.length !== 8) return setError("O CEP precisa ter 8 dígitos.");
    setLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const json = await res.json();
      if (json.erro) throw new Error("CEP não encontrado.");
      setData(json);
    } catch (err) {
      setError((err as Error).message || "Erro ao consultar CEP.");
    } finally {
      setLoading(false);
    }
  }

  const rows: [string, keyof Endereco][] = [["CEP", "cep"], ["Rua", "logradouro"], ["Bairro", "bairro"], ["Cidade", "localidade"], ["UF", "uf"], ["DDD", "ddd"]];

  return (
    <div className="card mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">📮 Consulta de CEP</h1>
      <form onSubmit={buscar} className="flex gap-2">
        <input className="input" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" inputMode="numeric" />
        <button className="btn" disabled={loading}>{loading ? "..." : "Buscar"}</button>
      </form>
      {error && <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
      {data && (
        <dl className="mt-4 divide-y divide-slate-800 rounded-xl bg-slate-950">
          {rows.map(([label, key]) => (
            <div key={key} className="flex justify-between gap-4 px-4 py-2 text-sm">
              <dt className="text-slate-400">{label}</dt>
              <dd className="text-right">{data[key] || "—"}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
