import { cookies } from "next/headers";

// Lightweight HMAC-signed session tokens implemented with the Web Crypto API
// so the exact same code runs in both the Node.js API routes and the Edge
// middleware (jsonwebtoken relies on Node's `crypto` module and cannot run
// in the Edge runtime that Next.js middleware uses).

export type Role = "customer" | "staff" | "owner";

export interface SessionPayload {
  role: Role;
  sub: string; // customer id ("staff"/"owner" for those roles, no per-account id yet)
  name: string;
  email?: string;
  exp: number; // unix seconds
}

const encoder = new TextEncoder();

function base64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === "string" ? encoder.encode(input) : new Uint8Array(input);
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBytes(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(input.length + ((4 - (input.length % 4)) % 4), "=");
  const str = atob(padded);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

async function getKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return secret;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const secret = getSecret();
  const body = base64url(JSON.stringify(payload));
  const key = await getKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return `${body}.${base64url(signature)}`;
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  try {
    const secret = getSecret();
    const key = await getKey(secret);
    const valid = await crypto.subtle.verify("HMAC", key, base64urlToBytes(sig) as BufferSource, encoder.encode(body));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64urlToBytes(body))) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export const COOKIE_NAMES: Record<Role, string> = {
  customer: "customer_session",
  staff: "staff_session",
  owner: "owner_session",
};

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function createSessionCookie(role: Role, sub: string, name: string, email?: string) {
  const payload: SessionPayload = {
    role,
    sub,
    name,
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const token = await signSession(payload);
  const store = await cookies();
  store.set(COOKIE_NAMES[role], token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(role: Role) {
  const store = await cookies();
  store.delete(COOKIE_NAMES[role]);
}

export async function getSession(role: Role): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAMES[role])?.value;
  return verifySession(token);
}

export async function getCustomerSession() {
  return getSession("customer");
}

export async function getStaffSession() {
  return getSession("staff");
}

export async function getOwnerSession() {
  return getSession("owner");
}
