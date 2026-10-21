import { cookies } from "next/headers";
import { SESSION_COOKIE, readSession } from "@/lib/auth";

export async function currentSession() {
  return readSession((await cookies()).get(SESSION_COOKIE)?.value);
}
