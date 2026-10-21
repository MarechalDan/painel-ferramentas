"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4">
      <form action={action} className="card w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="text-4xl">🧰</div>
          <h1 className="mt-2 text-2xl font-bold">Painel de Ferramentas</h1>
          <p className="text-sm text-slate-400">Entre para acessar suas ferramentas</p>
        </div>
        <div>
          <label className="label" htmlFor="user">Usuário</label>
          <input id="user" name="user" className="input" autoComplete="username" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Senha</label>
          <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
        </div>
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
        <button className="btn w-full" disabled={pending}>{pending ? "Entrando..." : "Entrar"}</button>
      </form>
    </main>
  );
}
