"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Play } from "lucide-react";
import { fetchFromServer, STORAGE_KEYS } from "@/lib/storage";
import { LandingConfig, defaultLandingConfig, SectionLayout } from "@/types/landing";

export function Hero({ layout }: { layout?: SectionLayout }) {
  const [hero, setHero] = useState(defaultLandingConfig.hero);
  const [loaded, setLoaded] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchFromServer<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig)
      .then((config) => { setHero(config.hero); setTimeout(() => setLoaded(true), 100); });
  }, []);

  // Parallax on scroll (desktop only)
  const handleScroll = useCallback(() => {
    if (window.innerWidth < 768) return;
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0) return;
    setParallaxY(Math.round(-rect.top * 0.3));
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{
          backgroundImage: `url('${hero.backgroundImage}')`,
          transform: `translateY(${parallaxY}px) scale(1.1)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content — staggered fade-in */}
      <Container className="relative z-10">
        <div className={`max-w-2xl ${layout?.textAlign === "center" ? "mx-auto text-center" : layout?.textAlign === "right" ? "ml-auto text-right" : ""}`}>
          <p
            className="text-[var(--accent)] text-sm font-medium tracking-[0.3em] uppercase mb-4"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "none" : "translateY(20px)",
              transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
            }}
          >
            {hero.label}
          </p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl text-white font-semibold leading-tight mb-6"
            style={{
              fontFamily: "var(--font-playfair), serif",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "none" : "translateY(20px)",
              transition: "opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s",
            }}
          >
            {hero.title}
          </h1>
          <p
            className="text-white/80 text-lg md:text-xl leading-relaxed mb-8 max-w-xl"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "none" : "translateY(20px)",
              transition: "opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s",
            }}
          >
            {hero.subtitle}
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-4 ${layout?.textAlign === "center" ? "justify-center" : layout?.textAlign === "right" ? "justify-end" : ""}`}
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "none" : "translateY(20px)",
              transition: "opacity 0.8s ease 0.8s, transform 0.8s ease 0.8s",
            }}
          >
            <Button size="lg" href={hero.ctaPrimaryHref} className="group">
              {hero.ctaPrimaryText}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform ml-2"
              />
            </Button>
            <Button
              size="lg"
              variant="outline"
              href={hero.ctaSecondaryHref}
              className="border-white text-white hover:bg-white hover:text-[var(--foreground)]"
            >
              <Play size={20} className="mr-2" />
              {hero.ctaSecondaryText}
            </Button>
          </div>
        </div>
      </Container>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{
          opacity: loaded ? 1 : 0,
          transition: "opacity 1s ease 1.2s",
        }}
      >
        <span className="text-white/60 text-xs tracking-widest uppercase">
          Scroll
        </span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
