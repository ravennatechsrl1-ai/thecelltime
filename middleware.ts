import { type NextRequest, NextResponse } from "next/server";
import { isAdminRequestAuthorized } from "@/lib/admin-session";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/admin")) {
    const publicAdminPaths = new Set(["/api/admin/auth", "/api/admin/session"]);
    if (!publicAdminPaths.has(pathname) && !isAdminRequestAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/login",
    "/auth/:path*",
    "/api/admin/:path*",
    "/api/auth/:path*",
  ],
};
