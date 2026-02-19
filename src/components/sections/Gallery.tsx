"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { featuredProjects as defaultFeaturedProjects, GalleryProject } from "@/data/gallery";
import { fetchFromServer, STORAGE_KEYS } from "@/lib/storage";
import { LandingConfig, defaultLandingConfig, SectionLayout } from "@/types/landing";

export function Gallery({ layout }: { layout?: SectionLayout }) {
  const [galleryConfig, setGalleryConfig] = useState(defaultLandingConfig.gallery);
  const [featuredProjects, setFeaturedProjects] = useState(defaultFeaturedProjects);

  useEffect(() => {
    fetchFromServer<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig)
      .then((config) => setGalleryConfig(config.gallery));
    fetchFromServer<GalleryProject[] | null>(STORAGE_KEYS.GALLERY, null)
      .then((storedProjects) => {
        if (storedProjects) {
          setFeaturedProjects(storedProjects.slice(0, 6).map((p) => ({ ...p })));
        }
      });
  }, []);

  // Show only 4 projects in the compact landing view
  const displayProjects = featuredProjects.slice(0, 4);

  return (
    <section id="galeria" className="py-12 md:py-16 bg-[var(--muted)]" style={layout?.paddingY ? { paddingTop: layout.paddingY, paddingBottom: layout.paddingY } : undefined}>
      <Container>
        {/* Header — inline with CTA */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[var(--accent)] text-xs font-medium tracking-[0.3em] uppercase mb-1">
              {galleryConfig.sectionLabel}
            </p>
            <h2
              className="text-2xl md:text-3xl font-semibold text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {galleryConfig.title}
            </h2>
          </div>
          <Button variant="outline" size="sm" href="/portfolio" className="group flex-shrink-0">
            Ver todo
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform ml-1.5"
            />
          </Button>
        </div>

        {/* Compact grid — 4 images, single row on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {displayProjects.map((project) => (
            <Link
              key={project.id}
              href="/portfolio"
              className="relative group overflow-hidden aspect-[4/5]"
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-[var(--accent)] text-xs mb-0.5">
                  {project.category}
                </p>
                <h3
                  className="text-white text-sm font-medium"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {project.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
