"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Product } from "@/types/product";

const MAX_COMPARE = 3;

interface CompareContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (id: number) => void;
  clearAll: () => void;
  isSelected: (id: number) => boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, product];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    setIsOpen(false);
  }, []);

  const isSelected = useCallback(
    (id: number) => items.some((p) => p.id === id),
    [items]
  );

  return (
    <CompareContext.Provider
      value={{ items, addItem, removeItem, clearAll, isSelected, isOpen, setIsOpen }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) throw new Error("useCompare must be used within CompareProvider");
  return context;
}
