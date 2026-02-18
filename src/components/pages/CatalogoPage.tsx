"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { CatalogProductCard } from "@/components/catalog/CatalogProductCard";
import { ProductDetail } from "@/components/catalog/ProductDetail";
import { allProducts, categories as defaultCategories } from "@/data/products";
import { Product } from "@/types/product";
import { getStoredValue, STORAGE_KEYS } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function CatalogoPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const productParam = searchParams.get("product");

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [categories, setCategories] = useState(defaultCategories);
  const [products, setProducts] = useState(allProducts);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    productParam ? Number(productParam) : null
  );

  useEffect(() => {
    const storedCategories = getStoredValue(STORAGE_KEYS.CATEGORIES, defaultCategories);
    setCategories(storedCategories);
    const storedProducts = getStoredValue<Product[] | null>(STORAGE_KEYS.PRODUCTS, null);
    if (storedProducts) setProducts(storedProducts);
  }, []);

  const filteredProducts = useMemo(
    () =>
      activeCategory === "all"
        ? products
        : products.filter((p) => p.category === activeCategory),
    [activeCategory, products]
  );

  const selectedProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId) || null
    : null;

  return (
    <>
      <Header />
      <PageHero
        title="Catálogo Completo"
        subtitle="Explorá todos nuestros muebles de diseño. Elegí tu tela y color favorito."
        breadcrumbs={[{ label: "Catálogo" }]}
      />

      {/* Product Detail — shown when a product is selected */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProductId(null)}
        />
      )}

      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-white">
        <Container>
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium transition-all duration-300",
                  activeCategory === cat.id
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--secondary)]"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Products count */}
          <p className="text-[var(--foreground)]/50 text-xs tracking-[0.2em] uppercase mb-6 sm:mb-8">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
          </p>

          {/* Products Grid — 2 cols mobile, 3 tablet, 4 desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <CatalogProductCard
                key={product.id}
                product={product}
                isActive={selectedProductId === product.id}
                onClick={() => setSelectedProductId(product.id)}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 sm:py-20">
              <p className="text-[var(--foreground)]/50 text-base sm:text-lg">
                No hay productos en esta categoría.
              </p>
            </div>
          )}
        </Container>
      </section>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
