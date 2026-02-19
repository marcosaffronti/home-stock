"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Truck, Shield, Palette, Users, Award, Wrench } from "lucide-react";
import { fetchFromServer, STORAGE_KEYS } from "@/lib/storage";
import { LandingConfig, defaultLandingConfig, BenefitItem, SectionLayout } from "@/types/landing";
import type { LucideIcon } from "lucide-react";

const benefitIcons: LucideIcon[] = [Palette, Award, Users, Truck, Shield, Wrench];

export function Benefits({ layout }: { layout?: SectionLayout }) {
  const [config, setConfig] = useState(defaultLandingConfig.benefits);

  useEffect(() => {
    fetchFromServer<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig)
      .then((landing) => setConfig(landing.benefits));
  }, []);

  return (
    <section id="nosotros" className="py-12 md:py-16 bg-white" style={layout?.paddingY ? { paddingTop: layout.paddingY, paddingBottom: layout.paddingY } : undefined}>
      <Container>
        {/* Compact header + stats in a row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-[var(--accent)] text-xs font-medium tracking-[0.3em] uppercase mb-1">
              {config.sectionLabel}
            </p>
            <h2
              className="text-2xl md:text-3xl font-semibold text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {config.title}
            </h2>
          </div>
          <div className="flex items-center gap-6 md:gap-8 flex-shrink-0">
            {config.stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-6 md:gap-8">
                {i > 0 && <div className="w-[1px] h-10 bg-[var(--border)]" />}
                <div className="text-center">
                  <p
                    className="text-2xl md:text-3xl font-semibold text-[var(--primary)]"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits — single row of compact cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {config.items.map((benefit: BenefitItem, index: number) => {
            const Icon = benefitIcons[index] || Palette;
            return (
              <div
                key={index}
                className="p-4 border border-[var(--border)] hover:border-[var(--primary)] transition-colors group text-center"
              >
                <div className="w-10 h-10 bg-[var(--muted)] flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--primary)] transition-colors">
                  <Icon
                    size={20}
                    className="text-[var(--primary)] group-hover:text-white transition-colors"
                  />
                </div>
                <h3 className="font-medium text-sm text-[var(--foreground)] mb-1">
                  {benefit.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
