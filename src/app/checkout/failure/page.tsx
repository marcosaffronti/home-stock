"use client";

import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function FailurePage() {
  return (
    <div className="min-h-screen bg-[var(--muted)] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md shadow-sm p-8 text-center">
        <XCircle size={56} className="mx-auto mb-4 text-red-500" />
        <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
          Pago no completado
        </h1>
        <p className="text-gray-500 mb-6">
          Hubo un problema con tu pago. Podés intentarlo de nuevo o consultarnos por WhatsApp.
        </p>
        <div className="space-y-3">
          <Button href="/checkout" className="w-full">
            Intentar de nuevo
          </Button>
          <Button href="/" variant="outline" className="w-full">
            Volver a la tienda
          </Button>
        </div>
      </div>
    </div>
  );
}
