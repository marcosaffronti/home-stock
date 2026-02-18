"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Menu, X, ShoppingBag, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import Image from "next/image";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Catálogo", href: "#catalogo" },
  { label: "Galería", href: "#galeria" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm py-3"
          : "bg-transparent py-6"
      )}
    >
      <Container>
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <a href="#inicio" className="flex items-center">
            <Image
              src="/images/logo-hs.jpeg"
              alt="Home Stock"
              width={120}
              height={120}
              className={cn(
                "h-10 w-auto transition-all duration-300",
                isScrolled ? "" : "brightness-0 invert"
              )}
              priority
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium tracking-wide transition-colors hover:text-[var(--accent)]",
                  isScrolled ? "text-[var(--foreground)]" : "text-white"
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-2 text-sm transition-colors",
                isScrolled ? "text-[var(--foreground)]" : "text-white"
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
                isScrolled ? "text-[var(--foreground)]" : "text-white"
              )}
            >
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent)] text-white text-xs rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            
            <Button size="sm" variant={isScrolled ? "primary" : "outline"} href="#agenda" className={!isScrolled ? "border-white text-white hover:bg-white hover:text-[var(--foreground)]" : ""}>
              Agendar Visita
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            className={cn(
              "md:hidden p-2 transition-colors",
              isScrolled ? "text-[var(--foreground)]" : "text-white"
            )}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4">
            <div className="flex flex-col px-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3 text-[var(--foreground)] font-medium border-b border-[var(--border)] last:border-0"
                >
                  {link.label}
                </a>
              ))}
              <Button className="mt-4" size="md" href="#agenda">
                Agendar Visita
              </Button>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
