"use client";

import { Product } from "@/types/product";
import { formatPrice } from "@/lib/formatters";
import { Clock } from "lucide-react";
import Image from "next/image";

interface RecentlyViewedProps {
  products: Product[];
  onSelect: (id: number) => void;
  currentProductId?: number | null;
}

export function RecentlyViewed({ products, onSelect, currentProductId }: RecentlyViewedProps) {
  const filtered = products.filter((p) => p.id !== currentProductId);

  if (filtered.length === 0) return null;

  return (
    <div className="border-t border-[var(--border)] pt-8 sm:pt-12 mt-8 sm:mt-12">
      <div className="flex items-center gap-2 mb-6">
        <Clock size={16} className="text-[var(--foreground)]/30" />
        <h3 className="text-xs font-medium text-[var(--foreground)]/40 tracking-[0.2em] uppercase">
          Vistos recientemente
        </h3>
      </div>
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {filtered.map((product) => (
          <button
            key={product.id}
            onClick={() => onSelect(product.id)}
            className="flex-shrink-0 w-32 sm:w-40 text-left group"
          >
            <div className="relative aspect-square overflow-hidden bg-[var(--muted)] mb-2 border border-[var(--border)] group-hover:border-[var(--primary)] transition-colors">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="160px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="text-xs text-[var(--foreground)] font-medium truncate group-hover:text-[var(--primary)] transition-colors">
              {product.name}
            </p>
            <p
              className="text-xs text-[var(--primary)] mt-0.5"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {formatPrice(product.price)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
