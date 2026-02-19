import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

export interface Lead {
  id: string;
  formType: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  data: Record<string, unknown>;
  timestamp: string;
  source: string;
  read: boolean;
  notes?: string;           // internal admin notes
  repliedAt?: string;       // ISO timestamp when first replied
}

function readLeads(): Lead[] {
  try {
    if (!fs.existsSync(LEADS_FILE)) return [];
    const raw = fs.readFileSync(LEADS_FILE, "utf-8");
    return JSON.parse(raw) as Lead[];
  } catch {
    return [];
  }
}

function writeLeads(leads: Lead[]) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

const NO_CACHE = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
};

// GET /api/leads — list all leads, newest first
export async function GET() {
  const leads = readLeads();
  leads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return NextResponse.json({ leads }, { headers: NO_CACHE });
}

// POST /api/leads — add a new lead
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { formType, data, source } = body as {
    formType: string;
    data: Record<string, unknown>;
    source: string;
  };

  if (!formType || !data) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const lead: Lead = {
    id: randomUUID(),
    formType,
    name: (data.name as string) || (data.nombreCompleto as string) || undefined,
    email: (data.email as string) || undefined,
    phone: (data.phone as string) || (data.telefono as string) || undefined,
    message: (data.message as string) || (data.mensaje as string) || undefined,
    data,
    timestamp: new Date().toISOString(),
    source: source || "homestock-web",
    read: false,
  };

  const leads = readLeads();
  leads.push(lead);
  writeLeads(leads);

  return NextResponse.json({ ok: true, id: lead.id });
}

// PATCH /api/leads — mark as read, update notes, mark replied
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, read, notes, repliedAt } = body as {
    id: string;
    read?: boolean;
    notes?: string;
    repliedAt?: string;
  };

  const leads = readLeads();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }
  if (read !== undefined)      leads[idx].read = read;
  if (notes !== undefined)     leads[idx].notes = notes;
  if (repliedAt !== undefined) leads[idx].repliedAt = repliedAt;
  writeLeads(leads);
  return NextResponse.json({ ok: true });
}

// DELETE /api/leads?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const leads = readLeads();
  const filtered = leads.filter((l) => l.id !== id);
  writeLeads(filtered);
  return NextResponse.json({ ok: true });
}
