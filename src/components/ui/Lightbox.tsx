"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxImage {
  src: string;
  alt: string;
  title?: string;
  category?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function Lightbox({ images, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const current = images[currentIndex];
  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Cerrar galería"
        className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-10"
      >
        <X size={32} />
      </button>

      {/* Counter */}
      <div className="absolute top-6 left-6 text-white/60 text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Prev */}
      <button
        onClick={onPrev}
        aria-label="Imagen anterior"
        className="absolute left-4 md:left-6 text-white/80 hover:text-white transition-colors z-10"
      >
        <ChevronLeft size={48} />
      </button>

      {/* Image */}
      <div className="relative max-w-5xl w-full h-[70vh] mx-4">
        <Image
          src={current.src}
          alt={current.alt}
          fill
          sizes="90vw"
          className="object-contain"
        />
      </div>

      {/* Caption */}
      {(current.title || current.category) && (
        <div className="absolute bottom-8 left-0 right-0 text-center">
          {current.category && (
            <p className="text-[var(--accent)] text-sm mb-1">{current.category}</p>
          )}
          {current.title && (
            <h3 className="text-white text-xl font-medium">{current.title}</h3>
          )}
        </div>
      )}

      {/* Next */}
      <button
        onClick={onNext}
        aria-label="Imagen siguiente"
        className="absolute right-4 md:right-6 text-white/80 hover:text-white transition-colors z-10"
      >
        <ChevronRight size={48} />
      </button>
    </div>
  );
}
