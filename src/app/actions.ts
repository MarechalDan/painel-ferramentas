"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, checkCredentials, createSession, sessionMaxAge } from "@/lib/auth";

export type LoginState = { error: string; user: string } | null;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const user = String(formData.get("user") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!checkCredentials(user, password)) return { error: "Usuário ou senha inválidos.", user };

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSession(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAge,
  });
  redirect("/painel");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
