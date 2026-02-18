"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Product } from "@/types/product";
import { FabricSelection } from "@/types/fabric";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { FabricSelector } from "@/components/catalog/FabricSelector";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/formatters";
import Image from "next/image";

interface CatalogProductCardProps {
  product: Product;
}

export function CatalogProductCard({ product }: CatalogProductCardProps) {
  const [selectedFabric, setSelectedFabric] = useState<FabricSelection | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, selectedFabric || undefined);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <div className="bg-white border border-[var(--border)] overflow-hidden group">
      {/* Image */}
      <div className="relative">
        {hasMultipleImages ? (
          <ImageCarousel images={product.images!} alt={product.name} />
        ) : (
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
        {product.tag && (
          <span className="absolute top-4 left-4 bg-[var(--accent)] text-white text-xs px-3 py-1 font-medium z-10">
            {product.tag}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-medium text-[var(--foreground)] mb-1 group-hover:text-[var(--primary)] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <p className="text-[var(--primary)] font-semibold text-lg">
              {formatPrice(product.price)}
            </p>
            {product.originalPrice && (
              <p className="text-gray-400 text-sm line-through">
                {formatPrice(product.originalPrice)}
              </p>
            )}
          </div>
        </div>

        {/* Fabric Selector */}
        <FabricSelector
          onSelect={setSelectedFabric}
          selected={selectedFabric}
        />

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all ${
            justAdded
              ? "bg-green-600 text-white"
              : "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]"
          }`}
        >
          {justAdded ? (
            <>
              <Check size={18} />
              Agregado
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              Agregar al carrito
            </>
          )}
        </button>
      </div>
    </div>
  );
}
