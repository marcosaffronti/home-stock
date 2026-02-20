import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side middleware: protects /admin routes.
 * Cookie presence is checked here (UX redirect).
 * Full HMAC verification happens in each API handler via requireAdminCookie().
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login page through unconditionally (it IS the auth page)
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    const hasCookie = req.cookies.has("admin-session");
    if (!hasCookie) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
