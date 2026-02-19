// localStorage / server config keys
export const STORAGE_KEYS = {
  PRODUCTS: "hs-admin-products",
  CONTENT: "hs-admin-content",
  INFO: "hs-admin-info",
  LANDING: "hs-admin-landing",
  CATEGORIES: "hs-admin-categories",
  GALLERY: "hs-admin-gallery",
  GALLERY_CATEGORIES: "hs-admin-gallery-categories",
  META_PIXEL_ID: "hs-meta-pixel-id",
  GA4_MEASUREMENT_ID: "hs-ga4-measurement-id",
  CRM_WEBHOOK_URL: "hs-crm-webhook-url",
  WHATSAPP_NUMBER: "hs-whatsapp-number",
} as const;

export function getStoredValue<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

export function setStoredValue<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

// --- Server-side config (JSON file on VPS) ---

// Module-level cache: one fetch per page load, shared by all components
let _configCache: Record<string, unknown> | null = null;
let _configPromise: Promise<Record<string, unknown>> | null = null;

function fetchAllConfig(): Promise<Record<string, unknown>> {
  if (_configCache) return Promise.resolve(_configCache);
  if (_configPromise) return _configPromise;

  _configPromise = fetch("/api/config", { cache: "no-store" })
    .then((res) => res.json())
    .then((data) => {
      _configCache = data;
      return data;
    })
    .catch(() => ({}));

  return _configPromise;
}

/** Fetch a config value from the server (cached per page load) */
export async function fetchFromServer<T>(key: string, fallback: T): Promise<T> {
  const config = await fetchAllConfig();
  return (config[key] as T) ?? fallback;
}

/** Save a config value to the server (persisted in JSON file) */
export async function saveToServer(key: string, value: unknown): Promise<boolean> {
  try {
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    // Invalidate cache so next page load gets fresh data
    _configCache = null;
    _configPromise = null;
    return res.ok;
  } catch {
    return false;
  }
}
