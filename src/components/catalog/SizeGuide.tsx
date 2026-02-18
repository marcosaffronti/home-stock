"use client";

import { Ruler } from "lucide-react";

interface SizeGuideProps {
  dimensions: { width: number; height: number; depth: number };
  productName: string;
}

export function SizeGuide({ dimensions, productName }: SizeGuideProps) {
  const { width, height, depth } = dimensions;
  const maxDim = Math.max(width, height, depth);

  const scale = (val: number) => Math.max(20, (val / maxDim) * 100);

  return (
    <div className="border border-[var(--border)] p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Ruler size={16} className="text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--foreground)]/50 tracking-[0.15em] uppercase">
          Dimensiones
        </span>
      </div>

      {/* Visual representation */}
      <div className="flex items-end justify-center gap-6 sm:gap-10 mb-4 py-4">
        {/* Front view: width x height */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="border-2 border-[var(--primary)]/30 bg-[var(--primary)]/5 relative"
            style={{
              width: `${scale(width)}px`,
              height: `${scale(height)}px`,
              minWidth: 30,
              minHeight: 30,
            }}
          >
            {/* Height label */}
            <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-[10px] text-[var(--foreground)]/40 whitespace-nowrap">
              {height}
            </span>
            {/* Width label */}
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-[var(--foreground)]/40">
              {width}
            </span>
          </div>
          <span className="text-[9px] text-[var(--foreground)]/30 tracking-wider uppercase mt-3">
            Frente
          </span>
        </div>

        {/* Side view: depth x height */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="border-2 border-[var(--accent)]/30 bg-[var(--accent)]/5 relative"
            style={{
              width: `${scale(depth)}px`,
              height: `${scale(height)}px`,
              minWidth: 20,
              minHeight: 30,
            }}
          >
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-[var(--foreground)]/40">
              {depth}
            </span>
          </div>
          <span className="text-[9px] text-[var(--foreground)]/30 tracking-wider uppercase mt-3">
            Perfil
          </span>
        </div>
      </div>

      {/* Text summary */}
      <p className="text-center text-xs text-[var(--foreground)]/40">
        {productName}: {width} × {depth} × {height} cm
      </p>
    </div>
  );
}
