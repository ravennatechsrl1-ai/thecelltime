import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "tct_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function getAdminSecret(): string | null {
  return process.env.ADMIN_PASSWORD?.trim() || null;
}

export function createAdminSessionToken(): string | null {
  const secret = getAdminSecret();
  if (!secret) return null;

  const issuedAt = String(Date.now());
  const signature = createHmac("sha256", secret).update(issuedAt).digest("hex");
  return `${issuedAt}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;

  const secret = getAdminSecret();
  if (!secret) return false;

  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;

  const ageMs = Date.now() - Number(issuedAt);
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > SESSION_MAX_AGE_SECONDS * 1000) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(issuedAt).digest("hex");
  if (signature.length !== expected.length) return false;

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function getAdminSessionFromRequest(request: NextRequest): string | undefined {
  return request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
}

export function isAdminRequestAuthorized(request: NextRequest): boolean {
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
