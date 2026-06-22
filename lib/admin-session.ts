import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "tct_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function getAdminSecret(): string | null {
  return process.env.ADMIN_PASSWORD?.trim() || null;
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createAdminSessionToken(): Promise<string | null> {
  const secret = getAdminSecret();
  if (!secret) return null;

  const issuedAt = String(Date.now());
  const signature = await hmacSha256Hex(secret, issuedAt);
  return `${issuedAt}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;

  const secret = getAdminSecret();
  if (!secret) return false;

  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;

  const ageMs = Date.now() - Number(issuedAt);
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > SESSION_MAX_AGE_SECONDS * 1000) {
    return false;
  }

  const expected = await hmacSha256Hex(secret, issuedAt);
  return timingSafeEqualString(signature, expected);
}

export function getAdminSessionFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
}

export async function isAdminRequestAuthorized(
  request: NextRequest
): Promise<boolean> {
  return verifyAdminSessionToken(getAdminSessionFromRequest(request));
}

export async function isAdminCookieAuthorized(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export const adminSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
