"use client";

import { Product } from "@/types/product";
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Image from "next/image";

interface CatalogProductCardProps {
  product: Product;
  isActive?: boolean;
  onClick?: () => void;
}

export function CatalogProductCard({ product, isActive, onClick }: CatalogProductCardProps) {
  const { ref, isVisible } = useScrollReveal<HTMLButtonElement>();

  return (
    <button
      ref={ref}
      id={`product-${product.id}`}
      onClick={onClick}
      className={cn(
        "text-left bg-white border overflow-hidden group transition-all cursor-pointer w-full",
        "duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        isActive
          ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
          : "border-[var(--border)] hover:border-[var(--primary)]"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.tag && (
          <span className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-[var(--accent)] text-white text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 font-medium z-10">
            {product.tag}
          </span>
        )}
        {product.stock > 0 && product.stock <= 3 && (
          <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-[var(--foreground)]/80 text-white text-[9px] sm:text-[10px] px-2 py-0.5 font-medium tracking-wide z-10">
            {product.stock === 1 ? "Último disponible!" : `Solo ${product.stock} disponibles!`}
          </span>
        )}
        {/* Hover overlay — hidden on mobile (touch) */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center">
          <span className="text-white text-sm font-medium tracking-wide">
            Ver producto
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <p className="text-[var(--accent)] text-[9px] sm:text-[10px] font-medium tracking-[0.2em] uppercase mb-0.5 sm:mb-1">
          {product.category}
        </p>
        <h3
          className="font-semibold text-sm sm:text-base text-[var(--foreground)] mb-1 sm:mb-2 group-hover:text-[var(--primary)] transition-colors leading-tight line-clamp-2"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {product.name}
        </h3>
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-[var(--primary)] font-semibold text-base sm:text-lg">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[var(--foreground)]/30 text-xs sm:text-sm line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
