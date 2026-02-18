"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { fabricTypes } from "@/data/fabrics";
import { FabricSelection } from "@/types/fabric";
import { FabricColor } from "@/types/fabric";

interface FabricSelectorProps {
  onSelect: (fabric: FabricSelection) => void;
  selected?: FabricSelection | null;
}

const VISIBLE_SWATCHES = 8;

export function FabricSelector({ onSelect, selected }: FabricSelectorProps) {
  const [activeTab, setActiveTab] = useState(fabricTypes[0].id);
  const [expanded, setExpanded] = useState(false);

  const activeFabric = fabricTypes.find((f) => f.id === activeTab)!;
  const allColors = activeFabric.colors;
  const visibleColors = expanded ? allColors : allColors.slice(0, VISIBLE_SWATCHES);
  const hiddenCount = allColors.length - VISIBLE_SWATCHES;

  const selectedColor: FabricColor | null =
    selected?.fabricType === activeFabric.name
      ? allColors.find((c) => c.name === selected.colorName) || null
      : null;

  const handleSelect = (color: FabricColor) => {
    onSelect({
      fabricType: activeFabric.name,
      colorName: color.name,
      colorHex: color.hex,
      colorImage: color.image,
    });
  };

  return (
    <div className="space-y-3">
      {/* Fabric type tabs */}
      <div className="flex gap-3 overflow-x-auto border-b border-[var(--border)] -mx-1 px-1">
        {fabricTypes.map((fabric) => (
          <button
            key={fabric.id}
            onClick={() => {
              setActiveTab(fabric.id);
              setExpanded(false);
            }}
            className={cn(
              "pb-2 text-[11px] font-medium tracking-wide uppercase transition-colors -mb-px whitespace-nowrap",
              activeTab === fabric.id
                ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
                : "text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70"
            )}
          >
            {fabric.name}
          </button>
        ))}
      </div>

      {/* Fabric info */}
      <div className="space-y-1.5">
        {activeFabric.description && (
          <p className="text-[11px] sm:text-xs text-[var(--foreground)]/50">
            {activeFabric.description}
          </p>
        )}
        {activeFabric.features && activeFabric.features.length > 0 && (
          <ul className="space-y-0.5">
            {activeFabric.features.map((f) => (
              <li key={f} className="text-[11px] sm:text-xs text-[var(--foreground)]/45 flex items-start gap-1.5">
                <span className="text-[var(--accent)] mt-0.5 flex-shrink-0">·</span>
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Selected info + keyboard hint */}
      {selectedColor && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-[var(--primary)] overflow-hidden flex-shrink-0">
            {selectedColor.image ? (
              <img src={selectedColor.image} alt={selectedColor.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" style={{ backgroundColor: selectedColor.hex }} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[var(--foreground)]/40 tracking-[0.15em] uppercase">
              {activeFabric.name}
            </p>
            <p className="text-sm font-semibold text-[var(--foreground)] truncate">
              {selectedColor.name}
            </p>
          </div>
        </div>
      )}

      {/* Swatches grid */}
      <div className="flex flex-wrap gap-1.5">
        {visibleColors.map((color) => {
          const isSelected =
            selected?.fabricType === activeFabric.name &&
            selected?.colorName === color.name;

          return (
            <button
              key={color.name}
              onClick={() => handleSelect(color)}
              title={color.name}
              className={cn(
                "relative w-9 h-9 sm:w-8 sm:h-8 overflow-hidden border transition-all",
                isSelected
                  ? "border-[var(--primary)] ring-1 ring-[var(--primary)]"
                  : "border-[var(--border)] hover:border-[var(--primary)]/50"
              )}
            >
              {color.image ? (
                <img
                  src={color.image}
                  alt={color.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full" style={{ backgroundColor: color.hex }} />
              )}
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <Check size={14} className="text-white drop-shadow" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}

        {!expanded && hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(true)}
            className="w-9 h-9 sm:w-8 sm:h-8 border border-[var(--border)] flex items-center justify-center text-[10px] font-medium text-[var(--foreground)]/50 hover:border-[var(--primary)]/50 hover:text-[var(--foreground)] transition-colors"
          >
            +{hiddenCount}
          </button>
        )}
      </div>
    </div>
  );
}
