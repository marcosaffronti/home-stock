"use client";

import { Container } from "@/components/ui/Container";
import { Instagram, MessageCircle, ArrowUp } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import Link from "next/link";

const footerLinks = {
  productos: [
    { label: "Catálogo Completo", href: "/catalogo" },
    { label: "Sillas", href: "/catalogo?category=sillas" },
    { label: "Cabeceras", href: "/catalogo?category=cabeceras" },
    { label: "Banquetas", href: "/catalogo?category=banquetas" },
    { label: "Mesas", href: "/catalogo?category=mesas" },
  ],
  empresa: [
    { label: "Sobre Nosotros", href: "/#nosotros" },
    { label: "Showroom", href: "/#agenda" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "Contacto", href: "/#contacto" },
  ],
  legal: [
    { label: "Términos y Condiciones", href: "/terminos" },
    { label: "Preguntas Frecuentes", href: "/faq" },
    { label: "Política de Envíos", href: "/envios" },
    { label: "Garantía", href: "#" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/somoshomestock/?hl=es-la", label: "Instagram" },
  { icon: MessageCircle, href: `https://wa.me/${WHATSAPP_NUMBER}`, label: "WhatsApp" },
];

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[var(--foreground)] text-white">
      {/* Main Footer */}
      <Container className="py-16 md:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span
                className="text-3xl font-semibold tracking-tight"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Home Stock
              </span>
            </Link>
            <p className="text-white/70 leading-relaxed mb-6 max-w-sm">
              Transformamos espacios en experiencias únicas. Muebles de diseño
              exclusivo para quienes buscan calidad, estilo y personalidad.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-[var(--foreground)] transition-colors"
                  aria-label={social.label}
                  title={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-6 text-[var(--accent)]">Productos</h3>
            <ul className="space-y-3">
              {footerLinks.productos.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-6 text-[var(--accent)]">Empresa</h3>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-6 text-[var(--accent)]">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") ? (
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <Container className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Home Stock. Todos los derechos reservados.
              <span className="mx-2">|</span>
              Powered by{" "}
              <a
                href="https://emiti.cloud"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                EMITI
              </a>
            </p>
            <button
              onClick={scrollToTop}
              className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-[var(--foreground)] transition-colors"
              aria-label="Volver arriba"
              title="Volver arriba"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </Container>
      </div>
    </footer>
  );
}
