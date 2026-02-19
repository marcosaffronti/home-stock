export interface BenefitItem {
  title: string;
  description: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface TestimonialItem {
  id: number;
  name: string;
  initials: string;
  role: string;
  content: string;
  rating: number;
}

// ── Layout & Theme Types ──

export type SectionId = "hero" | "catalog" | "styleQuiz" | "gallery" | "appointment" | "testimonials" | "benefits" | "contact";

export const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Hero",
  catalog: "Catálogo",
  styleQuiz: "Quiz de Estilo",
  gallery: "Galería",
  appointment: "Agenda",
  testimonials: "Testimonios",
  benefits: "Nosotros",
  contact: "Contacto",
};

export type TextAlign = "left" | "center" | "right";

export interface SectionLayout {
  textAlign: TextAlign;
  paddingY: number; // pixels (0 = use section default)
}

export interface ThemeConfig {
  primary: string;
  primaryDark: string;
  accent: string;
  secondary: string;
  muted: string;
  border: string;
  foreground: string;
  background: string;
  headingFont: string;
  bodyFont: string;
}

export const FONT_OPTIONS = {
  heading: [
    "Playfair Display",
    "Cormorant Garamond",
    "Lora",
    "Merriweather",
    "Libre Baskerville",
    "DM Serif Display",
    "Crimson Text",
    "Prata",
  ],
  body: [
    "Inter",
    "Lato",
    "Open Sans",
    "Roboto",
    "Source Sans 3",
    "Nunito",
    "Work Sans",
    "DM Sans",
  ],
};

export const DEFAULT_SECTION_ORDER: SectionId[] = [
  "hero", "catalog", "styleQuiz", "gallery", "appointment", "testimonials", "benefits", "contact",
];

export const DEFAULT_SECTION_VISIBILITY: Record<SectionId, boolean> = {
  hero: true,
  catalog: true,
  styleQuiz: true,
  gallery: true,
  appointment: true,
  testimonials: true,
  benefits: true,
  contact: true,
};

export const DEFAULT_SECTION_LAYOUT: Record<SectionId, SectionLayout> = {
  hero: { textAlign: "center", paddingY: 0 },
  catalog: { textAlign: "center", paddingY: 0 },
  styleQuiz: { textAlign: "center", paddingY: 0 },
  gallery: { textAlign: "left", paddingY: 0 },
  appointment: { textAlign: "center", paddingY: 0 },
  testimonials: { textAlign: "left", paddingY: 0 },
  benefits: { textAlign: "left", paddingY: 0 },
  contact: { textAlign: "left", paddingY: 0 },
};

export const DEFAULT_THEME: ThemeConfig = {
  primary: "#8B7355",
  primaryDark: "#6B5744",
  accent: "#C9A962",
  secondary: "#D4C4B0",
  muted: "#F5F1ED",
  border: "#E5DDD3",
  foreground: "#1A1A1A",
  background: "#FAFAFA",
  headingFont: "Playfair Display",
  bodyFont: "Inter",
};

export interface ContactInfoItem {
  icon: "mapPin" | "phone" | "mail" | "clock";
  title: string;
  content: string;
}

export interface LandingConfig {
  hero: {
    backgroundImage: string;
    label: string;
    title: string;
    subtitle: string;
    ctaPrimaryText: string;
    ctaPrimaryHref: string;
    ctaSecondaryText: string;
    ctaSecondaryHref: string;
  };
  catalog: {
    sectionLabel: string;
    title: string;
    description: string;
  };
  gallery: {
    sectionLabel: string;
    title: string;
    description: string;
  };
  benefits: {
    sectionLabel: string;
    title: string;
    description: string;
    stats: StatItem[];
    items: BenefitItem[];
  };
  testimonials: {
    sectionLabel: string;
    title: string;
    description: string;
    items: TestimonialItem[];
  };
  contact: {
    sectionLabel: string;
    title: string;
    description: string;
    whatsappText: string;
    items: ContactInfoItem[];
  };
  appointment: {
    sectionLabel: string;
    title: string;
    description: string;
    timeSlots: string[];
  };
  styleQuiz: {
    title: string;
    subtitle: string;
    buttonText: string;
  };
  featuredProductIds: number[];
  sectionOrder: SectionId[];
  sectionVisibility: Record<SectionId, boolean>;
  sectionLayout: Record<SectionId, SectionLayout>;
  theme: ThemeConfig;
}

export const defaultLandingConfig: LandingConfig = {
  hero: {
    backgroundImage: "/images/hero-bg.jpeg",
    label: "Muebles de Diseño",
    title: "Transformamos espacios en experiencias únicas",
    subtitle:
      "Descubrí nuestra colección de muebles exclusivos, diseñados para quienes buscan calidad, estilo y personalidad en cada rincón de su hogar.",
    ctaPrimaryText: "Ver Catálogo",
    ctaPrimaryHref: "#catalogo",
    ctaSecondaryText: "Ver Proyectos",
    ctaSecondaryHref: "#galeria",
  },
  catalog: {
    sectionLabel: "Nuestros Productos",
    title: "Catálogo de Muebles",
    description:
      "Explorá nuestra selección de muebles de diseño, creados con los mejores materiales y pensados para transformar tu hogar.",
  },
  gallery: {
    sectionLabel: "Proyectos Realizados",
    title: "Galería de Proyectos",
    description:
      "Conocé algunos de los espacios que hemos transformado con nuestros muebles de diseño. Cada proyecto es único.",
  },
  benefits: {
    sectionLabel: "¿Por Qué Elegirnos?",
    title: "Más que muebles, creamos experiencias",
    description:
      "En Home Stock entendemos que cada espacio cuenta una historia. Por eso nos dedicamos a crear muebles que no solo sean funcionales y estéticamente hermosos, sino que también reflejen la personalidad de quienes los habitan.",
    stats: [
      { value: "15+", label: "Años de experiencia" },
      { value: "500+", label: "Proyectos realizados" },
      { value: "98%", label: "Clientes satisfechos" },
    ],
    items: [
      {
        title: "Diseño Exclusivo",
        description:
          "Piezas únicas creadas por diseñadores locales e internacionales, pensadas para espacios con personalidad.",
      },
      {
        title: "Calidad Premium",
        description:
          "Materiales de primera calidad y terminaciones impecables que garantizan durabilidad y elegancia.",
      },
      {
        title: "Asesoramiento Personalizado",
        description:
          "Nuestro equipo de interioristas te acompaña en cada paso para encontrar los muebles perfectos.",
      },
      {
        title: "Envío e Instalación",
        description:
          "Entrega profesional y armado incluido en todo el país. Tu mueble listo para usar.",
      },
      {
        title: "Garantía Extendida",
        description:
          "Respaldamos nuestros productos con garantía de hasta 5 años en estructura y tapicería.",
      },
      {
        title: "Proyectos a Medida",
        description:
          "Fabricamos muebles personalizados según tus necesidades y dimensiones específicas.",
      },
    ],
  },
  testimonials: {
    sectionLabel: "Testimonios",
    title: "Lo que dicen nuestros clientes",
    description:
      "La satisfacción de nuestros clientes es nuestra mayor recompensa. Conocé las experiencias de quienes ya confiaron en nosotros.",
    items: [
      {
        id: 1,
        name: "María García",
        initials: "MG",
        role: "Arquitecta de Interiores",
        content:
          "Trabajar con Home Stock fue una experiencia excepcional. La calidad de sus muebles y el asesoramiento personalizado superaron todas mis expectativas. Mis clientes quedaron encantados.",
        rating: 5,
      },
      {
        id: 2,
        name: "Roberto Fernández",
        initials: "RF",
        role: "Empresario",
        content:
          "Amoblamos toda nuestra casa de fin de semana con Home Stock. El proceso fue simple, la entrega puntual y los muebles son exactamente lo que buscábamos. Calidad premium.",
        rating: 5,
      },
      {
        id: 3,
        name: "Carolina López",
        initials: "CL",
        role: "Diseñadora",
        content:
          "La atención al detalle de Home Stock es impresionante. Cada pieza que compramos es una obra de arte funcional. Definitivamente seguiremos siendo clientes.",
        rating: 5,
      },
      {
        id: 4,
        name: "Martín Ruiz",
        initials: "MR",
        role: "Hotelero",
        content:
          "Equipamos nuestro hotel boutique con muebles de Home Stock. El resultado fue espectacular y nuestros huéspedes no dejan de elogiar la decoración.",
        rating: 5,
      },
    ],
  },
  contact: {
    sectionLabel: "Contactanos",
    title: "Estamos para ayudarte",
    description:
      "¿Tenés alguna consulta o querés más información sobre nuestros productos? Completá el formulario y nos pondremos en contacto a la brevedad.",
    whatsappText: "Hola! Me interesa conocer más sobre sus muebles",
    items: [
      { icon: "mapPin", title: "Showroom", content: "Av. Pres. Juan Domingo Perón 757, Villa de Mayo, Prov. de Buenos Aires" },
      { icon: "phone", title: "WhatsApp", content: "+54 11 7164-3900" },
      { icon: "mail", title: "Email", content: "somoshomestock@gmail.com" },
      { icon: "clock", title: "Horarios", content: "Lun a Vie: 9:00 - 16:00 | Sáb: 9:00 - 13:00" },
    ],
  },
  appointment: {
    sectionLabel: "Visitá Nuestro Showroom",
    title: "Agendá tu visita",
    description:
      "Reservá una cita para conocer nuestra colección en persona y recibir asesoramiento personalizado de nuestro equipo.",
    timeSlots: ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
  },
  styleQuiz: {
    title: "¿No sabés por dónde empezar?",
    subtitle: "Respondé 4 preguntas y te recomendamos los muebles ideales para tu estilo y espacio.",
    buttonText: "Descubrí tu estilo",
  },
  featuredProductIds: [],
  sectionOrder: DEFAULT_SECTION_ORDER,
  sectionVisibility: DEFAULT_SECTION_VISIBILITY,
  sectionLayout: DEFAULT_SECTION_LAYOUT,
  theme: DEFAULT_THEME,
};
