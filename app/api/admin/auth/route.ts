import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
} from "@/lib/admin-session";
import { AdminAuthRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: AdminAuthRequest = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD?.trim();

    if (!adminPassword) {
      return NextResponse.json(
        { authenticated: false, error: "ADMIN_PASSWORD non configurata." },
        { status: 500 }
      );
    }

    if (body.password !== adminPassword) {
      return NextResponse.json(
        { authenticated: false, error: "Password non valida." },
        { status: 401 }
      );
    }

    const token = await createAdminSessionToken();
    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: "Sessione admin non disponibile." },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions);
    return response;
  } catch (error) {
    console.error("[admin/auth]", error);
    return NextResponse.json(
      { authenticated: false, error: "Errore di autenticazione." },
      { status: 500 }
    );
  }
}
