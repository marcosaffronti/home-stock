"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Play } from "lucide-react";
import { fetchFromServer, STORAGE_KEYS } from "@/lib/storage";
import { LandingConfig, defaultLandingConfig } from "@/types/landing";

export function Hero() {
  const [hero, setHero] = useState(defaultLandingConfig.hero);

  useEffect(() => {
    fetchFromServer<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig)
      .then((config) => setHero(config.hero));
  }, []);

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${hero.backgroundImage}')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <Container className="relative z-10">
        <div className="max-w-2xl">
          <p className="text-[var(--accent)] text-sm font-medium tracking-[0.3em] uppercase mb-4">
            {hero.label}
          </p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl text-white font-semibold leading-tight mb-6"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {hero.title}
          </h1>
          <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
            {hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-white/60 text-xs tracking-widest uppercase">
          Scroll
        </span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-white/60 to-transparent" />
      </div>
    </section>
  );
}
