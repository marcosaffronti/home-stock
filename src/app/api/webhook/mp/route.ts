import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { MercadoPagoConfig, Payment } from "mercadopago";

const CONFIG_FILE = path.join(process.cwd(), "data", "site-config.json");

function readConfig(): Record<string, unknown> {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return {};
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

export async function POST(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic") || req.nextUrl.searchParams.get("type");
  const id = req.nextUrl.searchParams.get("id") || req.nextUrl.searchParams.get("data.id");

  // Only process payment notifications
  if (topic !== "payment" || !id) {
    return NextResponse.json({ ok: true });
  }

  const config = readConfig();
  const token = config["hs-mp-access-token"] as string | undefined;
  if (!token) return NextResponse.json({ ok: true });

  try {
    const mp = new MercadoPagoConfig({ accessToken: token });
    const paymentClient = new Payment(mp);
    const payment = await paymentClient.get({ id: Number(id) });

    if (payment.status === "approved") {
      // Log approved payment (extend here to save to emiti-admin if needed)
      console.log(`[MP Webhook] Payment approved: ${payment.id} — $${payment.transaction_amount}`);
    }
  } catch (err) {
    console.error("[MP Webhook] Error:", err);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
