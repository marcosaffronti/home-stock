"use client";

import { useEffect, useRef, useState } from "react";

interface FabricPreviewCanvasProps {
  productImage: string;
  fabricTexture: string;
  maskImage: string;
  alt: string;
  className?: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function FabricPreviewCanvas({
  productImage,
  fabricTexture,
  maskImage,
  alt,
  className,
}: FabricPreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    Promise.all([
      loadImage(productImage),
      loadImage(fabricTexture),
      loadImage(maskImage),
    ])
      .then(([product, fabric, mask]) => {
        if (cancelled) return;

        const w = product.naturalWidth;
        const h = product.naturalHeight;
        canvas.width = w;
        canvas.height = h;

        // 1. Draw original product photo
        ctx.drawImage(product, 0, 0, w, h);

        // 2. Create masked fabric on temp canvas
        const temp = document.createElement("canvas");
        temp.width = w;
        temp.height = h;
        const tCtx = temp.getContext("2d")!;

        // Draw mask (white = upholstery area)
        tCtx.drawImage(mask, 0, 0, w, h);

        // Clip fabric texture to mask shape using source-in
        tCtx.globalCompositeOperation = "source-in";
        const pattern = tCtx.createPattern(fabric, "repeat");
        if (pattern) {
          // Scale fabric texture to a reasonable size relative to image
          const scale = Math.max(w, h) / 800;
          tCtx.save();
          tCtx.scale(scale, scale);
          tCtx.fillStyle = pattern;
          tCtx.fillRect(0, 0, w / scale, h / scale);
          tCtx.restore();
        }
        tCtx.globalCompositeOperation = "source-over";

        // 3. Apply masked fabric with 'color' blend to change hue/saturation
        //    while keeping original luminosity (shadows, wrinkles, depth)
        ctx.globalCompositeOperation = "color";
        ctx.drawImage(temp, 0, 0);

        // 4. Apply subtle fabric texture with 'overlay' blend for realism
        ctx.globalCompositeOperation = "overlay";
        ctx.globalAlpha = 0.25;
        ctx.drawImage(temp, 0, 0);
        ctx.globalAlpha = 1;

        // Reset
        ctx.globalCompositeOperation = "source-over";

        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [productImage, fabricTexture, maskImage]);

  if (error) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-label={alt}
        className={className}
        style={{ display: loading ? "none" : "block" }}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--muted)]">
          <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent animate-spin" />
        </div>
      )}
    </>
  );
}
