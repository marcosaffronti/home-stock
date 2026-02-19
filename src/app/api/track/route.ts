import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

type DayData = {
  pv: number;          // page views (total)
  sv: number;          // unique sessions
  ca: number;          // cart adds
  wa: number;          // whatsapp clicks
  cs: number;          // checkout starts
  pv_products: Record<string, number>; // productId-name → count
};

type Analytics = Record<string, DayData>;
type Sessions = Record<string, string[]>; // date → session IDs (hashed)

function today(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(filePath: string, data: unknown) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function pruneOldDays(data: Record<string, unknown>, days = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  for (const key of Object.keys(data)) {
    if (key < cutoffStr) delete data[key];
  }
}

const emptyDay = (): DayData => ({ pv: 0, sv: 0, ca: 0, wa: 0, cs: 0, pv_products: {} });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { event, sessionId, productId, productName } = body as {
    event?: string;
    sessionId?: string;
    productId?: number;
    productName?: string;
  };

  if (!event) return NextResponse.json({ ok: false }, { status: 400 });

  const date = today();
  const analytics = readJson<Analytics>(ANALYTICS_FILE, {});
  const sessions = readJson<Sessions>(SESSIONS_FILE, {});

  if (!analytics[date]) analytics[date] = emptyDay();
  const day = analytics[date];

  switch (event) {
    case "page_view": {
      day.pv++;
      // Unique session dedup
      if (sessionId) {
        if (!sessions[date]) sessions[date] = [];
        const hash = sessionId.slice(0, 16); // truncate for storage
        if (!sessions[date].includes(hash)) {
          sessions[date].push(hash);
          day.sv++;
        }
      }
      break;
    }
    case "product_view": {
      if (productId && productName) {
        const key = `${productId}:${productName}`;
        day.pv_products[key] = (day.pv_products[key] || 0) + 1;
      }
      break;
    }
    case "cart_add":
      day.ca++;
      break;
    case "whatsapp_click":
      day.wa++;
      break;
    case "checkout_start":
      day.cs++;
      break;
  }

  pruneOldDays(analytics);
  pruneOldDays(sessions);
  writeJson(ANALYTICS_FILE, analytics);
  writeJson(SESSIONS_FILE, sessions);

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const analytics = readJson<Analytics>(ANALYTICS_FILE, {});

  // Build last 30 days array (filling gaps with zeros)
  const days: Array<{ date: string } & DayData> = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({ date: dateStr, ...(analytics[dateStr] || emptyDay()) });
  }

  // Aggregate totals
  const totals = days.reduce(
    (acc, d) => ({
      pv: acc.pv + d.pv,
      sv: acc.sv + d.sv,
      ca: acc.ca + d.ca,
      wa: acc.wa + d.wa,
      cs: acc.cs + d.cs,
    }),
    { pv: 0, sv: 0, ca: 0, wa: 0, cs: 0 }
  );

  // Last 7 days
  const last7 = days.slice(-7);
  const prev7 = days.slice(-14, -7);
  const week = {
    sv: last7.reduce((a, d) => a + d.sv, 0),
    ca: last7.reduce((a, d) => a + d.ca, 0),
    wa: last7.reduce((a, d) => a + d.wa, 0),
  };
  const prevWeek = {
    sv: prev7.reduce((a, d) => a + d.sv, 0),
    ca: prev7.reduce((a, d) => a + d.ca, 0),
    wa: prev7.reduce((a, d) => a + d.wa, 0),
  };

  // Top products (merge all days)
  const productMap: Record<string, number> = {};
  for (const d of days) {
    for (const [key, count] of Object.entries(d.pv_products)) {
      productMap[key] = (productMap[key] || 0) + count;
    }
  }
  const topProducts = Object.entries(productMap)
    .map(([key, count]) => {
      const [, ...nameParts] = key.split(":");
      return { name: nameParts.join(":"), count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return NextResponse.json(
    { days, totals, week, prevWeek, topProducts },
    { headers: { "Cache-Control": "no-store" } }
  );
}
