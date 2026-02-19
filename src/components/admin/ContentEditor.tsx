"use client";

import { useState, useEffect, useRef } from "react";
import { defaultContent, ContentData, FaqItem } from "@/data/content";
import {
  Save,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Pencil,
  Check,
  X,
  Loader2,
  FileText,
} from "lucide-react";
import { saveToServer, fetchFromServer, STORAGE_KEYS } from "@/lib/storage";

// ─── Custom pages ────────────────────────────────────────────────────────────
const CUSTOM_PAGES_KEY = "hs-admin-content-custom";

interface CustomPage {
  id: string;
  title: string;
  body: string;
}

// ─── Built-in tab IDs ────────────────────────────────────────────────────────
type BuiltinTab = "terms" | "faq" | "shipping";
type ActiveTab = BuiltinTab | string; // string = custom page id

const BUILTIN_TABS: { id: BuiltinTab; label: string }[] = [
  { id: "terms",    label: "Términos y Condiciones" },
  { id: "faq",      label: "Preguntas Frecuentes" },
  { id: "shipping", label: "Política de Envío" },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function ContentEditor() {
  const [activeTab, setActiveTab]         = useState<ActiveTab>("terms");
  const [content, setContent]             = useState<ContentData>(defaultContent);
  const [customPages, setCustomPages]     = useState<CustomPage[]>([]);
  const [showPreview, setShowPreview]     = useState(false);
  const [saveMessage, setSaveMessage]     = useState("");
  const [saving, setSaving]               = useState(false);
  const [expandedFaq, setExpandedFaq]     = useState<number | null>(null);
  const [editingTitle, setEditingTitle]   = useState<string | null>(null);
  const editTitleRef = useRef<HTMLInputElement>(null);

  // ── Load from server ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchFromServer<ContentData>(STORAGE_KEYS.CONTENT, defaultContent).then((data) => {
      setContent({ ...defaultContent, ...data });
    });
    fetchFromServer<CustomPage[]>(CUSTOM_PAGES_KEY, []).then((pages) => {
      setCustomPages(pages || []);
    });
  }, []);

  // ── Focus on title edit ───────────────────────────────────────────────────
  useEffect(() => {
    if (editingTitle) editTitleRef.current?.focus();
  }, [editingTitle]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    const [r1, r2] = await Promise.all([
      saveToServer(STORAGE_KEYS.CONTENT, content),
      saveToServer(CUSTOM_PAGES_KEY, customPages),
    ]);
    setSaving(false);
    setSaveMessage(r1 && r2 ? "Guardado correctamente ✓" : "Error al guardar — revisá la conexión");
    setTimeout(() => setSaveMessage(""), 4000);
  };

  // ── FAQ helpers ───────────────────────────────────────────────────────────
  const updateFaqItem = (index: number, field: keyof FaqItem, value: string) => {
    const items = [...content.faq.items];
    items[index] = { ...items[index], [field]: value };
    setContent({ ...content, faq: { ...content.faq, items } });
  };

  const addFaqItem = () => {
    const items = [...content.faq.items, { question: "Nueva pregunta", answer: "Respuesta aquí..." }];
    setContent({ ...content, faq: { ...content.faq, items } });
    setExpandedFaq(items.length - 1);
  };

  const removeFaqItem = (index: number) => {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    const items = content.faq.items.filter((_, i) => i !== index);
    setContent({ ...content, faq: { ...content.faq, items } });
    setExpandedFaq(null);
  };

  // ── Custom page helpers ───────────────────────────────────────────────────
  const addCustomPage = () => {
    const newPage: CustomPage = {
      id: `page-${Date.now()}`,
      title: "Nueva página",
      body: "<p>Escribí el contenido aquí. Podés usar HTML para formato enriquecido.</p>",
    };
    const updated = [...customPages, newPage];
    setCustomPages(updated);
    setActiveTab(newPage.id);
    setEditingTitle(newPage.id);
  };

  const updateCustomPage = (id: string, field: keyof CustomPage, value: string) => {
    setCustomPages((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const deleteCustomPage = (id: string) => {
    if (!confirm("¿Eliminar esta página?")) return;
    setCustomPages((prev) => prev.filter((p) => p.id !== id));
    setActiveTab("terms");
  };

  // ── Shared HTML editor ────────────────────────────────────────────────────
  const HtmlEditor = ({
    value, onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 font-mono">HTML</span>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--primary)] border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
        >
          {showPreview ? <><EyeOff className="w-4 h-4" /> Editar</> : <><Eye className="w-4 h-4" /> Vista previa</>}
        </button>
      </div>
      {showPreview ? (
        <div
          className="prose prose-sm max-w-none p-4 bg-[var(--muted)] rounded-xl min-h-[200px] text-sm"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          className="w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm font-mono bg-white resize-y min-h-[200px]"
          placeholder="Contenido HTML..."
        />
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Save message */}
      {saveMessage && (
        <div className={`border rounded-xl px-4 py-3 text-sm ${saveMessage.includes("Error") ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800"}`}>
          {saveMessage}
        </div>
      )}

      {/* ── Tabs bar ── */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {/* Built-in tabs */}
        {BUILTIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowPreview(false); }}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[var(--primary)] text-white"
                : "bg-white border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Custom page tabs */}
        {customPages.map((page) => (
          <div key={page.id} className="relative group flex items-center">
            {editingTitle === page.id ? (
              <div className="flex items-center gap-1 bg-white border border-[var(--primary)] rounded-xl px-2 py-1.5">
                <input
                  ref={editTitleRef}
                  type="text"
                  value={page.title}
                  onChange={(e) => updateCustomPage(page.id, "title", e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") setEditingTitle(null); }}
                  className="text-sm text-[var(--foreground)] bg-transparent focus:outline-none w-28"
                />
                <button onClick={() => setEditingTitle(null)} className="text-green-500 hover:text-green-700">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setActiveTab(page.id); setShowPreview(false); }}
                className={`pl-3.5 pr-2 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === page.id
                    ? "bg-[var(--primary)] text-white"
                    : "bg-white border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                {page.title}
                {/* Edit title + delete on hover */}
                <span className="flex items-center gap-0.5 ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span
                    className="p-0.5 rounded hover:bg-white/20 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); setEditingTitle(page.id); setActiveTab(page.id); }}
                    title="Renombrar"
                  >
                    <Pencil className="w-3 h-3" />
                  </span>
                  <span
                    className="p-0.5 rounded hover:bg-red-500/30 cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); deleteCustomPage(page.id); }}
                    title="Eliminar página"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </span>
              </button>
            )}
          </div>
        ))}

        {/* Add page button */}
        <button
          onClick={addCustomPage}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-[var(--primary)] border border-dashed border-[var(--primary)]/40 hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-colors"
          title="Agregar nueva página"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva página</span>
        </button>
      </div>

      {/* ── Content panel ── */}
      <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">

        {/* TERMS */}
        {activeTab === "terms" && (
          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Términos y Condiciones
            </h3>
            <HtmlEditor
              value={content.termsAndConditions.body}
              onChange={(v) => setContent({ ...content, termsAndConditions: { ...content.termsAndConditions, body: v } })}
            />
          </div>
        )}

        {/* FAQ */}
        {activeTab === "faq" && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-lg font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Preguntas Frecuentes ({content.faq.items.length})
              </h3>
              <button
                onClick={addFaqItem}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-[var(--primary)] rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
              >
                <Plus className="w-4 h-4" /> Agregar pregunta
              </button>
            </div>

            <div className="space-y-2">
              {content.faq.items.map((item, index) => (
                <div key={index} className="border border-[var(--border)] rounded-xl overflow-hidden">
                  <div
                    className="flex items-center justify-between px-4 py-3 bg-[var(--muted)] cursor-pointer"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xs font-medium text-[var(--primary)] bg-white px-2 py-0.5 rounded-full flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-[var(--foreground)] truncate">
                        {item.question}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFaqItem(index); }}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedFaq === index ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {expandedFaq === index && (
                    <div className="p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Pregunta</label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => updateFaqItem(index, "question", e.target.value)}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Respuesta (HTML)</label>
                        <textarea
                          value={item.answer}
                          onChange={(e) => updateFaqItem(index, "answer", e.target.value)}
                          rows={5}
                          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SHIPPING */}
        {activeTab === "shipping" && (
          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Política de Envío
            </h3>
            <HtmlEditor
              value={content.shippingPolicy.body}
              onChange={(v) => setContent({ ...content, shippingPolicy: { ...content.shippingPolicy, body: v } })}
            />
          </div>
        )}

        {/* CUSTOM PAGES */}
        {customPages.map((page) => activeTab === page.id && (
          <div key={page.id} className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <h3
                className="text-lg font-semibold text-[var(--foreground)] flex-1"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {page.title}
              </h3>
              <button
                onClick={() => setEditingTitle(page.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Renombrar
              </button>
              <button
                onClick={() => deleteCustomPage(page.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </button>
            </div>
            <HtmlEditor
              value={page.body}
              onChange={(v) => updateCustomPage(page.id, "body", v)}
            />
          </div>
        ))}
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm text-white bg-[var(--primary)] rounded-xl hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
