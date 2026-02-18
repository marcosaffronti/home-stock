"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    id: 1,
    name: "María García",
    initials: "MG",
    role: "Arquitecta de Interiores",
    content: "Trabajar con Home Stock fue una experiencia excepcional. La calidad de sus muebles y el asesoramiento personalizado superaron todas mis expectativas. Mis clientes quedaron encantados.",
    rating: 5,
  },
  {
    id: 2,
    name: "Roberto Fernández",
    initials: "RF",
    role: "Empresario",
    content: "Amoblamos toda nuestra casa de fin de semana con Home Stock. El proceso fue simple, la entrega puntual y los muebles son exactamente lo que buscábamos. Calidad premium.",
    rating: 5,
  },
  {
    id: 3,
    name: "Carolina López",
    initials: "CL",
    role: "Diseñadora",
    content: "La atención al detalle de Home Stock es impresionante. Cada pieza que compramos es una obra de arte funcional. Definitivamente seguiremos siendo clientes.",
    rating: 5,
  },
  {
    id: 4,
    name: "Martín Ruiz",
    initials: "MR",
    role: "Hotelero",
    content: "Equipamos nuestro hotel boutique con muebles de Home Stock. El resultado fue espectacular y nuestros huéspedes no dejan de elogiar la decoración.",
    rating: 5,
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <section className="py-20 md:py-32 bg-[var(--foreground)]">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p className="text-[var(--accent)] text-sm font-medium tracking-[0.3em] uppercase mb-4">
              Testimonios
            </p>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-6"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              La satisfacción de nuestros clientes es nuestra mayor recompensa.
              Conocé las experiencias de quienes ya confiaron en nosotros.
            </p>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrev}
                aria-label="Testimonio anterior"
                className="w-12 h-12 border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-[var(--foreground)] transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNext}
                aria-label="Testimonio siguiente"
                className="w-12 h-12 border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-[var(--foreground)] transition-colors"
              >
                <ChevronRight size={24} />
              </button>
              <span className="text-white/50 ml-4">
                {currentIndex + 1} / {testimonials.length}
              </span>
            </div>
          </div>

          {/* Right - Testimonial Card */}
          <div className="relative">
            <Quote
              size={80}
              className="absolute -top-4 -left-4 text-[var(--accent)] opacity-20"
            />
            <div className="bg-white p-8 md:p-12 relative">
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className="fill-[var(--accent)] text-[var(--accent)]"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-[var(--foreground)] text-lg md:text-xl leading-relaxed mb-8">
                &quot;{testimonials[currentIndex].content}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-lg">
                    {testimonials[currentIndex].initials}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {testimonials[currentIndex].role}
                  </p>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Ver testimonio ${index + 1}`}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    currentIndex === index
                      ? "bg-[var(--accent)] w-6"
                      : "bg-white/30"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
