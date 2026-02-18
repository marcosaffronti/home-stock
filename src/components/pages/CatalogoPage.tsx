"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { CatalogProductCard } from "@/components/catalog/CatalogProductCard";
import { ProductDetail } from "@/components/catalog/ProductDetail";
import { RecentlyViewed } from "@/components/catalog/RecentlyViewed";
import { CompareBar } from "@/components/catalog/CompareBar";
import { CompareModal } from "@/components/catalog/CompareModal";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { allProducts, categories as defaultCategories } from "@/data/products";
import { Product } from "@/types/product";
import { fetchFromServer, STORAGE_KEYS } from "@/lib/storage";
import { LandingConfig, defaultLandingConfig } from "@/types/landing";
import { cn } from "@/lib/utils";

type SortOption = "default" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Destacados" },
  { value: "price-asc", label: "Menor precio" },
  { value: "price-desc", label: "Mayor precio" },
  { value: "name-asc", label: "A → Z" },
  { value: "name-desc", label: "Z → A" },
];

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [showSort, setShowSort] = useState(false);
  const [heroImage, setHeroImage] = useState(defaultLandingConfig.hero.backgroundImage);
  const { recentIds, addViewed } = useRecentlyViewed();

  useEffect(() => {
    fetchFromServer(STORAGE_KEYS.CATEGORIES, defaultCategories).then((storedCategories) => {
      setCategories(storedCategories);
    });
    fetchFromServer<Product[] | null>(STORAGE_KEYS.PRODUCTS, null).then((storedProducts) => {
      if (storedProducts) setProducts(storedProducts);
    });
    fetchFromServer<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig).then((config) => {
      setHeroImage(config.hero.backgroundImage);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    let result = activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result = [...result].sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    return result;
  }, [activeCategory, products, searchQuery, sortBy]);

  const selectedProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId) || null
    : null;

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || "Ordenar";

  return (
    <>
      <Header />
      <PageHero
        title="Catálogo Completo"
        subtitle="Explorá todos nuestros muebles de diseño. Elegí tu tela y color favorito."
        breadcrumbs={[{ label: "Catálogo" }]}
        backgroundImage={heroImage}
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
          {/* Search + Sort bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-11 pr-10 py-3 border border-[var(--border)] bg-white text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/30 hover:text-[var(--foreground)]"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 px-4 py-3 border border-[var(--border)] bg-white text-sm text-[var(--foreground)] hover:border-[var(--primary)] transition-colors w-full sm:w-auto"
              >
                <SlidersHorizontal size={14} className="text-[var(--foreground)]/40" />
                <span className="whitespace-nowrap">{activeSortLabel}</span>
                <ChevronDown size={14} className={cn("ml-1 transition-transform text-[var(--foreground)]/40", showSort && "rotate-180")} />
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-[var(--border)] shadow-lg z-30 min-w-[180px]">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSort(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm transition-colors",
                        sortBy === option.value
                          ? "bg-[var(--muted)] text-[var(--primary)] font-medium"
                          : "text-[var(--foreground)]/70 hover:bg-[var(--muted)]"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

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

          {/* Products count + active filters */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <p className="text-[var(--foreground)]/50 text-xs tracking-[0.2em] uppercase">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
            </p>
            {(searchQuery || sortBy !== "default") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSortBy("default");
                }}
                className="text-xs text-[var(--primary)] hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Products Grid — 2 cols mobile, 3 tablet, 4 desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <CatalogProductCard
                key={product.id}
                product={product}
                isActive={selectedProductId === product.id}
                onClick={() => { setSelectedProductId(product.id); addViewed(product.id); }}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 sm:py-20">
              <p className="text-[var(--foreground)]/50 text-base sm:text-lg">
                {searchQuery
                  ? `No se encontraron resultados para "${searchQuery}".`
                  : "No hay productos en esta categoría."}
              </p>
            </div>
          )}

          {/* Recently Viewed */}
          <RecentlyViewed
            products={recentIds
              .map((id) => products.find((p) => p.id === id))
              .filter((p): p is Product => !!p)}
            onSelect={(id) => { setSelectedProductId(id); addViewed(id); }}
            currentProductId={selectedProductId}
          />
        </Container>
      </section>

      {/* Compare bar + modal */}
      <CompareBar />
      <CompareModal />

      <Footer />
      <WhatsAppButton />
    </>
  );
}
