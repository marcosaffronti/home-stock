"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, RotateCcw, Download } from "lucide-react";
import { FabricSelection } from "@/types/fabric";

interface TryFabricOnChairProps {
  fabric: FabricSelection;
  onClose: () => void;
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

export function TryFabricOnChair({ fabric, onClose }: TryFabricOnChairProps) {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [blendIntensity, setBlendIntensity] = useState(0.5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUserImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Render composite with fabric texture
  useEffect(() => {
    if (!userImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderWithTexture = async () => {
      const userImg = await loadImage(userImage);
      const w = Math.min(userImg.naturalWidth, 1200);
      const scale = w / userImg.naturalWidth;
      const h = Math.round(userImg.naturalHeight * scale);
      canvas.width = w;
      canvas.height = h;

      // Draw user photo
      ctx.drawImage(userImg, 0, 0, w, h);

      if (fabric.colorImage) {
        const fabricImg = await loadImage(fabric.colorImage);
        const temp = document.createElement("canvas");
        temp.width = w;
        temp.height = h;
        const tCtx = temp.getContext("2d")!;
        const pattern = tCtx.createPattern(fabricImg, "repeat");
        if (pattern) {
          const s = Math.max(w, h) / 600;
          tCtx.save();
          tCtx.scale(s, s);
          tCtx.fillStyle = pattern;
          tCtx.fillRect(0, 0, w / s, h / s);
          tCtx.restore();
        }

        ctx.globalCompositeOperation = "color";
        ctx.globalAlpha = blendIntensity;
        ctx.drawImage(temp, 0, 0);

        ctx.globalCompositeOperation = "overlay";
        ctx.globalAlpha = blendIntensity * 0.3;
        ctx.drawImage(temp, 0, 0);
      } else {
        ctx.globalCompositeOperation = "color";
        ctx.globalAlpha = blendIntensity;
        ctx.fillStyle = fabric.colorHex;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    renderWithTexture();
  }, [userImage, fabric.colorImage, fabric.colorHex, blendIntensity]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `mi-silla-${fabric.fabricType}-${fabric.colorName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 border-b border-white/10">
        <div>
          <h3 className="text-white text-sm font-medium tracking-wide">
            Probá la tela en tu silla
          </h3>
          <p className="text-white/40 text-xs mt-0.5">
            {fabric.fabricType} · {fabric.colorName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userImage && (
            <>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Guardar</span>
              </button>
              <button
                onClick={() => { setUserImage(null); setBlendIntensity(0.5); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors"
              >
                <RotateCcw size={14} />
                <span className="hidden sm:inline">Otra foto</span>
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {!userImage ? (
          <div className="text-center max-w-md">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-white/50 p-10 sm:p-12 cursor-pointer transition-colors group"
            >
              <Upload
                size={48}
                className="mx-auto text-white/30 group-hover:text-white/60 transition-colors mb-4"
              />
              <p className="text-white text-lg font-medium mb-2">
                Subí una foto de tu silla
              </p>
              <p className="text-white/40 text-sm leading-relaxed">
                Sacale una foto a tu mueble y mirá cómo queda con la tela{" "}
                <span className="text-white/70">{fabric.colorName}</span>
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex items-center gap-2 justify-center mt-4">
              <div
                className="w-5 h-5 border border-white/20"
                style={{ backgroundColor: fabric.colorHex }}
              />
              <span className="text-white/30 text-xs">
                {fabric.fabricType} — {fabric.colorName}
              </span>
            </div>
            <p className="text-white/15 text-[10px] mt-3">
              Tu foto se procesa localmente. No se sube a ningún servidor.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[60vh] object-contain"
            />
            <div className="flex items-center gap-4 w-full max-w-sm">
              <span className="text-white/40 text-[10px] tracking-wide uppercase w-16 text-right">
                Original
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={blendIntensity}
                onChange={(e) => setBlendIntensity(parseFloat(e.target.value))}
                className="flex-1 accent-[var(--primary)] h-1"
              />
              <span className="text-white/40 text-[10px] tracking-wide uppercase w-16">
                Tela
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
