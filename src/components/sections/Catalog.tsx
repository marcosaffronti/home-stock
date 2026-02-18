"use client";

import { useState, useEffect, useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";
import { featuredProducts, allProducts } from "@/data/products";
import { formatPrice } from "@/lib/formatters";
import { getStoredValue, STORAGE_KEYS } from "@/lib/storage";
import { LandingConfig, defaultLandingConfig } from "@/types/landing";

export function Catalog() {
  const { addItem } = useCart();
  const [catalogConfig, setCatalogConfig] = useState(defaultLandingConfig.catalog);
  const [featuredIds, setFeaturedIds] = useState<number[]>([]);
  const [storedProducts, setStoredProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    const config = getStoredValue<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig);
    setCatalogConfig(config.catalog);
    setFeaturedIds(config.featuredProductIds);
    const stored = getStoredValue<Product[] | null>(STORAGE_KEYS.PRODUCTS, null);
    setStoredProducts(stored);
  }, []);

  const displayProducts = useMemo(() => {
    const productList = storedProducts || allProducts;
    if (featuredIds.length > 0) {
      // Return products in the order defined by featuredIds
      const ordered = featuredIds
        .map((id) => productList.find((p) => p.id === id))
        .filter((p): p is Product => !!p);
      return ordered.slice(0, 8);
    }
    // Fallback: use featured products from data
    if (storedProducts) {
      return storedProducts.filter((p) => p.featured).slice(0, 8);
    }
    return featuredProducts.slice(0, 8);
  }, [featuredIds, storedProducts]);

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  return (
    <section id="catalogo" className="py-20 md:py-32 bg-white">
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[var(--accent)] text-sm font-medium tracking-[0.3em] uppercase mb-4">
            {catalogConfig.sectionLabel}
          </p>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--foreground)] mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {catalogConfig.title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {catalogConfig.description}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white border border-[var(--border)] overflow-hidden"
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
                {/* Overlay - Add to Cart */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                  <button
                    onClick={() => handleAddToCart(product)}
                    aria-label="Agregar al carrito"
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-colors"
                  >
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-medium text-[var(--foreground)] mb-1 group-hover:text-[var(--primary)] transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-[var(--primary)] font-semibold">
                    {formatPrice(product.price)}
                  </p>
                  {product.originalPrice && (
                    <p className="text-gray-400 text-sm line-through">
                      {formatPrice(product.originalPrice)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" href="/catalogo" className="group">
            Ver Catálogo Completo
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform ml-2"
            />
          </Button>
        </div>
      </Container>
    </section>
  );
}
