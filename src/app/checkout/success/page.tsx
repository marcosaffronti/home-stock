"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessInner() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-[var(--muted)] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md shadow-sm p-8 text-center">
        <CheckCircle size={56} className="mx-auto mb-4 text-green-500" />
        <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
          ¡Pago exitoso!
        </h1>
        <p className="text-gray-500 mb-2">
          Tu pedido fue confirmado. Nos pondremos en contacto a la brevedad.
        </p>
        {paymentId && (
          <p className="text-xs text-gray-400 mb-6">N° de pago: {paymentId}</p>
        )}
        <Button href="/" className="w-full">
          Volver a la tienda
        </Button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}
