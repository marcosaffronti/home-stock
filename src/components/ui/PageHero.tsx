"use client";

import { Container } from "./Container";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
}

export function PageHero({ title, subtitle, breadcrumbs }: PageHeroProps) {
  return (
    <section className="bg-[var(--foreground)] pt-28 pb-12 md:pt-32 md:pb-16">
      <Container>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm text-white/50 mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight size={14} />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-white transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white/80">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-3"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/60 text-lg max-w-2xl">{subtitle}</p>
        )}
      </Container>
    </section>
  );
}
