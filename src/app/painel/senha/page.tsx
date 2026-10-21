"use client";

import { useCallback, useEffect, useState } from "react";

const sets = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%&*()-_=+[]{};:,.?/",
};
type SetKey = keyof typeof sets;
const labels: Record<SetKey, string> = { upper: "Maiúsculas", lower: "Minúsculas", digits: "Números", symbols: "Símbolos" };

function randomIndex(max: number) {
  const buf = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % max;
}

export default function Senha() {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState<Record<SetKey, boolean>>({ upper: true, lower: true, digits: true, symbols: true });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const active = (Object.keys(opts) as SetKey[]).filter((k) => opts[k]);
    if (active.length === 0) return setPassword("");
    const chars = active.map((k) => sets[k][randomIndex(sets[k].length)]);
    const pool = active.map((k) => sets[k]).join("");
    while (chars.length < length) chars.push(pool[randomIndex(pool.length)]);
    for (let i = chars.length - 1; i > 0; i--) {
      const j = randomIndex(i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    setPassword(chars.join(""));
    setCopied(false);
  }, [length, opts]);

  useEffect(() => {
    generate();
  }, [generate]);

  async function copy() {
    await navigator.clipboard.writeText(password);
    setCopied(true);
  }

  return (
    <div className="card mx-auto max-w-lg">
      <h1 className="mb-4 text-2xl font-bold">🔐 Gerador de senha</h1>
      <div className="flex gap-2">
        <input className="input font-mono text-lg" readOnly value={password} />
        <button className="btn" onClick={copy} disabled={!password}>{copied ? "Copiado!" : "Copiar"}</button>
      </div>
      <div className="mt-5">
        <label className="label">Tamanho: {length}</label>
        <input type="range" min={6} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-indigo-500" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {(Object.keys(sets) as SetKey[]).map((k) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={opts[k]} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })} className="accent-indigo-500" />
            {labels[k]}
          </label>
        ))}
      </div>
      <button className="btn mt-5 w-full" onClick={generate}>Gerar outra</button>
    </div>
  );
}
