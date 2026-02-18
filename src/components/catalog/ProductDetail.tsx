"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ShoppingCart, Check, ArrowLeft, Minus, Plus, MessageCircle, ZoomIn, ChevronLeft, ChevronRight, Maximize2, Minimize2, Share2, Scan } from "lucide-react";
import { Product } from "@/types/product";
import { FabricSelection } from "@/types/fabric";
import { fabricTypes } from "@/data/fabrics";
import { FabricSelector } from "@/components/catalog/FabricSelector";
import { FabricPreviewCanvas } from "@/components/catalog/FabricPreviewCanvas";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { StockAlert } from "@/components/catalog/StockAlert";
import { SizeGuide } from "@/components/catalog/SizeGuide";
import { RoomVisualizer } from "@/components/catalog/RoomVisualizer";
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<'images' | 'fabric'>('images');
  const { addItem } = useCart();
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const [fabricExpanded, setFabricExpanded] = useState(false);
  const [fabricPos, setFabricPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mx: number; my: number; px: number; py: number; moved: boolean } | null>(null);
  const justDraggedRef = useRef(false);
  const [fabricSize, setFabricSize] = useState<'sm' | 'lg'>('lg');
  const [viewerCount, setViewerCount] = useState(0);
  const [roomVizOpen, setRoomVizOpen] = useState(false);

  const isUpholstered = product.upholstered !== false;
  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];

  useEffect(() => {
    setSelectedFabric(null);
    setQuantity(1);
    setCurrentImageIndex(0);
    setLightboxOpen(false);
    setActiveNav('images');
    setFabricExpanded(false);
    setFabricPos(null);
    setFabricSize('lg');
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [product.id]);

  // Social proof: dynamic viewer count
  useEffect(() => {
    const base = String(product.id).split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
    setViewerCount((base % 5) + 2);
    const interval = setInterval(() => {
      setViewerCount((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.max(2, Math.min(9, prev + delta));
      });
    }, 15000 + Math.random() * 10000);
    return () => clearInterval(interval);
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
      if (fabricExpanded) { setFabricExpanded(false); return; }
      onClose();
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (fabricExpanded || activeNav === 'fabric') {
        navigateFabric(-1);
      } else if (allImages.length > 1) {
        setCurrentImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
      }
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      if (fabricExpanded || activeNav === 'fabric') {
        navigateFabric(1);
      } else if (allImages.length > 1) {
        setCurrentImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));
      }
    }
  }, [onClose, allImages.length, lightboxOpen, activeNav, navigateFabric, fabricExpanded]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when fabric is expanded
  useEffect(() => {
    if (fabricExpanded) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [fabricExpanded]);

  // Mobile swipe on images
  const onImageTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
  }, []);

  const onImageTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.t;
    touchStartRef.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 500) {
      e.preventDefault();
      if (dx > 0) setCurrentImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
      else setCurrentImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));
    }
  }, [allImages.length]);

  // Fabric preview drag (pointer events = mouse + touch unified)
  const onFabricPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const container = imageContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const el = e.currentTarget as HTMLElement;
    const elRect = el.getBoundingClientRect();
    dragStartRef.current = {
      mx: e.clientX, my: e.clientY,
      px: elRect.left - rect.left, py: elRect.top - rect.top,
      moved: false,
    };
    isDraggingRef.current = true;
  }, []);

  const onFabricPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.mx;
    const dy = e.clientY - dragStartRef.current.my;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragStartRef.current.moved = true;
    if (!dragStartRef.current.moved) return;
    const container = imageContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pw = window.innerWidth < 640 ? 96 : 144;
    const ph = pw + 36;
    setFabricPos({
      x: Math.max(0, Math.min(rect.width - pw, dragStartRef.current.px + dx)),
      y: Math.max(0, Math.min(rect.height - ph, dragStartRef.current.py + dy)),
    });
  }, []);

  const onFabricPointerUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    if (dragStartRef.current?.moved) {
      justDraggedRef.current = true;
      setTimeout(() => { justDraggedRef.current = false; }, 100);
    } else {
      setActiveNav("fabric");
    }
    isDraggingRef.current = false;
    dragStartRef.current = null;
  }, []);

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
            title="Volver al catálogo"
            className="flex items-center gap-2 text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="tracking-wide uppercase text-[11px] font-medium hidden sm:inline">
              Volver al catálogo
            </span>
          </button>
          <button
            onClick={onClose}
            title="Cerrar"
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
                ref={imageContainerRef}
                className="relative aspect-square overflow-hidden bg-[var(--muted)] cursor-pointer group"
                onClick={() => { if (justDraggedRef.current) return; setActiveNav('images'); setLightboxOpen(true); }}
                onTouchStart={onImageTouchStart}
                onTouchEnd={onImageTouchEnd}
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

                {/* Floating fabric preview — draggable + resizable */}
                {selectedFabric && (
                  <div
                    data-fabric-preview
                    className={cn(
                      "absolute z-10 touch-none select-none",
                      fabricPos ? "" : "bottom-3 left-3",
                      activeNav === 'fabric'
                        ? "ring-2 ring-[var(--primary)] shadow-lg"
                        : "ring-1 ring-white/40 hover:ring-white/70",
                      "cursor-grab active:cursor-grabbing"
                    )}
                    style={fabricPos ? { left: fabricPos.x, top: fabricPos.y } : undefined}
                    onPointerDown={onFabricPointerDown}
                    onPointerMove={onFabricPointerMove}
                    onPointerUp={onFabricPointerUp}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={cn(
                      "relative overflow-hidden transition-all duration-200",
                      fabricSize === 'sm'
                        ? "w-24 h-24 sm:w-36 sm:h-36"
                        : "w-44 h-44 sm:w-56 sm:h-56"
                    )}>
                      {selectedFabric.colorImage ? (
                        <img
                          src={selectedFabric.colorImage}
                          alt={selectedFabric.colorName}
                          className="w-full h-full object-cover pointer-events-none"
                          draggable={false}
                        />
                      ) : (
                        <div
                          className="w-full h-full pointer-events-none"
                          style={{ backgroundColor: selectedFabric.colorHex }}
                        />
                      )}
                    </div>
                    {/* Label + actions bar */}
                    <div className="bg-black/70 backdrop-blur-sm px-2 py-1.5 flex items-center justify-between gap-1">
                      <div className="min-w-0 pointer-events-none">
                        <p className="text-white/60 text-[8px] sm:text-[9px] tracking-[0.15em] uppercase truncate">
                          {selectedFabric.fabricType}
                        </p>
                        <p className="text-white text-[10px] sm:text-[11px] font-medium truncate">
                          {selectedFabric.colorName}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {/* Toggle size */}
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFabricSize(fabricSize === 'sm' ? 'lg' : 'sm');
                            setFabricPos(null);
                          }}
                          className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                          title={fabricSize === 'sm' ? 'Agrandar' : 'Achicar'}
                        >
                          {fabricSize === 'sm' ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
                        </button>
                        {/* Fullscreen */}
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); setFabricExpanded(true); }}
                          className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                          title="Ver en pantalla completa"
                        >
                          <ZoomIn size={11} />
                        </button>
                      </div>
                    </div>
                    {activeNav === 'fabric' && (
                      <div className="absolute -top-2 -right-2 bg-[var(--primary)] text-white text-[8px] px-1.5 py-0.5 font-bold shadow pointer-events-none">
                        ←→
                      </div>
                    )}
                  </div>
                )}

                {/* Zoom hint */}
                <div
                  className={cn(
                    "absolute bottom-3 right-3 w-9 h-9 bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                    selectedFabric && "bottom-3 right-3"
                  )}
                  title="Ampliar imagen"
                >
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
                      title="Imagen anterior"
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
                      title="Imagen siguiente"
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

          {/* Expanded fabric fullscreen */}
          {fabricExpanded && selectedFabric && (
            <div
              className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center"
              onClick={() => setFabricExpanded(false)}
            >
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  onClick={() => setFabricExpanded(false)}
                  className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <Minimize2 size={20} />
                </button>
                <button
                  onClick={() => setFabricExpanded(false)}
                  className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <X size={22} />
                </button>
              </div>
              <div
                className="relative w-[85vw] h-[55vh] sm:w-[70vw] sm:h-[70vh] max-w-3xl"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedFabric.colorImage ? (
                  <img
                    src={selectedFabric.colorImage}
                    alt={selectedFabric.colorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full" style={{ backgroundColor: selectedFabric.colorHex }} />
                )}
                <button
                  onClick={() => { navigateFabric(-1); setActiveNav('fabric'); }}
                  className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center bg-transparent hover:bg-black/30 text-white/40 hover:text-white transition-colors"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={() => { navigateFabric(1); setActiveNav('fabric'); }}
                  className="absolute right-0 top-0 bottom-0 w-14 flex items-center justify-center bg-transparent hover:bg-black/30 text-white/40 hover:text-white transition-colors"
                >
                  <ChevronRight size={32} />
                </button>
              </div>
              <div className="mt-4 text-center" onClick={(e) => e.stopPropagation()}>
                <p className="text-white/50 text-xs tracking-[0.2em] uppercase">
                  {selectedFabric.fabricType}
                </p>
                <p className="text-white text-lg font-medium mt-1">
                  {selectedFabric.colorName}
                </p>
                <p className="text-white/30 text-xs mt-2">
                  ← → para cambiar color · ESC para cerrar
                </p>
              </div>
            </div>
          )}

          {/* Right — Info */}
          <div className="flex flex-col">
            {/* Social proof */}
            {viewerCount > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                </span>
                <span className="text-[11px] text-[var(--foreground)]/40">
                  {viewerCount} personas viendo este producto ahora
                </span>
              </div>
            )}

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
              <div className="text-sm sm:text-base text-[var(--foreground)]/60 leading-relaxed mb-6 sm:mb-8 whitespace-pre-line">
                {product.description}
              </div>
            )}

            {/* Materials — subtle divider + label */}
            {(product.specs?.woodType || product.specs?.finish || product.specs?.upholstery || product.dimensions || product.materials?.length) && (
              <>
                <div className="border-t border-[var(--border)]/40 mb-4" />
                <div className="mb-6 sm:mb-8">
                  <p className="text-[10px] text-[var(--foreground)]/30 tracking-[0.2em] uppercase mb-2">
                    Materiales
                  </p>
                  <div className="text-sm text-[var(--foreground)]/50 space-y-1">
                    {product.specs?.woodType && <p>Madera: {product.specs.woodType}</p>}
                    {product.specs?.finish && <p>Terminación: {product.specs.finish}</p>}
                    {product.specs?.upholstery && <p>{product.specs.upholstery}</p>}
                    {product.dimensions && (
                      <p>Medidas: {product.dimensions.width} × {product.dimensions.depth} × {product.dimensions.height} cm</p>
                    )}
                    {product.materials?.map((m) => <p key={m}>{m}</p>)}
                  </div>
                </div>
              </>
            )}

            {/* Divider */}
            <div className="border-t border-[var(--border)] mb-6 sm:mb-8" />

            {/* Fabric Selector */}
            {isUpholstered && (
              <div className="mb-6 sm:mb-8">
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
            )}

            {/* Quantity + Total + Add to Cart */}
            <div className="mt-auto space-y-3">
              {/* Quantity selector */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--foreground)]">Cantidad</span>
                <div className="flex items-center border border-[var(--border)]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    title="Reducir cantidad"
                    className="w-10 h-10 flex items-center justify-center text-[var(--foreground)]/50 hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-[var(--foreground)] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    title="Aumentar cantidad"
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
                title="Agregar al carrito"
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
                title="Consultar disponibilidad por WhatsApp"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-4 px-6 text-sm font-medium tracking-[0.1em] uppercase transition-all bg-[#25D366] text-white hover:bg-[#20BD5A]"
              >
                <MessageCircle size={18} />
                Consultar por WhatsApp
              </a>

              {/* Secondary actions */}
              <div className="flex gap-2">
                {/* Share */}
                <a
                  title="Compartir producto por WhatsApp"
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Mirá este producto de Home Stock: ${product.name}${selectedFabric ? ` en ${selectedFabric.fabricType} ${selectedFabric.colorName}` : ""} — ${formatPrice(product.price)} https://somoshomestock.com/catalogo?product=${product.id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-[var(--border)] text-sm text-[var(--foreground)]/60 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                >
                  <Share2 size={15} />
                  Compartir
                </a>
                {/* Room Visualizer */}
                <button
                  onClick={() => setRoomVizOpen(true)}
                  title="Visualizá el producto en tu habitación"
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-[var(--border)] text-sm text-[var(--foreground)]/60 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                >
                  <Scan size={15} />
                  Probá en tu espacio
                </button>
              </div>

              {/* Stock alert (only for out-of-stock) */}
              {product.stock === 0 && (
                <StockAlert productName={product.name} productId={product.id} />
              )}
            </div>

            {/* Size Guide */}
            {product.dimensions && (
              <div className="mt-6">
                <SizeGuide dimensions={product.dimensions} productName={product.name} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Room Visualizer Modal */}
      <RoomVisualizer
        isOpen={roomVizOpen}
        onClose={() => setRoomVizOpen(false)}
        productImage={product.image}
        productName={product.name}
      />
    </section>
  );
}
