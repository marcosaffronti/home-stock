"use client";

import { useState, useMemo } from "react";
import { X, ChevronRight, Sparkles, RotateCcw } from "lucide-react";
import { allProducts } from "@/data/products";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/formatters";
import Image from "next/image";
import Link from "next/link";

interface QuizStep {
  question: string;
  options: { label: string; value: string; icon: string }[];
}

const STEPS: QuizStep[] = [
  {
    question: "¿Cuál es tu estilo?",
    options: [
      { label: "Moderno", value: "modern", icon: "M" },
      { label: "Clásico", value: "classic", icon: "C" },
      { label: "Minimalista", value: "minimal", icon: "I" },
      { label: "Rústico", value: "rustic", icon: "R" },
    ],
  },
  {
    question: "¿Para qué espacio?",
    options: [
      { label: "Comedor", value: "dining", icon: "D" },
      { label: "Living", value: "living", icon: "L" },
      { label: "Dormitorio", value: "bedroom", icon: "B" },
      { label: "Exterior", value: "outdoor", icon: "E" },
    ],
  },
  {
    question: "¿Qué material preferís?",
    options: [
      { label: "Madera natural", value: "wood", icon: "W" },
      { label: "Tapizado", value: "upholstered", icon: "T" },
      { label: "Mixto", value: "mixed", icon: "X" },
    ],
  },
  {
    question: "¿Tu presupuesto por pieza?",
    options: [
      { label: "Hasta $180.000", value: "low", icon: "$" },
      { label: "$180.000 – $250.000", value: "mid", icon: "$$" },
      { label: "Más de $250.000", value: "high", icon: "$$$" },
    ],
  },
];

function getRecommendations(answers: string[]): Product[] {
  const [style, space, material, budget] = answers;

  let scored = allProducts.map((p) => {
    let score = 0;

    // Style scoring
    if (style === "modern" && ["silla-ibiza", "silla-dora", "silla-moller"].some((s) => p.slug.includes(s))) score += 3;
    if (style === "classic" && ["wishbone", "emma"].some((s) => p.slug.includes(s))) score += 3;
    if (style === "minimal" && ["teca", "lola"].some((s) => p.slug.includes(s))) score += 3;
    if (style === "rustic" && ["petiribi", "tablero"].some((s) => p.slug.includes(s))) score += 3;

    // Space scoring
    if (space === "dining" && ["sillas", "mesas"].includes(p.category)) score += 2;
    if (space === "living" && ["poltronas", "banquetas"].includes(p.category)) score += 2;
    if (space === "bedroom" && p.category === "cabeceras") score += 3;
    if (space === "outdoor" && p.slug.includes("teca")) score += 2;

    // Material scoring
    if (material === "wood" && p.upholstered === false) score += 2;
    if (material === "upholstered" && p.upholstered !== false && ["sillas", "cabeceras", "poltronas"].includes(p.category)) score += 2;
    if (material === "mixed") score += 1;

    // Budget scoring
    if (budget === "low" && p.price <= 180000) score += 2;
    if (budget === "mid" && p.price > 180000 && p.price <= 250000) score += 2;
    if (budget === "high" && p.price > 250000) score += 2;

    // Bonus for featured/tagged products
    if (p.featured) score += 1;
    if (p.tag === "Nuevo") score += 1;

    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((s) => s.product);
}

interface StyleQuizProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StyleQuiz({ isOpen, onClose }: StyleQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const recommendations = useMemo(() => {
    if (!showResults) return [];
    return getRecommendations(answers);
  }, [showResults, answers]);

  const handleSelect = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setAnswers([]);
    setShowResults(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--accent)]" />
            <span
              className="font-semibold text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Diseñado para vos
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {!showResults ? (
          <div className="p-6 sm:p-8">
            {/* Progress */}
            <div className="flex gap-1.5 mb-8">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 transition-colors ${
                    i <= currentStep ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                  }`}
                />
              ))}
            </div>

            {/* Question */}
            <p className="text-[10px] text-[var(--foreground)]/30 tracking-[0.2em] uppercase mb-2">
              Paso {currentStep + 1} de {STEPS.length}
            </p>
            <h3
              className="text-2xl font-semibold text-[var(--foreground)] mb-8"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {STEPS[currentStep].question}
            </h3>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STEPS[currentStep].options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className="flex items-center gap-4 p-4 border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all text-left group"
                >
                  <span className="w-10 h-10 flex items-center justify-center bg-[var(--muted)] text-[var(--primary)] font-semibold text-sm group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                    {option.icon}
                  </span>
                  <span className="font-medium text-[var(--foreground)]">{option.label}</span>
                  <ChevronRight
                    size={16}
                    className="ml-auto text-[var(--foreground)]/20 group-hover:text-[var(--primary)] transition-colors"
                  />
                </button>
              ))}
            </div>

            {/* Back button */}
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="mt-6 text-sm text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors"
              >
                Volver al paso anterior
              </button>
            )}
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            {/* Results header */}
            <div className="text-center mb-8">
              <Sparkles size={32} className="text-[var(--accent)] mx-auto mb-3" />
              <h3
                className="text-2xl font-semibold text-[var(--foreground)] mb-2"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Tus recomendaciones
              </h3>
              <p className="text-sm text-[var(--foreground)]/50">
                Seleccionamos los productos ideales para tu estilo
              </p>
            </div>

            {/* Product recommendations */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {recommendations.map((product) => (
                <Link
                  key={product.id}
                  href={`/catalogo?product=${product.id}`}
                  onClick={onClose}
                  className="group border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="250px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-[9px] text-[var(--accent)] tracking-[0.2em] uppercase mb-0.5">
                      {product.category}
                    </p>
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      {product.name}
                    </p>
                    <p
                      className="text-sm text-[var(--primary)] mt-1"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/catalogo"
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[var(--primary)] text-white text-sm font-medium tracking-[0.1em] uppercase hover:bg-[var(--primary-dark)] transition-colors"
              >
                Ver catálogo completo
              </Link>
              <button
                onClick={restart}
                className="flex items-center justify-center gap-2 py-3.5 px-6 border border-[var(--border)] text-sm font-medium text-[var(--foreground)]/60 hover:border-[var(--primary)] transition-colors"
              >
                <RotateCcw size={14} />
                Repetir quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
