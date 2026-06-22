import { NextResponse } from "next/server";
import { isAdminCookieAuthorized } from "@/lib/admin-session";

export async function GET() {
  const authenticated = await isAdminCookieAuthorized();
  return NextResponse.json({ authenticated });
}
