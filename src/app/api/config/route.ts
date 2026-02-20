import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdminCookie } from "@/lib/admin-auth";

const CONFIG_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(CONFIG_DIR, "site-config.json");

function readConfig(): Record<string, unknown> {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return {};
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeConfig(config: Record<string, unknown>) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const tmp = CONFIG_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(config, null, 2), "utf-8");
  fs.renameSync(tmp, CONFIG_FILE); // atomic on same filesystem
}

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
};

// GET /api/config — read config (public, site needs this to render)
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const config = readConfig();

  if (key) {
    return NextResponse.json({ value: config[key] ?? null }, { headers: NO_CACHE_HEADERS });
  }
  return NextResponse.json(config, { headers: NO_CACHE_HEADERS });
}

// POST /api/config — write config (admin only)
export async function POST(req: NextRequest) {
  if (!requireAdminCookie(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { key, value } = body;

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const config = readConfig();
  config[key] = value;
  writeConfig(config);

  return NextResponse.json({ success: true });
}
