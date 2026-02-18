"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Truck, Shield, Palette, Users, Award, Wrench } from "lucide-react";
import { getStoredValue, STORAGE_KEYS } from "@/lib/storage";
import { LandingConfig, defaultLandingConfig, BenefitItem } from "@/types/landing";
import type { LucideIcon } from "lucide-react";

// Icons are fixed by position — admin edits titles/descriptions only
const benefitIcons: LucideIcon[] = [Palette, Award, Users, Truck, Shield, Wrench];

export function Benefits() {
  const [config, setConfig] = useState(defaultLandingConfig.benefits);

  useEffect(() => {
    const landing = getStoredValue<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig);
    setConfig(landing.benefits);
  }, []);

  return (
    <section id="nosotros" className="py-20 md:py-32 bg-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <p className="text-[var(--accent)] text-sm font-medium tracking-[0.3em] uppercase mb-4">
              {config.sectionLabel}
            </p>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[var(--foreground)] mb-6"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {config.title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {config.description}
            </p>
            <div className="flex items-center gap-8">
              {config.stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-8">
                  {i > 0 && <div className="w-[1px] h-12 bg-[var(--border)]" />}
                  <div>
                    <p
                      className="text-4xl font-semibold text-[var(--primary)]"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {config.items.map((benefit: BenefitItem, index: number) => {
              const Icon = benefitIcons[index] || Palette;
              return (
                <div
                  key={index}
                  className="p-6 border border-[var(--border)] hover:border-[var(--primary)] transition-colors group"
                >
                  <div className="w-12 h-12 bg-[var(--muted)] flex items-center justify-center mb-4 group-hover:bg-[var(--primary)] transition-colors">
                    <Icon
                      size={24}
                      className="text-[var(--primary)] group-hover:text-white transition-colors"
                    />
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)] mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
