"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Star } from "lucide-react";
import { fetchFromServer, STORAGE_KEYS } from "@/lib/storage";
import { LandingConfig, defaultLandingConfig, TestimonialItem } from "@/types/landing";

function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <div className="flex-shrink-0 w-[320px] sm:w-[360px] bg-white p-6 border border-[var(--border)] mx-2">
      {/* Stars */}
      <div className="flex gap-0.5 mb-3">
        {[...Array(item.rating)].map((_, i) => (
          <Star key={i} size={14} className="fill-[var(--accent)] text-[var(--accent)]" />
        ))}
      </div>
      {/* Quote */}
      <p className="text-[var(--foreground)]/70 text-sm leading-relaxed mb-4 line-clamp-3">
        &quot;{item.content}&quot;
      </p>
      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-xs">{item.initials}</span>
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm text-[var(--foreground)] truncate">{item.name}</p>
          <p className="text-[var(--foreground)]/40 text-xs truncate">{item.role}</p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const [config, setConfig] = useState(defaultLandingConfig.testimonials);

  useEffect(() => {
    fetchFromServer<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig)
      .then((landing) => setConfig(landing.testimonials));
  }, []);

  const items = config.items;
  if (items.length === 0) return null;

  // Duplicate items for seamless marquee loop
  const marqueeItems = [...items, ...items];

  return (
    <section className="py-12 md:py-16 bg-[var(--muted)] overflow-hidden">
      <Container className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--accent)] text-xs font-medium tracking-[0.3em] uppercase mb-1">
              {config.sectionLabel}
            </p>
            <h2
              className="text-xl md:text-2xl font-semibold text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {config.title}
            </h2>
          </div>
          <p className="text-[var(--foreground)]/40 text-sm hidden sm:block max-w-xs text-right">
            {config.description}
          </p>
        </div>
      </Container>

      {/* Marquee */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--muted)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--muted)] to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {marqueeItems.map((item, i) => (
            <TestimonialCard key={`${item.name}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
