"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { sendToCrm } from "@/lib/crm";

interface StockAlertProps {
  productName: string;
  productId: number;
}

export function StockAlert({ productName, productId }: StockAlertProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    sendToCrm({
      formType: "stock-alert",
      data: { email, productName, productId },
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 bg-green-50 border border-green-200">
        <Check size={16} className="text-green-600" />
        <span className="text-sm text-green-700">Te avisaremos cuando esté disponible</span>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 border border-[var(--border)] text-sm font-medium tracking-[0.1em] uppercase text-[var(--foreground)]/70 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
      >
        <Bell size={16} />
        Avisame cuando haya stock
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Tu email"
        required
        className="flex-1 px-4 py-3 border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-[var(--primary)] text-white text-sm font-medium tracking-[0.1em] uppercase hover:bg-[var(--primary-dark)] transition-colors"
      >
        Avisar
      </button>
    </form>
  );
}
