// localStorage keys
export const STORAGE_KEYS = {
  PRODUCTS: "hs-admin-products",
  CONTENT: "hs-admin-content",
  INFO: "hs-admin-info",
  LANDING: "hs-admin-landing",
  META_PIXEL_ID: "hs-meta-pixel-id",
  GA4_MEASUREMENT_ID: "hs-ga4-measurement-id",
  CRM_WEBHOOK_URL: "hs-crm-webhook-url",
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
