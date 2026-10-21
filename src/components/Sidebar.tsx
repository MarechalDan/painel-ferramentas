"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools } from "@/lib/tools";
import { logout } from "@/app/actions";

export default function Sidebar({ user }: { user: string }) {
  const pathname = usePathname();
  const link = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm transition ${
        pathname === href ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <aside className="flex flex-col gap-4 border-b border-slate-800 bg-slate-900 p-4 md:min-h-screen md:w-64 md:border-r md:border-b-0">
      <Link href="/painel" className="text-lg font-bold">🧰 Ferramentas</Link>
      <nav className="flex flex-wrap gap-1 md:flex-col">
        {link("/painel", "🏠 Início")}
        {tools.map((t) => link(t.href, `${t.icon} ${t.name}`))}
      </nav>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-800 pt-4 text-sm">
        <span className="truncate text-slate-400">👤 {user}</span>
        <form action={logout}>
          <button className="rounded-lg px-3 py-1 text-red-400 hover:bg-red-500/10">Sair</button>
        </form>
      </div>
    </aside>
  );
}
