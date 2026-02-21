import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { MercadoPagoConfig, Preference } from "mercadopago";

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
  const config = readConfig();

  const checkout = config["hs-checkout"] as { enabled?: boolean } | undefined;
  if (!checkout?.enabled) {
    return NextResponse.json({ error: "checkout_not_configured" }, { status: 422 });
  }

  const token = config["hs-mp-access-token"] as string | undefined;
  if (!token) {
    return NextResponse.json({ error: "mp_token_missing" }, { status: 422 });
  }

  const { items, customerEmail } = await req.json();
  if (!items?.length) {
    return NextResponse.json({ error: "items_required" }, { status: 400 });
  }

  const host = (
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3002"
  ).split(":")[0];
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const mp = new MercadoPagoConfig({ accessToken: token });
  const preference = new Preference(mp);

  try {
    const result = await preference.create({
      body: {
        items: items.map((item: { name: string; price: number; quantity: number }) => ({
          id: item.name,
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: "ARS",
        })),
        payer: customerEmail ? { email: customerEmail } : undefined,
        back_urls: {
          success: `${baseUrl}/checkout/success`,
          failure: `${baseUrl}/checkout/failure`,
          pending: `${baseUrl}/checkout/pending`,
        },
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhook/mp`,
      },
    });

    return NextResponse.json({
      init_point: result.init_point,
      preference_id: result.id,
    });
  } catch (err: unknown) {
    const mpErr = err as { status?: number; message?: string; code?: string };
    console.error("[Checkout] MP error:", mpErr);
    return NextResponse.json(
      { error: "mp_error", message: mpErr?.message || "Error al crear preferencia de pago" },
      { status: 502 }
    );
  }
}
