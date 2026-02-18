"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { StyleQuiz } from "@/components/ui/StyleQuiz";

export function StyleQuizSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="py-12 md:py-16 bg-[var(--muted)]">
        <Container>
          <div className="max-w-2xl mx-auto text-center">
            <Sparkles size={28} className="text-[var(--accent)] mx-auto mb-4" />
            <h2
              className="text-2xl md:text-3xl font-semibold text-[var(--foreground)] mb-3"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              ¿No sabés por dónde empezar?
            </h2>
            <p className="text-[var(--foreground)]/50 mb-8 max-w-md mx-auto">
              Respondé 4 preguntas y te recomendamos los muebles ideales para tu estilo y espacio.
            </p>
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-[var(--primary)] text-white font-medium tracking-[0.1em] uppercase text-sm hover:bg-[var(--primary-dark)] transition-colors"
            >
              <Sparkles size={16} />
              Descubrí tu estilo
            </button>
          </div>
        </Container>
      </section>

      <StyleQuiz isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
