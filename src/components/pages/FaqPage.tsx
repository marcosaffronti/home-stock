"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/data/content";

interface FaqPageProps {
  items: FaqItem[];
}

function FaqAccordionItem({ item, isOpen, onToggle }: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "border border-[var(--border)] transition-all duration-300",
        isOpen
          ? "bg-white shadow-md"
          : "bg-[var(--muted)]/50 hover:bg-white hover:shadow-sm"
      )}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer group"
        aria-expanded={isOpen}
      >
        <span
          className={cn(
            "text-base md:text-lg font-medium transition-colors duration-200",
            isOpen
              ? "text-[var(--primary-dark)]"
              : "text-[var(--foreground)] group-hover:text-[var(--primary)]"
          )}
        >
          {item.question}
        </span>
        <span
          className={cn(
            "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300",
            isOpen
              ? "bg-[var(--primary)] text-white rotate-180"
              : "bg-[var(--muted)] text-[var(--primary)] group-hover:bg-[var(--secondary)]"
          )}
        >
          <ChevronDown size={18} />
        </span>
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div
          className="faq-answer px-6 pb-6 text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: item.answer }}
        />
      </div>
    </div>
  );
}

export function FaqPage({ items }: FaqPageProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Header />
      <PageHero
        title="Preguntas Frecuentes"
        subtitle="Encontra respuestas a las consultas mas habituales sobre nuestros productos, envios y formas de pago."
        breadcrumbs={[{ label: "Preguntas Frecuentes" }]}
      />

      <section className="py-12 md:py-20 bg-white">
        <Container>
          <div className="max-w-3xl mx-auto space-y-3">
            {items.map((item, index) => (
              <FaqAccordionItem
                key={index}
                item={item}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </div>

          {/* CTA at bottom */}
          <div className="max-w-3xl mx-auto mt-12 p-8 bg-[var(--muted)] text-center">
            <p
              className="text-xl font-semibold text-[var(--foreground)] mb-2"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              No encontraste lo que buscabas?
            </p>
            <p className="text-gray-500 mb-6">
              Escribinos por WhatsApp y te respondemos al instante.
            </p>
            <a
              href="https://wa.me/5491171643900?text=Hola!%20Tengo%20una%20consulta."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary-dark)] transition-colors"
            >
              Contactanos por WhatsApp
            </a>
          </div>
        </Container>
      </section>

      <Footer />
      <WhatsAppButton />

      <style jsx global>{`
        .faq-answer p {
          margin-bottom: 0.75rem;
          line-height: 1.75;
        }

        .faq-answer p:last-child {
          margin-bottom: 0;
        }

        .faq-answer a {
          color: var(--primary);
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s;
        }

        .faq-answer a:hover {
          color: var(--primary-dark);
        }

        .faq-answer strong {
          color: var(--foreground);
          font-weight: 600;
        }

        .faq-answer ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .faq-answer ul ul {
          list-style: circle;
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }

        .faq-answer li {
          line-height: 1.75;
          margin-bottom: 0.25rem;
        }
      `}</style>
    </>
  );
}
