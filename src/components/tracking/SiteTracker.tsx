"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Generate or retrieve a session ID (unique per browser tab session)
function getSessionId(): string {
  const key = "hs-session-id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

function track(event: string, extra?: Record<string, unknown>) {
  const sessionId = getSessionId();
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, sessionId, ...extra }),
  }).catch(() => {});
}

// Exported helper for other components (cart, whatsapp, etc.)
export function trackEvent(event: string, extra?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  track(event, extra);
}

export function SiteTracker() {
  const pathname = usePathname();
  const lastPathname = useRef<string | null>(null);

  useEffect(() => {
    // Skip admin routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    // Skip if same path (prevent double-fire in React StrictMode)
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;

    track("page_view", { page: pathname });
  }, [pathname]);

  return null;
}
