// Avaliador de expressões simples (sem eval): + - * / % ^ e parênteses.
export function evaluate(expr: string): number {
  const tokens = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/,/g, ".").match(/\d*\.?\d+|[-+*/%^()]/g);
  if (!tokens || tokens.join("") !== expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/,/g, ".").replace(/\s+/g, "")) {
    throw new Error("Expressão inválida");
  }
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function primary(): number {
    const t = next();
    if (t === undefined) throw new Error("Expressão incompleta");
    if (t === "(") {
      const v = additive();
      if (next() !== ")") throw new Error("Parêntese não fechado");
      return v;
    }
    if (t === "-") return -primary();
    if (t === "+") return primary();
    const n = Number(t);
    if (Number.isNaN(n)) throw new Error("Expressão inválida");
    if (peek() === "%") {
      next();
      return n / 100;
    }
    return n;
  }
  function power(): number {
    const base = primary();
    if (peek() === "^") {
      next();
      return Math.pow(base, power());
    }
    return base;
  }
  function multiplicative(): number {
    let v = power();
    while (peek() === "*" || peek() === "/") {
      const op = next();
      const r = power();
      v = op === "*" ? v * r : v / r;
    }
    return v;
  }
  function additive(): number {
    let v = multiplicative();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      const r = multiplicative();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }

  const result = additive();
  if (pos < tokens.length) throw new Error("Expressão inválida");
  if (!Number.isFinite(result)) throw new Error("Divisão por zero");
  return Math.round(result * 1e10) / 1e10;
}
