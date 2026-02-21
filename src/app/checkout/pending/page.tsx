"use client";

import { Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PendingInner() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  return (
    <div className="min-h-screen bg-[var(--muted)] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md shadow-sm p-8 text-center">
        <Clock size={56} className="mx-auto mb-4 text-yellow-500" />
        <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
          Pago pendiente
        </h1>
        <p className="text-gray-500 mb-2">
          Tu pago está siendo procesado. Te notificaremos cuando se confirme.
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

export default function PendingPage() {
  return (
    <Suspense>
      <PendingInner />
    </Suspense>
  );
}
