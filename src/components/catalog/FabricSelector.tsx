"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fabricTypes } from "@/data/fabrics";
import { FabricSelection } from "@/types/fabric";

interface FabricSelectorProps {
  onSelect: (fabric: FabricSelection) => void;
  selected?: FabricSelection | null;
}

export function FabricSelector({ onSelect, selected }: FabricSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(fabricTypes[0].id);

  const activeFabric = fabricTypes.find((f) => f.id === activeTab)!;

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      {/* Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
      >
        <span>
          {selected
            ? `${selected.fabricType} - ${selected.colorName}`
            : "Elegir tela y color"}
        </span>
        <ChevronDown
          size={16}
          className={cn("transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="border-t border-[var(--border)] p-4">
          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            {fabricTypes.map((fabric) => (
              <button
                key={fabric.id}
                onClick={() => setActiveTab(fabric.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                  activeTab === fabric.id
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--secondary)]"
                )}
              >
                {fabric.name}
              </button>
            ))}
          </div>

          {/* Color Grid */}
          <div className="grid grid-cols-5 gap-2">
            {activeFabric.colors.map((color) => {
              const isSelected =
                selected?.fabricType === activeFabric.name &&
                selected?.colorName === color.name;

              return (
                <button
                  key={color.name}
                  onClick={() => {
                    onSelect({
                      fabricType: activeFabric.name,
                      colorName: color.name,
                      colorHex: color.hex,
                    });
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 p-1.5 rounded transition-all",
                    isSelected
                      ? "ring-2 ring-[var(--primary)] bg-[var(--muted)]"
                      : "hover:bg-[var(--muted)]"
                  )}
                  title={color.name}
                >
                  <div
                    className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-[10px] text-gray-600 leading-tight text-center">
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
