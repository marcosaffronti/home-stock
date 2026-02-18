"use client";

import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Lightbox } from "@/components/ui/Lightbox";
import { Container } from "@/components/ui/Container";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import {
  allProjects as defaultProjects,
  galleryCategories as defaultGalleryCategories,
  GalleryProject,
} from "@/data/gallery";
import { fetchFromServer, STORAGE_KEYS } from "@/lib/storage";
import { LandingConfig, defaultLandingConfig } from "@/types/landing";
import { cn } from "@/lib/utils";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";
import Image from "next/image";

export function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [allProjects, setAllProjects] = useState(defaultProjects);
  const [galleryCategories, setGalleryCategories] = useState(defaultGalleryCategories);
  const [heroImage, setHeroImage] = useState(defaultLandingConfig.hero.backgroundImage);

  useEffect(() => {
    fetchFromServer<GalleryProject[] | null>(STORAGE_KEYS.GALLERY, null).then((storedProjects) => {
      if (storedProjects) setAllProjects(storedProjects);
    });
    fetchFromServer<string[] | null>(STORAGE_KEYS.GALLERY_CATEGORIES, null).then((storedCategories) => {
      if (storedCategories) setGalleryCategories(storedCategories);
    });
    fetchFromServer<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig).then((config) => {
      setHeroImage(config.hero.backgroundImage);
    });
  }, []);

  const filteredProjects =
    activeCategory === "Todos"
      ? allProjects
      : allProjects.filter((p) => p.category === activeCategory);

  const lightboxImages = filteredProjects.map((p) => ({
    src: p.image,
    alt: p.title,
    title: p.title,
    category: p.category,
  }));

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev === 0 ? filteredProjects.length - 1 : prev - 1) : null
    );
  }, [filteredProjects.length]);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev === filteredProjects.length - 1 ? 0 : prev + 1) : null
    );
  }, [filteredProjects.length]);

  const handleClose = useCallback(() => setLightboxIndex(null), []);

  // Masonry-like spans for visual interest
  const getSpan = (index: number): string => {
    const patterns = [
      "md:col-span-2 md:row-span-2",
      "",
      "",
      "md:row-span-2",
      "",
      "",
      "md:col-span-2",
      "",
    ];
    return patterns[index % patterns.length];
  };

  return (
    <>
      <Header />
      <PageHero
        title="Portfolio"
        subtitle="Cada proyecto es único. Descubrí los espacios que hemos transformado."
        breadcrumbs={[{ label: "Portfolio" }]}
        backgroundImage={heroImage}
      />

      <section className="py-20 md:py-32 bg-white">
        <Container>
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setLightboxIndex(null);
                }}
                className={cn(
                  "px-5 py-2 text-sm font-medium transition-all duration-300",
                  activeCategory === cat
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--secondary)]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[250px] md:auto-rows-[300px]">
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className={cn(
                  "relative group overflow-hidden cursor-pointer",
                  getSpan(index)
                )}
                onClick={() => setLightboxIndex(index)}
              >
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
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

          {filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[var(--foreground)]/50 text-lg">
                No hay proyectos en esta categoría.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* Before / After Section */}
      {allProjects.some((p) => p.beforeImage) && (
        <section className="py-16 md:py-24 bg-[var(--muted)]">
          <Container>
            <div className="text-center mb-10">
              <p className="text-[var(--accent)] text-sm font-medium tracking-[0.3em] uppercase mb-3">
                Transformaciones
              </p>
              <h2
                className="text-2xl md:text-3xl font-semibold text-[var(--foreground)]"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Antes & Después
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allProjects
                .filter((p) => p.beforeImage)
                .map((project) => (
                  <div key={project.id}>
                    <BeforeAfterSlider
                      beforeImage={project.beforeImage!}
                      afterImage={project.image}
                      className="aspect-[4/3]"
                    />
                    <p
                      className="mt-3 text-sm font-medium text-[var(--foreground)]"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      {project.title}
                    </p>
                  </div>
                ))}
            </div>
          </Container>
        </section>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}

      <Footer />
      <WhatsAppButton />
    </>
  );
}
