import { NextRequest, NextResponse } from "next/server";
import { AdminAuthRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: AdminAuthRequest = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

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

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error("[admin/auth]", error);
    return NextResponse.json(
      { authenticated: false, error: "Errore di autenticazione." },
      { status: 500 }
    );
  }
}
