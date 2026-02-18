"use client";

import { useState } from "react";
import { allProducts, categories } from "@/data/products";
import {
  Package,
  FileText,
  Settings,
  LogOut,
  LayoutDashboard,
  AlertTriangle,
  ChevronRight,
  Monitor,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import ProductManager from "./ProductManager";
import ContentEditor from "./ContentEditor";
import InfoEditor from "./InfoEditor";
import LandingEditor from "./LandingEditor";
import GalleryManager from "./GalleryManager";

type AdminSection = "overview" | "products" | "content" | "info" | "landing" | "gallery";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const productCount = allProducts.length;
  const categoryCount = categories.filter((c) => c.id !== "all").length;
  const featuredCount = allProducts.filter((p) => p.featured).length;
  const taggedCount = allProducts.filter((p) => p.tag).length;

  const handleLogout = () => {
    sessionStorage.removeItem("hs-admin-auth");
    onLogout();
  };

  const navItems = [
    {
      id: "overview" as AdminSection,
      label: "Resumen",
      icon: LayoutDashboard,
    },
    { id: "landing" as AdminSection, label: "Landing", icon: Monitor },
    { id: "products" as AdminSection, label: "Productos", icon: Package },
    { id: "gallery" as AdminSection, label: "Galería", icon: ImageIcon },
    { id: "content" as AdminSection, label: "Contenido", icon: FileText },
    { id: "info" as AdminSection, label: "Información", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      {/* Top Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p
              className="text-xs sm:text-sm text-amber-800"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              Los cambios se guardan localmente. Para cambios permanentes,
              contactá al equipo de desarrollo.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1
                  className="text-lg font-semibold text-[var(--foreground)] leading-tight"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Home Stock
                </h1>
                <p
                  className="text-[10px] text-[var(--primary)] uppercase tracking-widest leading-tight"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  Admin
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                    }`}
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-[var(--primary)] hover:bg-[var(--muted)] rounded-lg transition-colors"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                <ExternalLink className="w-4 h-4" />
                Ver sitio
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-white px-4 py-3">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? "bg-[var(--primary)] text-white"
                        : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                    }`}
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Overview */}
        {activeSection === "overview" && (
          <div className="space-y-8">
            <div>
              <h2
                className="text-2xl font-semibold text-[var(--foreground)] mb-1"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Panel de Administración
              </h2>
              <p
                className="text-sm text-gray-500"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Gestioná productos, contenido e información del negocio.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[var(--border)] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#8B7355]/10 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                </div>
                <p
                  className="text-3xl font-semibold text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  {productCount}
                </p>
                <p
                  className="text-sm text-gray-500 mt-1"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  Productos totales
                </p>
              </div>
              <div className="bg-white border border-[var(--border)] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#C9A962]/10 rounded-xl flex items-center justify-center">
                    <LayoutDashboard className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                </div>
                <p
                  className="text-3xl font-semibold text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  {categoryCount}
                </p>
                <p
                  className="text-sm text-gray-500 mt-1"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  Categorías
                </p>
              </div>
              <div className="bg-white border border-[var(--border)] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p
                  className="text-3xl font-semibold text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  {featuredCount}
                </p>
                <p
                  className="text-sm text-gray-500 mt-1"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  Destacados
                </p>
              </div>
              <div className="bg-white border border-[var(--border)] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p
                  className="text-3xl font-semibold text-[var(--foreground)]"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  {taggedCount}
                </p>
                <p
                  className="text-sm text-gray-500 mt-1"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  Con etiqueta
                </p>
              </div>
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveSection("landing")}
                className="bg-white border border-[var(--border)] rounded-xl p-6 text-left hover:border-[var(--primary)] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                      <Monitor className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3
                      className="text-lg font-semibold text-[var(--foreground)] mb-1"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      Landing
                    </h3>
                    <p
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "var(--font-inter), sans-serif" }}
                    >
                      Editá hero, textos y productos destacados de la home.
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--primary)] transition-colors" />
                </div>
              </button>

              <button
                onClick={() => setActiveSection("products")}
                className="bg-white border border-[var(--border)] rounded-xl p-6 text-left hover:border-[var(--primary)] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="w-12 h-12 bg-[#8B7355]/10 rounded-xl flex items-center justify-center mb-4">
                      <Package className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <h3
                      className="text-lg font-semibold text-[var(--foreground)] mb-1"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      Productos
                    </h3>
                    <p
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "var(--font-inter), sans-serif" }}
                    >
                      Gestioná precios, categorías, etiquetas y productos
                      destacados.
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--primary)] transition-colors" />
                </div>
              </button>

              <button
                onClick={() => setActiveSection("content")}
                className="bg-white border border-[var(--border)] rounded-xl p-6 text-left hover:border-[var(--primary)] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3
                      className="text-lg font-semibold text-[var(--foreground)] mb-1"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      Contenido
                    </h3>
                    <p
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "var(--font-inter), sans-serif" }}
                    >
                      Editá términos, preguntas frecuentes e información de
                      envíos.
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--primary)] transition-colors" />
                </div>
              </button>

              <button
                onClick={() => setActiveSection("info")}
                className="bg-white border border-[var(--border)] rounded-xl p-6 text-left hover:border-[var(--primary)] hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                      <Settings className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3
                      className="text-lg font-semibold text-[var(--foreground)] mb-1"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      Información
                    </h3>
                    <p
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "var(--font-inter), sans-serif" }}
                    >
                      Actualizá datos de contacto, horarios y redes sociales.
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[var(--primary)] transition-colors" />
                </div>
              </button>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white border border-[var(--border)] rounded-xl p-6">
              <h3
                className="text-lg font-semibold text-[var(--foreground)] mb-4"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Productos por Categoría
              </h3>
              <div className="space-y-3">
                {categories
                  .filter((c) => c.id !== "all")
                  .map((cat) => {
                    const count = allProducts.filter(
                      (p) => p.category === cat.id
                    ).length;
                    const percentage = Math.round(
                      (count / productCount) * 100
                    );
                    return (
                      <div key={cat.id} className="flex items-center gap-4">
                        <span
                          className="text-sm text-[var(--foreground)] w-24 flex-shrink-0"
                          style={{
                            fontFamily: "var(--font-inter), sans-serif",
                          }}
                        >
                          {cat.label}
                        </span>
                        <div className="flex-1 h-2.5 bg-[var(--muted)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--primary)] rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span
                          className="text-sm text-gray-500 w-16 text-right flex-shrink-0"
                          style={{
                            fontFamily: "var(--font-inter), sans-serif",
                          }}
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

        {/* Landing */}
        {activeSection === "landing" && <LandingEditor />}

        {/* Products */}
        {activeSection === "products" && <ProductManager />}

        {/* Gallery */}
        {activeSection === "gallery" && <GalleryManager />}

        {/* Content */}
        {activeSection === "content" && <ContentEditor />}

        {/* Info */}
        {activeSection === "info" && <InfoEditor />}
      </main>
    </div>
  );
}
