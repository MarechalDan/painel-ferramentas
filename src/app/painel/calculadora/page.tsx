"use client";

import { useCallback, useEffect, useState } from "react";
import { evaluate } from "@/lib/calc";

const keys = ["C", "(", ")", "÷", "7", "8", "9", "×", "4", "5", "6", "-", "1", "2", "3", "+", "0", ",", "⌫", "="];

export default function Calculadora() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const press = useCallback(
    (k: string) => {
      if (k === "C") {
        setExpr("");
        setResult("");
      } else if (k === "⌫") {
        setExpr((e) => e.slice(0, -1));
      } else if (k === "=") {
        if (!expr) return;
        try {
          const r = evaluate(expr).toLocaleString("pt-BR", { maximumFractionDigits: 10 });
          setResult(r);
          setHistory((h) => [`${expr} = ${r}`, ...h].slice(0, 10));
        } catch (err) {
          setResult((err as Error).message);
        }
      } else {
        setExpr((e) => e + k);
      }
    },
    [expr],
  );

  useEffect(() => {
    const map: Record<string, string> = { "*": "×", "/": "÷", Enter: "=", Backspace: "⌫", Escape: "C", ".": ",", "=": "=" };
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9()+\-,]$/.test(e.key)) press(e.key);
      else if (map[e.key]) {
        e.preventDefault();
        press(map[e.key]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  return (
    <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-[1fr_220px]">
      <div className="card">
        <h1 className="mb-4 text-2xl font-bold">🧮 Calculadora</h1>
        <div className="mb-4 rounded-xl bg-slate-950 p-4 text-right">
          <div className="min-h-6 break-all text-slate-400" data-testid="expr">{expr || "0"}</div>
          <div className="min-h-9 break-all text-3xl font-semibold" data-testid="result">{result}</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {keys.map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              className={`rounded-xl py-4 text-lg font-medium transition ${
                k === "=" ? "bg-indigo-600 hover:bg-indigo-500" : /[÷×\-+]/.test(k) ? "bg-slate-700 hover:bg-slate-600" : k === "C" ? "bg-red-600/80 hover:bg-red-500" : "bg-slate-800 hover:bg-slate-700"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Dica: dá pra usar o teclado também.</p>
      </div>
      <div className="card">
        <h2 className="mb-2 font-semibold">Histórico</h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">Nada ainda.</p>
        ) : (
          <ul className="space-y-1 text-sm text-slate-300">
            {history.map((h, i) => <li key={i} className="break-all">{h}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
