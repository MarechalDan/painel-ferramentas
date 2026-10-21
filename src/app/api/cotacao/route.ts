import { NextResponse } from "next/server";

const PAIRS = ["USD-BRL", "EUR-BRL", "GBP-BRL", "ARS-BRL", "JPY-BRL", "BTC-BRL"];

export async function GET() {
  try {
    const res = await fetch(`https://economia.awesomeapi.com.br/json/last/${PAIRS.join(",")}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as Record<string, { code: string; name: string; bid: string; pctChange: string; create_date: string }>;
    const rates = Object.values(data).map((d) => ({
      code: d.code,
      name: d.name.split("/")[0],
      bid: Number(d.bid),
      pctChange: Number(d.pctChange),
      updatedAt: d.create_date,
    }));
    return NextResponse.json({ rates });
  } catch {
    return NextResponse.json({ error: "Não foi possível obter as cotações agora." }, { status: 502 });
  }
}
