"use client";

import { useState, useEffect, useRef } from "react";
import { getStoredValue, setStoredValue, saveToServer, STORAGE_KEYS } from "@/lib/storage";
import { LandingConfig, defaultLandingConfig, TestimonialItem } from "@/types/landing";
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
} from "lucide-react";

type SubTab = "hero" | "catalog" | "gallery" | "benefits" | "testimonials" | "featured";

export default function LandingEditor() {
  const [config, setConfig] = useState<LandingConfig>(defaultLandingConfig);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("hero");
  const [saveMessage, setSaveMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setConfig(getStoredValue<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig));
  }, []);

  const save = async () => {
    setStoredValue(STORAGE_KEYS.LANDING, config);
    const ok = await saveToServer(STORAGE_KEYS.LANDING, config);
    setSaveMessage(ok ? "Guardado en el servidor correctamente" : "ERROR: no se pudo guardar en el servidor");
    setTimeout(() => setSaveMessage(""), 5000);
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
    const newIds = featuredIds.includes(id)
      ? featuredIds.filter((fid) => fid !== id)
      : [...featuredIds, id];
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
    const newItem: TestimonialItem = {
      id: maxId + 1,
      name: "",
      initials: "",
      role: "",
      content: "",
      rating: 5,
    };
    setConfig({
      ...config,
      testimonials: {
        ...config.testimonials,
        items: [...config.testimonials.items, newItem],
      },
    });
  };

  const removeTestimonial = (id: number) => {
    setConfig({
      ...config,
      testimonials: {
        ...config.testimonials,
        items: config.testimonials.items.filter((t) => t.id !== id),
      },
    });
  };

  const updateTestimonial = (id: number, field: keyof TestimonialItem, value: string | number) => {
    const items = config.testimonials.items.map((t) =>
      t.id === id ? { ...t, [field]: value } : t
    );
    setConfig({ ...config, testimonials: { ...config.testimonials, items } });
  };

  const subTabs = [
    { id: "hero" as SubTab, label: "Hero", icon: ImageIcon },
    { id: "benefits" as SubTab, label: "Nosotros", icon: Heart },
    { id: "catalog" as SubTab, label: "Catálogo", icon: LayoutGrid },
    { id: "gallery" as SubTab, label: "Galería", icon: ImageIcon },
    { id: "testimonials" as SubTab, label: "Testimonios", icon: MessageSquareQuote },
    { id: "featured" as SubTab, label: "Destacados", icon: Star },
  ];

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
          Editá los textos, imágenes y productos destacados de la página
          principal. Los cambios se verán al refrescar el sitio.
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
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Hero Editor */}
      {activeSubTab === "hero" && (
        <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-6">
          <h3
            className="text-lg font-semibold text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Sección Hero
          </h3>

          {/* Background Image */}
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>
              Imagen de fondo
            </label>
            <div className="flex items-start gap-4">
              <div
                className="w-48 h-28 bg-cover bg-center rounded-lg border border-[var(--border)] flex-shrink-0"
                style={{ backgroundImage: `url('${config.hero.backgroundImage}')` }}
              />
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleHeroImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-[var(--border)] rounded-lg hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "Subiendo..." : "Cambiar imagen"}
                </button>
                <p className="text-xs text-gray-400">JPG, PNG o WebP. Máx 5MB.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                Label superior
              </label>
              <input
                type="text"
                value={config.hero.label}
                onChange={(e) =>
                  setConfig({ ...config, hero: { ...config.hero, label: e.target.value } })
                }
                className={inputClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                Título principal
              </label>
              <input
                type="text"
                value={config.hero.title}
                onChange={(e) =>
                  setConfig({ ...config, hero: { ...config.hero, title: e.target.value } })
                }
                className={inputClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                Subtítulo / Descripción
              </label>
              <textarea
                value={config.hero.subtitle}
                onChange={(e) =>
                  setConfig({ ...config, hero: { ...config.hero, subtitle: e.target.value } })
                }
                rows={3}
                className={`${inputClass} resize-y`}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              />
            </div>
          </div>

          {/* CTAs */}
          <div className="border-t border-[var(--border)] pt-6">
            <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">
              Botones de acción
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Texto botón primario</label>
                <input type="text" value={config.hero.ctaPrimaryText} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaPrimaryText: e.target.value } })} className={inputClass} style={{ fontFamily: "var(--font-inter), sans-serif" }} />
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Link botón primario</label>
                <input type="text" value={config.hero.ctaPrimaryHref} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaPrimaryHref: e.target.value } })} className={inputClass} style={{ fontFamily: "var(--font-inter), sans-serif" }} />
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Texto botón secundario</label>
                <input type="text" value={config.hero.ctaSecondaryText} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaSecondaryText: e.target.value } })} className={inputClass} style={{ fontFamily: "var(--font-inter), sans-serif" }} />
              </div>
              <div>
                <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Link botón secundario</label>
                <input type="text" value={config.hero.ctaSecondaryHref} onChange={(e) => setConfig({ ...config, hero: { ...config.hero, ctaSecondaryHref: e.target.value } })} className={inputClass} style={{ fontFamily: "var(--font-inter), sans-serif" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Benefits / Nosotros Editor */}
      {activeSubTab === "benefits" && (
        <div className="space-y-6">
          <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-5">
            <h3
              className="text-lg font-semibold text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Sobre Nosotros / ¿Por Qué Elegirnos?
            </h3>
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Label superior</label>
              <input
                type="text"
                value={config.benefits.sectionLabel}
                onChange={(e) => setConfig({ ...config, benefits: { ...config.benefits, sectionLabel: e.target.value } })}
                className={inputClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Título</label>
              <input
                type="text"
                value={config.benefits.title}
                onChange={(e) => setConfig({ ...config, benefits: { ...config.benefits, title: e.target.value } })}
                className={inputClass}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Descripción</label>
              <textarea
                value={config.benefits.description}
                onChange={(e) => setConfig({ ...config, benefits: { ...config.benefits, description: e.target.value } })}
                rows={4}
                className={`${inputClass} resize-y`}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-6">
            <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">Estadísticas</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {config.benefits.stats.map((stat, i) => (
                <div key={i} className="space-y-2">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(i, "value", e.target.value)}
                    className={inputClass}
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                    placeholder="15+"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStat(i, "label", e.target.value)}
                    className={inputClass}
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                    placeholder="Años de experiencia"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Benefit Items */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-6">
            <h4 className="text-sm font-semibold text-[var(--foreground)] mb-4">
              Beneficios (6 tarjetas)
            </h4>
            <div className="space-y-4">
              {config.benefits.items.map((item, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-[var(--muted)] rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400 w-4">{i + 1}</span>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateBenefitItem(i, "title", e.target.value)}
                      className={inputClass}
                      style={{ fontFamily: "var(--font-inter), sans-serif" }}
                      placeholder="Título"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateBenefitItem(i, "description", e.target.value)}
                      className={inputClass}
                      style={{ fontFamily: "var(--font-inter), sans-serif" }}
                      placeholder="Descripción"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Catalog Editor */}
      {activeSubTab === "catalog" && (
        <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-5">
          <h3 className="text-lg font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Sección Catálogo
          </h3>
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Label superior</label>
            <input type="text" value={config.catalog.sectionLabel} onChange={(e) => setConfig({ ...config, catalog: { ...config.catalog, sectionLabel: e.target.value } })} className={inputClass} style={{ fontFamily: "var(--font-inter), sans-serif" }} />
          </div>
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Título</label>
            <input type="text" value={config.catalog.title} onChange={(e) => setConfig({ ...config, catalog: { ...config.catalog, title: e.target.value } })} className={inputClass} style={{ fontFamily: "var(--font-inter), sans-serif" }} />
          </div>
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Descripción</label>
            <textarea value={config.catalog.description} onChange={(e) => setConfig({ ...config, catalog: { ...config.catalog, description: e.target.value } })} rows={3} className={`${inputClass} resize-y`} style={{ fontFamily: "var(--font-inter), sans-serif" }} />
          </div>
        </div>
      )}

      {/* Gallery Editor */}
      {activeSubTab === "gallery" && (
        <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-5">
          <h3 className="text-lg font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Sección Galería
          </h3>
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Label superior</label>
            <input type="text" value={config.gallery.sectionLabel} onChange={(e) => setConfig({ ...config, gallery: { ...config.gallery, sectionLabel: e.target.value } })} className={inputClass} style={{ fontFamily: "var(--font-inter), sans-serif" }} />
          </div>
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Título</label>
            <input type="text" value={config.gallery.title} onChange={(e) => setConfig({ ...config, gallery: { ...config.gallery, title: e.target.value } })} className={inputClass} style={{ fontFamily: "var(--font-inter), sans-serif" }} />
          </div>
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Descripción</label>
            <textarea value={config.gallery.description} onChange={(e) => setConfig({ ...config, gallery: { ...config.gallery, description: e.target.value } })} rows={3} className={`${inputClass} resize-y`} style={{ fontFamily: "var(--font-inter), sans-serif" }} />
          </div>
        </div>
      )}

      {/* Testimonials Editor */}
      {activeSubTab === "testimonials" && (
        <div className="space-y-6">
          <div className="bg-white border border-[var(--border)] rounded-xl p-6 space-y-5">
            <h3 className="text-lg font-semibold text-[var(--foreground)]" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Sección Testimonios
            </h3>
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Label superior</label>
              <input type="text" value={config.testimonials.sectionLabel} onChange={(e) => setConfig({ ...config, testimonials: { ...config.testimonials, sectionLabel: e.target.value } })} className={inputClass} style={{ fontFamily: "var(--font-inter), sans-serif" }} />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Título</label>
              <input type="text" value={config.testimonials.title} onChange={(e) => setConfig({ ...config, testimonials: { ...config.testimonials, title: e.target.value } })} className={inputClass} style={{ fontFamily: "var(--font-inter), sans-serif" }} />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Descripción</label>
              <textarea value={config.testimonials.description} onChange={(e) => setConfig({ ...config, testimonials: { ...config.testimonials, description: e.target.value } })} rows={3} className={`${inputClass} resize-y`} style={{ fontFamily: "var(--font-inter), sans-serif" }} />
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-[var(--foreground)]">
                Testimonios ({config.testimonials.items.length})
              </h4>
              <button
                onClick={addTestimonial}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-dark)] transition-colors"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                <Plus className="w-3 h-3" /> Agregar
              </button>
            </div>
            <div className="space-y-4">
              {config.testimonials.items.map((item) => (
                <div key={item.id} className="p-4 bg-[var(--muted)] rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Testimonio #{item.id}</span>
                    <button
                      onClick={() => removeTestimonial(item.id)}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Nombre</label>
                      <input type="text" value={item.name} onChange={(e) => updateTestimonial(item.id, "name", e.target.value)} className={inputClass} style={{ fontFamily: "var(--font-inter), sans-serif" }} placeholder="Nombre completo" />
                    </div>
                    <div>
                      <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Iniciales</label>
                      <input type="text" value={item.initials} onChange={(e) => updateTestimonial(item.id, "initials", e.target.value)} className={inputClass} style={{ fontFamily: "var(--font-inter), sans-serif" }} placeholder="MG" maxLength={3} />
                    </div>
                    <div>
                      <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Rol / Profesión</label>
                      <input type="text" value={item.role} onChange={(e) => updateTestimonial(item.id, "role", e.target.value)} className={inputClass} style={{ fontFamily: "var(--font-inter), sans-serif" }} placeholder="Arquitecta" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Testimonio</label>
                    <textarea value={item.content} onChange={(e) => updateTestimonial(item.id, "content", e.target.value)} rows={2} className={`${inputClass} resize-y`} style={{ fontFamily: "var(--font-inter), sans-serif" }} placeholder="Lo que dijo el cliente..." />
                  </div>
                  <div className="w-32">
                    <label className={labelClass} style={{ fontFamily: "var(--font-inter), sans-serif" }}>Estrellas (1-5)</label>
                    <input type="number" min={1} max={5} value={item.rating} onChange={(e) => updateTestimonial(item.id, "rating", Math.min(5, Math.max(1, Number(e.target.value))))} className={inputClass} style={{ fontFamily: "var(--font-inter), sans-serif" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured Products Editor */}
      {activeSubTab === "featured" && (
        <div className="space-y-4">
          {featuredIds.length > 0 && (
            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Orden de destacados ({featuredIds.length})
              </h3>
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
                      <span className="flex-1 text-sm font-medium text-[var(--foreground)]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                        {product.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveFeatured(id, "up")} disabled={idx === 0} className="p-1 text-gray-400 hover:text-[var(--primary)] disabled:opacity-30 transition-colors">
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => moveFeatured(id, "down")} disabled={idx === featuredIds.length - 1} className="p-1 text-gray-400 hover:text-[var(--primary)] disabled:opacity-30 transition-colors">
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleFeatured(id)} className="p-1 text-red-400 hover:text-red-600 transition-colors ml-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4" style={{ fontFamily: "var(--font-playfair), serif" }}>
              Todos los productos
            </h3>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {products.map((product: { id: number; name: string; image: string; category: string }) => {
                const isFeatured = featuredIds.includes(product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => toggleFeatured(product.id)}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors ${
                      isFeatured ? "bg-amber-50 border border-amber-200" : "hover:bg-[var(--muted)]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="flex-1 text-sm text-[var(--foreground)]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                      {product.name}
                    </span>
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
        <button
          onClick={resetToDefaults}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-600 border border-[var(--border)] rounded-xl hover:bg-gray-50 transition-colors"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          <RotateCcw className="w-4 h-4" /> Restaurar originales
        </button>
        <button
          onClick={save}
          className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm text-white bg-[var(--primary)] rounded-xl hover:bg-[var(--primary-dark)] transition-colors"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          <Save className="w-4 h-4" /> Guardar cambios
        </button>
      </div>
    </div>
  );
}
