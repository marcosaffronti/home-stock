"use client";

import { useState, Fragment, useEffect, useRef, useCallback } from "react";
import { X, ShoppingCart, Check, ChevronDown, ArrowLeft, Minus, Plus } from "lucide-react";
import { Product } from "@/types/product";
import { FabricSelection } from "@/types/fabric";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import { FabricSelector } from "@/components/catalog/FabricSelector";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export function ProductDetail({ product, onClose }: ProductDetailProps) {
  const [selectedFabric, setSelectedFabric] = useState<FabricSelection | null>(null);
  const [fabricPreview, setFabricPreview] = useState<string | null>(null);
  const [showingFabric, setShowingFabric] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const { addItem } = useCart();
  const sectionRef = useRef<HTMLDivElement>(null);

  const isUpholstered = product.upholstered !== false;
  const hasMultipleImages = product.images && product.images.length > 1;

  useEffect(() => {
    setSelectedFabric(null);
    setFabricPreview(null);
    setShowingFabric(false);
    setShowSpecs(false);
    setQuantity(1);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [product.id]);

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const subtotal = product.price * quantity;

  const handleAddToCart = () => {
    addItem(product, selectedFabric || undefined, quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setQuantity(1);
    }, 2000);
  };

  const handleFabricPreview = (image: string | null) => {
    setFabricPreview(image);
    if (image) setShowingFabric(true);
  };

  return (
    <section ref={sectionRef} className="bg-[var(--muted)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="tracking-wide uppercase text-[11px] font-medium hidden sm:inline">
              Volver al catálogo
            </span>
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 px-4 sm:px-6 pb-8 sm:pb-12">
          {/* Left — Image area */}
          <div className="relative">
            {/* Fabric / Product toggle */}
            {fabricPreview && (
              <div className="flex gap-1 mb-3">
                <button
                  onClick={() => setShowingFabric(false)}
                  className={cn(
                    "px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase transition-colors",
                    !showingFabric
                      ? "bg-[var(--primary)] text-white"
                      : "bg-white text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                  )}
                >
                  Producto
                </button>
                <button
                  onClick={() => setShowingFabric(true)}
                  className={cn(
                    "px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase transition-colors",
                    showingFabric
                      ? "bg-[var(--primary)] text-white"
                      : "bg-white text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                  )}
                >
                  Ver tela
                </button>
              </div>
            )}

            {/* Showing fabric texture full size */}
            {showingFabric && fabricPreview ? (
              <div className="relative aspect-square overflow-hidden bg-white border border-[var(--border)]">
                <img
                  src={fabricPreview}
                  alt={selectedFabric?.colorName || "Tela"}
                  className="w-full h-full object-cover"
                />
                {/* Label overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                  <p className="text-white/70 text-xs tracking-[0.15em] uppercase">
                    {selectedFabric?.fabricType}
                  </p>
                  <p className="text-white font-semibold text-sm">
                    {selectedFabric?.colorName}
                  </p>
                </div>
              </div>
            ) : (
              /* Showing product image */
              <>
                {hasMultipleImages ? (
                  <ImageCarousel
                    images={product.images!}
                    alt={product.name}
                    aspectRatio="aspect-square"
                  />
                ) : (
                  <div className="relative aspect-square overflow-hidden bg-white">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                )}
              </>
            )}

            {product.tag && !showingFabric && (
              <span className="absolute top-4 left-4 bg-[var(--accent)] text-white text-xs px-3 py-1 font-medium z-10"
                style={fabricPreview ? { top: "calc(1rem + 36px)" } : undefined}
              >
                {product.tag}
              </span>
            )}
          </div>

          {/* Right — Info */}
          <div className="flex flex-col">
            {/* Category */}
            <p className="text-[var(--accent)] text-[11px] sm:text-xs font-medium tracking-[0.25em] uppercase mb-2 sm:mb-3">
              {product.category}
            </p>

            {/* Name */}
            <h2
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-[var(--foreground)] mb-3 sm:mb-4 leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {product.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4 sm:mb-6">
              <span className="text-xl sm:text-2xl md:text-3xl font-semibold text-[var(--primary)]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-base sm:text-lg text-[var(--foreground)]/30 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm sm:text-base text-[var(--foreground)]/60 leading-relaxed mb-4 sm:mb-6">
                {product.description}
              </p>
            )}

            {/* Divider */}
            <div className="border-t border-[var(--border)] mb-4 sm:mb-6" />

            {/* Fabric Selector or Material info */}
            {isUpholstered ? (
              <div className="mb-4 sm:mb-6">
                <p
                  className="text-sm font-semibold text-[var(--foreground)] mb-3"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Elegí tu tela
                </p>
                <FabricSelector
                  onSelect={setSelectedFabric}
                  selected={selectedFabric}
                  onPreviewImage={handleFabricPreview}
                />
              </div>
            ) : (
              /* Non-upholstered: show material info */
              <div className="mb-4 sm:mb-6">
                <p
                  className="text-sm font-semibold text-[var(--foreground)] mb-2"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Materiales
                </p>
                <div className="text-sm text-[var(--foreground)]/60 space-y-1">
                  {product.specs?.woodType && <p>Madera: {product.specs.woodType}</p>}
                  {product.specs?.finish && <p>Terminación: {product.specs.finish}</p>}
                  {product.specs?.upholstery && <p>{product.specs.upholstery}</p>}
                  {product.materials?.map((m) => <p key={m}>{m}</p>)}
                </div>
              </div>
            )}

            {/* Specs accordion */}
            {product.specs && (
              <div className="border border-[var(--border)] bg-white overflow-hidden mb-4 sm:mb-6">
                <button
                  onClick={() => setShowSpecs(!showSpecs)}
                  className="w-full flex items-center justify-between px-4 sm:px-5 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  <span>Especificaciones</span>
                  <ChevronDown
                    size={16}
                    className={cn("transition-transform", showSpecs && "rotate-180")}
                  />
                </button>
                {showSpecs && (
                  <div className="border-t border-[var(--border)] px-4 sm:px-5 py-4 text-sm">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      {product.specs.woodType && (
                        <>
                          <dt className="text-[var(--foreground)]/40">Madera</dt>
                          <dd className="font-medium text-[var(--foreground)]">{product.specs.woodType}</dd>
                        </>
                      )}
                      {product.specs.finish && (
                        <>
                          <dt className="text-[var(--foreground)]/40">Terminación</dt>
                          <dd className="font-medium text-[var(--foreground)]">{product.specs.finish}</dd>
                        </>
                      )}
                      {product.specs.upholstery && (
                        <>
                          <dt className="text-[var(--foreground)]/40">Tapizado</dt>
                          <dd className="font-medium text-[var(--foreground)]">{product.specs.upholstery}</dd>
                        </>
                      )}
                      {product.dimensions && (
                        <>
                          <dt className="text-[var(--foreground)]/40">Medidas</dt>
                          <dd className="font-medium text-[var(--foreground)]">
                            {product.dimensions.width} × {product.dimensions.depth} × {product.dimensions.height} cm
                          </dd>
                        </>
                      )}
                      {product.specs.seatHeight && (
                        <>
                          <dt className="text-[var(--foreground)]/40">Alto asiento</dt>
                          <dd className="font-medium text-[var(--foreground)]">{product.specs.seatHeight}</dd>
                        </>
                      )}
                      {product.specs.weight && (
                        <>
                          <dt className="text-[var(--foreground)]/40">Peso</dt>
                          <dd className="font-medium text-[var(--foreground)]">{product.specs.weight}</dd>
                        </>
                      )}
                      {product.specs.customFields?.map((field) => (
                        <Fragment key={field.label}>
                          <dt className="text-[var(--foreground)]/40">{field.label}</dt>
                          <dd className="font-medium text-[var(--foreground)]">{field.value}</dd>
                        </Fragment>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            )}

            {/* Quantity + Total + Add to Cart */}
            <div className="mt-auto space-y-3">
              {/* Quantity selector */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--foreground)]">Cantidad</span>
                <div className="flex items-center border border-[var(--border)]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-[var(--foreground)]/50 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-[var(--foreground)] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-[var(--foreground)]/50 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between py-3 border-t border-[var(--border)]">
                <span className="text-sm text-[var(--foreground)]/50 uppercase tracking-wide">Total</span>
                <span className="text-xl sm:text-2xl font-semibold text-[var(--primary)]">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className={cn(
                  "w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-6 text-sm font-medium tracking-[0.1em] uppercase transition-all",
                  justAdded
                    ? "bg-green-700 text-white"
                    : "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]"
                )}
              >
                {justAdded ? (
                  <>
                    <Check size={18} />
                    Agregado al carrito
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Agregar {quantity > 1 ? `${quantity} unidades` : "al carrito"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
