"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { featuredProjects } from "@/data/gallery";
import { getStoredValue, STORAGE_KEYS } from "@/lib/storage";
import { LandingConfig, defaultLandingConfig } from "@/types/landing";

export function Gallery() {
  const [galleryConfig, setGalleryConfig] = useState(defaultLandingConfig.gallery);

  useEffect(() => {
    const config = getStoredValue<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig);
    setGalleryConfig(config.gallery);
  }, []);

  return (
    <section id="galeria" className="py-20 md:py-32 bg-[var(--muted)]">
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[var(--accent)] text-sm font-medium tracking-[0.3em] uppercase mb-4">
            {galleryConfig.sectionLabel}
          </p>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--foreground)] mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {galleryConfig.title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {galleryConfig.description}
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[200px] md:auto-rows-[250px]">
          {featuredProjects.map((project) => (
            <div
              key={project.id}
              className={`relative group overflow-hidden ${project.span || ""}`}
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-[var(--accent)] text-sm mb-1">
                  {project.category}
                </p>
                <h3
                  className="text-white text-xl font-medium"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {project.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" href="/portfolio" className="group">
            Ver Portfolio Completo
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform ml-2"
            />
          </Button>
        </div>
      </Container>
    </section>
  );
}
