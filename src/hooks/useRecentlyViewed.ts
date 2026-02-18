"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "hs-recently-viewed";
const MAX_ITEMS = 6;

export function useRecentlyViewed() {
  const [recentIds, setRecentIds] = useState<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentIds(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const addViewed = useCallback((productId: number) => {
    setRecentIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { recentIds, addViewed };
}
