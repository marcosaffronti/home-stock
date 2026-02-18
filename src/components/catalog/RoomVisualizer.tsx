"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, Upload, Move, RotateCcw, Download, ZoomIn, ZoomOut } from "lucide-react";
import Image from "next/image";

interface RoomVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
  productImage: string;
  productName: string;
}

type DragTarget = "room" | "product" | null;

export function RoomVisualizer({ isOpen, onClose, productImage, productName }: RoomVisualizerProps) {
  const [roomImage, setRoomImage] = useState<string | null>(null);

  // Room image transform
  const [roomZoom, setRoomZoom] = useState(1);
  const [roomOffset, setRoomOffset] = useState({ x: 0, y: 0 });

  // Product overlay
  const [productPos, setProductPos] = useState({ x: 50, y: 50 });
  const [productScale, setProductScale] = useState(25);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragTarget = useRef<DragTarget>(null);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  // Resize uploaded images to prevent performance issues
  const processImage = useCallback((file: File) => {
    const img = new window.Image();
    img.onload = () => {
      const MAX = 1920;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, width, height);
      setRoomImage(canvas.toDataURL("image/jpeg", 0.85));
      resetState();
    };
    img.src = URL.createObjectURL(file);
  }, []);

  const resetState = () => {
    setRoomZoom(1);
    setRoomOffset({ x: 0, y: 0 });
    setProductPos({ x: 50, y: 50 });
    setProductScale(25);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImage(file);
  };

  // Scroll-wheel: zoom room image (on background) or product (on product overlay)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !roomImage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Check if scrolling over product overlay
      const target = e.target as HTMLElement;
      if (target.closest("[data-product-overlay]")) {
        setProductScale((prev) => Math.max(5, Math.min(90, prev - e.deltaY * 0.05)));
      } else {
        setRoomZoom((prev) => Math.max(0.5, Math.min(4, prev - e.deltaY * 0.002)));
      }
    };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [roomImage]);

  // Product drag
  const onProductPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragTarget.current = "product";
    dragStart.current = {
      mx: e.clientX, my: e.clientY,
      px: productPos.x, py: productPos.y,
    };
  }, [productPos]);

  // Room drag (background pan)
  const onRoomPointerDown = useCallback((e: React.PointerEvent) => {
    // Only start room drag if clicking on background, not on product
    const target = e.target as HTMLElement;
    if (target.closest("[data-product-overlay]")) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragTarget.current = "room";
    dragStart.current = {
      mx: e.clientX, my: e.clientY,
      px: roomOffset.x, py: roomOffset.y,
    };
  }, [roomOffset]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragTarget.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (dragTarget.current === "product") {
      const dx = ((e.clientX - dragStart.current.mx) / rect.width) * 100;
      const dy = ((e.clientY - dragStart.current.my) / rect.height) * 100;
      setProductPos({
        x: Math.max(0, Math.min(100, dragStart.current.px + dx)),
        y: Math.max(0, Math.min(100, dragStart.current.py + dy)),
      });
    } else if (dragTarget.current === "room") {
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      setRoomOffset({
        x: dragStart.current.px + dx,
        y: dragStart.current.py + dy,
      });
    }
  }, []);

  const onPointerUp = useCallback(() => {
    dragTarget.current = null;
  }, []);

  const handleDownload = useCallback(() => {
    const container = containerRef.current;
    if (!container || !roomImage) return;
    const canvas = document.createElement("canvas");
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);

    const roomImg = new window.Image();
    roomImg.crossOrigin = "anonymous";
    roomImg.onload = () => {
      // Draw room image with zoom/offset applied
      const rw = rect.width * roomZoom;
      const rh = rect.height * roomZoom;
      const rx = (rect.width - rw) / 2 + roomOffset.x;
      const ry = (rect.height - rh) / 2 + roomOffset.y;
      ctx.drawImage(roomImg, rx, ry, rw, rh);

      const prodImg = new window.Image();
      prodImg.crossOrigin = "anonymous";
      prodImg.onload = () => {
        const pw = (productScale / 100) * rect.width;
        const ph = pw;
        const px = (productPos.x / 100) * rect.width - pw / 2;
        const py = (productPos.y / 100) * rect.height - ph / 2;
        ctx.drawImage(prodImg, px, py, pw, ph);

        const link = document.createElement("a");
        link.download = `${productName}-en-mi-espacio.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      prodImg.src = productImage;
    };
    roomImg.src = roomImage;
  }, [roomImage, productImage, productName, productPos, productScale, roomZoom, roomOffset]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] flex-shrink-0">
          <h2
            className="font-semibold text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Probá en tu espacio
          </h2>
          <button
            onClick={onClose}
            title="Cerrar"
            className="w-9 h-9 flex items-center justify-center text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {!roomImage ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-[var(--muted)] flex items-center justify-center mb-6">
              <Upload size={32} className="text-[var(--primary)]" />
            </div>
            <h3
              className="text-xl font-semibold text-[var(--foreground)] mb-2"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Subí una foto de tu espacio
            </h3>
            <p className="text-sm text-[var(--foreground)]/50 mb-6 text-center max-w-sm">
              Tomá una foto de tu habitación y vamos a colocar el producto para que veas cómo queda
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-8 py-3.5 bg-[var(--primary)] text-white text-sm font-medium tracking-[0.1em] uppercase hover:bg-[var(--primary-dark)] transition-colors"
            >
              <Upload size={16} />
              Elegir foto
            </button>
            <p className="text-[10px] text-[var(--foreground)]/30 mt-4">
              Las imágenes grandes se redimensionan automáticamente
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Canvas area */}
            <div
              ref={containerRef}
              className="relative flex-1 min-h-[300px] max-h-[60vh] overflow-hidden bg-gray-900 cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={onRoomPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            >
              {/* Room image — zoomable + pannable */}
              <img
                src={roomImage}
                alt="Tu espacio"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                draggable={false}
                style={{
                  transform: `translate(${roomOffset.x}px, ${roomOffset.y}px) scale(${roomZoom})`,
                  transformOrigin: "center center",
                }}
              />

              {/* Product overlay — draggable */}
              <div
                data-product-overlay
                className="absolute touch-none cursor-grab active:cursor-grabbing z-10"
                style={{
                  left: `${productPos.x}%`,
                  top: `${productPos.y}%`,
                  width: `${productScale}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onPointerDown={onProductPointerDown}
              >
                <div className="relative aspect-square">
                  <Image
                    src={productImage}
                    alt={productName}
                    fill
                    sizes="400px"
                    className="object-contain drop-shadow-2xl pointer-events-none"
                    draggable={false}
                  />
                </div>
                <div className="absolute top-1 right-1 w-6 h-6 bg-white/80 flex items-center justify-center shadow pointer-events-none">
                  <Move size={12} className="text-[var(--foreground)]/60" />
                </div>
              </div>

              {/* Hint */}
              <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] px-2.5 py-1.5 pointer-events-none z-10">
                Arrastrá la foto o el producto · Scroll para zoom
              </div>
            </div>

            {/* Controls */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
              {/* Room zoom */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--foreground)]/40 tracking-wide uppercase">Fondo</span>
                <button
                  onClick={() => setRoomZoom((z) => Math.max(0.5, z - 0.15))}
                  title="Alejar foto"
                  className="w-7 h-7 flex items-center justify-center border border-[var(--border)] text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors"
                >
                  <ZoomOut size={12} />
                </button>
                <button
                  onClick={() => setRoomZoom((z) => Math.min(4, z + 0.15))}
                  title="Acercar foto"
                  className="w-7 h-7 flex items-center justify-center border border-[var(--border)] text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors"
                >
                  <ZoomIn size={12} />
                </button>
              </div>

              {/* Product size */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--foreground)]/40 tracking-wide uppercase">Producto</span>
                <button
                  onClick={() => setProductScale((s) => Math.max(5, s - 5))}
                  title="Achicar producto"
                  className="w-7 h-7 flex items-center justify-center border border-[var(--border)] text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors"
                >
                  <ZoomOut size={12} />
                </button>
                <input
                  type="range"
                  min={5}
                  max={90}
                  value={productScale}
                  onChange={(e) => setProductScale(Number(e.target.value))}
                  className="w-20 sm:w-28 accent-[var(--primary)]"
                  title="Tamaño del producto"
                />
                <button
                  onClick={() => setProductScale((s) => Math.min(90, s + 5))}
                  title="Agrandar producto"
                  className="w-7 h-7 flex items-center justify-center border border-[var(--border)] text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors"
                >
                  <ZoomIn size={12} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setRoomImage(null); resetState(); }}
                  title="Cambiar foto del espacio"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-[var(--foreground)]/50 hover:text-[var(--foreground)] border border-[var(--border)] transition-colors"
                >
                  <RotateCcw size={12} />
                  <span className="hidden sm:inline">Otra foto</span>
                </button>
                <button
                  onClick={handleDownload}
                  title="Guardar imagen"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors"
                >
                  <Download size={12} />
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
