import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/formatters";

interface FeaturedProductCardProps {
  product: Product;
}

export function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  return (
    <Link
      href={`/catalogo?product=${product.id}`}
      className="group relative bg-white border border-[var(--border)] overflow-hidden hover:border-[var(--primary)] transition-colors"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.tag && (
          <span className="absolute top-4 left-4 bg-[var(--accent)] text-white text-xs px-3 py-1 font-medium z-10">
            {product.tag}
          </span>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <span className="text-white text-sm font-medium tracking-wide">
            Ver producto
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[var(--accent)] text-[10px] font-medium tracking-[0.2em] uppercase mb-1">
          {product.category}
        </p>
        <h3
          className="font-semibold text-[var(--foreground)] mb-2 group-hover:text-[var(--primary)] transition-colors leading-tight"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-[var(--primary)] font-semibold text-lg">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-[var(--foreground)]/30 text-sm line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
