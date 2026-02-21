"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/formatters";
import { CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CheckoutPage() {
  const { items, total, closeCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    if (typeof window !== "undefined") router.replace("/");
    return null;
  }

  const handlePay = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.init_point) {
        setError(data.message || "No se pudo iniciar el pago. Verificá la configuración de MercadoPago.");
        return;
      }
      window.location.href = data.init_point;
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--muted)] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] flex items-center gap-3">
          <button
            onClick={() => { router.back(); }}
            className="p-2 hover:bg-[var(--muted)] rounded-full transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Resumen del pedido
          </h1>
        </div>

        {/* Items */}
        <div className="p-6 space-y-4 border-b border-[var(--border)]">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-[var(--foreground)]/70">
                {item.product.name}
                {item.fabric ? ` — ${item.fabric.colorName}` : ""}
                {" "}× {item.quantity}
              </span>
              <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Total + pay */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[var(--foreground)]">Total</span>
            <span className="text-2xl font-bold text-[var(--primary)]">{formatPrice(total)}</span>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded">{error}</p>
          )}

          <Button size="lg" className="w-full" onClick={handlePay} disabled={loading}>
            {loading ? (
              <><Loader2 size={18} className="mr-2 animate-spin" /> Procesando...</>
            ) : (
              <><CreditCard size={18} className="mr-2" /> Confirmar y pagar</>
            )}
          </Button>

          <p className="text-xs text-center text-gray-400">
            Serás redirigido a MercadoPago para completar el pago de forma segura.
          </p>
        </div>
      </div>
    </div>
  );
}
