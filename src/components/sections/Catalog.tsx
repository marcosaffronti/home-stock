"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Heart, Eye, ArrowRight, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";

const categories = [
  { id: "all", label: "Todos" },
  { id: "sillas", label: "Sillas" },
  { id: "cabeceras", label: "Cabeceras" },
  { id: "mesas", label: "Mesas" },
  { id: "poltronas", label: "Poltronas" },
];

const products: Product[] = [
  {
    id: 1,
    name: "Silla Wishbone",
    slug: "silla-wishbone",
    category: "sillas",
    price: 190000,
    image: "/images/products/silla-wishbone.jpeg",
    tag: "Destacado",
    stock: 10,
  },
  {
    id: 2,
    name: "Silla Wishbone Black",
    slug: "silla-wishbone-black",
    category: "sillas",
    price: 190000,
    image: "/images/products/silla-wishbone-black.jpeg",
    tag: "Nuevo",
    stock: 8,
  },
  {
    id: 3,
    name: "Silla Emma",
    slug: "silla-emma",
    category: "sillas",
    price: 220000,
    image: "/images/products/silla-emma.jpeg",
    stock: 12,
  },
  {
    id: 4,
    name: "Silla Lola",
    slug: "silla-lola",
    category: "sillas",
    price: 110000,
    image: "/images/products/silla-lola.jpeg",
    stock: 15,
  },
  {
    id: 5,
    name: "Silla Moller",
    slug: "silla-moller",
    category: "sillas",
    price: 185000,
    image: "/images/products/silla-moller.jpeg",
    stock: 10,
  },
  {
    id: 6,
    name: "Silla Teca Tapizada",
    slug: "silla-teca-tapizada",
    category: "sillas",
    price: 135000,
    image: "/images/products/silla-teca-tapizada.jpeg",
    stock: 8,
  },
  {
    id: 7,
    name: "Cabecera Ibiza",
    slug: "cabecera-ibiza",
    category: "cabeceras",
    price: 190000,
    image: "/images/products/cabecera-ibiza.jpeg",
    stock: 6,
  },
  {
    id: 8,
    name: "Poltrona Petiribi",
    slug: "poltrona-petiribi",
    category: "poltronas",
    price: 240000,
    image: "/images/products/poltrona-petiribi.jpg",
    stock: 4,
  },
  {
    id: 9,
    name: "Mesa Petiribi Carpintera",
    slug: "mesa-petiribi-carpintera",
    category: "mesas",
    price: 850000,
    image: "/images/products/mesa-petiribi-carpintera.jpg",
    stock: 3,
  },
  {
    id: 10,
    name: "Mesa Tablero",
    slug: "mesa-tablero",
    category: "mesas",
    price: 950000,
    image: "/images/products/mesa-tablero.jpg",
    stock: 2,
  },
  {
    id: 11,
    name: "Silla Teca",
    slug: "silla-teca",
    category: "sillas",
    price: 115000,
    image: "/images/products/silla-teca.jpg",
    stock: 10,
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price);
};

export function Catalog() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { addItem } = useCart();

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const handleAddToCart = (product: Product) => {
    addItem(product);
  };

  return (
    <section id="catalogo" className="py-20 md:py-32 bg-white">
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[var(--accent)] text-sm font-medium tracking-[0.3em] uppercase mb-4">
            Nuestros Productos
          </p>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--foreground)] mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Catálogo de Muebles
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explorá nuestra selección de muebles de diseño, creados con los
            mejores materiales y pensados para transformar tu hogar.
          </p>
        </div>

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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
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
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
                  <button aria-label="Agregar a favoritos" className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-colors">
                    <Heart size={18} />
                  </button>
                  <button
                    onClick={() => handleAddToCart(product)}
                    aria-label="Agregar al carrito"
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-colors"
                  >
                    <ShoppingCart size={18} />
                  </button>
                  <button aria-label="Ver detalle" className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[var(--accent)] hover:text-white transition-colors">
                    <Eye size={18} />
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
          <Button variant="outline" size="lg" href="#contacto" className="group">
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
