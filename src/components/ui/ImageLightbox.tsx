"use client";

import { useEffect, useCallback, useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  alt: string;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
}

export function ImageLightbox({ images, currentIndex, alt, onClose, onChangeIndex }: ImageLightboxProps) {
  const [zoomed, setZoomed] = useState(false);

  const goPrev = useCallback(() => {
    if (zoomed) return;
    onChangeIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images.length, onChangeIndex, zoomed]);

  const goNext = useCallback(() => {
    if (zoomed) return;
    onChangeIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, images.length, onChangeIndex, zoomed]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, goPrev, goNext]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <span className="text-white/50 text-sm tabular-nums">
          {images.length > 1 && `${currentIndex + 1} / ${images.length}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomed(!zoomed)}
            className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            aria-label={zoomed ? "Alejar" : "Zoom"}
          >
            {zoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-4 pb-4">
        {/* Prev arrow */}
        {images.length > 1 && !zoomed && (
          <button
            onClick={goPrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/40 hover:text-white transition-colors z-10"
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        {/* Main image */}
        <div
          className={cn(
            "relative w-full h-full flex items-center justify-center transition-all duration-300",
            zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
          )}
          onClick={() => setZoomed(!zoomed)}
        >
          <img
            src={images[currentIndex]}
            alt={`${alt} - ${currentIndex + 1}`}
            className={cn(
              "max-h-full transition-all duration-300 select-none",
              zoomed
                ? "max-w-none w-auto scale-150 cursor-zoom-out"
                : "max-w-full object-contain cursor-zoom-in"
            )}
            draggable={false}
          />
        </div>

        {/* Next arrow */}
        {images.length > 1 && !zoomed && (
          <button
            onClick={goNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/40 hover:text-white transition-colors z-10"
            aria-label="Imagen siguiente"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && !zoomed && (
        <div className="flex justify-center gap-2 px-4 pb-4 flex-shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onChangeIndex(i)}
              className={cn(
                "w-14 h-14 sm:w-16 sm:h-16 border-2 overflow-hidden flex-shrink-0 transition-all",
                i === currentIndex
                  ? "border-white opacity-100"
                  : "border-transparent opacity-40 hover:opacity-70"
              )}
            >
              <img
                src={img}
                alt={`${alt} - miniatura ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
