"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const projects = [
  {
    id: 1,
    title: "Comedor con Sillas Ibiza",
    category: "Comedor Completo",
    image: "/images/gallery/comedor-ibiza.jpg",
    span: "col-span-2 row-span-2",
  },
  {
    id: 2,
    title: "Cabecera & Silla Ibiza",
    category: "Detalle de Producto",
    image: "/images/gallery/cabecera-silla-ibiza.jpeg",
    span: "col-span-1 row-span-1",
  },
  {
    id: 3,
    title: "Mesa Redonda Exterior",
    category: "Espacios al Aire Libre",
    image: "/images/gallery/mesa-redonda-exterior.jpg",
    span: "col-span-1 row-span-1",
  },
  {
    id: 4,
    title: "Showroom Home Stock",
    category: "Nuestro Espacio",
    image: "/images/gallery/showroom-mesa.jpg",
    span: "col-span-1 row-span-1",
  },
  {
    id: 5,
    title: "Producción Artesanal",
    category: "Detrás de Escena",
    image: "/images/gallery/produccion-sillas.jpg",
    span: "col-span-1 row-span-2",
  },
  {
    id: 6,
    title: "Comedor Completo",
    category: "Proyecto Residencial",
    image: "/images/gallery/comedor-ibiza-2.jpg",
    span: "col-span-1 row-span-1",
  },
];

export function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const handlePrev = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? projects.length - 1 : selectedImage - 1);
    }
  };

  const handleNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === projects.length - 1 ? 0 : selectedImage + 1);
    }
  };

  return (
    <section id="galeria" className="py-20 md:py-32 bg-[var(--muted)]">
      <Container>
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[var(--accent)] text-sm font-medium tracking-[0.3em] uppercase mb-4">
            Proyectos Realizados
          </p>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--foreground)] mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Galería de Proyectos
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Conocé algunos de los espacios que hemos transformado con nuestros
            muebles de diseño. Cada proyecto es único.
          </p>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[200px] md:auto-rows-[250px]">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`relative group overflow-hidden cursor-pointer ${project.span}`}
              onClick={() => setSelectedImage(index)}
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
      </Container>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setSelectedImage(null)}
            aria-label="Cerrar galería"
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>

          <button
            onClick={handlePrev}
            aria-label="Imagen anterior"
            className="absolute left-6 text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeft size={48} />
          </button>

          <div className="relative max-w-5xl w-full h-[70vh] mx-4">
            <Image
              src={projects[selectedImage].image}
              alt={projects[selectedImage].title}
              fill
              sizes="90vw"
              className="object-contain"
            />
            <div className="text-center mt-4">
              <p className="text-[var(--accent)] text-sm mb-1">
                {projects[selectedImage].category}
              </p>
              <h3 className="text-white text-2xl font-medium">
                {projects[selectedImage].title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleNext}
            aria-label="Imagen siguiente"
            className="absolute right-6 text-white/80 hover:text-white transition-colors"
          >
            <ChevronRight size={48} />
          </button>
        </div>
      )}
    </section>
  );
}
