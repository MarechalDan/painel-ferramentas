import Link from "next/link";
import { tools } from "@/lib/tools";

export default function PainelHome() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold">Olá! 👋</h1>
      <p className="mt-1 text-slate-400">Escolha uma ferramenta para começar.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.href} href={t.href} className="card transition hover:-translate-y-0.5 hover:border-indigo-500">
            <div className="text-3xl">{t.icon}</div>
            <h2 className="mt-3 font-semibold">{t.name}</h2>
            <p className="text-sm text-slate-400">{t.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
