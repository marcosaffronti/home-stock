"use client";

import { useState, Fragment, useEffect, useRef, useCallback } from "react";
import { X, ShoppingCart, Check, ChevronDown, ArrowLeft, Minus, Plus, MessageCircle, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/product";
import { FabricSelection } from "@/types/fabric";
import { fabricTypes } from "@/data/fabrics";
import { FabricSelector } from "@/components/catalog/FabricSelector";
import { FabricPreviewCanvas } from "@/components/catalog/FabricPreviewCanvas";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import Image from "next/image";

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

export function ProductDetail({ product, onClose }: ProductDetailProps) {
  const [selectedFabric, setSelectedFabric] = useState<FabricSelection | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<'images' | 'fabric'>('images');
  const { addItem } = useCart();
  const sectionRef = useRef<HTMLDivElement>(null);

  const isUpholstered = product.upholstered !== false;
  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];

  useEffect(() => {
    setSelectedFabric(null);
    setShowSpecs(false);
    setQuantity(1);
    setCurrentImageIndex(0);
    setLightboxOpen(false);
    setActiveNav('images');
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [product.id]);

  // Navigate fabric colors (reused by keyboard + floating preview arrows)
  const navigateFabric = useCallback((dir: 1 | -1) => {
    if (selectedFabric) {
      const ft = fabricTypes.find(f => f.name === selectedFabric.fabricType);
      if (ft) {
        const idx = ft.colors.findIndex(c => c.name === selectedFabric.colorName);
        const next = (idx + dir + ft.colors.length) % ft.colors.length;
        const color = ft.colors[next];
        setSelectedFabric({
          fabricType: ft.name,
          colorName: color.name,
          colorHex: color.hex,
          colorImage: color.image,
        });
      }
    } else {
      const ft = fabricTypes[0];
      const color = ft.colors[0];
      setSelectedFabric({
        fabricType: ft.name,
        colorName: color.name,
        colorHex: color.hex,
        colorImage: color.image,
      });
    }
  }, [selectedFabric]);

  // Keyboard: ←→ navigate based on activeNav (images or fabric)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (lightboxOpen) return;
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (activeNav === 'fabric') {
        navigateFabric(-1);
      } else if (allImages.length > 1) {
        setCurrentImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
      }
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (activeNav === 'fabric') {
        navigateFabric(1);
      } else if (allImages.length > 1) {
        setCurrentImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));
      }
    }
  }, [onClose, allImages.length, lightboxOpen, activeNav, navigateFabric]);

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
            {/* Main image area */}
            <div className="space-y-3">
              <div
                className="relative aspect-square overflow-hidden bg-[var(--muted)] cursor-pointer group"
                onClick={() => { setActiveNav('images'); setLightboxOpen(true); }}
              >
                {/* Product image or fabric composite */}
                {product.fabricMask && selectedFabric?.colorImage ? (
                  <FabricPreviewCanvas
                    productImage={allImages[currentImageIndex]}
                    fabricTexture={selectedFabric.colorImage}
                    maskImage={product.fabricMask}
                    alt={`${product.name} en ${selectedFabric.fabricType} ${selectedFabric.colorName}`}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={allImages[currentImageIndex]}
                    alt={`${product.name} - ${currentImageIndex + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain transition-opacity duration-300"
                    priority
                  />
                )}

                {/* Tag (Nuevo, Destacado) */}
                {product.tag && (
                  <span className="absolute top-3 left-3 bg-[var(--accent)] text-white text-xs px-3 py-1 font-medium z-10">
                    {product.tag}
                  </span>
                )}

                {/* Fabric label when composite is active */}
                {product.fabricMask && selectedFabric && (
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/90 px-2.5 py-1.5 pointer-events-none z-10"
                    style={product.tag ? { top: "2.75rem" } : undefined}
                  >
                    <div
                      className="w-4 h-4 border border-[var(--border)]"
                      style={{ backgroundColor: selectedFabric.colorHex }}
                    />
                    <span className="text-[10px] font-medium text-[var(--foreground)]/70 tracking-wide">
                      {selectedFabric.fabricType} · {selectedFabric.colorName}
                    </span>
                  </div>
                )}

                {/* Floating fabric preview */}
                {selectedFabric && (
                  <div
                    className={cn(
                      "absolute bottom-3 left-3 z-10 cursor-pointer transition-all",
                      activeNav === 'fabric'
                        ? "ring-2 ring-[var(--primary)] shadow-lg"
                        : "ring-1 ring-white/40 hover:ring-white/70"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveNav('fabric');
                    }}
                  >
                    <div className="relative w-24 h-24 sm:w-36 sm:h-36 overflow-hidden">
                      {selectedFabric.colorImage ? (
                        <img
                          src={selectedFabric.colorImage}
                          alt={selectedFabric.colorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: selectedFabric.colorHex }}
                        />
                      )}
                      {/* Mini nav arrows */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateFabric(-1);
                          setActiveNav('fabric');
                        }}
                        className="absolute left-0 top-0 bottom-0 w-7 flex items-center justify-center bg-transparent hover:bg-black/30 text-transparent hover:text-white transition-colors"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateFabric(1);
                          setActiveNav('fabric');
                        }}
                        className="absolute right-0 top-0 bottom-0 w-7 flex items-center justify-center bg-transparent hover:bg-black/30 text-transparent hover:text-white transition-colors"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="bg-black/70 backdrop-blur-sm px-2 py-1">
                      <p className="text-white/60 text-[8px] sm:text-[9px] tracking-[0.15em] uppercase truncate">
                        {selectedFabric.fabricType}
                      </p>
                      <p className="text-white text-[10px] sm:text-[11px] font-medium truncate">
                        {selectedFabric.colorName}
                      </p>
                    </div>
                    {activeNav === 'fabric' && (
                      <div className="absolute -top-2 -right-2 bg-[var(--primary)] text-white text-[8px] px-1.5 py-0.5 font-bold shadow">
                        ←→
                      </div>
                    )}
                  </div>
                )}

                {/* Zoom hint */}
                <div className={cn(
                  "absolute bottom-3 right-3 w-9 h-9 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                  selectedFabric && "bottom-3 right-3"
                )}>
                  <ZoomIn size={16} className="text-[var(--foreground)]/60" />
                </div>

                {/* Prev/Next arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNav('images');
                        setCurrentImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveNav('images');
                        setCurrentImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Image counter + active indicator */}
                {allImages.length > 1 && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {activeNav === 'images' && selectedFabric && (
                      <span className="bg-[var(--primary)] text-white text-[8px] px-1.5 py-0.5 font-bold shadow">
                        ←→
                      </span>
                    )}
                    <span className="bg-black/50 text-white text-[10px] px-2 py-0.5 tabular-nums">
                      {currentImageIndex + 1} / {allImages.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveNav('images'); setCurrentImageIndex(i); }}
                      className={cn(
                        "relative w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 border overflow-hidden transition-all",
                        i === currentImageIndex
                          ? "border-[var(--primary)] ring-1 ring-[var(--primary)]"
                          : "border-[var(--border)] opacity-60 hover:opacity-100"
                      )}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} - miniatura ${i + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Keyboard hint */}
              {selectedFabric && (
                <p className="hidden sm:block text-[10px] text-[var(--foreground)]/25 text-center mt-1">
                  Hacé click en la foto o en la tela para navegar con ←→
                </p>
              )}
            </div>
          </div>

          {/* Lightbox */}
          {lightboxOpen && (
            <ImageLightbox
              images={allImages}
              currentIndex={currentImageIndex}
              alt={product.name}
              onClose={() => setLightboxOpen(false)}
              onChangeIndex={setCurrentImageIndex}
            />
          )}

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

            {/* Price + stock badge */}
            <div className="flex items-baseline gap-3 mb-4 sm:mb-6">
              <span
                className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-[var(--primary)]"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span
                  className="text-lg sm:text-xl text-[var(--foreground)]/25 line-through font-light"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.stock > 0 && product.stock <= 3 && (
                <span className="text-[10px] font-medium text-[var(--accent)] tracking-[0.15em] uppercase">
                  {product.stock === 1 ? "Último disponible" : `Solo ${product.stock} disponibles`}
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
                  onSelect={(fabric) => { setSelectedFabric(fabric); setActiveNav('fabric'); }}
                  selected={selectedFabric}
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
                <span className="text-[11px] text-[var(--foreground)]/40 uppercase tracking-[0.2em]">Total</span>
                <span
                  className="text-xl sm:text-2xl font-normal text-[var(--primary)]"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
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

              {/* WhatsApp — pre-built message */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Hola! Me interesa ${product.name}${quantity > 1 ? ` × ${quantity}` : ""}${selectedFabric ? ` en ${selectedFabric.fabricType} ${selectedFabric.colorName}` : ""}. ¿Tienen disponibilidad?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-6 text-sm font-medium tracking-[0.1em] uppercase transition-all bg-[#25D366] text-white hover:bg-[#20BD5A]"
              >
                <MessageCircle size={18} />
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
