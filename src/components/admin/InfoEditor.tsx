"use client";

import { useState, useEffect } from "react";
import { Save, Info, RotateCcw } from "lucide-react";
import { getStoredValue, setStoredValue, saveToServer, STORAGE_KEYS } from "@/lib/storage";

const STORAGE_KEY = "hs-admin-info";

interface BusinessInfo {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  businessHours: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    pinterest: string;
  };
}

const defaultInfo: BusinessInfo = {
  companyName: "Home Stock",
  address: "Showroom - Buenos Aires, Argentina",
  phone: "5491171643900",
  email: "info@homestock.com.ar",
  businessHours: "Lunes a Viernes: 10:00 - 18:00\nSábados: 10:00 - 14:00\nDomingos: Cerrado",
  socialMedia: {
    instagram: "https://instagram.com/homestock.ar",
    facebook: "https://facebook.com/homestock.ar",
    pinterest: "",
  },
};

export default function InfoEditor() {
  const [info, setInfo] = useState<BusinessInfo>(defaultInfo);
  const [saveMessage, setSaveMessage] = useState("");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [ga4Id, setGa4Id] = useState("");
  const [crmWebhookUrl, setCrmWebhookUrl] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setInfo(JSON.parse(stored));
      } catch {
        setInfo({ ...defaultInfo });
      }
    }
    setMetaPixelId(getStoredValue<string>(STORAGE_KEYS.META_PIXEL_ID, ""));
    setGa4Id(getStoredValue<string>(STORAGE_KEYS.GA4_MEASUREMENT_ID, ""));
    setCrmWebhookUrl(getStoredValue<string>(STORAGE_KEYS.CRM_WEBHOOK_URL, ""));
  }, []);

  const saveInfo = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    setStoredValue(STORAGE_KEYS.META_PIXEL_ID, metaPixelId);
    saveToServer(STORAGE_KEYS.META_PIXEL_ID, metaPixelId);
    setStoredValue(STORAGE_KEYS.GA4_MEASUREMENT_ID, ga4Id);
    saveToServer(STORAGE_KEYS.GA4_MEASUREMENT_ID, ga4Id);
    setStoredValue(STORAGE_KEYS.CRM_WEBHOOK_URL, crmWebhookUrl);
    saveToServer(STORAGE_KEYS.CRM_WEBHOOK_URL, crmWebhookUrl);
    setSaveMessage("Información guardada correctamente");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const resetToDefaults = () => {
    if (
      window.confirm(
        "¿Estás seguro de que querés restaurar toda la información a los valores originales?"
      )
    ) {
      setInfo({ ...defaultInfo });
      localStorage.removeItem(STORAGE_KEY);
      setSaveMessage("Información restaurada a los valores originales");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm bg-white text-[var(--foreground)]";
  const labelClass =
    "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider";

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p
          className="text-sm text-blue-800"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Editá la información de contacto y datos del negocio. Estos datos se
          muestran en el sitio web y en los mensajes de contacto.
        </p>
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p
            className="text-sm text-green-800"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            {saveMessage}
          </p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-6">
        {/* Company Name */}
        <div>
          <h3
            className="text-lg font-semibold text-[var(--foreground)] mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Datos del Negocio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                className={labelClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value={info.companyName}
                onChange={(e) =>
                  setInfo({ ...info, companyName: e.target.value })
                }
                className={inputClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              />
            </div>
            <div>
              <label
                className={labelClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Email
              </label>
              <input
                type="email"
                value={info.email}
                onChange={(e) => setInfo({ ...info, email: e.target.value })}
                className={inputClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="border-t border-[var(--border)] pt-6">
          <h3
            className="text-lg font-semibold text-[var(--foreground)] mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Contacto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                className={labelClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Dirección
              </label>
              <input
                type="text"
                value={info.address}
                onChange={(e) => setInfo({ ...info, address: e.target.value })}
                className={inputClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              />
            </div>
            <div>
              <label
                className={labelClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Teléfono / WhatsApp (sin +)
              </label>
              <input
                type="text"
                value={info.phone}
                onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                className={inputClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
                placeholder="5491171643900"
              />
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="border-t border-[var(--border)] pt-6">
          <h3
            className="text-lg font-semibold text-[var(--foreground)] mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Horarios de Atención
          </h3>
          <div>
            <label
              className={labelClass}
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              Horarios (una línea por día o grupo)
            </label>
            <textarea
              value={info.businessHours}
              onChange={(e) =>
                setInfo({ ...info, businessHours: e.target.value })
              }
              rows={4}
              className={`${inputClass} resize-y`}
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
              placeholder="Lunes a Viernes: 10:00 - 18:00&#10;Sábados: 10:00 - 14:00"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="border-t border-[var(--border)] pt-6">
          <h3
            className="text-lg font-semibold text-[var(--foreground)] mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Redes Sociales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                className={labelClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Instagram (URL completa)
              </label>
              <input
                type="url"
                value={info.socialMedia.instagram}
                onChange={(e) =>
                  setInfo({
                    ...info,
                    socialMedia: {
                      ...info.socialMedia,
                      instagram: e.target.value,
                    },
                  })
                }
                className={inputClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
                placeholder="https://instagram.com/homestock.ar"
              />
            </div>
            <div>
              <label
                className={labelClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Facebook (URL completa)
              </label>
              <input
                type="url"
                value={info.socialMedia.facebook}
                onChange={(e) =>
                  setInfo({
                    ...info,
                    socialMedia: {
                      ...info.socialMedia,
                      facebook: e.target.value,
                    },
                  })
                }
                className={inputClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
                placeholder="https://facebook.com/homestock.ar"
              />
            </div>
            <div>
              <label
                className={labelClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Pinterest (URL completa)
              </label>
              <input
                type="url"
                value={info.socialMedia.pinterest}
                onChange={(e) =>
                  setInfo({
                    ...info,
                    socialMedia: {
                      ...info.socialMedia,
                      pinterest: e.target.value,
                    },
                  })
                }
                className={inputClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
                placeholder="https://pinterest.com/homestock"
              />
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="border-t border-[var(--border)] pt-6">
          <h3
            className="text-lg font-semibold text-[var(--foreground)] mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Integraciones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label
                className={labelClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Meta Pixel ID
              </label>
              <input
                type="text"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                className={inputClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
                placeholder="1234567890123456"
              />
            </div>
            <div>
              <label
                className={labelClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                GA4 Measurement ID
              </label>
              <input
                type="text"
                value={ga4Id}
                onChange={(e) => setGa4Id(e.target.value)}
                className={inputClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div className="md:col-span-2">
              <label
                className={labelClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                CRM Webhook URL
              </label>
              <input
                type="url"
                value={crmWebhookUrl}
                onChange={(e) => setCrmWebhookUrl(e.target.value)}
                className={inputClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
                placeholder="https://api.emiti.cloud/webhooks/..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <button
          onClick={resetToDefaults}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-600 border border-[var(--border)] rounded-xl hover:bg-gray-50 transition-colors"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          <RotateCcw className="w-4 h-4" /> Restaurar originales
        </button>
        <button
          onClick={saveInfo}
          className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm text-white bg-[var(--primary)] rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          <Save className="w-4 h-4" /> Guardar cambios
        </button>
      </div>
    </div>
  );
}
