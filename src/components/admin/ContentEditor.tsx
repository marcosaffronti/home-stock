"use client";

import { useState, useEffect } from "react";
import { defaultContent, ContentData, FaqItem } from "@/data/content";
import {
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

const STORAGE_KEY = "hs-admin-content";

type ContentTab = "terms" | "faq" | "shipping";

export default function ContentEditor() {
  const [activeTab, setActiveTab] = useState<ContentTab>("terms");
  const [content, setContent] = useState<ContentData>(defaultContent);
  const [showPreview, setShowPreview] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setContent(JSON.parse(stored));
      } catch {
        setContent({ ...defaultContent });
      }
    }
  }, []);

  const saveContent = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    setSaveMessage("Contenido guardado correctamente");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const resetToDefaults = () => {
    if (
      window.confirm(
        "¿Estás seguro de que querés restaurar todo el contenido a los valores originales?"
      )
    ) {
      setContent({ ...defaultContent });
      localStorage.removeItem(STORAGE_KEY);
      setSaveMessage("Contenido restaurado a los valores originales");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const updateFaqItem = (index: number, field: keyof FaqItem, value: string) => {
    const newItems = [...content.faq.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setContent({ ...content, faq: { ...content.faq, items: newItems } });
  };

  const addFaqItem = () => {
    const newItems = [
      ...content.faq.items,
      { question: "Nueva pregunta", answer: "Respuesta aquí..." },
    ];
    setContent({ ...content, faq: { ...content.faq, items: newItems } });
    setExpandedFaq(newItems.length - 1);
  };

  const removeFaqItem = (index: number) => {
    if (window.confirm("¿Eliminar esta pregunta frecuente?")) {
      const newItems = content.faq.items.filter((_, i) => i !== index);
      setContent({ ...content, faq: { ...content.faq, items: newItems } });
      setExpandedFaq(null);
    }
  };

  const tabs = [
    { id: "terms" as ContentTab, label: "Términos y Condiciones" },
    { id: "faq" as ContentTab, label: "Preguntas Frecuentes" },
    { id: "shipping" as ContentTab, label: "Información de Envío" },
  ];

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p
          className="text-sm text-blue-800"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Editá el contenido de las páginas informativas del sitio. Los campos
          de texto admiten HTML para formato enriquecido. Los cambios se guardan
          localmente.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setShowPreview(false);
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[var(--primary)] text-white"
                : "bg-white border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
            }`}
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          >
            {tab.label}
          </button>
        ))}
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

      {/* Content Area */}
      <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
        {/* Terms & Conditions */}
        {activeTab === "terms" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3
                className="text-lg font-semibold text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Términos y Condiciones
              </h3>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--primary)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-4 h-4" /> Editar
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" /> Vista previa
                  </>
                )}
              </button>
            </div>

            {showPreview ? (
              <div
                className="prose prose-sm max-w-none p-4 bg-[var(--muted)] rounded-xl"
                dangerouslySetInnerHTML={{
                  __html: content.termsAndConditions.body,
                }}
              />
            ) : (
              <textarea
                value={content.termsAndConditions.body}
                onChange={(e) =>
                  setContent({
                    ...content,
                    termsAndConditions: {
                      ...content.termsAndConditions,
                      body: e.target.value,
                    },
                  })
                }
                rows={20}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm font-mono bg-white resize-y"
                placeholder="Contenido HTML de términos y condiciones..."
              />
            )}
          </div>
        )}

        {/* FAQ */}
        {activeTab === "faq" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3
                className="text-lg font-semibold text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Preguntas Frecuentes ({content.faq.items.length})
              </h3>
              <button
                onClick={addFaqItem}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                <Plus className="w-4 h-4" /> Agregar pregunta
              </button>
            </div>

            <div className="space-y-3">
              {content.faq.items.map((item, index) => (
                <div
                  key={index}
                  className="border border-[var(--border)] rounded-xl overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-[var(--muted)] cursor-pointer"
                    onClick={() =>
                      setExpandedFaq(expandedFaq === index ? null : index)
                    }
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span
                        className="text-xs font-medium text-[var(--primary)] bg-white px-2 py-0.5 rounded-full"
                        style={{
                          fontFamily: "var(--font-inter), sans-serif",
                        }}
                      >
                        {index + 1}
                      </span>
                      <span
                        className="text-sm font-medium text-[var(--foreground)] truncate"
                        style={{
                          fontFamily: "var(--font-inter), sans-serif",
                        }}
                      >
                        {item.question}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFaqItem(index);
                        }}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedFaq === index ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedFaq === index && (
                    <div className="p-4 space-y-3">
                      <div>
                        <label
                          className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider"
                          style={{
                            fontFamily: "var(--font-inter), sans-serif",
                          }}
                        >
                          Pregunta
                        </label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) =>
                            updateFaqItem(index, "question", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          style={{
                            fontFamily: "var(--font-inter), sans-serif",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider"
                          style={{
                            fontFamily: "var(--font-inter), sans-serif",
                          }}
                        >
                          Respuesta
                        </label>
                        <textarea
                          value={item.answer}
                          onChange={(e) =>
                            updateFaqItem(index, "answer", e.target.value)
                          }
                          rows={4}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y"
                          style={{
                            fontFamily: "var(--font-inter), sans-serif",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipping Policy */}
        {activeTab === "shipping" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3
                className="text-lg font-semibold text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Información de Envío
              </h3>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--primary)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-4 h-4" /> Editar
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" /> Vista previa
                  </>
                )}
              </button>
            </div>

            {showPreview ? (
              <div
                className="prose prose-sm max-w-none p-4 bg-[var(--muted)] rounded-xl"
                dangerouslySetInnerHTML={{
                  __html: content.shippingPolicy.body,
                }}
              />
            ) : (
              <textarea
                value={content.shippingPolicy.body}
                onChange={(e) =>
                  setContent({
                    ...content,
                    shippingPolicy: {
                      ...content.shippingPolicy,
                      body: e.target.value,
                    },
                  })
                }
                rows={20}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm font-mono bg-white resize-y"
                placeholder="Contenido HTML de información de envío..."
              />
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2.5 text-sm text-gray-600 border border-[var(--border)] rounded-xl hover:bg-gray-50 transition-colors"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Restaurar originales
        </button>
        <button
          onClick={saveContent}
          className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm text-white bg-[var(--primary)] rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          <Save className="w-4 h-4" /> Guardar cambios
        </button>
      </div>
    </div>
  );
}
