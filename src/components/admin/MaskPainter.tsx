"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Paintbrush, Eraser, RotateCcw, Save, X, Minus, Plus, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaskPainterProps {
  productImage: string;
  existingMask?: string;
  onSave: (maskDataUrl: string) => void;
  onClose: () => void;
}

export default function MaskPainter({ productImage, existingMask, onSave, onClose }: MaskPainterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const productImgRef = useRef<HTMLImageElement | null>(null);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [brushSize, setBrushSize] = useState(30);
  const [showMask, setShowMask] = useState(true);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const isPainting = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Load product image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      productImgRef.current = img;
      // Use image natural size, capped to 800px wide for usability
      const maxW = Math.min(window.innerWidth - 32, 800);
      const scale = Math.min(maxW / img.naturalWidth, 1);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      setDims({ w, h });
    };
    img.src = productImage;
  }, [productImage]);

  // Set up canvases once dims are known
  useEffect(() => {
    if (!dims) return;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const img = productImgRef.current;
    if (!canvas || !overlay || !img) return;

    canvas.width = dims.w;
    canvas.height = dims.h;
    overlay.width = dims.w;
    overlay.height = dims.h;

    // Draw product image
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, dims.w, dims.h);

    // Load existing mask if any
    if (existingMask) {
      const maskImg = new window.Image();
      maskImg.crossOrigin = "anonymous";
      maskImg.onload = () => {
        const oCtx = overlay.getContext("2d")!;
        oCtx.drawImage(maskImg, 0, 0, dims.w, dims.h);
      };
      maskImg.src = existingMask;
    }
  }, [dims, existingMask]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const getCanvasPos = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const overlay = overlayRef.current;
    if (!overlay) return null;
    const rect = overlay.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const paint = useCallback((x: number, y: number) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d")!;

    ctx.globalCompositeOperation = tool === "brush" ? "source-over" : "destination-out";
    ctx.beginPath();

    if (lastPos.current) {
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "white";
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
    }

    lastPos.current = { x, y };
    ctx.globalCompositeOperation = "source-over";
  }, [tool, brushSize]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isPainting.current = true;
    lastPos.current = null;
    const pos = getCanvasPos(e);
    if (pos) paint(pos.x, pos.y);
  }, [getCanvasPos, paint]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isPainting.current) return;
    const pos = getCanvasPos(e);
    if (pos) paint(pos.x, pos.y);
  }, [getCanvasPos, paint]);

  const handleEnd = useCallback(() => {
    isPainting.current = false;
    lastPos.current = null;
  }, []);

  const clearMask = () => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d")!;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
  };

  const handleSave = () => {
    const overlay = overlayRef.current;
    if (!overlay || !dims) return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = dims.w;
    exportCanvas.height = dims.h;
    const ctx = exportCanvas.getContext("2d")!;

    // Black background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, dims.w, dims.h);

    // Draw mask (white areas)
    ctx.drawImage(overlay, 0, 0);

    const dataUrl = exportCanvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/90 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--foreground)] border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <h3 className="text-white text-sm font-medium hidden sm:block">Editor de máscara</h3>
          <div className="h-5 w-px bg-white/20 hidden sm:block" />

          <button
            onClick={() => setTool("brush")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
              tool === "brush" ? "bg-white text-[var(--foreground)]" : "text-white/70 hover:text-white"
            )}
          >
            <Paintbrush size={14} />
            Pintar
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
              tool === "eraser" ? "bg-white text-[var(--foreground)]" : "text-white/70 hover:text-white"
            )}
          >
            <Eraser size={14} />
            Borrar
          </button>

          <div className="h-5 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            <button onClick={() => setBrushSize(Math.max(5, brushSize - 10))} className="text-white/50 hover:text-white">
              <Minus size={14} />
            </button>
            <span className="text-white/70 text-xs tabular-nums w-8 text-center">{brushSize}px</span>
            <button onClick={() => setBrushSize(Math.min(100, brushSize + 10))} className="text-white/50 hover:text-white">
              <Plus size={14} />
            </button>
          </div>

          <div className="h-5 w-px bg-white/20" />

          <button onClick={() => setShowMask(!showMask)} className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-white/70 hover:text-white">
            {showMask ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button onClick={clearMask} className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-white/70 hover:text-white">
            <RotateCcw size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] transition-colors"
          >
            <Save size={14} />
            Guardar
          </button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="bg-blue-900/30 px-4 py-2 text-xs text-blue-200 text-center flex-shrink-0">
        Pintá sobre la zona tapizada de la silla. El área blanca será reemplazada por la textura de tela.
      </div>

      {/* Canvas area */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4">
        {dims ? (
          <div className="relative" style={{ width: dims.w, height: dims.h }}>
            <canvas
              ref={canvasRef}
              className="absolute inset-0 block"
              style={{ width: dims.w, height: dims.h }}
            />
            <canvas
              ref={overlayRef}
              className="absolute inset-0 block"
              style={{
                width: dims.w,
                height: dims.h,
                opacity: showMask ? 0.5 : 0,
                cursor: tool === "brush" ? "crosshair" : "cell",
              }}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
