"use client";

import { useEffect, useState } from "react";
import { fetchFromServer, STORAGE_KEYS } from "@/lib/storage";
import {
  LandingConfig,
  defaultLandingConfig,
  SectionId,
  SectionLayout,
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_VISIBILITY,
  DEFAULT_SECTION_LAYOUT,
} from "@/types/landing";

import { Hero } from "@/components/sections/Hero";
import { Catalog } from "@/components/sections/Catalog";
import { Gallery } from "@/components/sections/Gallery";
import { Benefits } from "@/components/sections/Benefits";
import { Testimonials } from "@/components/sections/Testimonials";
import { AppointmentBooking } from "@/components/sections/AppointmentBooking";
import { ContactForm } from "@/components/sections/ContactForm";
import { StyleQuizSection } from "@/components/sections/StyleQuizSection";

const SECTION_COMPONENTS: Record<SectionId, React.ComponentType<{ layout?: SectionLayout }>> = {
  hero: Hero,
  catalog: Catalog,
  styleQuiz: StyleQuizSection,
  gallery: Gallery,
  appointment: AppointmentBooking,
  testimonials: Testimonials,
  benefits: Benefits,
  contact: ContactForm,
};

export function LandingRenderer() {
  const [order, setOrder] = useState<SectionId[]>(DEFAULT_SECTION_ORDER);
  const [visibility, setVisibility] = useState(DEFAULT_SECTION_VISIBILITY);
  const [layouts, setLayouts] = useState(DEFAULT_SECTION_LAYOUT);

  useEffect(() => {
    fetchFromServer<LandingConfig>(STORAGE_KEYS.LANDING, defaultLandingConfig)
      .then((config) => {
        if (config.sectionOrder?.length) setOrder(config.sectionOrder);
        if (config.sectionVisibility) setVisibility({ ...DEFAULT_SECTION_VISIBILITY, ...config.sectionVisibility });
        if (config.sectionLayout) setLayouts({ ...DEFAULT_SECTION_LAYOUT, ...config.sectionLayout });
      });
  }, []);

  // Listen for real-time layout updates from admin preview
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "hs-layout-update") {
        if (e.data.order) setOrder(e.data.order);
        if (e.data.visibility) setVisibility({ ...DEFAULT_SECTION_VISIBILITY, ...e.data.visibility });
        if (e.data.layouts) setLayouts({ ...DEFAULT_SECTION_LAYOUT, ...e.data.layouts });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <>
      {order.map((sectionId) => {
        if (!visibility[sectionId]) return null;
        const Component = SECTION_COMPONENTS[sectionId];
        if (!Component) return null;
        const layout = layouts[sectionId];
        return <Component key={sectionId} layout={layout} />;
      })}
    </>
  );
}
