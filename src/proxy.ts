import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "haqdar_admin";
const LOGIN_PATH = "/admin/login";

/**
 * Optimistic gate for the admin portal: no session cookie, straight to login. The real check
 * happens on every API call, where the backend validates the key itself; a stale key is sent
 * back to login by the API client, and logging in again replaces it.
 */
export function proxy(request: NextRequest) {
  const isLogin = request.nextUrl.pathname === LOGIN_PATH;
  if (!isLogin && !request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
