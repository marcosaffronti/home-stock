"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getStoredValue, setStoredValue, saveToServer, STORAGE_KEYS } from "@/lib/storage";
import {
  LandingConfig,
  defaultLandingConfig,
  TestimonialItem,
  ContactInfoItem,
  SectionId,
  SECTION_LABELS,
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_VISIBILITY,
  DEFAULT_SECTION_LAYOUT,
  DEFAULT_THEME,
  ThemeConfig,
  SectionLayout,
  TextAlign,
  FONT_OPTIONS,
} from "@/types/landing";
import { allProducts } from "@/data/products";
import { uploadImage } from "@/lib/upload";
import {
  Save,
  RotateCcw,
  Info,
  Image as ImageIcon,
  LayoutGrid,
  Star,
  ChevronUp,
  ChevronDown,
  Upload,
  X,
  Heart,
  MessageSquareQuote,
  Plus,
  Trash2,
  Layers,
  Palette,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  GripVertical,
  Monitor,
  Phone,
  Calendar,
  Sparkles,
  Minimize2,
  Maximize2,
  Move,
} from "lucide-react";

type SubTab = "sections" | "theme" | "hero" | "catalog" | "gallery" | "benefits" | "testimonials" | "featured" | "contact" | "appointment" | "quiz";

const PREVIEW_MIN_W = 320;
const PREVIEW_MIN_H = 240;

export default function LandingEditor() {
  const [config, setConfig] = useState<LandingConfig>({
    ...defaultLandingConfig,
    sectionOrder: DEFAULT_SECTION_ORDER,
    sectionVisibility: DEFAULT_SECTION_VISIBILITY,
    sectionLayout: DEFAULT_SECTION_LAYOUT,
    theme: DEFAULT_THEME,
  });
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("sections");
  const [saveMessage, setSaveMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMinimized, setPreviewMinimized] = useState(false);
  const [previewPos, setPreviewPos] = useState({ x: -1, y: -1 });
  const [previewSize, setPreviewSize] = useState({ w: 480, h: 600 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; origW: number; origH: number } | null>(null);

  // Initialize preview position on first open
  useEffect(() => {
    if (previewOpen && previewPos.x === -1) {
      setPreviewPos({ x: window.innerWidth - previewSize.w - 24, y: 80 });
    }
  }, [previewOpen, previewPos.x, previewSize.w]);

  // Drag handler
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragRef.current) {
        e.preventDefault();
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPreviewPos({
          x: Math.max(0, Math.min(window.innerWidth - 200, dragRef.current.origX + dx)),
          y: Math.max(0, Math.min(window.innerHeight - 48, dragRef.current.origY + dy)),
        });
      }
      if (resizeRef.current) {
        e.preventDefault();
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        setPreviewSize({
          w: Math.max(PREVIEW_MIN_W, resizeRef.current.origW + dx),
          h: Math.max(PREVIEW_MIN_H, resizeRef.current.origH + dy),
        });
      }
    };
    const onMouseUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: previewPos.x, origY: previewPos.y };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { startX: e.clientX, startY: e.clientY, origW: previewSize.w, origH: previewSize.h };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "nwse-resize";
  };

  useEffect(() => {
    const stored = getStoredValue<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig);
    setConfig({
      ...defaultLandingConfig,
      ...stored,
      contact: stored.contact ? { ...defaultLandingConfig.contact, ...stored.contact } : defaultLandingConfig.contact,
      appointment: stored.appointment ? { ...defaultLandingConfig.appointment, ...stored.appointment } : defaultLandingConfig.appointment,
      styleQuiz: stored.styleQuiz ? { ...defaultLandingConfig.styleQuiz, ...stored.styleQuiz } : defaultLandingConfig.styleQuiz,
      sectionOrder: stored.sectionOrder?.length ? stored.sectionOrder : DEFAULT_SECTION_ORDER,
      sectionVisibility: stored.sectionVisibility ? { ...DEFAULT_SECTION_VISIBILITY, ...stored.sectionVisibility } : DEFAULT_SECTION_VISIBILITY,
      sectionLayout: stored.sectionLayout ? { ...DEFAULT_SECTION_LAYOUT, ...stored.sectionLayout } : DEFAULT_SECTION_LAYOUT,
      theme: stored.theme ? { ...DEFAULT_THEME, ...stored.theme } : DEFAULT_THEME,
    });
  }, []);

  // Send real-time preview updates
  const sendToPreview = useCallback((msg: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  }, []);

  // Send theme updates to preview in real-time
  useEffect(() => {
    if (previewOpen) {
      sendToPreview({ type: "hs-theme-update", theme: config.theme });
    }
  }, [config.theme, previewOpen, sendToPreview]);

  // Send layout updates to preview in real-time
  useEffect(() => {
    if (previewOpen) {
      sendToPreview({
        type: "hs-layout-update",
        order: config.sectionOrder,
        visibility: config.sectionVisibility,
        layouts: config.sectionLayout,
      });
    }
  }, [config.sectionOrder, config.sectionVisibility, config.sectionLayout, previewOpen, sendToPreview]);

  const save = async () => {
    setStoredValue(STORAGE_KEYS.LANDING, config);
    const ok = await saveToServer(STORAGE_KEYS.LANDING, config);
    setSaveMessage(ok ? "Guardado correctamente" : "ERROR: no se pudo guardar");
    setTimeout(() => setSaveMessage(""), 5000);
    // Reload iframe to reflect content changes
    if (previewOpen && iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const resetToDefaults = () => {
    if (window.confirm("¿Restaurar la landing a los valores originales?")) {
      setConfig({ ...defaultLandingConfig });
      localStorage.removeItem(STORAGE_KEYS.LANDING);
      setSaveMessage("Landing restaurada a los valores originales");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = await uploadImage(file, "hero");
      setConfig({ ...config, hero: { ...config.hero, backgroundImage: path } });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Featured products helpers
  const products = getStoredValue(STORAGE_KEYS.PRODUCTS, allProducts);
  const featuredIds = config.featuredProductIds;

  const toggleFeatured = (id: number) => {
    const newIds = featuredIds.includes(id) ? featuredIds.filter((fid) => fid !== id) : [...featuredIds, id];
    setConfig({ ...config, featuredProductIds: newIds });
  };

  const moveFeatured = (id: number, direction: "up" | "down") => {
    const idx = featuredIds.indexOf(id);
    if (idx === -1) return;
    const newIds = [...featuredIds];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newIds.length) return;
    [newIds[idx], newIds[swapIdx]] = [newIds[swapIdx], newIds[idx]];
    setConfig({ ...config, featuredProductIds: newIds });
  };

  // Benefits helpers
  const updateBenefitItem = (index: number, field: "title" | "description", value: string) => {
    const items = [...config.benefits.items];
    items[index] = { ...items[index], [field]: value };
    setConfig({ ...config, benefits: { ...config.benefits, items } });
  };

  const updateStat = (index: number, field: "value" | "label", value: string) => {
    const stats = [...config.benefits.stats];
    stats[index] = { ...stats[index], [field]: value };
    setConfig({ ...config, benefits: { ...config.benefits, stats } });
  };

  // Testimonials helpers
  const addTestimonial = () => {
    const maxId = config.testimonials.items.reduce((m, t) => Math.max(m, t.id), 0);
    const newItem: TestimonialItem = { id: maxId + 1, name: "", initials: "", role: "", content: "", rating: 5 };
    setConfig({ ...config, testimonials: { ...config.testimonials, items: [...config.testimonials.items, newItem] } });
  };

  const removeTestimonial = (id: number) => {
    setConfig({ ...config, testimonials: { ...config.testimonials, items: config.testimonials.items.filter((t) => t.id !== id) } });
  };

  const updateTestimonial = (id: number, field: keyof TestimonialItem, value: string | number) => {
    const items = config.testimonials.items.map((t) => (t.id === id ? { ...t, [field]: value } : t));
    setConfig({ ...config, testimonials: { ...config.testimonials, items } });
  };

  // Section ordering helpers
  const moveSection = (sectionId: SectionId, direction: "up" | "down") => {
    const order = [...config.sectionOrder];
    const idx = order.indexOf(sectionId);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= order.length) return;
    [order[idx], order[swapIdx]] = [order[swapIdx], order[idx]];
    setConfig({ ...config, sectionOrder: order });
  };

  const toggleVisibility = (sectionId: SectionId) => {
    setConfig({
      ...config,
      sectionVisibility: { ...config.sectionVisibility, [sectionId]: !config.sectionVisibility[sectionId] },
    });
  };

  const updateSectionLayout = (sectionId: SectionId, updates: Partial<SectionLayout>) => {
    setConfig({
      ...config,
      sectionLayout: { ...config.sectionLayout, [sectionId]: { ...config.sectionLayout[sectionId], ...updates } },
    });
  };

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setConfig({ ...config, theme: { ...config.theme, ...updates } });
  };

  // Contact helpers
  const updateContactItem = (index: number, field: keyof ContactInfoItem, value: string) => {
    const items = [...config.contact.items];
    items[index] = { ...items[index], [field]: value };
    setConfig({ ...config, contact: { ...config.contact, items } });
  };

  const addContactItem = () => {
    setConfig({
      ...config,
      contact: { ...config.contact, items: [...config.contact.items, { icon: "phone" as const, title: "", content: "" }] },
    });
  };

  const removeContactItem = (index: number) => {
    const items = config.contact.items.filter((_, i) => i !== index);
    setConfig({ ...config, contact: { ...config.contact, items } });
  };

  // Appointment helpers
  const addTimeSlot = () => {
    setConfig({ ...config, appointment: { ...config.appointment, timeSlots: [...config.appointment.timeSlots, "19:00"] } });
  };

  const removeTimeSlot = (index: number) => {
    const slots = config.appointment.timeSlots.filter((_, i) => i !== index);
    setConfig({ ...config, appointment: { ...config.appointment, timeSlots: slots } });
  };

  const updateTimeSlot = (index: number, value: string) => {
    const slots = [...config.appointment.timeSlots];
    slots[index] = value;
    setConfig({ ...config, appointment: { ...config.appointment, timeSlots: slots } });
  };

  const subTabs = [
    { id: "sections" as SubTab, label: "Secciones", icon: Layers },
    { id: "theme" as SubTab, label: "Tema", icon: Palette },
    { id: "hero" as SubTab, label: "Hero", icon: ImageIcon },
    { id: "benefits" as SubTab, label: "Nosotros", icon: Heart },
    { id: "catalog" as SubTab, label: "Catálogo", icon: LayoutGrid },
    { id: "gallery" as SubTab, label: "Galería", icon: ImageIcon },
    { id: "testimonials" as SubTab, label: "Testimonios", icon: MessageSquareQuote },
    { id: "contact" as SubTab, label: "Contacto", icon: Phone },
    { id: "appointment" as SubTab, label: "Agenda", icon: Calendar },
    { id: "quiz" as SubTab, label: "Quiz", icon: Sparkles },
    { id: "featured" as SubTab, label: "Destacados", icon: Star },
  ];

  const inputClass =
    "w-full px-4 py-3 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-sm bg-white text-[var(--foreground)]";
  const labelClass =
    "block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider";

  const AlignButton = ({ align, current, onClick }: { align: TextAlign; current: TextAlign; onClick: () => void }) => {
    const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
    return (
      <button
        type="button"
        onClick={onClick}
        className={`p-2 border transition-colors ${
          current === align
            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
            : "border-[var(--border)] text-gray-400 hover:border-[var(--primary)] hover:text-[var(--primary)]"
        }`}
      >
        <Icon size={16} />
      </button>
    );
  };

  const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 border border-[var(--border)] cursor-pointer bg-transparent p-0" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg text-sm font-mono bg-white" maxLength={7} />
      </div>
    </div>
  );

  const CONTACT_ICONS: { value: ContactInfoItem["icon"]; label: string }[] = [
    { value: "mapPin", label: "Ubicación" },
    { value: "phone", label: "Teléfono" },
    { value: "mail", label: "Email" },
    { value: "clock", label: "Horarios" },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Info Banner + Preview Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Editá textos, secciones, colores y tipografía. Los cambios se aplican al guardar.
            </p>
          </div>
          <button
            onClick={() => setPreviewOpen(!previewOpen)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              previewOpen
                ? "bg-[var(--primary)] text-white"
                : "bg-white border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
            }`}
          >
            <Monitor className="w-4 h-4" />
            Vista previa
          </button>
        </div>

        {/* Success Message */}
        {saveMessage && (
          <div className={`border rounded-xl px-4 py-3 ${saveMessage.includes("ERROR") ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
            <p className={`text-sm ${saveMessage.includes("ERROR") ? "text-red-800" : "text-green-800"}`}>{saveMessage}</p>
          </div>
        )}

        {/* Sub-tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--foreground)] bg-white border border-[var(--border)] hover:bg-[var(--muted)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ═══════════════ SECTIONS TAB ═══════════════ */}
        {activeSubTab === "sections" && (
          <div className="space-y-6">
            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Orden y visibilidad de secciones
              </h3>
              <p className="text-xs text-gray-500 mb-6">Reordená, ocultá secciones y controlá la alineación de cada una.</p>

              <div className="space-y-2">
                {config.sectionOrder.map((sectionId, idx) => {
                  const isVisible = config.sectionVisibility[sectionId];
                  const sl = config.sectionLayout[sectionId] || DEFAULT_SECTION_LAYOUT[sectionId];
                  return (
                    <div key={sectionId} className={`border rounded-lg p-4 transition-colors ${isVisible ? "border-[var(--border)] bg-white" : "border-gray-200 bg-gray-50 opacity-60"}`}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-gray-300 flex-shrink-0">
                          <GripVertical size={16} />
                          <span className="text-xs font-mono w-4 text-center">{idx + 1}</span>
                        </div>
                        <span className="flex-1 font-medium text-sm text-[var(--foreground)]">{SECTION_LABELS[sectionId]}</span>
                        <div className="flex gap-0.5">
                          <AlignButton align="left" current={sl.textAlign} onClick={() => updateSectionLayout(sectionId, { textAlign: "left" })} />
                          <AlignButton align="center" current={sl.textAlign} onClick={() => updateSectionLayout(sectionId, { textAlign: "center" })} />
                          <AlignButton align="right" current={sl.textAlign} onClick={() => updateSectionLayout(sectionId, { textAlign: "right" })} />
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <label className="text-[10px] text-gray-400 uppercase tracking-wider">Padding</label>
                          <input type="range" min={0} max={200} step={8} value={sl.paddingY} onChange={(e) => updateSectionLayout(sectionId, { paddingY: Number(e.target.value) })} className="w-20 h-1 accent-[var(--primary)]" />
                          <span className="text-[10px] font-mono text-gray-400 w-8">{sl.paddingY || "auto"}</span>
                        </div>
                        <div className="flex gap-0.5 flex-shrink-0">
                          <button onClick={() => moveSection(sectionId, "up")} disabled={idx === 0} className="p-1.5 text-gray-400 hover:text-[var(--primary)] disabled:opacity-20 transition-colors"><ChevronUp size={16} /></button>
                          <button onClick={() => moveSection(sectionId, "down")} disabled={idx === config.sectionOrder.length - 1} className="p-1.5 text-gray-400 hover:text-[var(--primary)] disabled:opacity-20 transition-colors"><ChevronDown size={16} /></button>
                        </div>
                        <button onClick={() => toggleVisibility(sectionId)} className={`p-1.5 transition-colors ${isVisible ? "text-green-500 hover:text-red-400" : "text-gray-300 hover:text-green-500"}`} title={isVisible ? "Ocultar" : "Mostrar"}>
                          {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ THEME TAB ═══════════════ */}
        {activeSubTab === "theme" && (
          <div className="space-y-6">
            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1" style={{ fontFamily: "var(--font-playfair), serif" }}>Colores</h3>
              <p className="text-xs text-gray-500 mb-6">Personalizá la paleta de colores de todo el sitio.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorInput label="Primario" value={config.theme.primary} onChange={(v) => updateTheme({ primary: v })} />
                <ColorInput label="Primario oscuro" value={config.theme.primaryDark} onChange={(v) => updateTheme({ primaryDark: v })} />
                <ColorInput label="Acento" value={config.theme.accent} onChange={(v) => updateTheme({ accent: v })} />
                <ColorInput label="Secundario" value={config.theme.secondary} onChange={(v) => updateTheme({ secondary: v })} />
                <ColorInput label="Fondo suave" value={config.theme.muted} onChange={(v) => updateTheme({ muted: v })} />
                <ColorInput label="Bordes" value={config.theme.border} onChange={(v) => updateTheme({ border: v })} />
                <ColorInput label="Texto" value={config.theme.foreground} onChange={(v) => updateTheme({ foreground: v })} />
                <ColorInput label="Fondo" value={config.theme.background} onChange={(v) => updateTheme({ background: v })} />
              </div>
              <div className="mt-6 p-4 border border-[var(--border)] rounded-lg">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Vista previa</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(config.theme).filter(([k]) => !["headingFont", "bodyFont"].includes(k)).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className="w-8 h-8 border border-gray-200" style={{ backgroundColor: val }} />
                      <span className="text-xs text-gray-500">{key}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => updateTheme({ ...DEFAULT_THEME })} className="mt-4 text-xs text-[var(--primary)] hover:underline">Restaurar colores originales</button>
            </div>
            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1" style={{ fontFamily: "var(--font-playfair), serif" }}>Tipografía</h3>
              <p className="text-xs text-gray-500 mb-6">Elegí las fuentes para títulos y cuerpo de texto.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Fuente de títulos</label>
                  <select value={config.theme.headingFont} onChange={(e) => updateTheme({ headingFont: e.target.value })} className={inputClass}>
                    {FONT_OPTIONS.heading.map((font) => (<option key={font} value={font}>{font}</option>))}
                  </select>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]" style={{ fontFamily: `'${config.theme.headingFont}', serif` }}>Ejemplo de título</p>
                </div>
                <div>
                  <label className={labelClass}>Fuente de cuerpo</label>
                  <select value={config.theme.bodyFont} onChange={(e) => updateTheme({ bodyFont: e.target.value })} className={inputClass}>
                    {FONT_OPTIONS.body.map((font) => (<option key={font} value={font}>{font}</option>))}
                  </select>
                  <p className="mt-2 text-sm text-[var(--foreground)]" style={{ fontFamily: `'${config.theme.bodyFont}', sans-serif` }}>Ejemplo de texto de cuerpo. Así se verá el contenido general del sitio.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ HERO TAB ═══════════════ */}
        {activeSubTab === "hero" && (
          <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>Sección Hero</h3>
            <div>
              <label className={labelClass}>Imagen de fondo</label>
              <div className="flex items-start gap-4">
                <div className="w-48 h-28 bg-cover bg-center rounded-lg border border-[var(--border)] flex-shrink-0" style={{ backgroundImage: `url('${config.hero.backgroundImage}')` }} />
                <div className="space-y-2">
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleHeroImageUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors disabled:opacity-50">
                    <Upload className="w-4 h-4" />{uploading ? "Subiendo..." : "Cambiar imagen"}
                  </button>
                  <p className="text-xs text-gray-400">JPG, PNG o WebP. Máx 5MB.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Label superior</label>
                <input type="text" value={config.hero.label} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, label: e.target.value } })} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Título principal</label>
                <input type="text" value={config.hero.title} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Subtítulo / Descripción</label>
                <textarea value={config.hero.subtitle} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })} rows={3} className={`${inputClass} resize-y`} />
              </div>
            </div>
            <div className="border-t border-[var(--border)] pt-6">
              <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">Botones de acción</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Texto botón primario</label>
                  <input type="text" value={config.hero.ctaPrimaryText} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaPrimaryText: e.target.value } })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Link botón primario</label>
                  <input type="text" value={config.hero.ctaPrimaryHref} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaPrimaryHref: e.target.value } })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Texto botón secundario</label>
                  <input type="text" value={config.hero.ctaSecondaryText} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaSecondaryText: e.target.value } })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Link botón secundario</label>
                  <input type="text" value={config.hero.ctaSecondaryHref} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaSecondaryHref: e.target.value } })} className={inputClass} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ BENEFITS TAB ═══════════════ */}
        {activeSubTab === "benefits" && (
          <div className="space-y-6">
            <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-5">
              <h3 className="text-lg font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>Sobre Nosotros / ¿Por Qué Elegirnos?</h3>
              <div>
                <label className={labelClass}>Label superior</label>
                <input type="text" value={config.benefits.sectionLabel} onChange={(e) => setConfig({ ...config, benefits: { ...config.benefits, sectionLabel: e.target.value } })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Título</label>
                <input type="text" value={config.benefits.title} onChange={(e) => setConfig({ ...config, benefits: { ...config.benefits, title: e.target.value } })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Descripción</label>
                <textarea value={config.benefits.description} onChange={(e) => setConfig({ ...config, benefits: { ...config.benefits, description: e.target.value } })} rows={4} className={`${inputClass} resize-y`} />
              </div>
            </div>
            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">Estadísticas</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {config.benefits.stats.map((stat, i) => (
                  <div key={i} className="space-y-2">
                    <input type="text" value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} className={inputClass} placeholder="15+" />
                    <input type="text" value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} className={inputClass} placeholder="Años de experiencia" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">Beneficios (6 tarjetas)</h4>
              <div className="space-y-4">
                {config.benefits.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-[var(--muted)] rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-400 w-4">{i + 1}</span>
                      <input type="text" value={item.title} onChange={(e) => updateBenefitItem(i, "title", e.target.value)} className={inputClass} placeholder="Título" />
                    </div>
                    <div className="md:col-span-2">
                      <input type="text" value={item.description} onChange={(e) => updateBenefitItem(i, "description", e.target.value)} className={inputClass} placeholder="Descripción" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ CATALOG TAB ═══════════════ */}
        {activeSubTab === "catalog" && (
          <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-5">
            <h3 className="text-lg font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>Sección Catálogo</h3>
            <div>
              <label className={labelClass}>Label superior</label>
              <input type="text" value={config.catalog.sectionLabel} onChange={(e) => setConfig({ ...config, catalog: { ...config.catalog, sectionLabel: e.target.value } })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Título</label>
              <input type="text" value={config.catalog.title} onChange={(e) => setConfig({ ...config, catalog: { ...config.catalog, title: e.target.value } })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea value={config.catalog.description} onChange={(e) => setConfig({ ...config, catalog: { ...config.catalog, description: e.target.value } })} rows={3} className={`${inputClass} resize-y`} />
            </div>
          </div>
        )}

        {/* ═══════════════ GALLERY TAB ═══════════════ */}
        {activeSubTab === "gallery" && (
          <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-5">
            <h3 className="text-lg font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>Sección Galería</h3>
            <div>
              <label className={labelClass}>Label superior</label>
              <input type="text" value={config.gallery.sectionLabel} onChange={(e) => setConfig({ ...config, gallery: { ...config.gallery, sectionLabel: e.target.value } })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Título</label>
              <input type="text" value={config.gallery.title} onChange={(e) => setConfig({ ...config, gallery: { ...config.gallery, title: e.target.value } })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea value={config.gallery.description} onChange={(e) => setConfig({ ...config, gallery: { ...config.gallery, description: e.target.value } })} rows={3} className={`${inputClass} resize-y`} />
            </div>
          </div>
        )}

        {/* ═══════════════ TESTIMONIALS TAB ═══════════════ */}
        {activeSubTab === "testimonials" && (
          <div className="space-y-6">
            <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-5">
              <h3 className="text-lg font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>Sección Testimonios</h3>
              <div>
                <label className={labelClass}>Label superior</label>
                <input type="text" value={config.testimonials.sectionLabel} onChange={(e) => setConfig({ ...config, testimonials: { ...config.testimonials, sectionLabel: e.target.value } })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Título</label>
                <input type="text" value={config.testimonials.title} onChange={(e) => setConfig({ ...config, testimonials: { ...config.testimonials, title: e.target.value } })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Descripción</label>
                <textarea value={config.testimonials.description} onChange={(e) => setConfig({ ...config, testimonials: { ...config.testimonials, description: e.target.value } })} rows={3} className={`${inputClass} resize-y`} />
              </div>
            </div>
            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Testimonios ({config.testimonials.items.length})</h4>
                <button onClick={addTestimonial} className="flex items-center gap-2 px-3 py-1.5 text-xs text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-dark)] transition-colors">
                  <Plus className="w-3 h-3" /> Agregar
                </button>
              </div>
              <div className="space-y-4">
                {config.testimonials.items.map((item) => (
                  <div key={item.id} className="p-4 bg-[var(--muted)] rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Testimonio #{item.id}</span>
                      <button onClick={() => removeTestimonial(item.id)} className="p-1 text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>Nombre</label>
                        <input type="text" value={item.name} onChange={(e) => updateTestimonial(item.id, "name", e.target.value)} className={inputClass} placeholder="Nombre completo" />
                      </div>
                      <div>
                        <label className={labelClass}>Iniciales</label>
                        <input type="text" value={item.initials} onChange={(e) => updateTestimonial(item.id, "initials", e.target.value)} className={inputClass} placeholder="MG" maxLength={3} />
                      </div>
                      <div>
                        <label className={labelClass}>Rol / Profesión</label>
                        <input type="text" value={item.role} onChange={(e) => updateTestimonial(item.id, "role", e.target.value)} className={inputClass} placeholder="Arquitecta" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Testimonio</label>
                      <textarea value={item.content} onChange={(e) => updateTestimonial(item.id, "content", e.target.value)} rows={2} className={`${inputClass} resize-y`} placeholder="Lo que dijo el cliente..." />
                    </div>
                    <div className="w-32">
                      <label className={labelClass}>Estrellas (1-5)</label>
                      <input type="number" min={1} max={5} value={item.rating} onChange={(e) => updateTestimonial(item.id, "rating", Math.min(5, Math.max(1, Number(e.target.value))))} className={inputClass} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ CONTACT TAB ═══════════════ */}
        {activeSubTab === "contact" && (
          <div className="space-y-6">
            <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-5">
              <h3 className="text-lg font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>Sección Contacto</h3>
              <div>
                <label className={labelClass}>Label superior</label>
                <input type="text" value={config.contact.sectionLabel} onChange={(e) => setConfig({ ...config, contact: { ...config.contact, sectionLabel: e.target.value } })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Título</label>
                <input type="text" value={config.contact.title} onChange={(e) => setConfig({ ...config, contact: { ...config.contact, title: e.target.value } })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Descripción</label>
                <textarea value={config.contact.description} onChange={(e) => setConfig({ ...config, contact: { ...config.contact, description: e.target.value } })} rows={3} className={`${inputClass} resize-y`} />
              </div>
              <div>
                <label className={labelClass}>Mensaje predeterminado WhatsApp</label>
                <input type="text" value={config.contact.whatsappText} onChange={(e) => setConfig({ ...config, contact: { ...config.contact, whatsappText: e.target.value } })} className={inputClass} />
              </div>
            </div>

            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Información de contacto ({config.contact.items.length})</h4>
                <button onClick={addContactItem} className="flex items-center gap-2 px-3 py-1.5 text-xs text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-dark)] transition-colors">
                  <Plus className="w-3 h-3" /> Agregar
                </button>
              </div>
              <div className="space-y-4">
                {config.contact.items.map((item, i) => (
                  <div key={i} className="p-4 bg-[var(--muted)] rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Item #{i + 1}</span>
                      <button onClick={() => removeContactItem(i)} className="p-1 text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>Icono</label>
                        <select value={item.icon} onChange={(e) => updateContactItem(i, "icon", e.target.value)} className={inputClass}>
                          {CONTACT_ICONS.map((ic) => (<option key={ic.value} value={ic.value}>{ic.label}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Título</label>
                        <input type="text" value={item.title} onChange={(e) => updateContactItem(i, "title", e.target.value)} className={inputClass} placeholder="Showroom" />
                      </div>
                      <div>
                        <label className={labelClass}>Contenido</label>
                        <input type="text" value={item.content} onChange={(e) => updateContactItem(i, "content", e.target.value)} className={inputClass} placeholder="Dirección o info" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ APPOINTMENT TAB ═══════════════ */}
        {activeSubTab === "appointment" && (
          <div className="space-y-6">
            <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-5">
              <h3 className="text-lg font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>Sección Agenda</h3>
              <div>
                <label className={labelClass}>Label superior</label>
                <input type="text" value={config.appointment.sectionLabel} onChange={(e) => setConfig({ ...config, appointment: { ...config.appointment, sectionLabel: e.target.value } })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Título</label>
                <input type="text" value={config.appointment.title} onChange={(e) => setConfig({ ...config, appointment: { ...config.appointment, title: e.target.value } })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Descripción</label>
                <textarea value={config.appointment.description} onChange={(e) => setConfig({ ...config, appointment: { ...config.appointment, description: e.target.value } })} rows={3} className={`${inputClass} resize-y`} />
              </div>
            </div>

            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-[var(--foreground)]">Horarios disponibles ({config.appointment.timeSlots.length})</h4>
                <button onClick={addTimeSlot} className="flex items-center gap-2 px-3 py-1.5 text-xs text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-dark)] transition-colors">
                  <Plus className="w-3 h-3" /> Agregar
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {config.appointment.timeSlots.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="time" value={slot} onChange={(e) => updateTimeSlot(i, e.target.value)} className={`${inputClass} flex-1`} />
                    <button onClick={() => removeTimeSlot(i)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ QUIZ TAB ═══════════════ */}
        {activeSubTab === "quiz" && (
          <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-5">
            <h3 className="text-lg font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>Sección Quiz de Estilo</h3>
            <div>
              <label className={labelClass}>Título</label>
              <input type="text" value={config.styleQuiz.title} onChange={(e) => setConfig({ ...config, styleQuiz: { ...config.styleQuiz, title: e.target.value } })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Subtítulo</label>
              <textarea value={config.styleQuiz.subtitle} onChange={(e) => setConfig({ ...config, styleQuiz: { ...config.styleQuiz, subtitle: e.target.value } })} rows={2} className={`${inputClass} resize-y`} />
            </div>
            <div>
              <label className={labelClass}>Texto del botón</label>
              <input type="text" value={config.styleQuiz.buttonText} onChange={(e) => setConfig({ ...config, styleQuiz: { ...config.styleQuiz, buttonText: e.target.value } })} className={inputClass} />
            </div>
          </div>
        )}

        {/* ═══════════════ FEATURED TAB ═══════════════ */}
        {activeSubTab === "featured" && (
          <div className="space-y-4">
            {featuredIds.length > 0 && (
              <div className="bg-white border border-[var(--border)] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>Orden de destacados ({featuredIds.length})</h3>
                <div className="space-y-2">
                  {featuredIds.map((id, idx) => {
                    const product = products.find((p: { id: number }) => p.id === id);
                    if (!product) return null;
                    return (
                      <div key={id} className="flex items-center gap-3 p-3 bg-[var(--muted)] rounded-lg">
                        <span className="text-xs font-mono text-gray-400 w-6">{idx + 1}</span>
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-[var(--foreground)]">{product.name}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveFeatured(id, "up")} disabled={idx === 0} className="p-1 text-gray-400 hover:text-[var(--primary)] disabled:opacity-30 transition-colors"><ChevronUp className="w-4 h-4" /></button>
                          <button onClick={() => moveFeatured(id, "down")} disabled={idx === featuredIds.length - 1} className="p-1 text-gray-400 hover:text-[var(--primary)] disabled:opacity-30 transition-colors"><ChevronDown className="w-4 h-4" /></button>
                          <button onClick={() => toggleFeatured(id)} className="p-1 text-red-400 hover:text-red-600 transition-colors ml-1"><X className="w-4 h-4" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>Todos los productos</h3>
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {products.map((product: { id: number; name: string; image: string; category: string }) => {
                  const isFeatured = featuredIds.includes(product.id);
                  return (
                    <button key={product.id} onClick={() => toggleFeatured(product.id)} className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors ${isFeatured ? "bg-amber-50 border border-amber-200" : "hover:bg-[var(--muted)]"}`}>
                      <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="flex-1 text-sm text-[var(--foreground)]">{product.name}</span>
                      <span className="text-xs text-gray-400 capitalize">{product.category}</span>
                      {isFeatured && <Star className="w-4 h-4 text-[var(--accent)] fill-current flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <button onClick={resetToDefaults} className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-600 border border-[var(--border)] rounded-xl hover:bg-gray-50 transition-colors">
            <RotateCcw className="w-4 h-4" /> Restaurar originales
          </button>
          <button onClick={save} className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm text-white bg-[var(--primary)] rounded-xl hover:bg-[var(--primary-dark)] transition-colors">
            <Save className="w-4 h-4" /> Guardar cambios
          </button>
        </div>
      </div>

      {/* ═══════════════ FLOATING LIVE PREVIEW ═══════════════ */}
      {previewOpen && (
        <div
          className="fixed z-50 flex flex-col bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{
            left: previewPos.x,
            top: previewPos.y,
            width: previewMinimized ? 280 : previewSize.w,
            height: previewMinimized ? "auto" : previewSize.h,
          }}
        >
          {/* Drag header */}
          <div
            onMouseDown={startDrag}
            className="flex items-center justify-between px-3 py-2 border-b border-gray-200 bg-gray-50 cursor-grab active:cursor-grabbing select-none flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <Move className="w-3.5 h-3.5 text-gray-400" />
              <Monitor className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span className="text-xs font-semibold text-[var(--foreground)]">Vista previa</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { if (iframeRef.current) iframeRef.current.src = iframeRef.current.src; }}
                className="p-1 text-gray-400 hover:text-[var(--primary)] transition-colors"
                title="Recargar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewMinimized(!previewMinimized)}
                className="p-1 text-gray-400 hover:text-[var(--primary)] transition-colors"
                title={previewMinimized ? "Expandir" : "Minimizar"}
              >
                {previewMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Cerrar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {/* Iframe */}
          {!previewMinimized && (
            <>
              <iframe
                ref={iframeRef}
                src="/"
                className="flex-1 w-full border-0"
                title="Vista previa de la landing"
              />
              {/* Resize handle */}
              <div
                onMouseDown={startResize}
                className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize group"
                title="Redimensionar"
              >
                <svg viewBox="0 0 20 20" className="w-full h-full text-gray-300 group-hover:text-[var(--primary)] transition-colors">
                  <path d="M14 20L20 14M10 20L20 10M6 20L20 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
