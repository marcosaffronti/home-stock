"use client";

import { Container } from "@/components/ui/Container";
import { Instagram, Facebook, Linkedin, Youtube, ArrowUp } from "lucide-react";

const footerLinks = {
  productos: [
    { label: "Living", href: "#catalogo" },
    { label: "Comedor", href: "#catalogo" },
    { label: "Dormitorio", href: "#catalogo" },
    { label: "Exterior", href: "#catalogo" },
    { label: "Decoración", href: "#catalogo" },
  ],
  empresa: [
    { label: "Sobre Nosotros", href: "#nosotros" },
    { label: "Showroom", href: "#agenda" },
    { label: "Proyectos", href: "#galeria" },
    { label: "Blog", href: "#" },
    { label: "Contacto", href: "#contacto" },
  ],
  legal: [
    { label: "Términos y Condiciones", href: "#" },
    { label: "Política de Privacidad", href: "#" },
    { label: "Envíos y Devoluciones", href: "#" },
    { label: "Garantía", href: "#" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/homestock", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/homestock", label: "Facebook" },
  { icon: Linkedin, href: "https://linkedin.com/company/homestock", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/homestock", label: "YouTube" },
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
            <a href="#inicio" className="inline-block mb-6">
              <span
                className="text-3xl font-semibold tracking-tight"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Home Stock
              </span>
            </a>
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
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
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
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
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
                  <a
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
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
              © {new Date().getFullYear()} Home Stock. Todos los derechos reservados.
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
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </Container>
      </div>
    </footer>
  );
}
