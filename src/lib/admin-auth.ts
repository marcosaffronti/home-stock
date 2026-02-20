import { createHmac } from "crypto";
import { NextRequest } from "next/server";

const SESSION_COOKIE = "admin-session";

/**
 * Generates a deterministic session token based on ADMIN_SECRET.
 * The token changes whenever ADMIN_SECRET changes (i.e., password reset).
 */
export function getSessionToken(): string {
  const secret = process.env.ADMIN_SECRET || "change-me-in-production";
  return createHmac("sha256", secret).update("hs-admin-v1").digest("hex");
}

/**
 * Verifies the admin-session cookie from an incoming request.
 * Returns true only if the cookie matches the expected HMAC token.
 */
export function requireAdminCookie(req: NextRequest): boolean {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) return false;
  return cookie === getSessionToken();
}
