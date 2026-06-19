import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
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
