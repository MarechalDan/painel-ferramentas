"use client";

import { useState } from "react";

type Category = { label: string; units: Record<string, { name: string; toBase: (v: number) => number; fromBase: (v: number) => number }> };

const linear = (name: string, factor: number) => ({ name, toBase: (v: number) => v * factor, fromBase: (v: number) => v / factor });

const categories: Record<string, Category> = {
  distancia: {
    label: "Distância",
    units: { m: linear("Metros", 1), km: linear("Quilômetros", 1000), cm: linear("Centímetros", 0.01), mi: linear("Milhas", 1609.344), ft: linear("Pés", 0.3048), in: linear("Polegadas", 0.0254) },
  },
  peso: {
    label: "Peso",
    units: { kg: linear("Quilogramas", 1), g: linear("Gramas", 0.001), t: linear("Toneladas", 1000), lb: linear("Libras", 0.45359237), oz: linear("Onças", 0.028349523125) },
  },
  temperatura: {
    label: "Temperatura",
    units: {
      c: { name: "Celsius", toBase: (v) => v, fromBase: (v) => v },
      f: { name: "Fahrenheit", toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      k: { name: "Kelvin", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    },
  },
  velocidade: {
    label: "Velocidade",
    units: { kmh: linear("km/h", 1), ms: linear("m/s", 3.6), mph: linear("mph", 1.609344), kn: linear("Nós", 1.852) },
  },
};

export default function Unidades() {
  const [cat, setCat] = useState("distancia");
  const [value, setValue] = useState("1");
  const units = categories[cat].units;
  const keys = Object.keys(units);
  const [from, setFrom] = useState(keys[0]);
  const [to, setTo] = useState(keys[1]);

  function changeCat(c: string) {
    const k = Object.keys(categories[c].units);
    setCat(c);
    setFrom(k[0]);
    setTo(k[1]);
  }

  const n = Number(value.replace(",", "."));
  const result = units[from] && units[to] && !Number.isNaN(n) ? units[to].fromBase(units[from].toBase(n)) : null;

  return (
    <div className="card mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">📏 Conversor de unidades</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(categories).map(([k, c]) => (
          <button key={k} onClick={() => changeCat(k)} className={`rounded-full px-4 py-1 text-sm ${cat === k ? "bg-indigo-600" : "bg-slate-800 hover:bg-slate-700"}`}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="label">Valor</label>
          <input className="input" value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" />
        </div>
        <div>
          <label className="label">De</label>
          <select className="input" value={from} onChange={(e) => setFrom(e.target.value)}>
            {keys.map((k) => <option key={k} value={k}>{units[k].name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Para</label>
          <select className="input" value={to} onChange={(e) => setTo(e.target.value)}>
            {keys.map((k) => <option key={k} value={k}>{units[k].name}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-6 text-3xl font-bold text-indigo-300">
        {result !== null ? `${result.toLocaleString("pt-BR", { maximumFractionDigits: 6 })} ${units[to].name}` : "—"}
      </div>
    </div>
  );
}
