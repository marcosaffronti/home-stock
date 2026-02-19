"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { StyleQuiz } from "@/components/ui/StyleQuiz";
import { LandingConfig, defaultLandingConfig, SectionLayout } from "@/types/landing";
import { fetchFromServer, STORAGE_KEYS } from "@/lib/storage";

export function StyleQuizSection({ layout }: { layout?: SectionLayout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(defaultLandingConfig.styleQuiz);

  useEffect(() => {
    fetchFromServer<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig)
      .then((landing) => { if (landing.styleQuiz) setConfig({ ...defaultLandingConfig.styleQuiz, ...landing.styleQuiz }); });
  }, []);

  return (
    <>
      <section className="py-12 md:py-16 bg-[var(--muted)]" style={layout?.paddingY ? { paddingTop: layout.paddingY, paddingBottom: layout.paddingY } : undefined}>
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <Sparkles size={28} className="text-[var(--accent)] mx-auto mb-4" />
            <h2
              className="text-2xl md:text-3xl font-semibold text-[var(--foreground)] mb-3"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {config.title}
            </h2>
            <p className="text-[var(--foreground)]/50 mb-8 max-w-md mx-auto">
              {config.subtitle}
            </p>
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-[var(--primary)] text-white font-medium tracking-[0.1em] uppercase text-sm hover:bg-[var(--primary-dark)] transition-colors"
            >
              <Sparkles size={16} />
              {config.buttonText}
            </button>
          </div>
        </Container>
      </section>

      <StyleQuiz isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
