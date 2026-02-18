"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { CatalogProductCard } from "@/components/catalog/CatalogProductCard";
import { allProducts, categories } from "@/data/products";
import { cn } from "@/lib/utils";

export function CatalogoPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  const filteredProducts = useMemo(
    () =>
      activeCategory === "all"
        ? allProducts
        : allProducts.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  return (
    <>
      <Header />
      <PageHero
        title="Catálogo Completo"
        subtitle="Explorá todos nuestros muebles de diseño. Elegí tu tela y color favorito."
        breadcrumbs={[{ label: "Catálogo" }]}
      />

      <section className="py-12 md:py-20 bg-white">
        <Container>
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-6 py-2 text-sm font-medium transition-all duration-300",
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
          <p className="text-gray-500 text-sm mb-6">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
          </p>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <CatalogProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No hay productos en esta categoría.</p>
            </div>
          )}
        </Container>
      </section>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
