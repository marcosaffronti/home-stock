import { getStoredValue, STORAGE_KEYS } from "./storage";

interface CrmPayload {
  formType: string;
  data: Record<string, unknown>;
}

export function sendToCrm(payload: CrmPayload): void {
  const timestamp = new Date().toISOString();

  // 1. Save locally (fire-and-forget)
  fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      formType: payload.formType,
      data: payload.data,
      source: "homestock-web",
      timestamp,
    }),
  }).catch(() => {
    // Never block UX
  });

  // 2. Send to external CRM webhook if configured
  const webhookUrl = getStoredValue<string>(STORAGE_KEYS.CRM_WEBHOOK_URL, "");
  if (!webhookUrl) return;

  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      timestamp,
      source: "homestock-web",
    }),
  }).catch(() => {
    // Fire-and-forget — never block UX
  });
}
