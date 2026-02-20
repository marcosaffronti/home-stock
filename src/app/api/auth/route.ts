import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/admin-auth";

const SESSION_COOKIE = "admin-session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

// POST /api/auth — login
export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({})) as { password?: string };

  if (!password) {
    return NextResponse.json({ error: "Contraseña requerida" }, { status: 400 });
  }

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    console.error("ADMIN_SECRET not set");
    return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 });
  }

  if (password !== adminSecret) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const token = getSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

// DELETE /api/auth — logout
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

// GET /api/auth — check session
export async function GET(req: NextRequest) {
  const { requireAdminCookie } = await import("@/lib/admin-auth");
  if (!requireAdminCookie(req)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}
