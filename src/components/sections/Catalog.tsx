"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types/product";
import { featuredProducts, allProducts } from "@/data/products";
import { getStoredValue, STORAGE_KEYS } from "@/lib/storage";
import { LandingConfig, defaultLandingConfig } from "@/types/landing";
import { FeaturedProductCard } from "./FeaturedProductCard";

export function Catalog() {
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
      const ordered = featuredIds
        .map((id) => productList.find((p) => p.id === id))
        .filter((p): p is Product => !!p);
      return ordered.slice(0, 8);
    }
    if (storedProducts) {
      return storedProducts.filter((p) => p.featured).slice(0, 8);
    }
    return featuredProducts.slice(0, 8);
  }, [featuredIds, storedProducts]);

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
            <FeaturedProductCard
              key={product.id}
              product={product}
            />
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
