"use server";

import { currentSession } from "@/lib/session";

export type Rate = { code: string; name: string; bid: number; pctChange: number | null; updatedAt: string };
export type RatesResult = { rates: Rate[]; source: string } | { error: string };

const NAMES: Record<string, string> = {
  USD: "Dólar Americano",
  EUR: "Euro",
  GBP: "Libra Esterlina",
  ARS: "Peso Argentino",
  JPY: "Iene Japonês",
  BTC: "Bitcoin",
};
const CODES = Object.keys(NAMES);

async function fromAwesomeApi(): Promise<Rate[]> {
  const res = await fetch(`https://economia.awesomeapi.com.br/json/last/${CODES.map((c) => `${c}-BRL`).join(",")}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`AwesomeAPI HTTP ${res.status}`);
  const data = (await res.json()) as Record<string, { code: string; bid: string; pctChange: string; create_date: string }>;
  const rates = Object.values(data).map((d) => ({
    code: d.code,
    name: NAMES[d.code] ?? d.code,
    bid: Number(d.bid),
    pctChange: Number(d.pctChange),
    updatedAt: d.create_date,
  }));
  if (rates.length === 0) throw new Error("AwesomeAPI vazia");
  return rates;
}

async function fromFallback(): Promise<Rate[]> {
  const res = await fetch("https://open.er-api.com/v6/latest/BRL", { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`ER-API HTTP ${res.status}`);
  const data = (await res.json()) as { rates: Record<string, number>; time_last_update_utc: string };
  const updatedAt = new Date(data.time_last_update_utc).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const rates: Rate[] = CODES.filter((c) => data.rates[c]).map((c) => ({
    code: c,
    name: NAMES[c],
    bid: 1 / data.rates[c],
    pctChange: null,
    updatedAt,
  }));
  try {
    const btc = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=BTC", { cache: "no-store", signal: AbortSignal.timeout(8000) });
    const brl = Number((await btc.json())?.data?.rates?.BRL);
    if (brl) rates.push({ code: "BTC", name: NAMES.BTC, bid: brl, pctChange: null, updatedAt });
  } catch {}
  if (rates.length === 0) throw new Error("Fallback vazio");
  return rates;
}

export async function getRates(): Promise<RatesResult> {
  if (!(await currentSession())) return { error: "Sessão expirada. Faça login de novo." };
  try {
    return { rates: await fromAwesomeApi(), source: "AwesomeAPI" };
  } catch (e) {
    console.error("Cotação (AwesomeAPI) falhou:", e);
  }
  try {
    return { rates: await fromFallback(), source: "ExchangeRate-API / Coinbase" };
  } catch (e) {
    console.error("Cotação (fallback) falhou:", e);
    return { error: "Não foi possível obter as cotações agora. Tente de novo em instantes." };
  }
}
