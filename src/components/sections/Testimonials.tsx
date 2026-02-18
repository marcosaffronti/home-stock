"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchFromServer, STORAGE_KEYS } from "@/lib/storage";
import { LandingConfig, defaultLandingConfig, TestimonialItem } from "@/types/landing";

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [config, setConfig] = useState(defaultLandingConfig.testimonials);

  useEffect(() => {
    fetchFromServer<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig)
      .then((landing) => setConfig(landing.testimonials));
  }, []);

  const items = config.items;

  const handlePrev = () => {
    setCurrentIndex(currentIndex === 0 ? items.length - 1 : currentIndex - 1);
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex === items.length - 1 ? 0 : currentIndex + 1);
  };

  if (items.length === 0) return null;

  const current: TestimonialItem = items[currentIndex] || items[0];

  return (
    <section className="py-20 md:py-32 bg-[var(--foreground)]">
      <Container>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <p className="text-[var(--accent)] text-sm font-medium tracking-[0.3em] uppercase mb-4">
              {config.sectionLabel}
            </p>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-6"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {config.title}
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              {config.description}
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
                {currentIndex + 1} / {items.length}
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
                {[...Array(current.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className="fill-[var(--accent)] text-[var(--accent)]"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-[var(--foreground)] text-lg md:text-xl leading-relaxed mb-8">
                &quot;{current.content}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-lg">
                    {current.initials}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">
                    {current.name}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {current.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {items.map((_, index) => (
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
