import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "sessao";
const SESSION_HOURS = 8;

function secretKey() {
  const secret = process.env.AUTH_SECRET || "dev-secret-troque-em-producao-1234567890";
  return new TextEncoder().encode(secret);
}

function allowedUsers(): Record<string, string> {
  const users: Record<string, string> = {};
  const list = process.env.APP_USERS;
  if (list) {
    for (const pair of list.split(",")) {
      const idx = pair.indexOf(":");
      if (idx > 0) users[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
    }
  }
  if (Object.keys(users).length === 0) users.admin = "admin123";
  return users;
}

export function checkCredentials(user: string, password: string) {
  const users = allowedUsers();
  return Object.prototype.hasOwnProperty.call(users, user) && users[user] === password;
}

export async function createSession(user: string) {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());
}

export async function readSession(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return typeof payload.user === "string" ? { user: payload.user } : null;
  } catch {
    return null;
  }
}

export const sessionMaxAge = SESSION_HOURS * 60 * 60;
