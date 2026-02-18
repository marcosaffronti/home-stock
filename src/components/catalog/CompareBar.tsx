"use client";

import { useCompare } from "@/context/CompareContext";
import { X, ArrowRightLeft } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function CompareBar() {
  const { items, removeItem, clearAll, setIsOpen } = useCompare();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--foreground)] text-white shadow-2xl border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        {/* Selected products */}
        <div className="flex items-center gap-3 flex-1 overflow-x-auto">
          {items.map((product) => (
            <div key={product.id} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 flex-shrink-0">
              <div className="relative w-8 h-8 overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <span className="text-xs font-medium truncate max-w-[120px]">
                {product.name}
              </span>
              <button
                onClick={() => removeItem(product.id)}
                className="text-white/40 hover:text-white transition-colors ml-1"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {items.length < 3 && (
            <span className="text-white/30 text-xs tracking-wide flex-shrink-0">
              +{3 - items.length} más para comparar
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={clearAll}
            className="text-xs text-white/40 hover:text-white transition-colors px-3 py-2"
          >
            Limpiar
          </button>
          <button
            onClick={() => setIsOpen(true)}
            disabled={items.length < 2}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 text-sm font-medium tracking-[0.1em] uppercase transition-all",
              items.length >= 2
                ? "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            )}
          >
            <ArrowRightLeft size={16} />
            Comparar
          </button>
        </div>
      </div>
    </div>
  );
}
