"use client";

import { useState, useEffect } from "react";
import { allProducts, categories } from "@/data/products";
import {
  Package,
  FileText,
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronRight,
  Monitor,
  ExternalLink,
  Image as ImageIcon,
  Inbox,
  BarChart2,
  Menu,
  X,
} from "lucide-react";
import ProductManager from "./ProductManager";
import ContentEditor from "./ContentEditor";
import InfoEditor from "./InfoEditor";
import LandingEditor from "./LandingEditor";
import GalleryManager from "./GalleryManager";
import LeadsViewer from "./LeadsViewer";
import MetricsDashboard from "./MetricsDashboard";

type AdminSection =
  | "overview"
  | "metrics"
  | "leads"
  | "landing"
  | "products"
  | "gallery"
  | "content"
  | "info";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadLeads, setUnreadLeads] = useState(0);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((data) => {
        const count = (data.leads || []).filter(
          (l: { read: boolean }) => !l.read
        ).length;
        setUnreadLeads(count);
      })
      .catch(() => {});
  }, []);

  const productCount = allProducts.length;
  const categoryCount = categories.filter((c) => c.id !== "all").length;
  const featuredCount = allProducts.filter((p) => p.featured).length;

  const handleLogout = () => {
    sessionStorage.removeItem("hs-admin-auth");
    onLogout();
  };

  const navItems = [
    { id: "overview" as AdminSection, label: "Inicio", icon: LayoutDashboard, badge: 0 },
    { id: "metrics" as AdminSection, label: "Métricas", icon: BarChart2, badge: 0 },
    { id: "leads" as AdminSection, label: "Consultas", icon: Inbox, badge: unreadLeads },
    { id: "landing" as AdminSection, label: "Landing", icon: Monitor, badge: 0 },
    { id: "products" as AdminSection, label: "Productos", icon: Package, badge: 0 },
    { id: "gallery" as AdminSection, label: "Galería", icon: ImageIcon, badge: 0 },
    { id: "content" as AdminSection, label: "Contenido", icon: FileText, badge: 0 },
    { id: "info" as AdminSection, label: "Config.", icon: Settings, badge: 0 },
  ];

  const goTo = (section: AdminSection) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-40 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-14 gap-4">
            {/* Logo */}
            <button
              onClick={() => goTo("overview")}
              className="flex items-center gap-2.5 flex-shrink-0"
            >
              <div className="w-7 h-7 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <Package className="w-3.5 h-3.5 text-white" />
              </div>
              <span
                className="text-base font-semibold text-[var(--foreground)] hidden sm:block"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Home Stock
              </span>
            </button>

            {/* Divider */}
            <div className="hidden md:block h-5 w-px bg-[var(--border)]" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => goTo(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-[var(--primary)] text-white font-medium"
                        : "text-gray-500 hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                    }`}
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {item.label}
                    {item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 ml-auto">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                title="Ver sitio"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ver sitio</span>
              </a>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-1.5 text-gray-500 hover:bg-[var(--muted)] rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-white px-4 py-3">
            <nav className="grid grid-cols-2 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => goTo(item.id)}
                    className={`relative flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                    }`}
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                    {item.badge > 0 && (
                      <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        {/* ── OVERVIEW ── */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            {/* Page title */}
            <div>
              <h2
                className="text-xl font-semibold text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Panel de administración
              </h2>
              <p
                className="text-sm text-gray-500 mt-0.5"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Home Stock · {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Productos", value: productCount, color: "text-[var(--primary)]", bg: "bg-[var(--primary)]/10" },
                { label: "Categorías", value: categoryCount, color: "text-violet-600", bg: "bg-violet-50" },
                { label: "Destacados", value: featuredCount, color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Sin leer", value: unreadLeads, color: unreadLeads > 0 ? "text-red-600" : "text-gray-400", bg: unreadLeads > 0 ? "bg-red-50" : "bg-gray-50" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white border border-[var(--border)] rounded-xl px-4 py-3"
                >
                  <p
                    className={`text-2xl font-semibold ${stat.color}`}
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-xs text-gray-500 mt-0.5"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick Access Grid */}
            <div>
              <h3
                className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Acceso rápido
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    section: "landing" as AdminSection,
                    label: "Landing",
                    desc: "Hero, textos y productos destacados",
                    icon: Monitor,
                    bg: "bg-purple-50",
                    color: "text-purple-600",
                  },
                  {
                    section: "products" as AdminSection,
                    label: "Productos",
                    desc: "Precios, categorías y etiquetas",
                    icon: Package,
                    bg: "bg-[var(--primary)]/10",
                    color: "text-[var(--primary)]",
                  },
                  {
                    section: "leads" as AdminSection,
                    label: "Consultas",
                    desc: "Mensajes, turnos y formularios",
                    icon: Inbox,
                    bg: unreadLeads > 0 ? "bg-red-50" : "bg-emerald-50",
                    color: unreadLeads > 0 ? "text-red-600" : "text-emerald-600",
                    badge: unreadLeads,
                  },
                  {
                    section: "metrics" as AdminSection,
                    label: "Métricas",
                    desc: "Visitas, carrito y conversión",
                    icon: BarChart2,
                    bg: "bg-blue-50",
                    color: "text-blue-600",
                  },
                  {
                    section: "gallery" as AdminSection,
                    label: "Galería",
                    desc: "Fotos del showroom y productos",
                    icon: ImageIcon,
                    bg: "bg-amber-50",
                    color: "text-amber-600",
                  },
                  {
                    section: "content" as AdminSection,
                    label: "Contenido",
                    desc: "FAQ, términos y envíos",
                    icon: FileText,
                    bg: "bg-sky-50",
                    color: "text-sky-600",
                  },
                  {
                    section: "info" as AdminSection,
                    label: "Configuración",
                    desc: "Contacto, horarios y redes sociales",
                    icon: Settings,
                    bg: "bg-gray-50",
                    color: "text-gray-600",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.section}
                      onClick={() => goTo(item.section)}
                      className="relative bg-white border border-[var(--border)] rounded-xl p-4 text-left hover:border-[var(--primary)]/50 hover:shadow-sm transition-all group"
                    >
                      {item.badge && item.badge > 0 ? (
                        <span className="absolute top-3 right-3 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {item.badge > 9 ? "9+" : item.badge}
                        </span>
                      ) : null}
                      <div
                        className={`w-9 h-9 ${item.bg} rounded-lg flex items-center justify-center mb-3`}
                      >
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className="text-sm font-semibold text-[var(--foreground)]"
                            style={{ fontFamily: "var(--font-inter), sans-serif" }}
                          >
                            {item.label}
                          </p>
                          <p
                            className="text-xs text-gray-400 mt-0.5"
                            style={{ fontFamily: "var(--font-inter), sans-serif" }}
                          >
                            {item.desc}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[var(--primary)] transition-colors flex-shrink-0 mt-0.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-white border border-[var(--border)] rounded-xl p-5">
              <h3
                className="text-sm font-semibold text-[var(--foreground)] mb-4"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Distribución por categoría
              </h3>
              <div className="space-y-2.5">
                {categories
                  .filter((c) => c.id !== "all")
                  .map((cat) => {
                    const count = allProducts.filter((p) => p.category === cat.id).length;
                    const percentage = Math.round((count / productCount) * 100);
                    return (
                      <div key={cat.id} className="flex items-center gap-3">
                        <span
                          className="text-sm text-gray-600 w-28 flex-shrink-0"
                          style={{ fontFamily: "var(--font-inter), sans-serif" }}
                        >
                          {cat.label}
                        </span>
                        <div className="flex-1 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--primary)] rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span
                          className="text-xs text-gray-400 w-14 text-right flex-shrink-0"
                          style={{ fontFamily: "var(--font-inter), sans-serif" }}
                        >
                          {count} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ── SECTIONS ── */}
        {activeSection === "metrics"  && <MetricsDashboard />}
        {activeSection === "leads"    && <LeadsViewer />}
        {activeSection === "landing"  && <LandingEditor />}
        {activeSection === "products" && <ProductManager />}
        {activeSection === "gallery"  && <GalleryManager />}
        {activeSection === "content"  && <ContentEditor />}
        {activeSection === "info"     && <InfoEditor />}
      </main>
    </div>
  );
}
