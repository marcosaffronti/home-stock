"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Menu, X, ShoppingBag, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const pathname = usePathname();

  const isLanding = pathname === "/";

  const navLinks = isLanding
    ? [
        { label: "Inicio", href: "#inicio" },
        { label: "Catálogo", href: "#catalogo" },
        { label: "Galería", href: "#galeria" },
        { label: "Nosotros", href: "#nosotros" },
        { label: "Contacto", href: "#contacto" },
      ]
    : [
        { label: "Inicio", href: "/" },
        { label: "Catálogo", href: "/catalogo" },
        { label: "Portfolio", href: "/portfolio" },
        { label: "Contacto", href: "/#contacto" },
      ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // On non-landing pages, always show scrolled style
  const showScrolledStyle = isScrolled || !isLanding;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        showScrolledStyle
          ? "bg-white/95 backdrop-blur-sm shadow-sm py-3"
          : "bg-transparent py-6"
      )}
    >
      <Container>
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span
              className={cn(
                "text-2xl font-semibold tracking-tight transition-colors duration-300",
                showScrolledStyle ? "text-[var(--foreground)]" : "text-white"
              )}
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Home Stock
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isAnchor = link.href.startsWith("#");
              const isActive =
                !isAnchor && link.href !== "/" && pathname === link.href;

              if (isAnchor) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium tracking-wide transition-colors hover:text-[var(--accent)]",
                      showScrolledStyle ? "text-[var(--foreground)]" : "text-white"
                    )}
                  >
                    {link.label}
                  </a>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium tracking-wide transition-colors hover:text-[var(--accent)]",
                    showScrolledStyle ? "text-[var(--foreground)]" : "text-white",
                    isActive && "text-[var(--accent)]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-2 text-sm transition-colors",
                showScrolledStyle ? "text-[var(--foreground)]" : "text-white"
              )}
            >
              <MessageCircle size={16} />
              <span>11 7164-3900</span>
            </a>

            {/* Cart Button */}
            <button
              onClick={openCart}
              aria-label="Abrir carrito"
              className={cn(
                "relative p-2 transition-colors",
                showScrolledStyle ? "text-[var(--foreground)]" : "text-white"
              )}
            >
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent)] text-white text-xs rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            <Button
              size="sm"
              variant={showScrolledStyle ? "primary" : "outline"}
              href={isLanding ? "#agenda" : "/#agenda"}
              className={!showScrolledStyle ? "border-white text-white hover:bg-white hover:text-[var(--foreground)]" : ""}
            >
              Agendar Visita
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={openCart}
              aria-label="Abrir carrito"
              className={cn(
                "relative p-2 transition-colors",
                showScrolledStyle ? "text-[var(--foreground)]" : "text-white"
              )}
            >
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent)] text-white text-xs rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className={cn(
                "p-2 transition-colors",
                showScrolledStyle ? "text-[var(--foreground)]" : "text-white"
              )}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4">
            <div className="flex flex-col px-4">
              {navLinks.map((link) => {
                const isAnchor = link.href.startsWith("#");

                if (isAnchor) {
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-3 text-[var(--foreground)] font-medium border-b border-[var(--border)] last:border-0"
                    >
                      {link.label}
                    </a>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "py-3 text-[var(--foreground)] font-medium border-b border-[var(--border)] last:border-0",
                      pathname === link.href && "text-[var(--accent)]"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Button
                className="mt-4"
                size="md"
                href={isLanding ? "#agenda" : "/#agenda"}
              >
                Agendar Visita
              </Button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
