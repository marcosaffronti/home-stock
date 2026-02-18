"use client";

import { useCompare } from "@/context/CompareContext";
import { X, Check, Minus } from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import Image from "next/image";

export function CompareModal() {
  const { items, isOpen, setIsOpen, clearAll } = useCompare();

  if (!isOpen || items.length < 2) return null;

  const specs = [
    {
      label: "Precio",
      getValue: (p: (typeof items)[0]) => formatPrice(p.price),
    },
    {
      label: "Categoría",
      getValue: (p: (typeof items)[0]) => p.category,
    },
    {
      label: "Stock",
      getValue: (p: (typeof items)[0]) =>
        p.stock > 0 ? `${p.stock} disponibles` : "Sin stock",
    },
    {
      label: "Madera",
      getValue: (p: (typeof items)[0]) => p.specs?.woodType || "—",
    },
    {
      label: "Terminación",
      getValue: (p: (typeof items)[0]) => p.specs?.finish || "—",
    },
    {
      label: "Tapizado",
      getValue: (p: (typeof items)[0]) =>
        p.upholstered !== false ? (
          <span className="inline-flex items-center gap-1 text-green-600">
            <Check size={12} /> Sí
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[var(--foreground)]/30">
            <Minus size={12} /> No
          </span>
        ),
    },
    {
      label: "Medidas",
      getValue: (p: (typeof items)[0]) =>
        p.dimensions
          ? `${p.dimensions.width} × ${p.dimensions.depth} × ${p.dimensions.height} cm`
          : "—",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm flex items-start justify-center pt-8 sm:pt-16 overflow-y-auto"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-white w-full max-w-5xl mx-4 mb-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2
            className="text-xl font-semibold text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Comparar productos
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                clearAll();
                setIsOpen(false);
              }}
              className="text-xs text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors"
            >
              Limpiar todo
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-9 h-9 flex items-center justify-center text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Product images */}
        <div
          className="grid border-b border-[var(--border)]"
          style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
        >
          {items.map((product) => (
            <div
              key={product.id}
              className="p-4 sm:p-6 border-r last:border-r-0 border-[var(--border)]"
            >
              <div className="relative aspect-square overflow-hidden bg-[var(--muted)] mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="300px"
                  className="object-cover"
                />
                {product.tag && (
                  <span className="absolute top-2 left-2 bg-[var(--accent)] text-white text-[10px] px-2 py-0.5 font-medium">
                    {product.tag}
                  </span>
                )}
              </div>
              <p className="text-[var(--accent)] text-[9px] font-medium tracking-[0.2em] uppercase mb-1">
                {product.category}
              </p>
              <h3
                className="font-semibold text-sm sm:text-base text-[var(--foreground)] leading-tight"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {product.name}
              </h3>
            </div>
          ))}
        </div>

        {/* Specs rows */}
        {specs.map((spec, i) => (
          <div
            key={spec.label}
            className={`grid ${i % 2 === 0 ? "bg-[var(--muted)]/50" : "bg-white"}`}
            style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
          >
            {items.map((product, j) => (
              <div
                key={product.id}
                className="px-4 sm:px-6 py-3 border-r last:border-r-0 border-[var(--border)]/30"
              >
                {j === 0 && (
                  <p className="text-[9px] text-[var(--foreground)]/30 tracking-[0.2em] uppercase mb-1">
                    {spec.label}
                  </p>
                )}
                {j !== 0 && (
                  <p className="text-[9px] text-transparent tracking-[0.2em] uppercase mb-1 sm:hidden">
                    {spec.label}
                  </p>
                )}
                <p className="text-sm text-[var(--foreground)]">
                  {spec.getValue(product)}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
