import { getStoredValue, STORAGE_KEYS } from "./storage";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

function getPixelId(): string {
  return getStoredValue<string>(STORAGE_KEYS.META_PIXEL_ID, "");
}

function getGa4Id(): string {
  return getStoredValue<string>(STORAGE_KEYS.GA4_MEASUREMENT_ID, "");
}

export function trackPageView() {
  if (getPixelId() && window.fbq) {
    window.fbq("track", "PageView");
  }
  if (getGa4Id() && window.gtag) {
    window.gtag("event", "page_view");
  }
}

export function trackAddToCart(product: { name: string; price: number; id: number }) {
  if (getPixelId() && window.fbq) {
    window.fbq("track", "AddToCart", {
      content_name: product.name,
      content_ids: [String(product.id)],
      content_type: "product",
      value: product.price,
      currency: "ARS",
    });
  }
  if (getGa4Id() && window.gtag) {
    window.gtag("event", "add_to_cart", {
      currency: "ARS",
      value: product.price,
      items: [{ item_id: String(product.id), item_name: product.name, price: product.price }],
    });
  }
}

export function trackInitiateCheckout(total: number, items: { name: string; price: number; quantity: number }[]) {
  if (getPixelId() && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      value: total,
      currency: "ARS",
      num_items: items.length,
    });
  }
  if (getGa4Id() && window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: "ARS",
      value: total,
      items: items.map((i) => ({ item_name: i.name, price: i.price, quantity: i.quantity })),
    });
  }
}

export function trackLead(formType: string) {
  if (getPixelId() && window.fbq) {
    window.fbq("track", "Lead", { content_name: formType });
  }
  if (getGa4Id() && window.gtag) {
    window.gtag("event", "generate_lead", { event_category: formType });
  }
}
