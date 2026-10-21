"use client";

import { useState } from "react";

const faixas = [
  { max: 18.5, label: "Abaixo do peso", color: "text-sky-400" },
  { max: 25, label: "Peso normal", color: "text-emerald-400" },
  { max: 30, label: "Sobrepeso", color: "text-yellow-400" },
  { max: 35, label: "Obesidade grau I", color: "text-orange-400" },
  { max: 40, label: "Obesidade grau II", color: "text-red-400" },
  { max: Infinity, label: "Obesidade grau III", color: "text-red-500" },
];

export default function Imc() {
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");

  const p = Number(peso.replace(",", "."));
  let a = Number(altura.replace(",", "."));
  if (a > 3) a = a / 100;
  const imc = p > 0 && a > 0 ? p / (a * a) : null;
  const faixa = imc !== null ? faixas.find((f) => imc < f.max)! : null;

  return (
    <div className="card mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">⚖️ Calculadora de IMC</h1>
      <div className="space-y-3">
        <div>
          <label className="label">Peso (kg)</label>
          <input className="input" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="Ex: 70" inputMode="decimal" />
        </div>
        <div>
          <label className="label">Altura (m ou cm)</label>
          <input className="input" value={altura} onChange={(e) => setAltura(e.target.value)} placeholder="Ex: 1,75 ou 175" inputMode="decimal" />
        </div>
      </div>
      {imc !== null && faixa && (
        <div className="mt-6 rounded-xl bg-slate-950 p-4 text-center">
          <div className="text-4xl font-bold">{imc.toFixed(1).replace(".", ",")}</div>
          <div className={`mt-1 font-semibold ${faixa.color}`}>{faixa.label}</div>
        </div>
      )}
      <p className="mt-4 text-xs text-slate-500">Referência da OMS. Não substitui avaliação médica.</p>
    </div>
  );
}
