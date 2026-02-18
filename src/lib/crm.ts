import { getStoredValue, STORAGE_KEYS } from "./storage";

interface CrmPayload {
  formType: string;
  data: Record<string, unknown>;
}

export function sendToCrm(payload: CrmPayload): void {
  const webhookUrl = getStoredValue<string>(STORAGE_KEYS.CRM_WEBHOOK_URL, "");
  if (!webhookUrl) return;

  fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      timestamp: new Date().toISOString(),
      source: "homestock-web",
    }),
  }).catch(() => {
    // Fire-and-forget — never block UX
  });
}
